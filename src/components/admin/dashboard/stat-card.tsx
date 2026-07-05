import { motion } from 'framer-motion';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accent?: 'orange' | 'blue' | 'green' | 'amber' | 'purple' | 'red';
  delay?: number;
}

const accents = {
  orange: { bg: 'bg-orange-50', icon: 'bg-[#FF6600]/10 text-[#FF6600]', ring: 'ring-[#FF6600]/20' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', ring: 'ring-blue-200' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', ring: 'ring-amber-200' },
  purple: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', ring: 'ring-violet-200' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', ring: 'ring-red-200' },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'orange',
  delay = 0,
}: StatCardProps) {
  const style = accents[accent];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1',
        style.ring
      )}
    >
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60', style.bg)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0A2240]">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={cn('font-medium', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                {isPositive ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-gray-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', style.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
