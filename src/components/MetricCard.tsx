import { clsx } from 'clsx';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
  purple: 'bg-purple-500/10 text-purple-400',
};

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  className,
  color = 'emerald',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={clsx(
        'rounded-xl border border-zinc-800 bg-zinc-900/50 p-5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <div className={clsx('rounded-lg p-2', colorMap[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <TrendIcon
            className={clsx(
              'h-3 w-3',
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500'
            )}
          />
          <span
            className={clsx(
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500'
            )}
          >
            {trendValue}
          </span>
          <span className="text-zinc-600">vs last period</span>
        </div>
      )}
    </div>
  );
}
