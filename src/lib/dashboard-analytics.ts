import { format, subDays, startOfDay, isAfter, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Request, Worker, Zone } from '@/types';

export const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelles',
  assigned: 'Assignées',
  in_progress: 'En cours',
  done: 'Terminées',
  cancelled: 'Annulées',
};

export const STATUS_COLORS: Record<string, string> = {
  new: '#F59E0B',        // Série 1: Ambré/Or vif
  assigned: '#22D3EE',   // Série 2: Cyan Néon
  in_progress: '#C27D3D',// Ambré charte
  done: '#34D399',       // Série 3: Vert Émeraude Néon
  cancelled: '#FB7185',  // Série 5: Rose / Corail Néon
};

export const CHART_PALETTE = [
  '#C27D3D', // Série 1: Ambré / Or
  '#22D3EE', // Série 2: Cyan Néon
  '#34D399', // Série 3: Vert Émeraude Néon
  '#C084FC', // Série 4: Violet Électrique
  '#FB7185', // Série 5: Rose / Corail Néon
  '#F59E0B', // Ambré vif
  '#38BDF8', // Cyan clair
];

export function getRequestsTrend(requests: Request[] = [], days = 7) {
  const today = startOfDay(new Date());
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const count = requests.filter((r) =>
      isSameDay(new Date(r.created_at), date)
    ).length;
    result.push({
      date: format(date, 'EEE', { locale: fr }),
      fullDate: format(date, 'dd MMM', { locale: fr }),
      demandes: count,
    });
  }

  return result;
}

export function getStatusDistribution(requests: Request[] = []) {
  const counts: Record<string, number> = {
    new: 0,
    assigned: 0,
    in_progress: 0,
    done: 0,
    cancelled: 0,
  };

  requests.forEach((r) => {
    if (counts[r.status] !== undefined) counts[r.status]++;
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] ?? status,
      value,
      status,
      color: STATUS_COLORS[status],
    }));
}

export function getZoneStats(
  requests: Request[] = [],
  workers: Worker[] = [],
  zones: Zone[] = []
) {
  return zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    demandes: requests.filter((r) => r.zone_id === zone.id).length,
    travailleurs: workers.filter((w) => w.zone_id === zone.id && w.status === 'active').length,
    travailleursTotal: workers.filter((w) => w.zone_id === zone.id).length,
  })).sort((a, b) => b.demandes - a.demandes);
}

export function getTopServices(requests: Request[] = [], limit = 5) {
  const counts = new Map<string, { name: string; count: number }>();

  requests.forEach((r) => {
    const name = r.services?.name ?? 'Inconnu';
    const existing = counts.get(r.service_id) ?? { name, count: 0 };
    counts.set(r.service_id, { name, count: existing.count + 1 });
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((s) => ({ name: s.name, demandes: s.count }));
}

export function getCompletionRate(requests: Request[] = []) {
  if (!requests.length) return 0;
  const done = requests.filter((r) => r.status === 'done').length;
  return Math.round((done / requests.length) * 100);
}

export function getRecentGrowth(requests: Request[] = []) {
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 7);
  const twoWeeksAgo = subDays(today, 14);

  const thisWeek = requests.filter((r) => isAfter(new Date(r.created_at), weekAgo)).length;
  const lastWeek = requests.filter((r) => {
    const d = new Date(r.created_at);
    return isAfter(d, twoWeeksAgo) && !isAfter(d, weekAgo);
  }).length;

  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}
