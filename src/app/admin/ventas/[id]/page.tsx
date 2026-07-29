import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { SaleDetail } from '@/components/SaleDetail';
import type { Sale } from '@/types/product';

export const revalidate = 0;

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: sale } = await supabase.from('sales').select('*').eq('id', params.id).single();

  if (!sale) notFound();

  return (
    <>
      <AdminTopbar title="Detalle de venta" />
      <SaleDetail sale={sale as Sale} />
    </>
  );
}
