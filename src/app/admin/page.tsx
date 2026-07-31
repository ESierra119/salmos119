import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { ProductsTable } from '@/components/ProductsTable';
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
        <ProductsTable products={(products as Product[]) ?? []} />
      </div>
    </>
  );
}
