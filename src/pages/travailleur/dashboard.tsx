import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { getWorkerEarnings } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, CalendarDays, CheckCircle2, Receipt, Eye, EyeOff } from 'lucide-react';
import { formatFcfa } from '@/lib/accounting';
import { StatsScrollRow, StatBadge } from '@/components/shared/stats-scroll-row';
import type { Attendance, Request } from '@/types';

const statusLabel: Record<string, string> = {
  assigned: 'Assignée',
  in_progress: 'En cours',
  done: 'Terminée',
  cancelled: 'Annulée',
};

export function WorkerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['worker-earnings'],
    queryFn: getWorkerEarnings,
  });

  const attendance = (data?.attendance as Attendance[] | undefined) ?? [];
  const requests = (data?.requests as Request[] | undefined) ?? [];
  const [periodMode, setPeriodMode] = useState<'all' | 'today'>('all');
  const [masked, setMasked] = useState(true);

  const filteredAttendance = useMemo(() => {
    if (periodMode === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return attendance.filter((a) => a.date && a.date.slice(0, 10) === today);
    }
    return attendance;
  }, [attendance, periodMode]);

  const netTotal = filteredAttendance.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const grossTotal = filteredAttendance.reduce((sum, a) => sum + Number(a.total_received || 0), 0);
  const levies = filteredAttendance.reduce((sum, a) => sum + Number(a.levy_amount || 0), 0);
  const days = new Set(attendance.map((a) => a.date)).size;
  const doneMissions = requests.filter((r) => r.status === 'done').length;

  const paidTotal = filteredAttendance.reduce((s, a) => s + (a.paid ? Number(a.paid_amount ?? a.amount ?? 0) : 0), 0);
  const unpaidTotal = filteredAttendance.reduce((s, a) => s + (a.paid ? 0 : Number(a.amount ?? 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Espace travailleur</h1>
        <p className="text-sm text-muted-foreground">
          Vos gains nets (après prélèvements admin) et historique des missions.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPeriodMode('today')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${periodMode === 'today' ? 'bg-[#0A2240] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setPeriodMode('all')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${periodMode === 'all' ? 'bg-[#0A2240] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Tout
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMasked((s) => !s)}
              className="rounded-full p-2 bg-white border shadow-sm hover:shadow-md"
              aria-label={masked ? 'Afficher les montants' : 'Cacher les montants'}
            >
              {masked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <StatsScrollRow cols={2} className="lg:gap-6">
            <StatBadge masked={masked} tone="accent" label="Montant payé" value={formatFcfa(paidTotal)} icon={<Wallet className="w-3.5 h-3.5" />} className="lg:w-[320px]" />
            <StatBadge masked={masked} tone="brand" label="À recevoir" value={formatFcfa(unpaidTotal)} icon={<Receipt className="w-3.5 h-3.5" />} className="lg:w-[320px]" />
            <StatBadge masked={masked} tone="success" label="Prélèvements" value={formatFcfa(levies)} className="lg:w-[320px]" />
            <StatBadge masked={masked} tone="muted" label="Jours d'activité" value={days} hint={`${doneMissions} mission(s) terminée(s)`} icon={<CalendarDays className="w-3.5 h-3.5" />} className="lg:w-[320px]" />
          </StatsScrollRow>
        </div>
      </div>

      <div className="app-card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FF6600]" /> Pointages / gains
        </h2>
        <div className="space-y-2">
          {filteredAttendance.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap justify-between gap-2 py-3 border-b border-border last:border-0 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{a.client_name || a.description}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {new Date(a.date).toLocaleDateString('fr-FR')} · Reçu client{' '}
                  {formatFcfa(Number(a.total_received || 0))}
                </p>
                {Number(a.levy_amount || 0) > 0 && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Prélèvement : {formatFcfa(Number(a.levy_amount))}
                  </p>
                )}
                {a.paid && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Payé le {new Date(a.paid_at || a.created_at).toLocaleDateString('fr-FR')} — {formatFcfa(Number(a.paid_amount ?? a.amount ?? 0))}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[#FF6600] font-semibold">{formatFcfa(Number(a.amount))}</p>
                <p className="text-[10px] text-muted-foreground">Votre part</p>
              </div>
            </div>
          ))}
          {!attendance.length && !isLoading && (
            <p className="text-sm text-muted-foreground">Aucun pointage pour le moment.</p>
          )}
        </div>
      </div>

      <div className="app-card p-5">
        <h2 className="font-semibold mb-3">Missions</h2>
        <div className="space-y-2">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex justify-between gap-2 py-2 border-b border-border last:border-0 text-sm"
            >
              <div>
                <p className="font-medium">{r.services?.name}</p>
                <p className="text-muted-foreground">
                  {r.zones?.name} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{statusLabel[r.status] || r.status}</Badge>
                {r.price != null && (
                  <p className="text-muted-foreground text-xs mt-1">{formatFcfa(Number(r.price))}</p>
                )}
              </div>
            </div>
          ))}
          {!requests.length && !isLoading && (
            <p className="text-sm text-muted-foreground">Aucune mission pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
