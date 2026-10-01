import { motion } from 'framer-motion';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accent?: 'orange' | 'blue' | 'cyan' | 'green' | 'amber' | 'purple' | 'red';
  delay?: number;
  className?: string;
}

const accents = {
  orange: {
    bg: 'bg-[#C27D3D]/10',
    icon: 'bg-[rgba(194,125,61,0.15)] text-[#D99A5B] border border-[#C27D3D]/30',
    ring: 'border-[#27272A] hover:border-[#C27D3D]/40',
  },
  amber: {
    bg: 'bg-[#F59E0B]/10',
    icon: 'bg-[rgba(194,125,61,0.15)] text-[#D99A5B] border border-[#C27D3D]/30',
    ring: 'border-[#27272A] hover:border-[#C27D3D]/40',
  },
  cyan: {
    bg: 'bg-[#22D3EE]/10',
    icon: 'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30',
    ring: 'border-[#27272A] hover:border-[#22D3EE]/40',
  },
  blue: {
    bg: 'bg-[#22D3EE]/10',
    icon: 'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30',
    ring: 'border-[#27272A] hover:border-[#22D3EE]/40',
  },
  green: {
    bg: 'bg-[#34D399]/10',
    icon: 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30',
    ring: 'border-[#27272A] hover:border-[#34D399]/40',
  },
  purple: {
    bg: 'bg-[#C084FC]/10',
    icon: 'bg-[#C084FC]/15 text-[#C084FC] border border-[#C084FC]/30',
    ring: 'border-[#27272A] hover:border-[#C084FC]/40',
  },
  red: {
    bg: 'bg-[#FB7185]/10',
    icon: 'bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30',
    ring: 'border-[#27272A] hover:border-[#FB7185]/40',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'orange',
  delay = 0,
  className,
}: StatCardProps) {
  const style = accents[accent] || accents.orange;
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl sm:rounded-2xl border bg-[#121212] p-4 shadow-sm transition-all duration-200',
        'snap-start shrink-0 w-[min(200px,70vw)] sm:w-[190px] lg:w-auto lg:min-w-0 lg:shrink',
        style.ring,
        className
      )}
    >
      <div className={cn('absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-40 blur-xl pointer-events-none', style.bg)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-zinc-400 truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">{value}</p>
          {trend !== undefined && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px]">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-[#34D399]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-[#FB7185]" />
              )}
              <span className={cn('font-semibold', isPositive ? 'text-[#34D399]' : 'text-[#FB7185]')}>
                {isPositive ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-zinc-500 truncate">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5 shrink-0 flex items-center justify-center', style.icon)}>
          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
      </div>
    </motion.div>
  );
}
