import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPartnerApplications,
  reviewPartnerApplication,
} from '@/services/api';
import { getIdDocSignedUrl } from '@/lib/storage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PageHeader, EmptyState, ErrorAlert } from '@/components/admin/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { openSafeExternalUrl } from '@/lib/security';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import type { PartnerApplication } from '@/types';

export function RoleRequestsPage() {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const { alert, confirm } = useConfirm();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['partner-applications', filter],
    queryFn: () => getPartnerApplications(filter === 'pending' ? 'pending' : undefined),
  });

  const review = useMutation({
    mutationFn: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) =>
      reviewPartnerApplication(id, approve, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-applications'] }),
  });

  const openDoc = async (path: string) => {
    try {
      const url = await getIdDocSignedUrl(path);
      if (!openSafeExternalUrl(url)) {
        throw new Error('Lien document invalide');
      }
    } catch (e) {
      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
    }
  };

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const showDocInModal = async (path: string) => {
    try {
      setLoadingDoc(true);
      const url = await getIdDocSignedUrl(path);
      setImageModalUrl(url);
      setImageModalOpen(true);
    } catch (e) {
      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de rôle"
        description="Acceptez ou refusez les candidatures partenaires."
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'pending' ? 'default' : 'outline'}
          className="rounded-xl"
          onClick={() => setFilter('pending')}
        >
          En attente
        </Button>
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          className="rounded-xl"
          onClick={() => setFilter('all')}
        >
          Toutes
        </Button>
      </div>

      {error && <ErrorAlert message={getErrorMessage(error)} />}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
        </div>
      )}

      {!isLoading && !data?.length && <EmptyState message="Aucune candidature pour le moment." />}

      <div className="space-y-4">
        {(data as PartnerApplication[] | undefined)?.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl border p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0A2240] text-lg">{app.name}</p>
                <p className="text-sm text-gray-500">{app.phone}</p>
              </div>
              <Badge
                className={
                  app.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : app.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                }
              >
                {app.status}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p><span className="text-gray-500">Expérience :</span> {app.experience}</p>
              <p><span className="text-gray-500">Services :</span> {app.services_offered}</p>
              <p><span className="text-gray-500">Zones :</span> {app.zones_interest}</p>
              <p><span className="text-gray-500">Motivation :</span> {app.why_partner}</p>
              <p>Matériel : {app.has_tools ? 'Oui' : 'Non'} · Transport : {app.has_transport ? 'Oui' : 'Non'}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => showDocInModal(app.id_recto_url)}>
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Recto
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => showDocInModal(app.id_verso_url)}>
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Verso
              </Button>
              {app.selfie_url && (
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => showDocInModal(app.selfie_url!)}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Selfie
                </Button>
              )}
            </div>

            {app.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="rounded-xl bg-green-600 hover:bg-green-700"
                  disabled={review.isPending}
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Accepter cette demande ?',
                      description: `${app.name} deviendra partenaire et pourra gérer des travailleurs.`,
                      confirmText: 'Accepter',
                      cancelText: 'Annuler',
                    });
                    if (!ok) return;
                    try {
                      await review.mutateAsync({ id: app.id, approve: true });
                      await alert({ title: 'Acceptée', description: 'Le compte partenaire est activé.', variant: 'success' });
                    } catch (e) {
                      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                    }
                  }}
                >
                  <Check className="w-4 h-4 mr-1" /> Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-red-600 border-red-200"
                  disabled={review.isPending}
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Refuser cette demande ?',
                      description: 'Le candidat sera notifié.',
                      confirmText: 'Refuser',
                      cancelText: 'Annuler',
                      variant: 'danger',
                    });
                    if (!ok) return;
                    try {
                      await review.mutateAsync({ id: app.id, approve: false });
                    } catch (e) {
                      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Refuser
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog open={imageModalOpen} onOpenChange={(v) => setImageModalOpen(v)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0">
          {imageModalUrl && (
            <div className="bg-black/90 p-4 flex justify-center">
              <img src={imageModalUrl} alt="Document" className="max-h-[80vh] w-auto rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
