'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCOP } from '@/lib/whatsapp';
import { saleSubtotal, saleCreditSurcharge, saleTotalToPay, suggestedInstallment } from '@/lib/pricing';
import { ProductCombobox } from '@/components/ProductCombobox';
import { CustomerPicker } from '@/components/CustomerPicker';
import type { Product, Customer, PaymentType } from '@/types/product';

export function NewSaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState(products[0]?.price?.toString() ?? '0');
  const [paymentType, setPaymentType] = useState<PaymentType>('contado');
  const [surchargeRate, setSurchargeRate] = useState('3');
  const [installments, setInstallments] = useState('2');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleProductSelect(p: Product) {
    setSelectedProduct(p);
    setUnitPrice(p.price.toString());
  }

  const preview = useMemo(() => {
    const draft = {
      quantity: Number(quantity) || 0,
      unit_price: Number(unitPrice) || 0,
      payment_type: paymentType,
      credit_surcharge_rate: Number(surchargeRate) / 100 || 0,
      installments_count: Number(installments) || 1,
    };
    return {
      subtotal: saleSubtotal(draft),
      surcharge: saleCreditSurcharge(draft),
      total: saleTotalToPay(draft),
      installment: suggestedInstallment(draft),
    };
  }, [quantity, unitPrice, paymentType, surchargeRate, installments]);

  async function resolveCustomerId(): Promise<string | null> {
    const trimmedPhone = customerPhone.trim();

    if (selectedCustomer) {
      if (trimmedPhone && trimmedPhone !== (selectedCustomer.phone ?? '')) {
        await supabase.from('customers').update({ phone: trimmedPhone }).eq('id', selectedCustomer.id);
      }
      return selectedCustomer.id;
    }

    // Si el teléfono coincide con un cliente ya existente, lo reutilizamos en vez de duplicar.
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
    if (!selectedProduct) return;
    setSaving(true);
    setError(null);

    try {
      const customerId = await resolveCustomerId();

      const payload = {
        sale_date: saleDate,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_id: customerId,
        product_id: selectedProduct.id,
        product_name_snapshot: selectedProduct.name,
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
        unit_cost: selectedProduct.cost_price + selectedProduct.shipping_cost,
        payment_type: paymentType,
        credit_surcharge_rate: paymentType === 'credito' ? Number(surchargeRate) / 100 : 0,
        installments_count: paymentType === 'credito' ? Number(installments) : 1,
        paid_amount: 0,
      };

      const { error: saleError } = await supabase.from('sales').insert(payload);
      if (saleError) throw saleError;

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

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Producto</label>
        <ProductCombobox products={products} selectedProduct={selectedProduct} onSelect={handleProductSelect} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Cantidad</label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Precio unitario (COP)</label>
          <input
            type="number"
            min="0"
            required
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
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
          <span className="text-inkSoft">Subtotal</span>
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
