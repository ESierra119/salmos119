'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EXPENSE_CATEGORY_LABELS } from '@/types/product';
import { formatCOP } from '@/lib/whatsapp';

const COLORS = ['#B08D57', '#221F1D', '#8C6F42', '#C9A876', '#55504A', '#E4D3B4'];

export function ExpensesByCategoryChart({ data }: { data: { category: string; amount: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-inkSoft">Aún no has registrado gastos.</p>;
  }

  const chartData = data.map((d) => ({
    name: EXPENSE_CATEGORY_LABELS[d.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? d.category,
    value: d.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name }) => name}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCOP(value)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
