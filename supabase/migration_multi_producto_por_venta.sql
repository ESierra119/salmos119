-- ============================================================
-- Migración: una venta = varios productos (pedido con líneas)
-- Corre esto en Supabase > SQL Editor, UNA SOLA VEZ.
-- Convierte "sales" (1 venta = 1 producto) en un pedido con
-- varias líneas en la nueva tabla "sale_items", sin perder tus
-- ventas ya registradas ni descontar el stock dos veces.
-- ============================================================

-- 1) Tabla de líneas de producto por venta
create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_sale_items_sale_id on sale_items(sale_id);
create index if not exists idx_sale_items_product_id on sale_items(product_id);

alter table sale_items enable row level security;

drop policy if exists "Solo admins acceden a items de venta" on sale_items;
create policy "Solo admins acceden a items de venta"
  on sale_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2) Migra cada venta existente a una línea en sale_items
--    (todavía SIN el trigger de stock activo, para no descontar dos veces)
insert into sale_items (sale_id, product_id, product_name_snapshot, quantity, unit_price, unit_cost, created_at)
select id, product_id, product_name_snapshot, quantity, unit_price, unit_cost, created_at
from sales
where not exists (select 1 from sale_items where sale_items.sale_id = sales.id);

-- 3) Quita el trigger viejo de stock (vivía en "sales")
drop trigger if exists trg_adjust_stock_on_sale on sales;

-- 4) Trigger nuevo de stock, ahora en "sale_items" (por cada línea del pedido)
create or replace function adjust_stock_on_sale_item()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.product_id is not null then
      update products set stock = greatest(stock - new.quantity, 0) where id = new.product_id;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.product_id is not null then
      update products set stock = stock + old.quantity where id = old.product_id;
    end if;
    return old;
  elsif TG_OP = 'UPDATE' then
    if old.product_id is not null then
      update products set stock = stock + old.quantity where id = old.product_id;
    end if;
    if new.product_id is not null then
      update products set stock = greatest(stock - new.quantity, 0) where id = new.product_id;
    end if;
    return new;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_adjust_stock_on_sale_item on sale_items;
create trigger trg_adjust_stock_on_sale_item
after insert or update or delete on sale_items
for each row execute procedure adjust_stock_on_sale_item();

-- 5) Ya migrados los datos, quitamos esas columnas de "sales"
--    (ahora "sales" es solo el encabezado del pedido: cliente, fecha, pago)
alter table sales drop column if exists product_id;
alter table sales drop column if exists product_name_snapshot;
alter table sales drop column if exists quantity;
alter table sales drop column if exists unit_price;
alter table sales drop column if exists unit_cost;
