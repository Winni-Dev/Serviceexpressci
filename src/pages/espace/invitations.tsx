import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyInvitations, respondWorkerInvitation } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import type { WorkerInvitation } from '@/types';

export function InvitationsPage() {
  const { refreshProfile } = useAuth();
  const { alert } = useConfirm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: getMyInvitations,
  });

  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondWorkerInvitation(id, accept),
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ['my-invitations'] });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <p className="text-sm text-[#A0A0A0]">
          Acceptez ou refusez les invitations pour devenir travailleur chez un partenaire.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
        </div>
      )}

      {!isLoading && !data?.length && (
        <div className="rounded-2xl border border-dashed border-[#2D2D2D] bg-[#141414] p-8 text-center text-[#A0A0A0]">
          Aucune invitation en attente.
        </div>
      )}

      <div className="space-y-3">
        {(data as WorkerInvitation[] | undefined)?.map((inv) => (
          <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2D2D2D] bg-[#141414] p-4 shadow-[0_16px_32px_rgba(0,0,0,0.14)]">
            <div>
              <p className="font-medium text-white">
                Invitation travailleur — {inv.services?.name || 'Service'}
              </p>
              <p className="text-sm text-[#A0A0A0]">Téléphone : {inv.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]"
                disabled={respond.isPending}
                onClick={async () => {
                  try {
                    await respond.mutateAsync({ id: inv.id, accept: true });
                    await alert({
                      title: 'Invitation acceptée',
                      description: 'Vous avez maintenant accès à l\'espace travailleur.',
                      variant: 'success',
                    });
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
                className="rounded-xl"
                disabled={respond.isPending}
                onClick={async () => {
                  try {
                    await respond.mutateAsync({ id: inv.id, accept: false });
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
    </div>
  );
}
