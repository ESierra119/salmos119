import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/AdminTopbar';
import { DeleteRecordButton } from '@/components/DeleteRecordButton';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { TopProductsChart } from '@/components/charts/TopProductsChart';
import { ExpensesByCategoryChart } from '@/components/charts/ExpensesByCategoryChart';
import { formatCOP } from '@/lib/whatsapp';
import { saleTotals } from '@/lib/pricing';
import { salesByMonth, topProducts, expensesByCategory } from '@/lib/accounting';
import { EXPENSE_CATEGORY_LABELS } from '@/types/product';
import type { Sale, Expense, Investment } from '@/types/product';

export const revalidate = 0;

export default async function ContabilidadPage() {
  const supabase = createClient();

  const [{ data: sales }, { data: expenses }, { data: investments }] = await Promise.all([
    supabase.from('sales').select('*, sale_items(*)').order('sale_date', { ascending: false }),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    supabase.from('investments').select('*').order('investment_date', { ascending: false }),
  ]);

  const allSales = (sales as unknown as Sale[]) ?? [];
  const allExpenses = (expenses as Expense[]) ?? [];
  const allInvestments = (investments as Investment[]) ?? [];

  const ingresos = allSales.reduce((sum, s) => sum + saleTotals(s, s.sale_items ?? []).subtotal + saleTotals(s, s.sale_items ?? []).surcharge, 0);
  const utilidadBruta = allSales.reduce((sum, s) => sum + saleTotals(s, s.sale_items ?? []).profit, 0);
  const gastosTotal = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const utilidadNeta = utilidadBruta - gastosTotal;
  const capitalInvertido = allInvestments.reduce((sum, i) => sum + i.amount, 0);
  const saldoPendiente = allSales.reduce((sum, s) => sum + Math.max(0, saleTotals(s, s.sale_items ?? []).balance), 0);

  return (
    <>
      <AdminTopbar title="Contabilidad" />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* PANORAMA FINANCIERO */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Capital invertido" value={formatCOP(capitalInvertido)} />
          <SummaryCard label="Ingresos por ventas" value={formatCOP(ingresos)} />
          <SummaryCard label="Gastos totales" value={formatCOP(gastosTotal)} />
          <SummaryCard label="Utilidad bruta" value={formatCOP(utilidadBruta)} />
          <SummaryCard label="Utilidad neta" value={formatCOP(utilidadNeta)} highlight />
          <SummaryCard label="Saldo por cobrar" value={formatCOP(saldoPendiente)} warn={saldoPendiente > 0} />
        </div>

        {/* GRÁFICAS */}
        <div className="mb-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded border border-goldPale bg-white p-5">
            <h3 className="mb-4 font-display text-lg">Ventas e ingresos en el tiempo</h3>
            <SalesTrendChart data={salesByMonth(allSales)} />
          </div>
          <div className="rounded border border-goldPale bg-white p-5">
            <h3 className="mb-4 font-display text-lg">Productos más vendidos</h3>
            <TopProductsChart data={topProducts(allSales)} />
          </div>
        </div>

        <div className="mb-10 rounded border border-goldPale bg-white p-5 lg:max-w-md">
          <h3 className="mb-4 font-display text-lg">Gastos por categoría</h3>
          <ExpensesByCategoryChart data={expensesByCategory(allExpenses)} />
        </div>

        {/* GASTOS */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Gastos</h2>
            <Link
              href="/admin/contabilidad/gastos/nuevo"
              className="rounded bg-ink px-5 py-2.5 text-[13px] tracking-wide text-cream hover:bg-goldDark"
            >
              + Registrar gasto
            </Link>
          </div>
          <div className="overflow-x-auto rounded border border-goldPale bg-white">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {allExpenses.map((e) => (
                  <tr key={e.id} className="border-b border-goldPale last:border-0">
                    <td className="px-4 py-3">{new Date(e.expense_date).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3">{EXPENSE_CATEGORY_LABELS[e.category]}</td>
                    <td className="px-4 py-3 text-inkSoft">{e.description ?? '—'}</td>
                    <td className="px-4 py-3">{formatCOP(e.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRecordButton table="expenses" id={e.id} confirmText="¿Eliminar este gasto?" />
                    </td>
                  </tr>
                ))}
                {allExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-inkSoft">
                      Aún no has registrado gastos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVERSIONES */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Inversiones</h2>
            <Link
              href="/admin/contabilidad/inversiones/nueva"
              className="rounded bg-ink px-5 py-2.5 text-[13px] tracking-wide text-cream hover:bg-goldDark"
            >
              + Registrar inversión
            </Link>
          </div>
          <div className="overflow-x-auto rounded border border-goldPale bg-white">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-goldPale bg-creamDeep text-left text-xs uppercase tracking-wider text-inkSoft">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {allInvestments.map((i) => (
                  <tr key={i.id} className="border-b border-goldPale last:border-0">
                    <td className="px-4 py-3">{new Date(i.investment_date).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-inkSoft">{i.description ?? '—'}</td>
                    <td className="px-4 py-3">{formatCOP(i.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRecordButton table="investments" id={i.id} confirmText="¿Eliminar esta inversión?" />
                    </td>
                  </tr>
                ))}
                {allInvestments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-inkSoft">
                      Aún no has registrado inversiones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
