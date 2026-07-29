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
import type { Sale } from '@/types/product';

export function SaleDetail({ sale }: { sale: Sale }) {
  const router = useRouter();
  const supabase = createClient();
  const [abono, setAbono] = useState('');
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
    const amount = Number(abono);
    if (!amount || amount <= 0) return;

    setSaving(true);
    setError(null);

    const newPaid = sale.paid_amount + amount;
    const { error } = await supabase.from('sales').update({ paid_amount: newPaid }).eq('id', sale.id);

    setSaving(false);
    if (error) {
      setError('No se pudo registrar el abono: ' + error.message);
      return;
    }
    setAbono('');
    router.refresh();
  }

  async function handleDelete() {
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
          <Row label="Abonado" value={formatCOP(sale.paid_amount)} />
          <Row label="Saldo" value={formatCOP(Math.max(0, balance))} strong />
          <Row label="Utilidad de esta venta" value={formatCOP(profit)} highlight />
        </div>
      </div>

      {status !== 'Pagado' && (
        <form onSubmit={handleAddPayment} className="rounded border border-goldPale bg-white p-5">
          <label className="mb-1.5 block text-xs text-inkSoft">Registrar abono (COP)</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              value={abono}
              onChange={(e) => setAbono(e.target.value)}
              className="flex-1 rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="Ej: 50000"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-ink px-5 py-2.5 text-sm text-cream hover:bg-goldDark disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Abonar'}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </form>
      )}

      {sale.notes && (
        <div className="rounded border border-goldPale bg-white p-5 text-sm text-inkSoft">
          <p className="mb-1 text-xs uppercase tracking-wider">Notas</p>
          {sale.notes}
        </div>
      )}

      <button onClick={handleDelete} className="text-xs text-red-600 underline">
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
