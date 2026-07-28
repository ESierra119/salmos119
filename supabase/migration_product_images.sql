-- ============================================================
-- Migración: imágenes adicionales por producto
-- Corre esto en Supabase > SQL Editor si ya habías ejecutado schema.sql antes.
-- (Si vas a montar el proyecto desde cero, no hace falta: ya está incluido en schema.sql)
-- ============================================================

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_product_images_product_id on product_images(product_id);

alter table product_images enable row level security;

drop policy if exists "Lectura pública de imágenes de producto" on product_images;
create policy "Lectura pública de imágenes de producto"
  on product_images for select
  using (true);

drop policy if exists "Admins pueden todo en imágenes de producto" on product_images;
create policy "Admins pueden todo en imágenes de producto"
  on product_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
