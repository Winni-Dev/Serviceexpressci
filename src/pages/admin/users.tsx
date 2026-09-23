import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, promoteClientToWorker, deleteClientUser } from '@/services/api';
import { PageHeader, FilterBar, EmptyState, ErrorAlert, AdminCard } from '@/components/admin/page-shell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useServices } from '@/hooks/useServices';
import { useZones } from '@/hooks/useZones';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { ArrowRightLeft, Loader2, Trash2, Users } from 'lucide-react';
import type { Profile } from '@/types';

type AdminUser = Profile & {
  partner: null;
  worker: null;
};

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });
  const { data: services } = useServices();
  const { data: zones } = useZones();

  const serviceOptions = useMemo(
    () => services?.map((service) => ({ value: service.id, label: service.name })) ?? [],
    [services]
  );

  const zoneOptions = useMemo(
    () => zones?.map((zone) => ({ value: zone.id, label: zone.name })) ?? [],
    [zones]
  );

  const filtered = useMemo(() => {
    return ((data as AdminUser[] | undefined) ?? []).filter((u) => {
      const q = search.toLowerCase();
      return (
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const resetPromotionForm = () => {
    setSelectedUser(null);
    setSelectedService('');
    setSelectedZones([]);
    setErrorMsg('');
  };

  const handleConvertToWorker = async () => {
    if (!selectedUser) return;
    if (!selectedService) {
      setErrorMsg('Veuillez choisir un service pour ce travailleur');
      return;
    }
    if (!selectedZones.length) {
      setErrorMsg('Veuillez sélectionner au moins une zone d\'intervention');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await promoteClientToWorker({
        userId: selectedUser.id,
        service_id: selectedService,
        zone_ids: selectedZones,
        name: selectedUser.name,
        phone: selectedUser.phone,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['workers'] });
      const message = `${selectedUser.name || 'Ce client'} a été promu travailleur.`;
      resetPromotionForm();
      setSuccessMsg(message);
    } catch (e) {
      setErrorMsg(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const ok = await confirm({
      title: 'Supprimer ce compte ?',
      description: `Cette action supprimera définitivement ${user.name || 'ce compte'} de la base de données.`,
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      setIsDeleting(true);
      setErrorMsg('');
      await deleteClientUser(user.id);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccessMsg(`${user.name || 'Ce compte'} a bien été supprimé.`);
    } catch (e) {
      setErrorMsg(getErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs (clients)"
        description="Uniquement les comptes avec le rôle client. Les travailleurs sont dans Travailleurs, les partenaires dans Partenaires."
        badge={filtered.length}
      />

      <FilterBar resultCount={filtered.length} resultLabel="client(s)">
        <Input
          placeholder="Rechercher nom, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl"
        />
      </FilterBar>

      {(error || errorMsg) && <ErrorAlert message={errorMsg || getErrorMessage(error)} />}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
        </div>
      )}

      {!isLoading && !filtered.length && (
        <EmptyState icon={Users} message="Aucun client inscrit" />
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((u) => (
          <AdminCard key={u.id} className="space-y-3">
            <div className="flex items-start gap-3">
              {u.photo_url ? (
                <img src={u.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0A2240] text-white flex items-center justify-center font-semibold">
                  {(u.name || u.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0A2240] truncate">{u.name || 'Sans nom'}</p>
                <p className="text-xs text-gray-500">{u.phone || u.email}</p>
                <Badge className="mt-1" variant="secondary">
                  Client
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {u.zones?.name && <p>Zone : {u.zones.name}</p>}
              <p className="text-xs text-gray-400">
                Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => {
                  setSelectedUser(u);
                  setSelectedService('');
                  setSelectedZones([]);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Promouvoir en travailleur
              </Button>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                disabled={isDeleting}
                onClick={() => handleDeleteUser(u)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Suppression...' : 'Supprimer le compte'}
              </Button>
            </div>
          </AdminCard>
        ))}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && resetPromotionForm()}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promouvoir ce client en travailleur</DialogTitle>
            <DialogDescription>
              Choisissez le service et les zones d&apos;intervention. Une fois validé, ce compte passe automatiquement en rôle travailleur.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-[#0A2240]">{selectedUser.name || 'Sans nom'}</p>
                <p className="text-gray-500">{selectedUser.phone || selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service</label>
                <SearchableSelect
                  value={selectedService}
                  onValueChange={setSelectedService}
                  options={serviceOptions}
                  placeholder="Choisir un service"
                  searchPlaceholder="Rechercher un service..."
                  emptyMessage="Aucun service trouvé"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Zones d&apos;intervention</label>
                <SearchableMultiSelect
                  values={selectedZones}
                  onChange={setSelectedZones}
                  options={zoneOptions}
                  placeholder="Sélectionner les zones"
                  searchPlaceholder="Rechercher une zone..."
                />
              </div>

              <Button
                className="w-full rounded-xl"
                variant="accent"
                disabled={isSubmitting}
                onClick={handleConvertToWorker}
              >
                {isSubmitting ? 'Validation...' : 'Valider la promotion'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
