-- ============================================================
-- Ajuste retroactivo ÚNICO de stock
-- Corre esto UNA SOLA VEZ en Supabase > SQL Editor.
-- Descuenta del stock las ventas que ya tenías registradas ANTES de que
-- existiera el trigger automático (migration_codigo_stock_sobrepedido.sql).
-- No lo vuelvas a correr después de hoy: las ventas nuevas ya se
-- descuentan solas.
-- ============================================================

update products p
set stock = greatest(p.stock - s.total_qty, 0)
from (
  select product_id, sum(quantity) as total_qty
  from sales
  where product_id is not null
  group by product_id
) s
where p.id = s.product_id;
