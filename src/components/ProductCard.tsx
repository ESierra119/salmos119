'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/whatsapp';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const isNew = Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  }

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded border border-goldPale bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Etiquetas: fila propia, arriba de la imagen */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="flex flex-col items-start gap-1">
          {product.categories?.name && (
            <span className="rounded-full bg-creamDeep px-2.5 py-1 text-[9.5px] uppercase tracking-wider text-goldDark">
              {product.categories.name}
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[9.5px] uppercase tracking-wider text-white">
              Nuevo
            </span>
          )}
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] uppercase tracking-wider ${
            product.is_preorder ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {product.is_preorder ? 'Sobre pedido' : 'Entrega inmediata'}
        </span>
      </div>

      {/* Imagen */}
      <div className="relative mt-2 flex h-[180px] items-center justify-center overflow-hidden bg-creamDeep">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
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

      {/* Detalles */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="min-h-[44px] font-display text-[17px] leading-snug">{product.name}</h3>
        {product.internal_code && (
          <p className="-mt-1 font-mono text-[10px] text-inkSoft/70">Cód. {product.internal_code}</p>
        )}
        {product.description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-inkSoft">
            {product.description}{' '}
            <span className="whitespace-nowrap font-medium text-goldDark underline underline-offset-2">
              Ver más
            </span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2.5">
          {onSale ? (
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-inkSoft line-through">Antes {formatCOP(product.compare_at_price!)}</span>
              <span className="font-display text-xl text-red-600">Ahora {formatCOP(product.price)}</span>
            </div>
          ) : (
            <span className="font-display text-[17px] text-ink">{formatCOP(product.price)}</span>
          )}
          <button
            onClick={handleAdd}
            aria-label="Agregar al carrito"
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition ${
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
    </Link>
  );
}
