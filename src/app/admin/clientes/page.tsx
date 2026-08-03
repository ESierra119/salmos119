import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { formatCOP } from '@/lib/whatsapp';
import { saleTotals } from '@/lib/pricing';
import type { Customer, Sale } from '@/types/product';

export const revalidate = 0;

export default async function ClientesPage() {
  const supabase = createClient();

  const [{ data: customers }, { data: sales }] = await Promise.all([
    supabase.from('customers').select('*').order('name'),
    supabase.from('sales').select('customer_id, payment_type, credit_surcharge_rate, installments_count, paid_amount, sale_items(quantity, unit_price, unit_cost)'),
  ]);

  const allCustomers = (customers as Customer[]) ?? [];
  const allSales = (sales as unknown as Sale[]) ?? [];

  const statsByCustomer = new Map<string, { count: number; total: number }>();
  allSales.forEach((s) => {
    if (!s.customer_id) return;
    const { total } = saleTotals(s, s.sale_items ?? []);
    const current = statsByCustomer.get(s.customer_id) ?? { count: 0, total: 0 };
    statsByCustomer.set(s.customer_id, { count: current.count + 1, total: current.total + total });
  });

  return (
    <>
      <AdminTopbar title="Clientes" />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="mb-6 text-sm text-inkSoft">
          Estos contactos se guardan automáticamente cada vez que registras una venta. Sirven para futuras
          campañas o seguimiento por WhatsApp.
        </p>

        <div className="overflow-x-auto rounded border border-goldPale bg-white">
          <table className="w-full whitespace-nowrap text-sm">
            <thead>
              <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Compras</th>
                <th className="px-4 py-3">Total comprado</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((c) => {
                const stats = statsByCustomer.get(c.id) ?? { count: 0, total: 0 };
                return (
                  <tr key={c.id} className="border-b border-goldPale last:border-0">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.phone ? (
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          className="text-goldDark underline"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        <span className="text-inkSoft">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{stats.count}</td>
                    <td className="px-4 py-3">{formatCOP(stats.total)}</td>
                  </tr>
                );
              })}
              {allCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-inkSoft">
                    Aún no tienes clientes guardados — se agregan solos al registrar tu primera venta.
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
