import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { formatCOP } from '@/lib/whatsapp';
import { saleSubtotal, saleCreditSurcharge, saleBalance, saleStatus, saleTotalProfit } from '@/lib/pricing';
import type { Product, Sale } from '@/types/product';

export const revalidate = 0;

export default async function VentasPage() {
  const supabase = createClient();

  const [{ data: sales }, { data: products }] = await Promise.all([
    supabase.from('sales').select('*').order('sale_date', { ascending: false }),
    supabase.from('products').select('stock, cost_price, shipping_cost'),
  ]);

  const allSales = (sales as Sale[]) ?? [];

  const ventasContado = allSales
    .filter((s) => s.payment_type === 'contado')
    .reduce((sum, s) => sum + saleSubtotal(s), 0);

  const ventasCredito = allSales
    .filter((s) => s.payment_type === 'credito')
    .reduce((sum, s) => sum + saleSubtotal(s), 0);

  const recargosCobrados = allSales.reduce((sum, s) => sum + saleCreditSurcharge(s), 0);
  const utilidadTotal = allSales.reduce((sum, s) => sum + saleTotalProfit(s), 0);
  const saldoPendiente = allSales.reduce((sum, s) => sum + Math.max(0, saleBalance(s)), 0);

  const inventarioAlCosto = ((products as Pick<Product, 'stock' | 'cost_price' | 'shipping_cost'>[]) ?? []).reduce(
    (sum, p) => sum + p.stock * (p.cost_price + p.shipping_cost),
    0
  );

  return (
    <>
      <AdminTopbar title="Ventas" />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* RESUMEN */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Ventas de contado" value={formatCOP(ventasContado)} />
          <SummaryCard label="Ventas a crédito" value={formatCOP(ventasCredito)} />
          <SummaryCard label="Recargos cobrados" value={formatCOP(recargosCobrados)} />
          <SummaryCard label="Utilidad total" value={formatCOP(utilidadTotal)} highlight />
          <SummaryCard label="Saldo por cobrar" value={formatCOP(saldoPendiente)} warn={saldoPendiente > 0} />
          <SummaryCard label="Inventario (al costo)" value={formatCOP(inventarioAlCosto)} />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-inkSoft">
            {allSales.length} venta{allSales.length === 1 ? '' : 's'} registrada{allSales.length === 1 ? '' : 's'}
          </p>
          <Link
            href="/admin/ventas/nueva"
            className="rounded bg-ink px-5 py-2.5 text-[13px] tracking-wide text-cream hover:bg-goldDark"
          >
            + Registrar venta
          </Link>
        </div>

        <div className="overflow-x-auto rounded border border-goldPale bg-white">
          <table className="w-full whitespace-nowrap text-sm">
            <thead>
              <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cant.</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Total a pagar</th>
                <th className="px-4 py-3">Abonado</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {allSales.map((s) => {
                const status = saleStatus(s);
                const balance = saleBalance(s);
                const total = saleSubtotal(s) + saleCreditSurcharge(s);
                return (
                  <tr key={s.id} className="border-b border-goldPale last:border-0">
                    <td className="px-4 py-3">{new Date(s.sale_date).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3">{s.customer_name}</td>
                    <td className="px-4 py-3">{s.product_name_snapshot}</td>
                    <td className="px-4 py-3">{s.quantity}</td>
                    <td className="px-4 py-3 capitalize">{s.payment_type}</td>
                    <td className="px-4 py-3">{formatCOP(total)}</td>
                    <td className="px-4 py-3">{formatCOP(s.paid_amount)}</td>
                    <td className="px-4 py-3">{formatCOP(Math.max(0, balance))}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          status === 'Pagado'
                            ? 'bg-green-100 text-green-700'
                            : status === 'Parcial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/ventas/${s.id}`} className="text-xs text-goldDark underline">
                        Ver / Abonar
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {allSales.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-inkSoft">
                    Aún no has registrado ninguna venta.
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

function SummaryCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded border border-goldPale bg-white p-4">
      <p className="mb-1.5 text-[10.5px] uppercase tracking-wider text-inkSoft">{label}</p>
      <p className={`font-display text-xl ${warn ? 'text-red-600' : highlight ? 'text-goldDark' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}
