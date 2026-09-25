import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
  onClick,
}) => {
  const styles = {
    indigo: {
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      textColor: 'text-indigo-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textColor: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textColor: 'text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400',
      textColor: 'text-rose-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/15 border-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      textColor: 'text-cyan-400',
    },
    purple: {
      bg: 'bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20',
      iconBg: 'bg-purple-500/20 text-purple-400',
      textColor: 'text-purple-400',
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 bg-slate-900/60 backdrop-blur-xs shadow-lg shadow-black/20 ${
        onClick ? 'cursor-pointer hover:scale-[1.01] hover:border-slate-700' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs text-slate-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
