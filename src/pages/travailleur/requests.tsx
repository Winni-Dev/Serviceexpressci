import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMatchingRequestsForWorker,
  getWorkerAssignedRequests,
  getWorkerMyProposals,
  submitProposal,
  workerUpdateRequestStatus,
  getMyWorkerProfile,
  createRequestPriceAdjustment,
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/contexts/confirm-context';
import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Request, RequestProposal } from '@/types';

export function WorkerRequestsPage() {
  const { alert } = useConfirm();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [supplementRequestId, setSupplementRequestId] = useState<string | null>(null);
  const [supplementAmount, setSupplementAmount] = useState('');
  const [supplementReason, setSupplementReason] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const { data: myWorker, refetch: refetchWorker } = useQuery({
    queryKey: ['my-worker-profile'],
    queryFn: getMyWorkerProfile,
  });

  const { data: openRequests, isLoading } = useQuery({
    queryKey: ['worker-open-requests'],
    queryFn: getMatchingRequestsForWorker,
    refetchInterval: 10000,
  });
  const { data: assigned } = useQuery({
    queryKey: ['worker-assigned'],
    queryFn: getWorkerAssignedRequests,
  });
  const { data: myProposals } = useQuery({
    queryKey: ['worker-my-proposals'],
    queryFn: getWorkerMyProposals,
    refetchInterval: 10000,
  });

  const propose = useMutation({
    mutationFn: ({ id, amount, message }: { id: string; amount: number; message?: string }) =>
      submitProposal(id, amount, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-open-requests'] });
      qc.invalidateQueries({ queryKey: ['worker-my-proposals'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'in_progress' | 'done' }) =>
      workerUpdateRequestStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-assigned'] });
      qc.invalidateQueries({ queryKey: ['worker-earnings'] });
      qc.invalidateQueries({ queryKey: ['worker-my-proposals'] });
    },
  });

  const addSupplement = useMutation({
    mutationFn: ({ requestId, extraPrice, reason }: { requestId: string; extraPrice: number; reason: string }) =>
      createRequestPriceAdjustment({ requestId, extraPrice, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-assigned'] });
      qc.invalidateQueries({ queryKey: ['request-adjustments'] });
      setSupplementRequestId(null);
      setSupplementAmount('');
      setSupplementReason('');
    },
  });

  const proposedRequestIds = new Set(
    (myProposals as RequestProposal[] | undefined)?.map((p) => p.request_id) ?? []
  );

  const openToQuote = (openRequests as Request[] | undefined)?.filter(
    (r) => !proposedRequestIds.has(r.id)
  );

  const pendingProposals = (myProposals as RequestProposal[] | undefined)?.filter(
    (p) => p.status === 'pending' && (!p.requests || p.requests.status === 'new')
  );

  const hasPhoto = !!(myWorker?.photo_url || profile?.photo_url);

  return (
    <>
      <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2240]">Demandes</h1>
        <p className="text-sm text-gray-500">
          Proposez un prix, suivez vos propositions dans Mes missions, puis exécutez les missions acceptées.
        </p>
      </div>

      {!hasPhoto && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Une <strong>photo de profil</strong> est obligatoire.{' '}
          <Link to="/espace/profil" className="underline font-medium text-[#FF6600]">
            Ajouter ma photo
          </Link>
          {' · '}
          <button type="button" className="underline" onClick={() => refetchWorker()}>
            Actualiser
          </button>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-[#0A2240]">Nouvelles demandes (à chiffrer)</h2>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#FF6600]" />}
        {!isLoading && !openToQuote?.length && (
          <p className="text-sm text-gray-500 bg-white rounded-2xl border p-6">
            Aucune nouvelle demande correspondante.
          </p>
        )}
        {openToQuote?.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border p-4 space-y-3">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">
                  {r.services?.name} · {r.zones?.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                {r.photo_url && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalUrl(r.photo_url ?? null);
                        setImageModalOpen(true);
                      }}
                      className="inline-block rounded-lg overflow-hidden border transition-transform duration-200 hover:scale-105"
                    >
                      <img src={r.photo_url} alt="Demande" className="max-h-40 w-auto block" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{r.quartier}</p>
              </div>
              <Badge>new</Badge>
            </div>
            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                type="number"
                placeholder="Prix (FCFA)"
                className="rounded-xl"
                value={amounts[r.id] || ''}
                onChange={(e) => setAmounts((s) => ({ ...s, [r.id]: e.target.value }))}
              />
              <Input
                placeholder="Message (optionnel)"
                className="rounded-xl"
                value={messages[r.id] || ''}
                onChange={(e) => setMessages((s) => ({ ...s, [r.id]: e.target.value }))}
              />
              <Button
                className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]"
                disabled={propose.isPending}
                onClick={async () => {
                  if (!hasPhoto) {
                    await alert({
                      title: 'Photo requise',
                      description:
                        'Allez dans Mon profil, ajoutez une photo, cliquez Enregistrer, puis revenez ici.',
                      variant: 'error',
                    });
                    return;
                  }
                  const amount = Number(amounts[r.id]);
                  if (!amount || amount <= 0) {
                    await alert({
                      title: 'Prix requis',
                      description: 'Entrez un montant valide.',
                      variant: 'error',
                    });
                    return;
                  }
                  try {
                    await propose.mutateAsync({ id: r.id, amount, message: messages[r.id] });
                    await alert({
                      title: 'Proposition envoyée',
                      description: 'Elle apparaît dans Mes missions. Le client la verra dans son espace.',
                      variant: 'success',
                    });
                  } catch (e) {
                    await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                  }
                }}
              >
                {propose.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proposer'}
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-[#0A2240]">Mes missions</h2>

        {!!pendingProposals?.length && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Propositions en attente du client
            </p>
            {pendingProposals.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-dashed border-[#FF6600]/40 p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.requests?.services?.name || 'Demande'}</p>
                    <p className="text-sm text-gray-500">
                      {p.requests?.name} · {p.requests?.zones?.name}
                    </p>
                    <p className="text-sm text-[#FF6600] font-semibold mt-1">
                      Votre offre : {Number(p.amount).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Missions assignées</p>
          {(assigned as Request[] | undefined)
            ?.filter((r) => r.status !== 'new')
            .map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{r.services?.name}</p>
                  <p className="text-sm text-gray-500">
                    {r.name} · {r.phone} · {r.zones?.name}
                  </p>
                  {r.price != null && (
                    <p className="text-sm text-[#FF6600] font-semibold">
                      {Number(r.price).toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                  <Badge className="mt-1" variant="secondary">
                    {r.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === 'assigned' && (
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => updateStatus.mutate({ id: r.id, status: 'in_progress' })}
                    >
                      Démarrer
                    </Button>
                  )}
                  {r.status === 'in_progress' && (
                    <>
                      <Button
                        size="sm"
                        className="rounded-xl bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus.mutate({ id: r.id, status: 'done' })}
                      >
                        Terminer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-[#FF6600] text-[#FF6600]"
                        onClick={() => {
                          setSupplementRequestId(r.id);
                          setSupplementAmount('');
                          setSupplementReason('');
                        }}
                      >
                        Demander un supplément
                      </Button>
                    </>
                  )}
                  {r.status === 'cancelled' && (
                    <p className="text-sm text-red-500">Annulée par le client</p>
                  )}
                </div>
              </div>
            ))}
          {!assigned?.filter((r) => r.status !== 'new').length && !pendingProposals?.length && (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border p-6">Aucune mission pour le moment.</p>
          )}
        </div>
      </section>
      </div>
      <Dialog open={imageModalOpen} onOpenChange={(v) => setImageModalOpen(v)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0">
          {imageModalUrl && (
            <div className="bg-black/90 p-4 flex justify-center">
              <img src={imageModalUrl} alt="Grande vue" className="max-h-[80vh] w-auto rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!supplementRequestId} onOpenChange={(open) => !open && setSupplementRequestId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Supplément de mission</p>
              <h3 className="text-lg font-bold text-[#0A2240]">Demander un forfait supplémentaire</h3>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A2240]">Montant supplémentaire (FCFA)</label>
              <Input
                type="number"
                min="1"
                value={supplementAmount}
                onChange={(e) => setSupplementAmount(e.target.value)}
                placeholder="Ex: 150000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A2240]">Pourquoi ce supplément ?</label>
              <Input
                value={supplementReason}
                onChange={(e) => setSupplementReason(e.target.value)}
                placeholder="Travail supplémentaire, accès difficile, matériel, etc."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setSupplementRequestId(null)}>
                Annuler
              </Button>
              <Button
                className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]"
                disabled={!supplementAmount || Number(supplementAmount) <= 0 || addSupplement.isPending}
                onClick={async () => {
                  if (!supplementRequestId) return;
                  try {
                    await addSupplement.mutateAsync({
                      requestId: supplementRequestId,
                      extraPrice: Number(supplementAmount),
                      reason: supplementReason,
                    });
                    await alert({
                      title: 'Demande envoyée',
                      description: 'Le client peut maintenant accepter le supplément ou le refuser.',
                      variant: 'success',
                    });
                  } catch (e) {
                    await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                  }
                }}
              >
                {addSupplement.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
