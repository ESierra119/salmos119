'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCOP } from '@/lib/whatsapp';
import {
  saleSubtotal,
  saleCreditSurcharge,
  saleTotalToPay,
  saleBalance,
  saleStatus,
  saleTotalProfit,
  suggestedInstallment,
} from '@/lib/pricing';
import type { Sale, SalePayment } from '@/types/product';

export function SaleDetail({ sale, payments }: { sale: Sale; payments: SalePayment[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = saleSubtotal(sale);
  const surcharge = saleCreditSurcharge(sale);
  const total = saleTotalToPay(sale);
  const balance = saleBalance(sale);
  const status = saleStatus(sale);
  const profit = saleTotalProfit(sale);

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from('sale_payments')
      .insert({ sale_id: sale.id, amount: value, payment_date: paymentDate });

    setSaving(false);
    if (error) {
      setError('No se pudo registrar el abono: ' + error.message);
      return;
    }
    setAmount('');
    router.refresh();
  }

  async function handleDeletePayment(id: string) {
    if (!confirm('¿Quitar este abono? El saldo se recalcula automáticamente.')) return;
    await supabase.from('sale_payments').delete().eq('id', id);
    router.refresh();
  }

  async function handleDeleteSale() {
    if (!confirm('¿Eliminar este registro de venta? Esta acción no se puede deshacer.')) return;
    await supabase.from('sales').delete().eq('id', sale.id);
    router.push('/admin/ventas');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-8">
      <div className="rounded border border-goldPale bg-white p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">{sale.product_name_snapshot}</h2>
            <p className="text-sm text-inkSoft">
              {sale.customer_name} &middot; {new Date(sale.sale_date).toLocaleDateString('es-CO')}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              status === 'Pagado'
                ? 'bg-green-100 text-green-700'
                : status === 'Parcial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="space-y-1.5 text-sm">
          <Row label="Cantidad" value={sale.quantity.toString()} />
          <Row label="Precio unitario" value={formatCOP(sale.unit_price)} />
          <Row label="Subtotal" value={formatCOP(subtotal)} />
          <Row label="Tipo de pago" value={sale.payment_type === 'credito' ? 'Crédito' : 'Contado'} />
          {sale.payment_type === 'credito' && (
            <>
              <Row label="Recargo por crédito" value={formatCOP(surcharge)} />
              <Row label="Cuotas" value={sale.installments_count.toString()} />
              <Row label="Cuota sugerida" value={formatCOP(suggestedInstallment(sale))} />
            </>
          )}
          <Row label="Total a pagar" value={formatCOP(total)} strong />
          <Row label="Abonado hasta hoy" value={formatCOP(sale.paid_amount)} />
          <Row label="Saldo" value={formatCOP(Math.max(0, balance))} strong />
          <Row label="Utilidad de esta venta" value={formatCOP(profit)} highlight />
        </div>
      </div>

      {/* Historial de abonos */}
      <div className="rounded border border-goldPale bg-white p-5">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-inkSoft">Historial de abonos</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-inkSoft">Todavía no se ha registrado ningún abono.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-goldPale py-2 text-sm last:border-0">
                <div>
                  <span className="font-medium">{formatCOP(p.amount)}</span>
                  <span className="ml-2 text-xs text-inkSoft">
                    {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <button onClick={() => handleDeletePayment(p.id)} className="text-xs text-red-600 underline">
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {status !== 'Pagado' && (
        <form onSubmit={handleAddPayment} className="rounded border border-goldPale bg-white p-5">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-inkSoft">Registrar nuevo abono</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-inkSoft">Monto (COP)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
                placeholder="Ej: 50000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-inkSoft">Fecha del abono</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-3 w-full rounded bg-ink py-2.5 text-sm text-cream hover:bg-goldDark disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Registrar abono'}
          </button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </form>
      )}

      {sale.notes && (
        <div className="rounded border border-goldPale bg-white p-5 text-sm text-inkSoft">
          <p className="mb-1 text-xs uppercase tracking-wider">Notas</p>
          {sale.notes}
        </div>
      )}

      <button onClick={handleDeleteSale} className="text-xs text-red-600 underline">
        Eliminar este registro de venta
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  highlight,
}: {
  label: string;
  value: string;
  strong?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? 'border-t border-goldPale pt-1.5 font-medium' : ''}`}>
      <span className="text-inkSoft">{label}</span>
      <span className={highlight ? 'font-medium text-goldDark' : ''}>{value}</span>
    </div>
  );
}
