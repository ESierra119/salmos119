'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types/product';
import { useCart } from '@/context/CartContext';

export function Header({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string;
}) {
  const { openCart, totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-goldPale bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Salmos 119"
            width={44}
            height={44}
            className="rounded-full border border-goldPale object-cover"
          />
          <div className="leading-tight">
            <div className="font-script text-xl text-ink">Salmos 119</div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-inkSoft">Tienda Cristiana</div>
          </div>
        </Link>

        <nav className="hidden gap-7 md:flex">
          <Link
            href="/"
            className={`border-b text-[13px] pb-1 ${
              activeSlug === 'todos' ? 'border-gold text-goldDark' : 'border-transparent text-inkSoft hover:text-goldDark hover:border-gold'
            }`}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${c.slug}`}
              className={`border-b text-[13px] pb-1 ${
                activeSlug === c.slug ? 'border-gold text-goldDark' : 'border-transparent text-inkSoft hover:text-goldDark hover:border-gold'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="hidden text-[11px] uppercase tracking-wider text-inkSoft underline decoration-dotted underline-offset-4 hover:text-goldDark md:inline"
          >
            Administrador
          </Link>
          <button
            onClick={openCart}
            aria-label="Abrir carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold text-goldDark transition hover:bg-goldPale"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 6H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="18" cy="21" r="1" />
            </svg>
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-goldDark px-1 text-[10px] text-white">
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
