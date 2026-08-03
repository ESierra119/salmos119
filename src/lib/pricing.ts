import type { PaymentType, Sale, SaleItem } from '@/types/product';

export function unitTotalCost(costPrice: number, shippingCost: number) {
  return costPrice + shippingCost;
}

export function unitProfit(price: number, costPrice: number, shippingCost: number) {
  return price - unitTotalCost(costPrice, shippingCost);
}

export function profitMargin(price: number, costPrice: number, shippingCost: number) {
  if (price === 0) return 0;
  return unitProfit(price, costPrice, shippingCost) / price;
}

export function formatPercent(value: number) {
  return (value * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
}

// ---------- Cálculos de una venta (pedido con varias líneas de producto) ----------

type LineLike = Pick<SaleItem, 'quantity' | 'unit_price'>;
type LineWithCost = Pick<SaleItem, 'quantity' | 'unit_price' | 'unit_cost'>;
type SaleHeader = Pick<Sale, 'payment_type' | 'credit_surcharge_rate' | 'installments_count' | 'paid_amount'>;

export function itemsSubtotal(items: LineLike[]) {
  return items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
}

export function itemsTotalProfit(items: LineWithCost[]) {
  return items.reduce((sum, i) => sum + i.quantity * (i.unit_price - i.unit_cost), 0);
}

export function saleCreditSurcharge(subtotal: number, paymentType: PaymentType, rate: number) {
  if (paymentType !== 'credito') return 0;
  return subtotal * rate;
}

export function saleTotalToPay(subtotal: number, surcharge: number) {
  return subtotal + surcharge;
}

export function saleBalance(total: number, paidAmount: number) {
  return total - paidAmount;
}

export function saleStatus(total: number, paidAmount: number): 'Pagado' | 'Parcial' | 'Pendiente' {
  const balance = saleBalance(total, paidAmount);
  if (balance <= 0) return 'Pagado';
  if (paidAmount > 0) return 'Parcial';
  return 'Pendiente';
}

export function suggestedInstallment(total: number, installmentsCount: number) {
  if (installmentsCount <= 0) return total;
  return total / installmentsCount;
}

// Atajo para cuando ya tienes el encabezado + sus líneas juntos (ej. sale.sale_items)
export function saleTotals(sale: SaleHeader, items: LineWithCost[]) {
  const subtotal = itemsSubtotal(items);
  const surcharge = saleCreditSurcharge(subtotal, sale.payment_type, sale.credit_surcharge_rate);
  const total = saleTotalToPay(subtotal, surcharge);
  const balance = saleBalance(total, sale.paid_amount);
  const status = saleStatus(total, sale.paid_amount);
  const profit = itemsTotalProfit(items);
  const installment = suggestedInstallment(total, sale.installments_count);
  return { subtotal, surcharge, total, balance, status, profit, installment };
}
