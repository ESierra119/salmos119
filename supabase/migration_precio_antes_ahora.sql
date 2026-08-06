-- ============================================================
-- Migración: precio "antes" para mostrar descuentos en el catálogo
-- Corre esto en Supabase > SQL Editor
-- ============================================================

alter table products add column if not exists compare_at_price numeric(12,2);
-- Si compare_at_price > price, la tienda muestra "Antes / Ahora".
-- Se maneja automáticamente desde el panel: si bajas el precio, se
-- guarda el precio anterior aquí; si lo subes de nuevo, se limpia solo.
