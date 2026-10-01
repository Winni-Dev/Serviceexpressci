import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { useServices } from '@/hooks/useServices';
import { useZones } from '@/hooks/useZones';
import {
  getMyWorkerProfile,
  updateMyWorkerProfile,
  updateMyPartnerPhoto,
  getWorkerRatingStats,
} from '@/services/api';
import { uploadStaffPhoto } from '@/lib/storage';
import { getErrorMessage } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { StarRating } from '@/components/shared/star-rating';
import { Loader2, Briefcase, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ProfilePage() {
  const { profile, session, refreshProfile } = useAuth();
  const { alert } = useConfirm();
  const qc = useQueryClient();
  const { data: services } = useServices();
  const { data: zones } = useZones();
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isPartner = profile?.role === 'partner' || profile?.role === 'zone_manager';
  const canEditWorkerFields = profile?.role === 'worker' || profile?.role === 'partner';

  const { data: worker, isLoading } = useQuery({
    queryKey: ['my-worker-profile'],
    queryFn: getMyWorkerProfile,
    enabled: !!session && canEditWorkerFields,
  });

  const { data: stats } = useQuery({
    queryKey: ['my-worker-stats', worker?.id],
    queryFn: () => getWorkerRatingStats(worker!.id),
    enabled: !!worker?.id,
  });

  const form = useForm({
    defaultValues: {
      name: '',
      service_id: '',
      zone_ids: [] as string[],
    },
  });

  useEffect(() => {
    if (worker) {
      const zoneIds =
        worker.worker_zones?.map((z) => z.zone_id).filter(Boolean) ||
        (worker.zone_id ? [worker.zone_id] : []);
      form.reset({
        name: worker.name || profile?.name || '',
        service_id: worker.service_id || '',
        zone_ids: zoneIds,
      });
      setPreview(worker.photo_url || profile?.photo_url || null);
    } else if (profile) {
      form.reset({ name: profile.name || '', service_id: '', zone_ids: [] });
      setPreview(profile.photo_url || null);
    }
  }, [worker, profile, form, services]);

  const serviceOptions = services?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  const assignedServiceName =
    worker?.services?.name ||
    services?.find((s) => s.id === worker?.service_id)?.name ||
    '—';

  const assignedZones =
    worker?.worker_zones?.map((z) => z.zones?.name).filter(Boolean).join(', ') ||
    worker?.zones?.name ||
    '—';

  const onSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      const values = form.getValues();
      let photoUrl = worker?.photo_url || profile?.photo_url || undefined;

      if (photoFile) {
        photoUrl = await uploadStaffPhoto(
          photoFile,
          worker ? 'workers' : 'managers',
          worker?.id || session.user.id
        );
      }

      if (!photoUrl && (profile?.role === 'worker' || isPartner)) {
        await alert({
          title: 'Photo requise',
          description: 'Ajoutez une photo de profil pour être visible.',
          variant: 'error',
        });
        setSaving(false);
        return;
      }

      if (worker || profile?.role === 'worker') {
        await updateMyWorkerProfile({
          photo_url: photoUrl,
          service_id: values.service_id || undefined,
          zone_ids: values.zone_ids?.length ? values.zone_ids : undefined,
          name: values.name || undefined,
        });
      } else if (isPartner && photoUrl) {
        try {
          await updateMyPartnerPhoto(photoUrl);
        } catch {
          await supabase
            .from('profiles')
            .update({ name: values.name || profile?.name, photo_url: photoUrl })
            .eq('id', session.user.id);
        }
      } else if (photoUrl) {
        await supabase
          .from('profiles')
          .update({ name: values.name || profile?.name, photo_url: photoUrl })
          .eq('id', session.user.id);
      }

      setPhotoFile(null);
      if (photoUrl) setPreview(photoUrl);
      await refreshProfile();
      await qc.invalidateQueries({ queryKey: ['my-worker-profile'] });
      await alert({
        title: 'Profil mis à jour',
        description: 'Photo, métier et zones enregistrés. Vous pouvez proposer des prix.',
        variant: 'success',
      });
    } catch (e) {
      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && profile?.role === 'worker') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Mon profil</h1>
        <p className="text-sm text-[#A0A0A0]">
          Le métier et les zones définis par le partenaire s'affichent ici. Vous pouvez les modifier.
        </p>
      </div>

      {worker && (
        <div className="rounded-2xl border border-[#3B82F6]/40 bg-[#3B82F6] p-4 text-white shadow-[0_16px_32px_rgba(59,130,246,0.22)] space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/80">Assigné par le partenaire</p>
          <div className="flex items-start gap-2">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-[#C27D3D]" />
            <div>
              <p className="text-xs text-white/70">Métier / service</p>
              <p className="font-semibold text-white">{assignedServiceName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C27D3D]" />
            <div>
              <p className="text-xs text-white/70">Zone(s)</p>
              <p className="font-semibold text-white">{assignedZones}</p>
            </div>
          </div>
          {stats && Number(stats.rating_count) > 0 && (
            <StarRating
              value={Number(stats.avg_rating) || 0}
              readonly
              size="sm"
              showValue
              count={stats.rating_count}
            />
          )}
        </div>
      )}

      <div className="rounded-2xl border border-[#2D2D2D] bg-[#141414] p-5 space-y-4 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="" className="h-20 w-20 rounded-full border border-[#2D2D2D] object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1C1C1C] text-2xl font-bold text-white">
              {(profile?.name || '?').charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <label className="text-sm font-medium text-[#F5F5F5]">Photo de profil *</label>
            <Input
              type="file"
              accept="image/*"
              className="mt-1 rounded-xl"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPhotoFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
            <p className="mt-1 text-xs text-[#A0A0A0]">Puis cliquez sur Enregistrer</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#F5F5F5]">Nom</label>
          <Input {...form.register('name')} className="mt-1 rounded-xl" />
        </div>

        <div>
          <label className="text-sm font-medium text-[#F5F5F5]">Téléphone</label>
          <Input value={profile?.phone || ''} disabled className="mt-1 rounded-xl bg-[#1C1C1C] text-white" />
        </div>

        {(profile?.role === 'worker' || worker) && (
          <>
            <div>
              <label className="text-sm font-medium">Métier / service (modifiable)</label>
              <FormSearchableSelect
                control={form.control}
                name="service_id"
                options={serviceOptions}
                placeholder={assignedServiceName !== '—' ? assignedServiceName : 'Choisir un service'}
                searchPlaceholder="Rechercher..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Zones d'intervention (modifiables)</label>
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
                    {field.value?.length ? (
                      <p className="text-xs text-gray-500">
                        {field.value.length} zone(s) sélectionnée(s)
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Aucune zone sélectionnée</p>
                    )}
                  </div>
                )}
              />
            </div>
          </>
        )}

        <Button
          onClick={onSave}
          disabled={saving}
          className="h-11 w-full rounded-xl bg-[#C27D3D] text-[#0A0A0A] hover:bg-[#D99A5B]"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
