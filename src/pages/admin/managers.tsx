import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
import { PhotoUpload } from '@/components/admin/photo-upload';
import { PersonDetailModal } from '@/components/admin/person-detail-modal';
import {
  PageHeader,
  FilterBar,
  EntityCard,
  ErrorAlert,
  EmptyState,
} from '@/components/admin/page-shell';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useZoneManagers,
  useCreateZoneManager,
  useUpdateZoneManager,
  useDeleteZoneManager,
} from '@/hooks/useManagers';
import { useZones } from '@/hooks/useZones';
import { getAvatarUrl } from '@/lib/utils';
import { uploadStaffPhoto } from '@/lib/storage';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import {
  Plus,
  Phone,
  MapPin,
  Shield,
  Pencil,
  Trash2,
  Mail,
  Search,
  UserCheck,
  Eye,
  Calendar,
  User,
} from 'lucide-react';
import type { ZoneManager } from '@/types';

const managerSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  zone_id: z.string().min(1, 'Veuillez choisir une zone'),
  password: z.string().min(6, 'Le mot de passe doit avoir au moins 6 caractères'),
  gender: z.enum(['male', 'female']),
});

const editSchema = managerSchema.omit({ password: true, email: true, zone_id: true });

type ManagerForm = z.infer<typeof managerSchema>;
type EditForm = z.infer<typeof editSchema>;

function formatCardDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
}

export function ManagersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ZoneManager | null>(null);
  const [detailManager, setDetailManager] = useState<ZoneManager | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const { data: managers } = useZoneManagers();
  const { data: zones } = useZones();
  const createManager = useCreateZoneManager();
  const updateManager = useUpdateZoneManager();
  const deleteManager = useDeleteZoneManager();
  const { confirm } = useConfirm();

  const availableZones = zones?.filter((z) => !managers?.some((m) => m.zone_id === z.id));

  const zoneFormOptions = useMemo(
    () => availableZones?.map((z) => ({ value: z.id, label: z.name })) ?? [],
    [availableZones]
  );

  const zoneFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Toutes les zones' },
      ...(zones?.map((z) => ({ value: z.id, label: z.name })) ?? []),
    ],
    [zones]
  );

  const filteredManagers = useMemo(() => {
    return managers?.filter((manager) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        manager.name.toLowerCase().includes(q) ||
        manager.phone.includes(searchTerm) ||
        manager.email?.toLowerCase().includes(q) ||
        manager.zones?.name?.toLowerCase().includes(q);
      const matchesZone = zoneFilter === 'all' || manager.zone_id === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [managers, searchTerm, zoneFilter]);

  const createForm = useForm<ManagerForm>({ resolver: zodResolver(managerSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const createGender = createForm.watch('gender') || 'male';
  const editGender = editForm.watch('gender') || editingManager?.gender || 'male';

  const resetCreateState = () => {
    createForm.reset();
    setPhotoFile(null);
    setRemovePhoto(false);
    setIsDialogOpen(false);
  };

  const resetEditState = () => {
    editForm.reset();
    setPhotoFile(null);
    setRemovePhoto(false);
    setEditingManager(null);
  };

  const handlePhotoChange = (file: File | null, isEdit: boolean) => {
    setPhotoFile(file);
    const existing = isEdit ? editingManager?.photo_url : undefined;
    if (!file && existing) setRemovePhoto(true);
    else setRemovePhoto(false);
  };

  const savePhoto = async (id: string, existingUrl?: string) => {
    if (photoFile) return uploadStaffPhoto(photoFile, 'managers', id);
    if (removePhoto) return null;
    return existingUrl;
  };

  const onCreate = async (data: ManagerForm) => {
    setErrorMsg('');
    try {
      const created = await createManager.mutateAsync(data);
      if (photoFile && created?.id) {
        const photo_url = await uploadStaffPhoto(photoFile, 'managers', created.id);
        await updateManager.mutateAsync({ id: created.id, photo_url });
      }
      resetCreateState();
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const onEdit = async (data: EditForm) => {
    if (!editingManager) return;
    setErrorMsg('');
    try {
      const photo_url = await savePhoto(editingManager.id, editingManager.photo_url);
      await updateManager.mutateAsync({
        id: editingManager.id,
        ...data,
        ...(photo_url !== undefined ? { photo_url: photo_url ?? undefined } : {}),
      });
      resetEditState();
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer ce chef de zone ?',
      description: 'Son compte de connexion sera désactivé. Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteManager.mutateAsync(id);
      if (detailManager?.id === id) setDetailManager(null);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const openEdit = (manager: ZoneManager) => {
    setDetailManager(null);
    setEditingManager(manager);
    editForm.reset({
      name: manager.name,
      phone: manager.phone,
      gender: manager.gender,
    });
    setPhotoFile(null);
    setRemovePhoto(false);
  };

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Chefs de zone"
        description="Comptes de connexion pour chaque chef de zone"
        badge={managers?.length ?? 0}
        action={
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetCreateState())}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />Ajouter un chef de zone
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Ajouter un chef de zone</DialogTitle></DialogHeader>
              <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
                {errorMsg && isDialogOpen && <ErrorAlert message={errorMsg} />}
                <PhotoUpload
                  gender={createGender}
                  onFileChange={(f) => handlePhotoChange(f, false)}
                />
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nom complet</label>
                  <Input {...createForm.register('name')} placeholder="Nom du chef de zone" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email (connexion)</label>
                  <Input type="email" {...createForm.register('email')} placeholder="chef@serviceexpress.ci" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Téléphone</label>
                  <Input {...createForm.register('phone')} placeholder="05XXXXXXXX" className="rounded-xl" />
                </div>
                <FormSearchableSelect
                  control={createForm.control}
                  name="gender"
                  options={[
                    { value: 'male', label: 'Homme' },
                    { value: 'female', label: 'Femme' },
                  ]}
                  placeholder="Sélectionner le genre"
                />
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Zone</label>
                  <FormSearchableSelect
                    control={createForm.control}
                    name="zone_id"
                    options={zoneFormOptions}
                    placeholder="Choisir une zone"
                    searchPlaceholder="Tapez le nom de la zone..."
                  />
                  {availableZones?.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">Toutes les zones ont déjà un chef assigné</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Mot de passe</label>
                  <Input type="password" {...createForm.register('password')} placeholder="Min. 6 caractères" className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={createManager.isPending}>
                  {createManager.isPending ? 'Création...' : 'Créer le compte'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <FilterBar resultCount={filteredManagers?.length ?? 0} resultLabel="chef(s) de zone trouvé(s)">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, téléphone, email ou zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <SearchableSelect
          value={zoneFilter}
          onValueChange={setZoneFilter}
          options={zoneFilterOptions}
          placeholder="Filtrer par zone"
          searchPlaceholder="Tapez le nom de la zone..."
        />
      </FilterBar>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredManagers?.length === 0 ? (
          <EmptyState icon={UserCheck} message="Aucun chef de zone trouvé" />
        ) : (
          filteredManagers?.map((manager) => (
            <EntityCard key={manager.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={manager.photo_url || getAvatarUrl(manager.gender)}
                    alt={manager.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#FF6600]/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#0A2240] truncate">{manager.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#FF6600] font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" />Chef de zone
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatCardDate(manager.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => setDetailManager(manager)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => openEdit(manager)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(manager.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><span className="truncate">{manager.email || '—'}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span>{manager.phone}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span>{manager.zones?.name}</span></div>
              </div>
            </EntityCard>
          ))
        )}
      </div>

      <Dialog open={!!editingManager} onOpenChange={(open) => !open && resetEditState()}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier le chef de zone</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <PhotoUpload
              gender={editGender}
              currentUrl={removePhoto ? undefined : editingManager?.photo_url}
              onFileChange={(f) => handlePhotoChange(f, true)}
            />
            <Input {...editForm.register('name')} placeholder="Nom" className="rounded-xl" />
            <Input {...editForm.register('phone')} placeholder="Téléphone" className="rounded-xl" />
            <FormSearchableSelect
              control={editForm.control}
              name="gender"
              options={[
                { value: 'male', label: 'Homme' },
                { value: 'female', label: 'Femme' },
              ]}
              placeholder="Genre"
            />
            <Button type="submit" className="w-full rounded-xl" disabled={updateManager.isPending}>
              Enregistrer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {detailManager && (
        <PersonDetailModal
          open={!!detailManager}
          onOpenChange={(open) => !open && setDetailManager(null)}
          name={detailManager.name}
          gender={detailManager.gender}
          photoUrl={detailManager.photo_url}
          createdAt={detailManager.created_at}
          badge={{
            label: 'Chef de zone',
            className: 'bg-orange-100 text-[#FF6600]',
          }}
          fields={[
            { label: 'Email', value: detailManager.email ?? '', icon: Mail },
            { label: 'Téléphone', value: detailManager.phone, icon: Phone },
            { label: 'Zone', value: detailManager.zones?.name ?? '', icon: MapPin },
            { label: 'Genre', value: detailManager.gender === 'male' ? 'Homme' : 'Femme', icon: User },
          ]}
          onEdit={() => openEdit(detailManager)}
        />
      )}
    </div>
  );
}
