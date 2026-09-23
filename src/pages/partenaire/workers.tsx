import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteWorker, getPartnerInvitations, getPartnerWorkers } from '@/services/api';
import { useServices } from '@/hooks/useServices';
import { useZones } from '@/hooks/useZones';
import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import type { WorkerInvitation } from '@/types';

const schema = z.object({
  phone: z.string().min(8, 'Numéro invalide'),
  service_id: z.string().min(1, 'Service requis'),
  zone_ids: z.array(z.string()).min(1, 'Au moins une zone'),
});

type FormData = z.infer<typeof schema>;

export function PartnerWorkersPage() {
  const { data: services } = useServices();
  const { data: zones } = useZones();
  const { alert } = useConfirm();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['partner-invitations'],
    queryFn: getPartnerInvitations,
  });
  const { data: workers } = useQuery({
    queryKey: ['partner-workers'],
    queryFn: getPartnerWorkers,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { zone_ids: [] },
  });

  const invite = useMutation({
    mutationFn: (data: FormData) => inviteWorker(data.phone, data.service_id, data.zone_ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner-invitations'] });
      form.reset({ phone: '', service_id: '', zone_ids: [] });
      setOpen(false);
    },
  });

  const serviceOptions = services?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2240]">Travailleurs</h1>
          <p className="text-sm text-gray-500">
            Invitez un utilisateur inscrit avec son numéro. Il devra accepter depuis son compte.
          </p>
        </div>
        <Button className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]" onClick={() => setOpen(!open)}>
          {open ? 'Fermer' : 'Ajouter un travailleur'}
        </Button>
      </div>

      {open && (
        <form
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await invite.mutateAsync(data);
              await alert({
                title: 'Invitation envoyée',
                description:
                  'Si ce numéro a un compte, la personne recevra une notification pour accepter.',
                variant: 'success',
              });
            } catch (e) {
              await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
            }
          })}
          className="bg-white rounded-2xl border p-5 space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Numéro de téléphone</label>
            <Input {...form.register('phone')} className="rounded-xl mt-1" placeholder="07XXXXXXXX" />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Métier / service</label>
            <FormSearchableSelect
              control={form.control}
              name="service_id"
              options={serviceOptions}
              placeholder="Choisir un service"
              searchPlaceholder="Rechercher..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Zones (plusieurs possibles)</label>
            <Controller
              control={form.control}
              name="zone_ids"
              render={({ field }) => (
                <div className="space-y-2">
                  <SearchableMultiSelect
                    values={field.value ?? []}
                    onChange={field.onChange}
                    options={(zones ?? []).map((z) => ({ value: z.id, label: z.name }))}
                    placeholder="Rechercher et sélectionner des zones"
                    searchPlaceholder="Tapez pour trouver une zone..."
                  />
                </div>
              )}
            />
            {form.formState.errors.zone_ids && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.zone_ids.message}</p>
            )}
          </div>
          <Button type="submit" disabled={invite.isPending} className="rounded-xl bg-[#0A2240]">
            {invite.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Envoyer l'invitation
          </Button>
        </form>
      )}

      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold mb-3">Invitations</h2>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#FF6600]" />}
        <div className="space-y-2">
          {(invitations as WorkerInvitation[] | undefined)?.map((inv) => (
            <div key={inv.id} className="flex justify-between text-sm py-2 border-b last:border-0">
              <span>
                {inv.phone} · {inv.services?.name}
              </span>
              <Badge variant="secondary">{inv.status}</Badge>
            </div>
          ))}
          {!invitations?.length && !isLoading && (
            <p className="text-sm text-gray-500">Aucune invitation.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold mb-3">Équipe ({workers?.length ?? 0})</h2>
        <div className="space-y-2">
          {workers?.map((w) => (
            <div key={w.id} className="text-sm py-2 border-b last:border-0">
              <p className="font-medium">{w.name}</p>
              <p className="text-gray-500">{w.phone} · {w.services?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
