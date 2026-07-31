-- ============================================================
-- Migración: código interno, stock ligado a ventas, sobre pedido automático
-- Corre esto en Supabase > SQL Editor
-- ============================================================

-- 1) Código interno tipo TS2607001 (TS + año + mes + consecutivo de 3 dígitos)
alter table products add column if not exists internal_code text unique;

create or replace function generate_internal_code()
returns trigger as $$
declare
  prefix text;
  next_num int;
begin
  if new.internal_code is null or new.internal_code = '' then
    prefix := 'TS' || to_char(now(), 'YYMM');
    select coalesce(max(substring(internal_code from 7 for 3)::int), 0) + 1
      into next_num
      from products
      where internal_code like prefix || '%';
    new.internal_code := prefix || lpad(next_num::text, 3, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_internal_code on products;
create trigger trg_generate_internal_code
before insert on products
for each row execute procedure generate_internal_code();

-- Asigna código a los productos que ya existían antes de este cambio
do $$
declare
  r record;
  prefix text;
  next_num int;
begin
  for r in select id, created_at from products where internal_code is null order by created_at loop
    prefix := 'TS' || to_char(r.created_at, 'YYMM');
    select coalesce(max(substring(internal_code from 7 for 3)::int), 0) + 1
      into next_num
      from products
      where internal_code like prefix || '%';
    update products set internal_code = prefix || lpad(next_num::text, 3, '0') where id = r.id;
  end loop;
end $$;

-- 2) Sobre pedido automático cuando el stock llega a 0
create or replace function auto_preorder_on_zero_stock()
returns trigger as $$
begin
  if new.stock <= 0 then
    new.is_preorder := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_preorder on products;
create trigger trg_auto_preorder
before insert or update on products
for each row execute procedure auto_preorder_on_zero_stock();

-- 3) El stock se descuenta automáticamente al registrar una venta
-- (y se restituye si borras el registro de la venta)
create or replace function adjust_stock_on_sale()
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

drop trigger if exists trg_adjust_stock_on_sale on sales;
create trigger trg_adjust_stock_on_sale
after insert or update or delete on sales
for each row execute procedure adjust_stock_on_sale();
