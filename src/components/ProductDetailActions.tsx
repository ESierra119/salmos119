'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/whatsapp';
import type { Product } from '@/types/product';

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div>
      <div className="mb-5 font-display text-3xl text-ink">{formatCOP(product.price)}</div>

      {product.is_preorder && (
        <p className="mb-4 text-xs text-inkSoft">
          Este producto se encarga bajo pedido — el tiempo de entrega se confirma con tu asesor.
        </p>
      )}

      <div className="mb-5 flex items-center gap-4">
        <span className="text-xs uppercase tracking-wider text-inkSoft">Cantidad</span>
        <div className="flex items-center gap-3 rounded border border-goldPale px-3 py-1.5">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="text-lg text-inkSoft"
            aria-label="Restar"
          >
            &minus;
          </button>
          <span className="w-6 text-center text-sm">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="text-lg text-inkSoft" aria-label="Sumar">
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`flex w-full items-center justify-center gap-2 rounded px-7 py-3.5 text-[13px] uppercase tracking-wider transition ${
          added ? 'bg-goldDark text-white' : 'bg-ink text-cream hover:bg-goldDark'
        }`}
      >
        {added ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Agregado al carrito
          </>
        ) : (
          'Agregar al carrito'
        )}
      </button>
    </div>
  );
}
