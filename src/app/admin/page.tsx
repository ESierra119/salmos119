import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { formatCOP } from '@/lib/whatsapp';
import { DeleteProductButton } from '@/components/DeleteProductButton';
import type { Product } from '@/types/product';

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false });

  return (
    <>
      <AdminTopbar title="Productos" />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-inkSoft">
            {products?.length ?? 0} producto{(products?.length ?? 0) === 1 ? '' : 's'} en total
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="rounded bg-ink px-5 py-2.5 text-[13px] tracking-wide text-cream hover:bg-goldDark"
          >
            + Agregar producto
          </Link>
        </div>

        <div className="overflow-hidden rounded border border-goldPale bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(products as Product[] | null)?.map((p) => (
                <tr key={p.id} className="border-b border-goldPale last:border-0">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-inkSoft">{p.categories?.name ?? '—'}</td>
                  <td className="px-4 py-3">{formatCOP(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/productos/${p.id}`} className="text-xs text-goldDark underline">
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-inkSoft">
                    Aún no has agregado productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
