'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCOP } from '@/lib/whatsapp';
import { itemsSubtotal, saleCreditSurcharge, saleTotalToPay, suggestedInstallment } from '@/lib/pricing';
import { ProductCombobox } from '@/components/ProductCombobox';
import { CustomerPicker } from '@/components/CustomerPicker';
import type { Product, Customer, PaymentType } from '@/types/product';

type DraftLine = {
  key: string;
  productId: string;
  productName: string;
  internalCode: string | null;
  unitCost: number;
  quantity: number;
  unitPrice: number;
};

export function NewSaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentType, setPaymentType] = useState<PaymentType>('contado');
  const [surchargeRate, setSurchargeRate] = useState('3');
  const [installments, setInstallments] = useState('2');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lines, setLines] = useState<DraftLine[]>([]);

  // Campos "en construcción" para agregar la siguiente línea del pedido
  const [stagingProduct, setStagingProduct] = useState<Product | null>(null);
  const [stagingQty, setStagingQty] = useState('1');
  const [stagingPrice, setStagingPrice] = useState('');

  function handleStagingProductSelect(p: Product) {
    setStagingProduct(p);
    setStagingPrice(p.price.toString());
  }

  function addLine() {
    if (!stagingProduct) return;
    const qty = Number(stagingQty) || 1;
    const price = Number(stagingPrice) || 0;

    setLines((prev) => {
      const existing = prev.find((l) => l.productId === stagingProduct.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === stagingProduct.id ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [
        ...prev,
        {
          key: crypto.randomUUID(),
          productId: stagingProduct.id,
          productName: stagingProduct.name,
          internalCode: stagingProduct.internal_code,
          unitCost: stagingProduct.cost_price + stagingProduct.shipping_cost,
          quantity: qty,
          unitPrice: price,
        },
      ];
    });

    setStagingProduct(null);
    setStagingQty('1');
    setStagingPrice('');
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function updateLineQty(key: string, qty: number) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, qty) } : l)));
  }

  function updateLinePrice(key: string, price: number) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, unitPrice: Math.max(0, price) } : l)));
  }

  const preview = useMemo(() => {
    const subtotal = itemsSubtotal(lines.map((l) => ({ quantity: l.quantity, unit_price: l.unitPrice })));
    const surcharge = saleCreditSurcharge(subtotal, paymentType, Number(surchargeRate) / 100 || 0);
    const total = saleTotalToPay(subtotal, surcharge);
    const installment = suggestedInstallment(total, Number(installments) || 1);
    return { subtotal, surcharge, total, installment };
  }, [lines, paymentType, surchargeRate, installments]);

  async function resolveCustomerId(): Promise<string | null> {
    const trimmedPhone = customerPhone.trim();

    if (selectedCustomer) {
      if (trimmedPhone && trimmedPhone !== (selectedCustomer.phone ?? '')) {
        await supabase.from('customers').update({ phone: trimmedPhone }).eq('id', selectedCustomer.id);
      }
      return selectedCustomer.id;
    }

    if (trimmedPhone) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', trimmedPhone)
        .maybeSingle();
      if (existing) return existing.id;
    }

    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert({ name: customerName.trim(), phone: trimmedPhone || null })
      .select()
      .single();

    if (createError) throw createError;
    return created.id;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const customerId = await resolveCustomerId();

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_date: saleDate,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || null,
          customer_id: customerId,
          payment_type: paymentType,
          credit_surcharge_rate: paymentType === 'credito' ? Number(surchargeRate) / 100 : 0,
          installments_count: paymentType === 'credito' ? Number(installments) : 1,
          paid_amount: 0,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const itemsPayload = lines.map((l) => ({
        sale_id: sale.id,
        product_id: l.productId,
        product_name_snapshot: l.productName,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        unit_cost: l.unitCost,
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      router.push('/admin/ventas');
      router.refresh();
    } catch (err) {
      setError('No se pudo guardar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-8">
        <p className="rounded border border-dashed border-goldPale p-6 text-center text-inkSoft">
          Primero necesitas crear al menos un producto antes de poder registrar una venta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5 px-6 py-8">
      <div>
        <label className="mb-1 block text-xs text-inkSoft">Fecha</label>
        <input
          type="date"
          required
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      <CustomerPicker
        customers={customers}
        name={customerName}
        phone={customerPhone}
        onChangeName={setCustomerName}
        onChangePhone={setCustomerPhone}
        onSelectCustomer={setSelectedCustomer}
      />

      {/* Productos del pedido */}
      <div className="rounded border border-goldPale p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-inkSoft">Productos del pedido</p>

        {lines.length > 0 && (
          <div className="mb-4 space-y-2">
            {lines.map((l) => (
              <div key={l.key} className="flex items-center gap-2.5 rounded border border-goldPale bg-creamDeep/40 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{l.productName}</p>
                  {l.internalCode && <p className="font-mono text-[10px] text-inkSoft">{l.internalCode}</p>}
                </div>
                <input
                  type="number"
                  min="1"
                  value={l.quantity}
                  onChange={(e) => updateLineQty(l.key, Number(e.target.value))}
                  className="w-14 rounded border border-goldPale bg-white px-2 py-1.5 text-center text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={l.unitPrice}
                  onChange={(e) => updateLinePrice(l.key, Number(e.target.value))}
                  className="w-24 rounded border border-goldPale bg-white px-2 py-1.5 text-right text-sm"
                />
                <span className="w-24 whitespace-nowrap text-right text-sm font-medium">
                  {formatCOP(l.quantity * l.unitPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLine(l.key)}
                  className="text-inkSoft hover:text-red-600"
                  aria-label="Quitar producto"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-inkSoft">Producto</label>
            <ProductCombobox products={products} selectedProduct={stagingProduct} onSelect={handleStagingProductSelect} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-inkSoft">Cant.</label>
            <input
              type="number"
              min="1"
              value={stagingQty}
              onChange={(e) => setStagingQty(e.target.value)}
              className="w-16 rounded border border-goldPale px-2 py-2.5 text-center text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-inkSoft">Precio</label>
            <input
              type="number"
              min="0"
              value={stagingPrice}
              onChange={(e) => setStagingPrice(e.target.value)}
              className="w-28 rounded border border-goldPale px-2 py-2.5 text-right text-sm outline-none focus:border-gold"
            />
          </div>
          <button
            type="button"
            onClick={addLine}
            disabled={!stagingProduct}
            className="rounded bg-ink px-4 py-2.5 text-sm text-cream hover:bg-goldDark disabled:opacity-40"
          >
            + Agregar
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-inkSoft">Tipo de pago</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPaymentType('contado')}
            className={`flex-1 rounded border px-4 py-2.5 text-sm ${
              paymentType === 'contado' ? 'border-ink bg-ink text-cream' : 'border-goldPale text-inkSoft'
            }`}
          >
            Contado
          </button>
          <button
            type="button"
            onClick={() => setPaymentType('credito')}
            className={`flex-1 rounded border px-4 py-2.5 text-sm ${
              paymentType === 'credito' ? 'border-ink bg-ink text-cream' : 'border-goldPale text-inkSoft'
            }`}
          >
            Crédito
          </button>
        </div>
      </div>

      {paymentType === 'credito' && (
        <div className="grid grid-cols-2 gap-4 rounded border border-goldPale bg-creamDeep/50 p-4">
          <div>
            <label className="mb-1 block text-xs text-inkSoft">Recargo por crédito (%)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={surchargeRate}
              onChange={(e) => setSurchargeRate(e.target.value)}
              className="w-full rounded border border-goldPale bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-inkSoft">Número de cuotas</label>
            <input
              type="number"
              min="1"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full rounded border border-goldPale bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>
        </div>
      )}

      <div className="rounded border border-goldPale bg-creamDeep/50 p-4 text-sm">
        <div className="flex justify-between py-0.5">
          <span className="text-inkSoft">Subtotal ({lines.length} producto{lines.length === 1 ? '' : 's'})</span>
          <span>{formatCOP(preview.subtotal)}</span>
        </div>
        {paymentType === 'credito' && (
          <div className="flex justify-between py-0.5">
            <span className="text-inkSoft">Recargo por crédito</span>
            <span>{formatCOP(preview.surcharge)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-goldPale pt-1.5 font-medium">
          <span>Total a pagar</span>
          <span className="font-display text-lg">{formatCOP(preview.total)}</span>
        </div>
        {paymentType === 'credito' && Number(installments) > 1 && (
          <div className="mt-1 flex justify-between text-xs text-inkSoft">
            <span>Cuota sugerida ({installments}x)</span>
            <span>{formatCOP(preview.installment)}</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-ink px-6 py-3 text-sm tracking-wide text-cream hover:bg-goldDark disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Registrar venta'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/ventas')}
          className="rounded border border-goldPale px-6 py-3 text-sm text-inkSoft hover:border-gold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
