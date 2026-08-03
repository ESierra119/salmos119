'use client';

import { useMemo, useState } from 'react';
import { formatCOP } from '@/lib/whatsapp';
import type { Product } from '@/types/product';

export function ProductCombobox({
  products,
  selectedProduct,
  onSelect,
}: {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}) {
  const [query, setQuery] = useState(selectedProduct?.name ?? '');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? products
      : products.filter(
          (p) => p.name.toLowerCase().includes(q) || p.internal_code?.toLowerCase().includes(q)
        );
    return base.slice(0, 8);
  }, [products, query]);

  function handleSelect(p: Product) {
    onSelect(p);
    setQuery(p.name);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Escribe el nombre o código (ej. TS2607001)"
        className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-goldPale bg-white shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => handleSelect(p)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-creamDeep"
            >
              <span className="flex-1 truncate">{p.name}</span>
              <span className="font-mono text-[10px] text-inkSoft">{p.internal_code}</span>
              <span className="whitespace-nowrap text-xs text-inkSoft">{formatCOP(p.price)}</span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded border border-goldPale bg-white px-3 py-2 text-sm text-inkSoft shadow-lg">
          Ningún producto coincide.
        </div>
      )}
    </div>
  );
}
