import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import type { Category, Product } from '@/types/product';

export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  let query = supabase
    .from('products')
    .select('id, name, description, price, image_url, stock, is_preorder, active, category_id, categories(id, name, slug)')
    .eq('active', true)
    .order('created_at', { ascending: false });

  const activeSlug = searchParams.categoria ?? 'todos';
  if (activeSlug !== 'todos') {
    const cat = (categories as Category[] | null)?.find((c) => c.slug === activeSlug);
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data: products } = await query;

  return (
    <>
      <Header categories={(categories as Category[]) ?? []} activeSlug={activeSlug} />

      {/* HERO */}
      <section className="relative mx-auto grid max-w-6xl gap-10 overflow-hidden px-6 pb-10 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div
          className="pointer-events-none absolute -right-16 -top-36 h-[420px] w-[420px] rounded-full opacity-70"
          style={{ background: 'radial-gradient(circle, #E4D3B4 0%, transparent 70%)' }}
        />
        <div className="relative z-10 text-center md:text-left">
          <div className="mb-3.5 text-[11px] uppercase tracking-[0.22em] text-inkSoft">Inspiración · Fe · Propósito</div>
          <h1 className="mb-4.5 font-display text-[34px] leading-tight md:text-5xl">
            Su palabra, <em className="text-goldDark not-italic italic">nuestra inspiración</em>
          </h1>
          <p className="mx-auto mb-6 max-w-md text-[15px] leading-relaxed text-inkSoft md:mx-0">
            Biblias, libros, devocionales y papelería cristiana, elegidos con cuidado para acompañar tu caminar con
            Dios cada día.
          </p>
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded bg-ink px-7 py-3.5 text-[13px] uppercase tracking-wider text-cream transition hover:bg-goldDark"
          >
            Ver catálogo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
        <div className="relative z-10 flex justify-center">
          <div className="rotate-[-2deg] rounded-md bg-white p-4 shadow-2xl">
            <Image src="/logo.jpg" alt="Salmos 119" width={220} height={220} className="rounded object-cover" />
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="mx-auto max-w-6xl px-6 pb-6 pt-14">
        <div className="mx-auto mb-9 max-w-lg text-center">
          <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-inkSoft">Nuestro catálogo</div>
          <h2 className="mb-3 font-display text-3xl">Cada artículo, una bendición</h2>
          <p className="text-sm text-inkSoft">Explora por categoría o mira todo lo que tenemos para ti.</p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/"
            className={`rounded-full border px-4.5 py-2 text-[12.5px] ${
              activeSlug === 'todos' ? 'border-ink bg-ink text-cream' : 'border-goldPale text-inkSoft hover:border-gold hover:text-goldDark'
            }`}
          >
            Todos
          </Link>
          {(categories as Category[] | null)?.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${c.slug}`}
              className={`rounded-full border px-4.5 py-2 text-[12.5px] ${
                activeSlug === c.slug ? 'border-ink bg-ink text-cream' : 'border-goldPale text-inkSoft hover:border-gold hover:text-goldDark'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4 lg:gap-5.5">
            {(products as unknown as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-goldPale py-16 text-center text-inkSoft">
            Todavía no hay productos en esta categoría.
            <br />
            Ve al <Link href="/admin" className="text-goldDark underline">panel de administrador</Link> para agregar el primero.
          </div>
        )}
      </section>

      {/* CONFIANZA */}
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap justify-around gap-6 border-y border-goldPale px-6 py-8">
        <div className="max-w-[200px] text-center">
          <h4 className="mb-1.5 text-[13px] uppercase tracking-wider text-goldDark">Envío a todo el país</h4>
          <p className="text-xs text-inkSoft">Coordinado directamente con tu asesor por WhatsApp.</p>
        </div>
        <div className="max-w-[200px] text-center">
          <h4 className="mb-1.5 text-[13px] uppercase tracking-wider text-goldDark">Empaque con propósito</h4>
          <p className="text-xs text-inkSoft">Cada pedido llega envuelto con dedicación, listo para regalar.</p>
        </div>
        <div className="max-w-[200px] text-center">
          <h4 className="mb-1.5 text-[13px] uppercase tracking-wider text-goldDark">Atención personalizada</h4>
          <p className="text-xs text-inkSoft">Un asesor confirma contigo precio final, envío y forma de pago.</p>
        </div>
      </div>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-5 px-6 py-10">
        <div>
          <div className="font-script text-2xl">Salmos 119</div>
          <p className="mt-1.5 text-xs text-inkSoft">Inspiración · Fe · Propósito &mdash; Colombia</p>
        </div>
        <div className="flex gap-5 text-xs text-inkSoft">
          <a href="#" className="hover:text-goldDark">Instagram</a>
          <a href="#" className="hover:text-goldDark">WhatsApp</a>
          <Link href="/admin" className="hover:text-goldDark">Administrador</Link>
        </div>
      </footer>

      <CartDrawer />
    </>
  );
}
