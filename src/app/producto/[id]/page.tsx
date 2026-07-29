import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductGallery } from '@/components/ProductGallery';
import type { Category, Product, ProductImage } from '@/types/product';

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name');

  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock, active, category_id, categories(id, name, slug)')
    .eq('id', params.id)
    .eq('active', true)
    .single();

  if (!product) notFound();

  const p = product as unknown as Product;

  const { data: extraImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', p.id)
    .order('sort_order');

  const gallery = [
    ...(p.image_url ? [p.image_url] : []),
    ...((extraImages as ProductImage[] | null)?.map((i) => i.image_url) ?? []),
  ];

  // Relacionados: primero de la misma categoría; si no alcanza, se completa con otros productos.
  let related: Product[] = [];
  if (p.category_id) {
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, stock, active, category_id, categories(id, name, slug)')
      .eq('active', true)
      .eq('category_id', p.category_id)
      .neq('id', p.id)
      .limit(4);
    related = (data as unknown as Product[]) ?? [];
  }
  if (related.length < 4) {
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, stock, active, category_id, categories(id, name, slug)')
      .eq('active', true)
      .neq('id', p.id)
      .limit(4 - related.length);
    const extra = ((data as unknown as Product[]) ?? []).filter((r) => !related.some((x) => x.id === r.id));
    related = [...related, ...extra];
  }

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
          <ProductGallery images={gallery} alt={p.name} />
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

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          <h2 className="mb-6 font-display text-2xl">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}

      <CartDrawer />
    </>
  );
}
