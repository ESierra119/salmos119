import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { SaleDetail } from '@/components/SaleDetail';
import type { Sale, SalePayment } from '@/types/product';

export const revalidate = 0;

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: sale }, { data: payments }] = await Promise.all([
    supabase.from('sales').select('*').eq('id', params.id).single(),
    supabase.from('sale_payments').select('*').eq('sale_id', params.id).order('payment_date', { ascending: false }),
  ]);

  if (!sale) notFound();

  return (
    <>
      <AdminTopbar title="Detalle de venta" />
      <SaleDetail sale={sale as Sale} payments={(payments as SalePayment[]) ?? []} />
    </>
  );
}
