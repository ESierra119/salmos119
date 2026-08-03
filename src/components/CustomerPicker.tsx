'use client';

import { useMemo, useState } from 'react';
import type { Customer } from '@/types/product';

export function CustomerPicker({
  customers,
  name,
  phone,
  onChangeName,
  onChangePhone,
  onSelectCustomer,
}: {
  customers: Customer[];
  name: string;
  phone: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onSelectCustomer: (c: Customer | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [customers, name]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative">
        <label className="mb-1 block text-xs text-inkSoft">Cliente</label>
        <input
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value);
            onSelectCustomer(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          required
          placeholder="Nombre del cliente"
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        {open && results.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded border border-goldPale bg-white shadow-lg">
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => {
                  onChangeName(c.name);
                  onChangePhone(c.phone ?? '');
                  onSelectCustomer(c);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-creamDeep"
              >
                <span className="truncate">{c.name}</span>
                <span className="whitespace-nowrap text-xs text-inkSoft">{c.phone ?? 'sin teléfono'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs text-inkSoft">Teléfono (WhatsApp)</label>
        <input
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="3001234567"
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}
