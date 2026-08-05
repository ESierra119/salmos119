'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMonthLabel } from '@/lib/accounting';
import { formatCOP } from '@/lib/whatsapp';

export function SalesTrendChart({ data }: { data: { month: string; ingresos: number; utilidad: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-inkSoft">Aún no hay ventas suficientes para mostrar una tendencia.</p>;
  }

  const chartData = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4D3B4" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#55504A' }} />
        <YAxis tick={{ fontSize: 11, fill: '#55504A' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(value: number) => formatCOP(value)} labelStyle={{ color: '#221F1D' }} />
        <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#B08D57" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="utilidad" name="Utilidad" stroke="#221F1D" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
