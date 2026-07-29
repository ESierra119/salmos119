-- ============================================================
-- Migración: historial de abonos (con fecha) por venta
-- Corre esto en Supabase > SQL Editor
-- Requiere haber corrido antes migration_sales_module.sql
-- ============================================================

create table if not exists sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_sale_payments_sale_id on sale_payments(sale_id);

alter table sale_payments enable row level security;

drop policy if exists "Solo admins acceden a abonos" on sale_payments;
create policy "Solo admins acceden a abonos"
  on sale_payments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Mantiene sales.paid_amount siempre igual a la suma de sus abonos,
-- para que el resto del panel (resumen, listado) no tenga que cambiar.
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
