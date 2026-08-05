import type { Sale, SaleItem, Expense, ExpenseCategory } from '@/types/product';
import { saleTotals } from '@/lib/pricing';

type SaleWithItems = Sale & { sale_items?: SaleItem[] };

// ---------- Ventas en el tiempo (agrupado por mes) ----------

export function salesByMonth(sales: SaleWithItems[]) {
  const map = new Map<string, { month: string; ingresos: number; utilidad: number }>();

  sales.forEach((s) => {
    const items = s.sale_items ?? [];
    const { subtotal, surcharge, profit } = saleTotals(s, items);
    const key = s.sale_date.slice(0, 7); // YYYY-MM
    const current = map.get(key) ?? { month: key, ingresos: 0, utilidad: 0 };
    current.ingresos += subtotal + surcharge;
    current.utilidad += profit;
    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
}

// ---------- Productos más vendidos ----------

export function topProducts(sales: SaleWithItems[], limit = 8) {
  const map = new Map<string, { name: string; cantidad: number; ingresos: number }>();

  sales.forEach((s) => {
    (s.sale_items ?? []).forEach((i) => {
      const key = i.product_id ?? i.product_name_snapshot;
      const current = map.get(key) ?? { name: i.product_name_snapshot, cantidad: 0, ingresos: 0 };
      current.cantidad += i.quantity;
      current.ingresos += i.quantity * i.unit_price;
      map.set(key, current);
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limit);
}

// ---------- Gastos por categoría ----------

export function expensesByCategory(expenses: Expense[]) {
  const map = new Map<ExpenseCategory, number>();
  expenses.forEach((e) => {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  });
  return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
}
