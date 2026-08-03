import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { NewSaleForm } from '@/components/NewSaleForm';
import type { Product, Customer } from '@/types/product';

export const revalidate = 0;

export default async function NewSalePage() {
  const supabase = createClient();
  const [{ data: products }, { data: customers }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('name'),
    supabase.from('customers').select('*').order('name'),
  ]);

  return (
    <>
      <AdminTopbar title="Registrar venta" />
      <NewSaleForm products={(products as Product[]) ?? []} customers={(customers as Customer[]) ?? []} />
    </>
  );
}
