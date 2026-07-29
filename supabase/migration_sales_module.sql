-- ============================================================
-- Migración: módulo de costos y ventas
-- Corre esto en Supabase > SQL Editor
-- ============================================================

-- Costos por producto (para calcular utilidad y margen, como en tu Excel)
alter table products add column if not exists cost_price numeric(12,2) not null default 0;
alter table products add column if not exists shipping_cost numeric(12,2) not null default 0;

-- Registro de ventas (contado / crédito)
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  sale_date date not null default current_date,
  customer_name text not null,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null, -- se guarda por si el producto cambia de nombre o se borra
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  unit_cost numeric(12,2) not null default 0, -- costo_proveedor + envio, al momento de la venta
  payment_type text not null default 'contado' check (payment_type in ('contado', 'credito')),
  credit_surcharge_rate numeric(6,4) not null default 0, -- ej 0.03 = 3%
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

-- Solo administradores (usuarios autenticados) pueden ver y modificar ventas.
-- A diferencia de products/categories, esta tabla NO tiene lectura pública:
-- contiene costos, clientes y utilidades, información sensible del negocio.
alter table sales enable row level security;

drop policy if exists "Solo admins acceden a ventas" on sales;
create policy "Solo admins acceden a ventas"
  on sales for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
