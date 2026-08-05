'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@/types/product';

export function ExpenseForm() {
  const router = useRouter();
  const supabase = createClient();

  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('envios');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('expenses').insert({
      expense_date: expenseDate,
      category,
      amount: Number(amount),
      description: description || null,
    });

    setSaving(false);
    if (error) {
      setError('No se pudo guardar: ' + error.message);
      return;
    }
    router.push('/admin/contabilidad');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-6 py-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Fecha</label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Monto (COP)</label>
          <input
            type="number"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="50000"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        >
          {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Descripción (opcional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Guías de envío del mes"
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-ink px-6 py-3 text-sm tracking-wide text-cream hover:bg-goldDark disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Registrar gasto'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/contabilidad')}
          className="rounded border border-goldPale px-6 py-3 text-sm text-inkSoft hover:border-gold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
