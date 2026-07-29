import type { Sale } from '@/types/product';

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

// ---------- Cálculos de una venta individual ----------

export function saleSubtotal(sale: Pick<Sale, 'quantity' | 'unit_price'>) {
  return sale.quantity * sale.unit_price;
}

export function saleCreditSurcharge(sale: Pick<Sale, 'quantity' | 'unit_price' | 'payment_type' | 'credit_surcharge_rate'>) {
  if (sale.payment_type !== 'credito') return 0;
  return saleSubtotal(sale) * sale.credit_surcharge_rate;
}

export function saleTotalToPay(sale: Pick<Sale, 'quantity' | 'unit_price' | 'payment_type' | 'credit_surcharge_rate'>) {
  return saleSubtotal(sale) + saleCreditSurcharge(sale);
}

export function saleBalance(sale: Pick<Sale, 'quantity' | 'unit_price' | 'payment_type' | 'credit_surcharge_rate' | 'paid_amount'>) {
  return saleTotalToPay(sale) - sale.paid_amount;
}

export function saleStatus(sale: Pick<Sale, 'quantity' | 'unit_price' | 'payment_type' | 'credit_surcharge_rate' | 'paid_amount'>): 'Pagado' | 'Parcial' | 'Pendiente' {
  const balance = saleBalance(sale);
  if (balance <= 0) return 'Pagado';
  if (sale.paid_amount > 0) return 'Parcial';
  return 'Pendiente';
}

export function saleUnitProfit(sale: Pick<Sale, 'unit_price' | 'unit_cost'>) {
  return sale.unit_price - sale.unit_cost;
}

export function saleTotalProfit(sale: Pick<Sale, 'quantity' | 'unit_price' | 'unit_cost'>) {
  return sale.quantity * saleUnitProfit(sale);
}

export function suggestedInstallment(sale: Pick<Sale, 'quantity' | 'unit_price' | 'payment_type' | 'credit_surcharge_rate' | 'installments_count'>) {
  if (sale.installments_count <= 0) return saleTotalToPay(sale);
  return saleTotalToPay(sale) / sale.installments_count;
}
