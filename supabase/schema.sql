-- ============================================================
-- Salmos 119 · Esquema de base de datos
-- Ejecuta este archivo completo en Supabase > SQL Editor > New query
-- ============================================================

-- Tabla de categorías (para poder agregar más desde el panel a futuro)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

insert into categories (name, slug) values
  ('Biblias', 'biblias'),
  ('Libros y devocionales', 'libros'),
  ('Papelería', 'papeleria')
on conflict (slug) do nothing;

-- Tabla de productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  stock integer default 0,
  is_preorder boolean not null default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mantiene updated_at al día automáticamente
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute procedure set_updated_at();

-- Imágenes adicionales por producto (la foto principal sigue viviendo en products.image_url)
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_product_images_product_id on product_images(product_id);

-- Registro de ventas (contado / crédito)
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  sale_date date not null default current_date,
  customer_name text not null,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  unit_cost numeric(12,2) not null default 0,
  payment_type text not null default 'contado' check (payment_type in ('contado', 'credito')),
  credit_surcharge_rate numeric(6,4) not null default 0,
  installments_count integer not null default 1,
  paid_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_sales_sale_date on sales(sale_date desc);
create index if not exists idx_sales_product_id on sales(product_id);

drop trigger if exists trg_sales_updated_at on sales;
create trigger trg_sales_updated_at
before update on sales
for each row execute procedure set_updated_at();

-- Historial de abonos (con fecha) por cada venta
create table if not exists sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_sale_payments_sale_id on sale_payments(sale_id);

-- Mantiene sales.paid_amount = suma de sus abonos automáticamente
create or replace function sync_sale_paid_amount()
returns trigger as $$
declare
  target_sale_id uuid;
begin
  target_sale_id := coalesce(new.sale_id, old.sale_id);
  update sales
    set paid_amount = (
      select coalesce(sum(amount), 0) from sale_payments where sale_id = target_sale_id
    )
    where id = target_sale_id;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_paid_amount on sale_payments;
create trigger trg_sync_paid_amount
after insert or update or delete on sale_payments
for each row execute procedure sync_sale_paid_amount();

-- ============================================================
-- Seguridad (Row Level Security)
-- Cualquiera puede LEER productos activos (catálogo público).
-- Solo usuarios autenticados (administradores) pueden crear/editar/borrar.
-- ============================================================

alter table products enable row level security;
alter table categories enable row level security;
alter table product_images enable row level security;

drop policy if exists "Lectura pública de productos activos" on products;
create policy "Lectura pública de productos activos"
  on products for select
  using (active = true);

drop policy if exists "Lectura pública de categorías" on categories;
create policy "Lectura pública de categorías"
  on categories for select
  using (true);

drop policy if exists "Lectura pública de imágenes de producto" on product_images;
create policy "Lectura pública de imágenes de producto"
  on product_images for select
  using (true);

drop policy if exists "Admins pueden todo en imágenes de producto" on product_images;
create policy "Admins pueden todo en imágenes de producto"
  on product_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Ventas: solo administradores, nunca lectura pública (contiene costos y utilidades)
alter table sales enable row level security;

drop policy if exists "Solo admins acceden a ventas" on sales;
create policy "Solo admins acceden a ventas"
  on sales for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table sale_payments enable row level security;

drop policy if exists "Solo admins acceden a abonos" on sale_payments;
create policy "Solo admins acceden a abonos"
  on sale_payments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admins pueden todo en productos" on products;
create policy "Admins pueden todo en productos"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admins pueden todo en categorías" on categories;
create policy "Admins pueden todo en categorías"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage: bucket público para las fotos de producto
-- (esto también se puede crear desde Supabase > Storage > New bucket,
-- pero lo dejamos scripteado para que no se te olvide)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Lectura pública de imágenes" on storage.objects;
create policy "Lectura pública de imágenes"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins suben imágenes" on storage.objects;
create policy "Admins suben imágenes"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admins borran imágenes" on storage.objects;
create policy "Admins borran imágenes"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');
