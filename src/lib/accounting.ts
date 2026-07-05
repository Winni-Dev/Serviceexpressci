import {
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Attendance } from '@/types';

export type PeriodMode = 'all' | 'month' | 'range';

export interface PeriodFilter {
  mode: PeriodMode;
  month: string;
  dateFrom: string;
  dateTo: string;
}

export interface AccountingTotals {
  totalReceived: number;
  totalPaid: number;
  profit: number;
  count: number;
}

export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

export function getRecordProfit(record: Attendance): number {
  return (record.total_received ?? 0) - record.amount;
}

export function computeTotals(records: Attendance[]): AccountingTotals {
  return records.reduce(
    (acc, record) => ({
      totalReceived: acc.totalReceived + (record.total_received ?? 0),
      totalPaid: acc.totalPaid + record.amount,
      profit: acc.profit + getRecordProfit(record),
      count: acc.count + 1,
    }),
    { totalReceived: 0, totalPaid: 0, profit: 0, count: 0 }
  );
}

export function filterByPeriod(records: Attendance[], filter: PeriodFilter): Attendance[] {
  if (filter.mode === 'all') return records;

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    return records.filter((r) => {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start, end });
    });
  }

  if (filter.mode === 'range' && filter.dateFrom && filter.dateTo) {
    const start = startOfDay(parseISO(filter.dateFrom));
    const end = endOfDay(parseISO(filter.dateTo));
    return records.filter((r) => {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start, end });
    });
  }

  return records;
}

export function filterByWorker(
  records: Attendance[],
  workerId: string | null,
  searchTerm: string
): Attendance[] {
  let result = records;

  if (workerId) {
    result = result.filter((r) => r.worker_id === workerId);
  } else if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    result = result.filter((r) => r.workers?.name?.toLowerCase().includes(q));
  }

  return result;
}

export function getWorkerLifetimeStats(records: Attendance[], workerId: string): AccountingTotals {
  return computeTotals(records.filter((r) => r.worker_id === workerId));
}

export function getPeriodLabel(filter: PeriodFilter): string {
  if (filter.mode === 'all') return 'Toute la période';

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: fr });
  }

  if (filter.mode === 'range' && filter.dateFrom && filter.dateTo) {
    const from = format(parseISO(filter.dateFrom), 'dd MMM yyyy', { locale: fr });
    const to = format(parseISO(filter.dateTo), 'dd MMM yyyy', { locale: fr });
    return `Du ${from} au ${to}`;
  }

  return 'Période non définie';
}
