'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/whatsapp';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded border border-goldPale bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-[200px] items-center justify-center overflow-hidden bg-creamDeep">
        {product.categories?.name && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[9.5px] uppercase tracking-wider text-goldDark">
            {product.categories.name}
          </span>
        )}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 700px) 50vw, 25vw"
          />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B08D57" strokeWidth="1.3" className="opacity-55">
            <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16.5" />
            <path d="M6 21h13" />
            <path d="M6 3v18" />
          </svg>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="min-h-[44px] font-display text-[17px] leading-snug">{product.name}</h3>
        <p className="min-h-[32px] text-xs leading-relaxed text-inkSoft">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2.5">
          <span className="font-display text-[17px] text-ink">{formatCOP(product.price)}</span>
          <button
            onClick={handleAdd}
            aria-label="Agregar al carrito"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              justAdded ? 'border-goldDark bg-goldDark text-white' : 'border-ink text-ink hover:bg-ink hover:text-cream'
            }`}
          >
            {justAdded ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
