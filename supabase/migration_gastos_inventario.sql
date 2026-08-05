-- ============================================================
-- Migración: agregar categoría "Compra de inventario" a gastos
-- Corre esto en Supabase > SQL Editor
-- ============================================================

alter table expenses drop constraint if exists expenses_category_check;

alter table expenses add constraint expenses_category_check check (
  category in ('inventario', 'envios', 'empaques', 'publicidad', 'papeleria', 'herramientas', 'otros')
);
