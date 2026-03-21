'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DORAHistory } from '@/lib/types';

interface DORAChartProps {
  data: DORAHistory[];
  metric?: keyof Omit<DORAHistory, 'date'>;
}

const metricConfig = {
  deployment_frequency: { color: '#10b981', label: 'Deploy Frequency', unit: '/day' },
  lead_time: { color: '#3b82f6', label: 'Lead Time', unit: 'hrs' },
  change_failure_rate: { color: '#f59e0b', label: 'Change Failure Rate', unit: '%' },
  mttr: { color: '#ef4444', label: 'MTTR', unit: 'hrs' },
};

export function DORAChart({ data, metric }: DORAChartProps) {
  const metrics = metric ? [metric] : (Object.keys(metricConfig) as (keyof typeof metricConfig)[]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#52525b"
            fontSize={11}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis stroke="#52525b" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          {metrics.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
            />
          )}
          {metrics.map((m) => (
            <Line
              key={m}
              type="monotone"
              dataKey={m}
              stroke={metricConfig[m].color}
              strokeWidth={2}
              dot={false}
              name={metricConfig[m].label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
