import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { ProductForm } from '@/components/ProductForm';
import type { Category, Product, ProductImage } from '@/types/product';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: categories }, { data: product }, { data: extraImages }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('product_images').select('*').eq('product_id', params.id).order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminTopbar title="Editar producto" />
      <ProductForm
        categories={(categories as Category[]) ?? []}
        product={product as Product}
        initialExtraImages={(extraImages as ProductImage[]) ?? []}
      />
    </>
  );
}
