'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TopProductsChart({ data }: { data: { name: string; cantidad: number; ingresos: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-inkSoft">Aún no hay ventas registradas.</p>;
  }

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 22 ? d.name.slice(0, 22) + '…' : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 38)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4D3B4" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#55504A' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="shortName"
          width={150}
          tick={{ fontSize: 12, fill: '#221F1D' }}
        />
        <Tooltip formatter={(value: number) => value} labelFormatter={(label) => label} />
        <Bar dataKey="cantidad" name="Unidades vendidas" fill="#B08D57" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
