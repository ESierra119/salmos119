'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function CatalogSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative mx-auto mb-7 max-w-md">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar biblias, libros, cuadernos..."
        className="w-full rounded-full border border-goldPale bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-gold"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-inkSoft hover:text-goldDark"
        >
          &times;
        </button>
      )}
    </div>
  );
}
