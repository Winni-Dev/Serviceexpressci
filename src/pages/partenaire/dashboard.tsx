import { useQuery } from '@tanstack/react-query';
import { getPartnerWorkers, getPartnerInvitations, getWorkerRatingStatsMap } from '@/services/api';
import { Loader2, Users, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WorkerBadgeCard } from '@/components/shared/worker-badge-card';
import { StatsScrollRow, StatBadge } from '@/components/shared/stats-scroll-row';
import type { Worker, WorkerInvitation } from '@/types';
import { useMemo } from 'react';

export function PartnerDashboardPage() {
  const { data: workers, isLoading } = useQuery({
    queryKey: ['partner-workers'],
    queryFn: getPartnerWorkers,
  });
  const { data: invitations } = useQuery({
    queryKey: ['partner-invitations'],
    queryFn: getPartnerInvitations,
  });

  const workerIds = useMemo(
    () => ((workers as Worker[] | undefined) ?? []).map((w) => w.id),
    [workers]
  );

  const { data: ratingsMap } = useQuery({
    queryKey: ['partner-worker-ratings', workerIds],
    queryFn: () => getWorkerRatingStatsMap(workerIds),
    enabled: workerIds.length > 0,
  });

  const pending =
    (invitations as WorkerInvitation[] | undefined)?.filter((i) => i.status === 'pending').length ??
    0;
  const active = (workers as Worker[] | undefined)?.filter((w) => w.status === 'active').length ?? 0;
  const total = (workers as Worker[] | undefined)?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace partenaire</h1>
          <p className="text-sm text-muted-foreground">
            Votre équipe invitée — photo, infos et notes clients.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]">
          <Link to="/partenaire/travailleurs">Ajouter un travailleur</Link>
        </Button>
      </div>

      <StatsScrollRow cols={3}>
        <StatBadge
          tone="brand"
          label="Travailleurs actifs"
          value={active}
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <StatBadge
          tone="accent"
          label="Invitations en attente"
          value={pending}
          icon={<Bell className="w-3.5 h-3.5" />}
        />
        <StatBadge tone="muted" label="Total équipe" value={total} />
      </StatsScrollRow>

      <div>
        <h2 className="font-semibold text-foreground mb-3">Équipe invitée</h2>
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[#FF6600]" />
          </div>
        )}
        {!isLoading && !workers?.length && (
          <div className="app-card border-dashed p-8 text-center text-muted-foreground text-sm">
            Aucun travailleur. Invitez-en un par numéro de téléphone.
          </div>
        )}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(workers as Worker[] | undefined)?.map((w) => {
            const stats = ratingsMap?.get(w.id);
            const zoneName =
              w.worker_zones?.map((z) => z.zones?.name).filter(Boolean).join(', ') ||
              w.zones?.name;
            return (
              <WorkerBadgeCard
                key={w.id}
                name={w.name}
                phone={w.phone}
                photoUrl={w.photo_url}
                gender={w.gender}
                serviceName={w.services?.name}
                zoneName={zoneName}
                status={w.status}
                avgRating={Number(stats?.avg_rating ?? 0)}
                ratingCount={Number(stats?.rating_count ?? 0)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
