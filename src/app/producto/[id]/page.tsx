import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import type { Category, Product } from '@/types/product';

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name');

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', params.id)
    .eq('active', true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('active', true)
    .eq('category_id', (product as Product).category_id ?? '')
    .neq('id', (product as Product).id)
    .limit(4);

  const p = product as Product;

  return (
    <>
      <Header categories={(categories as Category[]) ?? []} activeSlug="todos" />

      <nav className="mx-auto max-w-6xl px-6 pt-6 text-xs text-inkSoft">
        <Link href="/" className="hover:text-goldDark">Catálogo</Link>
        {p.categories?.name && (
          <>
            {' '}/{' '}
            <Link href={`/?categoria=${p.categories.slug}`} className="hover:text-goldDark">
              {p.categories.name}
            </Link>
          </>
        )}
        {' '}/ <span className="text-ink">{p.name}</span>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-2">
        <div className="flex items-center justify-center rounded border border-goldPale bg-creamDeep p-6">
          {p.image_url ? (
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded shadow-lg">
              <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 90vw, 400px" priority />
            </div>
          ) : (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#B08D57" strokeWidth="1" className="opacity-40">
              <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16.5" />
              <path d="M6 21h13" />
              <path d="M6 3v18" />
            </svg>
          )}
        </div>

        <div>
          {p.categories?.name && (
            <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-goldDark">{p.categories.name}</div>
          )}
          <h1 className="mb-4 font-display text-3xl leading-tight md:text-4xl">{p.name}</h1>

          {p.description && (
            <p className="mb-6 whitespace-pre-line text-[15px] leading-relaxed text-inkSoft">{p.description}</p>
          )}

          <ProductDetailActions product={p} />

          <div className="mt-8 space-y-1.5 border-t border-goldPale pt-6 text-xs text-inkSoft">
            <p>✓ Envío a todo Colombia, coordinado por WhatsApp</p>
            <p>✓ Empaque cuidado, listo para regalar</p>
            <p>✓ Precio final y envío se confirman con tu asesor</p>
          </div>
        </div>
      </section>

      {related && related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          <h2 className="mb-6 font-display text-2xl">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(related as Product[]).map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}

      <CartDrawer />
    </>
  );
}
