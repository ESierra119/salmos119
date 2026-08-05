-- ============================================================
-- Migración: módulo de contabilidad (gastos e inversiones)
-- Corre esto en Supabase > SQL Editor
-- ============================================================

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category text not null default 'otros' check (
    category in ('envios', 'empaques', 'publicidad', 'papeleria', 'herramientas', 'otros')
  ),
  amount numeric(12,2) not null default 0,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_expenses_date on expenses(expense_date desc);
create index if not exists idx_expenses_category on expenses(category);

drop trigger if exists trg_expenses_updated_at on expenses;
create trigger trg_expenses_updated_at
before update on expenses
for each row execute procedure set_updated_at();

alter table expenses enable row level security;

drop policy if exists "Solo admins acceden a gastos" on expenses;
create policy "Solo admins acceden a gastos"
  on expenses for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  investment_date date not null default current_date,
  amount numeric(12,2) not null default 0,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_investments_date on investments(investment_date desc);

drop trigger if exists trg_investments_updated_at on investments;
create trigger trg_investments_updated_at
before update on investments
for each row execute procedure set_updated_at();

alter table investments enable row level security;

drop policy if exists "Solo admins acceden a inversiones" on investments;
create policy "Solo admins acceden a inversiones"
  on investments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
