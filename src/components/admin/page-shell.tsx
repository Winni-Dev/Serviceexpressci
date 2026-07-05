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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0A2240]">{title}</h1>
          {badge !== undefined && (
            <span className="inline-flex items-center rounded-full bg-[#FF6600]/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF6600]">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-gray-500 mt-1 text-sm">{description}</p>}
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
        'rounded-2xl border border-gray-100 bg-white shadow-sm',
        padding && 'p-5',
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
    <AdminCard className="space-y-4">
      {children}
      {resultCount !== undefined && (
        <p className="text-sm text-gray-400">
          <span className="font-medium text-[#0A2240]">{resultCount}</span> {resultLabel}
        </p>
      )}
    </AdminCard>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
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
    <div className={cn('col-span-full flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-2xl bg-gray-50 p-4">
          <Icon className="w-8 h-8 text-gray-300" />
        </div>
      )}
      <p className="text-gray-400 text-sm">{message}</p>
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
        'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-200',
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
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-gray-200" />
      <div className="h-24 rounded-2xl bg-gray-200" />
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
