-- ============================================================
-- Migración: clientes (nombre + teléfono) ligados a las ventas
-- Corre esto en Supabase > SQL Editor
-- ============================================================

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customers_phone on customers(phone);

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at
before update on customers
for each row execute procedure set_updated_at();

alter table customers enable row level security;

drop policy if exists "Solo admins acceden a clientes" on customers;
create policy "Solo admins acceden a clientes"
  on customers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Referencia opcional desde ventas hacia el cliente registrado
alter table sales add column if not exists customer_id uuid references customers(id) on delete set null;
alter table sales add column if not exists customer_phone text;
