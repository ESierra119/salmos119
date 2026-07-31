'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded bg-creamDeep">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#B08D57" strokeWidth="1" className="opacity-40">
          <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16.5" />
          <path d="M6 21h13" />
          <path d="M6 3v18" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded bg-white shadow-lg">
        <Image
          src={images[active]}
          alt={alt}
          fill
          className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.7]"
          sizes="400px"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-14 flex-shrink-0 overflow-hidden rounded border-2 bg-white transition ${
                active === i ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain p-1" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
