import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string | number;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>
          {badge !== undefined && (
            <span className="inline-flex items-center rounded-full bg-[rgba(194,125,61,0.15)] border border-[#C27D3D]/30 px-2.5 py-0.5 text-xs font-semibold text-[#D99A5B]">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-zinc-400 mt-0.5 text-xs sm:text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] shadow-sm',
        padding && 'p-4 sm:p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function FilterBar({
  children,
  resultCount,
  resultLabel = 'résultat(s)',
}: {
  children: React.ReactNode;
  resultCount?: number;
  resultLabel?: string;
}) {
  return (
    <AdminCard className="space-y-3">
      {children}
      {resultCount !== undefined && (
        <p className="text-xs text-zinc-400">
          <span className="font-semibold text-white">{resultCount}</span> {resultLabel}
        </p>
      )}
    </AdminCard>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-[#FB7185]/30 bg-[#FB7185]/15 px-4 py-3 text-xs sm:text-sm text-[#FB7185]">
      {message}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  message,
  className,
}: {
  icon?: LucideIcon;
  message: string;
  className?: string;
}) {
  return (
    <div className={cn('col-span-full flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <div className="mb-3 rounded-2xl bg-[#18181B] border border-[#27272A] p-3.5">
          <Icon className="w-6 h-6 text-zinc-500" />
        </div>
      )}
      <p className="text-zinc-400 text-xs sm:text-sm">{message}</p>
    </div>
  );
}

export function EntityCard({
  children,
  className,
  inactive,
}: {
  children: React.ReactNode;
  className?: string;
  inactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] p-4 shadow-sm transition-all duration-200 hover:border-[#C27D3D]/40',
        inactive && 'opacity-60',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-44 rounded-xl bg-[#18181B] border border-[#27272A]" />
      <div className="h-20 rounded-2xl bg-[#18181B] border border-[#27272A]" />
      <div className="grid md:grid-cols-3 gap-3.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-[#18181B] border border-[#27272A]" />
        ))}
      </div>
    </div>
  );
}
