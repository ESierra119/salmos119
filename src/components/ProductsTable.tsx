'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCOP } from '@/lib/whatsapp';
import { unitProfit, profitMargin, formatPercent } from '@/lib/pricing';
import { DeleteProductButton } from '@/components/DeleteProductButton';
import type { Product } from '@/types/product';

export function ProductsTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.internal_code?.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o código (ej. TS2607001)"
            className="w-full rounded border border-goldPale py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold"
          />
        </div>
        <p className="text-sm text-inkSoft">
          {filtered.length} de {products.length} producto{products.length === 1 ? '' : 's'}
        </p>
        <Link
          href="/admin/productos/nuevo"
          className="rounded bg-ink px-5 py-2.5 text-center text-[13px] tracking-wide text-cream hover:bg-goldDark"
        >
          + Agregar producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-goldPale bg-white">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Utilidad</th>
              <th className="px-4 py-3">Margen</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const profit = unitProfit(p.price, p.cost_price, p.shipping_cost);
              const margin = profitMargin(p.price, p.cost_price, p.shipping_cost);
              return (
                <tr key={p.id} className="border-b border-goldPale last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-inkSoft">{p.internal_code ?? '—'}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-inkSoft">{p.categories?.name ?? '—'}</td>
                  <td className="px-4 py-3">{formatCOP(p.price)}</td>
                  <td className={`px-4 py-3 ${profit >= 0 ? 'text-goldDark' : 'text-red-600'}`}>{formatCOP(profit)}</td>
                  <td className={`px-4 py-3 ${profit >= 0 ? 'text-goldDark' : 'text-red-600'}`}>{formatPercent(margin)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/productos/${p.id}`} className="text-xs text-goldDark underline">
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-inkSoft">
                  {products.length === 0 ? 'Aún no has agregado productos.' : 'Ningún producto coincide con tu búsqueda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
