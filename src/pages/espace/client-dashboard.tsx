import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyRequests,
  getProposalsForRequest,
  acceptProposal,
  cancelMyRequest,
  rateWorker,
  getNotifications,
  markNotificationRead,
  getRequestPriceAdjustments,
  approveRequestPriceAdjustment,
  rejectRequestPriceAdjustment,
} from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shared/star-rating';
import { Loader2, Check, X, Bell, ClipboardList, History, Inbox } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/auth';
import type { Request, RequestProposal, AppNotification } from '@/types';
import { Link } from 'react-router-dom';
import { StatsScrollRow, StatBadge } from '@/components/shared/stats-scroll-row';

const statusLabel: Record<string, string> = {
  new: 'En attente de propositions',
  assigned: 'Assignée',
  in_progress: 'En cours',
  done: 'Terminée',
  cancelled: 'Annulée',
};

function zoneLabel(w: RequestProposal['workers']) {
  if (!w) return '';
  const fromMulti = w.worker_zones?.map((z) => z.zones?.name).filter(Boolean).join(', ');
  return fromMulti || w.zones?.name || '';
}

function ProposalList({ requestId }: { requestId: string }) {
  const { alert } = useConfirm();
  const qc = useQueryClient();
  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['proposals', requestId],
    queryFn: () => getProposalsForRequest(requestId),
    refetchInterval: 8000,
  });

  const accept = useMutation({
    mutationFn: acceptProposal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      qc.invalidateQueries({ queryKey: ['proposals', requestId] });
    },
  });

  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-[#FEC18A]" />;
  if (error) {
    return <p className="text-sm text-red-300">{getErrorMessage(error)}</p>;
  }
  if (!proposals?.length) {
    return <p className="text-sm text-[#A0A0A0]">Aucune proposition pour le moment. Actualisation auto…</p>;
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-[#A0A0A0]">{proposals.length} proposition(s)</p>
      {(proposals as RequestProposal[]).map((p) => (
        <div
          key={p.id}
          className="flex flex-col gap-3 rounded-xl border border-[#2D2D2D] bg-[#141414] p-3 sm:flex-row sm:items-center"
        >
          {p.workers?.photo_url ? (
            <img
              src={p.workers.photo_url}
              alt=""
              className="h-14 w-14 rounded-full border-2 border-[#2D2D2D] object-cover shadow-sm shadow-black/20"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1C1C] font-semibold text-white">
              {(p.workers?.name || '?').charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">{p.workers?.name}</p>
            <p className="text-xs text-[#A0A0A0]">
              {p.workers?.services?.name || 'Service'}
              {zoneLabel(p.workers) ? ` · ${zoneLabel(p.workers)}` : ''}
            </p>
            <StarRating
              value={p.avg_rating || 0}
              readonly
              size="sm"
              showValue={(p.rating_count || 0) > 0}
              count={p.rating_count}
            />
            <p className="mt-1 text-sm font-semibold text-[#FEC18A]">
              {Number(p.amount).toLocaleString('fr-FR')} FCFA
            </p>
            {p.message && <p className="mt-0.5 text-xs text-[#A0A0A0]">{p.message}</p>}
          </div>
          {p.status === 'pending' && (
            <Button
              size="sm"
              className="shrink-0 rounded-xl"
              disabled={accept.isPending}
              onClick={async () => {
                try {
                  await accept.mutateAsync(p.id);
                  await alert({
                    title: 'Travailleur choisi',
                    description: 'La mission lui a été assignée.',
                    variant: 'success',
                  });
                } catch (e) {
                  await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                }
              }}
            >
              Choisir
            </Button>
          )}
          {p.status === 'accepted' && <Badge className="bg-green-100 text-green-700">Choisi</Badge>}
        </div>
      ))}
    </div>
  );
}

function RequestPriceAdjustmentPanel({ requestId }: { requestId: string }) {
  const { alert } = useConfirm();
  const qc = useQueryClient();
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ['request-adjustments', requestId],
    queryFn: () => getRequestPriceAdjustments(requestId),
    enabled: !!requestId,
  });

  const approve = useMutation({
    mutationFn: approveRequestPriceAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      qc.invalidateQueries({ queryKey: ['request-adjustments', requestId] });
    },
  });

  const reject = useMutation({
    mutationFn: rejectRequestPriceAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request-adjustments', requestId] });
    },
  });

  const pending = (adjustments ?? []).filter((a) => a.status === 'pending');
  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-[#FEC18A]" />;
  if (!pending.length) return null;

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#C27D3D]/30 bg-[#C27D3D]/8 p-3">
      <p className="text-sm font-semibold text-white">Demande de supplément</p>
      {pending.map((adj) => (
        <div key={adj.id} className="rounded-xl border border-[#2D2D2D] bg-[#141414] p-3">
          <p className="mb-2 text-xs text-[#A0A0A0]">Prix initial : {Number(adj.previous_price).toLocaleString('fr-FR')} FCFA</p>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <span className="block text-[#A0A0A0]">Supplément</span>
              <strong className="text-[#FEC18A]">{Number(adj.extra_price).toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div>
              <span className="block text-[#A0A0A0]">Nouveau total</span>
              <strong className="text-white">{Number(adj.new_total).toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div>
              <span className="block text-[#A0A0A0]">Statut</span>
              <Badge className="border-[#C27D3D]/30 bg-[#C27D3D]/10 text-[#FEC18A]">En attente</Badge>
            </div>
          </div>
          {adj.reason && <p className="mt-2 text-xs text-[#A0A0A0]">Motif : {adj.reason}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="rounded-xl"
              disabled={approve.isPending || reject.isPending}
              onClick={async () => {
                try {
                  await approve.mutateAsync(adj.id);
                  await alert({ title: 'Supplément accepté', description: 'Le nouveau prix a bien été appliqué.', variant: 'success' });
                } catch (e) {
                  await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                }
              }}
            >
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-red-600 border-red-200"
              disabled={approve.isPending || reject.isPending}
              onClick={async () => {
                try {
                  await reject.mutateAsync(adj.id);
                  await alert({ title: 'Supplément refusé', description: 'La demande reste inchangée.', variant: 'success' });
                } catch (e) {
                  await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                }
              }}
            >
              Refuser
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RateMission({ request }: { request: Request }) {
  const [stars, setStars] = useState(0);
  const [sent, setSent] = useState(!!request.my_rating);
  const { alert } = useConfirm();
  const qc = useQueryClient();

  const rate = useMutation({
    mutationFn: () => rateWorker(request.id, stars),
    onSuccess: () => {
      setSent(true);
      qc.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });

  if (request.my_rating || sent) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-gray-500">Votre note :</span>
        <StarRating value={request.my_rating?.rating || stars} readonly size="sm" />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[#C27D3D]/30 bg-[#141414] p-3">
      <p className="mb-2 text-sm font-medium text-white">Noter cette intervention</p>
      <StarRating value={stars} onChange={setStars} size="lg" />
      <Button
        size="sm"
        className="mt-3 rounded-xl"
        disabled={!stars || rate.isPending}
        onClick={async () => {
          try {
            await rate.mutateAsync();
            await alert({ title: 'Merci !', description: 'Votre note est visible sur le profil.', variant: 'success' });
          } catch (e) {
            await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
          }
        }}
      >
        Envoyer la note
      </Button>
    </div>
  );
}

export function ClientEspacePage() {
  const { profile } = useAuth();
  const { confirm, alert } = useConfirm();
  const qc = useQueryClient();
  const [highlightRequestId, setHighlightRequestId] = useState<string | null>(null);

  const { data: requests, isLoading, error: requestsError, refetch } = useQuery({
    queryKey: ['my-requests'],
    queryFn: getMyRequests,
    refetchInterval: 10000,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 10000,
  });

  const unread = (notifications as AppNotification[] | undefined)?.filter((n) => !n.read) ?? [];

  const cancel = useMutation({
    mutationFn: cancelMyRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-requests'] }),
  });

  const active = (requests as Request[] | undefined)?.filter((r) =>
    ['new', 'assigned', 'in_progress'].includes(r.status)
  );
  const history = (requests as Request[] | undefined)?.filter((r) =>
    ['done', 'cancelled'].includes(r.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bonjour{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-sm text-[#A0A0A0]">Suivez vos demandes, propositions et historique.</p>
      </div>

      <StatsScrollRow cols={3}>
        <StatBadge
          tone="brand"
          label="En cours"
          value={active?.length ?? 0}
          icon={<ClipboardList className="w-3.5 h-3.5" />}
        />
        <StatBadge
          tone="accent"
          label="Notifications"
          value={unread.length}
          icon={<Inbox className="w-3.5 h-3.5" />}
          style={{
            background: '#C27D3D',
            borderColor: '#D99A5B',
            boxShadow: '0 12px 28px rgba(194, 125, 61, 0.28)',
            color: '#0A0A0A',
          }}
        />
        <StatBadge
          tone="muted"
          label="Historique"
          value={history?.length ?? 0}
          icon={<History className="w-3.5 h-3.5" />}
        />
      </StatsScrollRow>

      {unread.length > 0 && (
        <div className="app-card border-[#C27D3D]/20 bg-[#141414] p-4 space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <Bell className="h-4 w-4 text-[#FEC18A]" /> Nouveautés ({unread.length})
          </p>
          {unread.slice(0, 5).map((n) => (
            <button
              key={n.id}
              type="button"
              className="w-full rounded-xl p-2 text-left text-sm text-[#F5F5F5] hover:bg-white/5"
              onClick={async () => {
                await markNotificationRead(n.id);
                qc.invalidateQueries({ queryKey: ['notifications'] });
                if (n.meta && typeof n.meta === 'object' && 'request_id' in n.meta) {
                  setHighlightRequestId(String((n.meta as { request_id: string }).request_id));
                }
              }}
            >
              <span className="font-medium text-white">{n.title}</span>
              {n.body && <span className="mt-1 block text-xs text-[#A0A0A0]">{n.body}</span>}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#FEC18A]" />
        </div>
      )}

      {requestsError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getErrorMessage(requestsError)}{' '}
          <button type="button" className="underline" onClick={() => refetch()}>
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !requests?.length && !requestsError && (
        <div className="rounded-2xl border border-dashed border-[#2D2D2D] bg-[#141414] p-10 text-center text-[#A0A0A0]">
          Aucune demande pour l'instant.
        </div>
      )}

      {!!active?.length && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Demandes en cours</h2>
          {active.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border bg-[#141414] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
                highlightRequestId === r.id ? 'border-[#C27D3D]/50 ring-2 ring-[#C27D3D]/20' : 'border-[#2D2D2D]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{r.services?.name}</p>
                  <p className="text-sm text-[#A0A0A0]">
                    {r.zones?.name} · {r.quartier}
                  </p>
                  <p className="mt-1 text-sm text-[#F5F5F5]">{r.description}</p>
                </div>
                <Badge variant="secondary">{statusLabel[r.status] || r.status}</Badge>
              </div>

              {r.price != null && (
                <p className="text-sm mt-2">
                  Prix : <strong>{Number(r.price).toLocaleString('fr-FR')} FCFA</strong>
                  {r.workers?.name ? ` · ${r.workers.name}` : ''}
                </p>
              )}

              {['assigned', 'in_progress'].includes(r.status) && (
                <RequestPriceAdjustmentPanel requestId={r.id} />
              )}

              {r.status === 'new' && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-white">Propositions reçues</p>
                  <ProposalList requestId={r.id} />
                </div>
              )}

              {['new', 'assigned', 'in_progress'].includes(r.status) && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-red-600 border-red-200"
                    disabled={cancel.isPending}
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Annuler la demande ?',
                        description: 'Le travailleur sera notifié si la mission était assignée.',
                        confirmText: 'Annuler la demande',
                        cancelText: 'Retour',
                        variant: 'danger',
                      });
                      if (!ok) return;
                      try {
                        await cancel.mutateAsync(r.id);
                      } catch (e) {
                        await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                      }
                    }}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Annuler
                  </Button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {!!history?.length && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Historique</h2>
          {history.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#2D2D2D] bg-[#141414] p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{r.services?.name}</p>
                  <p className="text-sm text-[#A0A0A0]">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')} · {r.zones?.name}
                  </p>
                  {r.workers && (
                    <div className="mt-2 flex items-center gap-2">
                      {r.workers.photo_url ? (
                        <img src={r.workers.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1C] text-xs text-white">
                          {r.workers.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{r.workers.name}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {r.workers.services?.name}
                          {r.workers.zones?.name ? ` · ${r.workers.zones.name}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {r.price != null && (
                    <p className="mt-1 text-sm font-semibold text-[#FEC18A]">
                      {Number(r.price).toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>
                <Badge variant="secondary">{statusLabel[r.status]}</Badge>
              </div>
              {r.status === 'done' && (
                <>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Intervention terminée
                  </p>
                  <RateMission request={r} />
                </>
              )}
            </div>
          ))}
        </section>
      )}

      <p className="text-xs text-[#A0A0A0]">
        Astuce : ajoutez une photo depuis <Link className="text-[#FEC18A] hover:text-[#D99A5B]" to="/espace/profil">Mon profil</Link> si
        vous êtes travailleur ou partenaire.
      </p>
    </div>
  );
}
