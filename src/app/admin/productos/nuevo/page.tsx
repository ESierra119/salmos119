import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { ProductForm } from '@/components/ProductForm';
import type { Category } from '@/types/product';

export const revalidate = 0;

export default async function NewProductPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name');

  return (
    <>
      <AdminTopbar title="Nuevo producto" />
      <ProductForm categories={(categories as Category[]) ?? []} />
    </>
  );
}
