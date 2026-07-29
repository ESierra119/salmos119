-- ============================================================
-- Migración: entrega inmediata vs. sobre pedido
-- Corre esto en Supabase > SQL Editor
-- ============================================================

alter table products add column if not exists is_preorder boolean not null default false;
-- false (valor por defecto) = entrega inmediata
-- true = sobre pedido
