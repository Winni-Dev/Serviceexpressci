// import { useState, useEffect, useMemo } from 'react';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { SearchableSelect } from '@/components/ui/searchable-select';
// import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
// import { PhotoUpload } from '@/components/admin/photo-upload';
// import { PersonDetailModal } from '@/components/admin/person-detail-modal';
// import {
//   PageHeader,
//   FilterBar,
//   EntityCard,
//   ErrorAlert,
//   PageLoading,
//   EmptyState,
// } from '@/components/admin/page-shell';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import {
//   useWorkers,
//   useCreateWorker,
//   useUpdateWorker,
//   useUpdateWorkerStatus,
//   useDeleteWorker,
// } from '@/hooks/useWorkers';
// import { useServices } from '@/hooks/useServices';
// import { useZones } from '@/hooks/useZones';
// import { useAuth } from '@/contexts/auth-context';
// import { getAvatarUrl } from '@/lib/utils';
// import { uploadStaffPhoto } from '@/lib/storage';
// import { useConfirm } from '@/contexts/confirm-context';
// import { getErrorMessage } from '@/lib/auth';
// import {
//   Plus,
//   User,
//   UserCheck,
//   UserX,
//   Phone,
//   MapPin,
//   Trash2,
//   Search,
//   Users,
//   Pencil,
//   Eye,
//   Calendar,
//   Briefcase,
// } from 'lucide-react';
// import type { Worker } from '@/types';

// const workerSchema = z.object({
//   name: z.string().min(2, 'Le nom est requis'),
//   phone: z.string().min(8, 'Numéro de téléphone invalide'),
//   service_id: z.string().min(1, 'Veuillez choisir un service'),
//   zone_id: z.string().min(1, 'Veuillez choisir une zone'),
//   gender: z.enum(['male', 'female']),
// });

// type WorkerForm = z.infer<typeof workerSchema>;

// function formatCardDate(date: string) {
//   return format(new Date(date), 'dd MMM yyyy', { locale: fr });
// }

// export function WorkersPage() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
//   const [detailWorker, setDetailWorker] = useState<Worker | null>(null);
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [removePhoto, setRemovePhoto] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [zoneFilter, setZoneFilter] = useState('all');
//   const [serviceFilter, setServiceFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const { profile } = useAuth();
//   const isZoneManager = profile?.role === 'zone_manager';
//   const { data: workers, isLoading } = useWorkers();
//   const { data: services } = useServices();
//   const { data: zones } = useZones();
//   const createWorker = useCreateWorker();
//   const updateWorker = useUpdateWorker();
//   const updateStatus = useUpdateWorkerStatus();
//   const deleteWorker = useDeleteWorker();
//   const { confirm } = useConfirm();

//   const displayZones = isZoneManager
//     ? zones?.filter((z) => z.id === profile?.zone_id)
//     : zones;

//   const isEditMode = !!editingWorker;
//   const dialogOpen = isDialogOpen || isEditMode;

//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm<WorkerForm>({ resolver: zodResolver(workerSchema) });

//   const watchedGender = watch('gender') || editingWorker?.gender || 'male';

//   const serviceOptions = useMemo(
//     () => services?.map((s) => ({ value: s.id, label: s.name })) ?? [],
//     [services]
//   );

//   const zoneOptions = useMemo(
//     () => [
//       { value: 'all', label: 'Toutes les zones' },
//       ...(zones?.map((z) => ({ value: z.id, label: z.name })) ?? []),
//     ],
//     [zones]
//   );

//   const zoneFormOptions = useMemo(
//     () => displayZones?.map((z) => ({ value: z.id, label: z.name })) ?? [],
//     [displayZones]
//   );

//   const serviceFilterOptions = useMemo(
//     () => [
//       { value: 'all', label: 'Tous les services' },
//       ...(services?.map((s) => ({ value: s.id, label: s.name })) ?? []),
//     ],
//     [services]
//   );

//   const statusOptions = [
//     { value: 'all', label: 'Tous les statuts' },
//     { value: 'active', label: 'Actifs' },
//     { value: 'inactive', label: 'Inactifs' },
//   ];

//   useEffect(() => {
//     if (isZoneManager && profile?.zone_id) {
//       setValue('zone_id', profile.zone_id);
//     }
//   }, [isZoneManager, profile?.zone_id, setValue]);

//   const filteredWorkers = useMemo(() => {
//     return workers?.filter((worker) => {
//       const q = searchTerm.toLowerCase();
//       const matchesSearch =
//         !q ||
//         worker.name.toLowerCase().includes(q) ||
//         worker.phone.includes(q) ||
//         worker.zones?.name?.toLowerCase().includes(q) ||
//         worker.services?.name?.toLowerCase().includes(q);

//       const matchesZone = zoneFilter === 'all' || worker.zone_id === zoneFilter;
//       const matchesService = serviceFilter === 'all' || worker.service_id === serviceFilter;
//       const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;

//       return matchesSearch && matchesZone && matchesService && matchesStatus;
//     });
//   }, [workers, searchTerm, zoneFilter, serviceFilter, statusFilter]);

//   const activeCount = workers?.filter((w) => w.status === 'active').length ?? 0;
//   const inactiveCount = workers?.filter((w) => w.status === 'inactive').length ?? 0;

//   const resetFormState = () => {
//     reset();
//     setPhotoFile(null);
//     setRemovePhoto(false);
//     setEditingWorker(null);
//     setIsDialogOpen(false);
//     if (isZoneManager && profile?.zone_id) setValue('zone_id', profile.zone_id);
//   };

//   const openEdit = (worker: Worker) => {
//     setDetailWorker(null);
//     setEditingWorker(worker);
//     reset({
//       name: worker.name,
//       phone: worker.phone,
//       service_id: worker.service_id,
//       zone_id: worker.zone_id,
//       gender: worker.gender,
//     });
//     setPhotoFile(null);
//     setRemovePhoto(false);
//   };

//   const handlePhotoChange = (file: File | null) => {
//     setPhotoFile(file);
//     if (!file && (editingWorker?.photo_url)) setRemovePhoto(true);
//     else setRemovePhoto(false);
//   };

//   const savePhoto = async (id: string, existingUrl?: string) => {
//     if (photoFile) {
//       return uploadStaffPhoto(photoFile, 'workers', id);
//     }
//     if (removePhoto) return null;
//     return existingUrl;
//   };

//   const onSubmit = async (data: WorkerForm) => {
//     setErrorMsg('');
//     try {
//       const payload = isZoneManager && profile?.zone_id
//         ? { ...data, zone_id: profile.zone_id }
//         : data;

//       if (editingWorker) {
//         const photo_url = await savePhoto(editingWorker.id, editingWorker.photo_url);
//         await updateWorker.mutateAsync({
//           id: editingWorker.id,
//           ...payload,
//           ...(photo_url !== undefined ? { photo_url: photo_url ?? undefined } : {}),
//         });
//         resetFormState();
//       } else {
//         const created = await createWorker.mutateAsync(payload);
//         if (photoFile && created?.id) {
//           const photo_url = await uploadStaffPhoto(photoFile, 'workers', created.id);
//           await updateWorker.mutateAsync({ id: created.id, photo_url });
//         }
//         resetFormState();
//       }
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleToggleStatus = async (workerId: string, currentStatus: string) => {
//     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
//     try {
//       await updateStatus.mutateAsync({ id: workerId, status: newStatus });
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleDelete = async (id: string) => {
//     const ok = await confirm({
//       title: 'Supprimer ce travailleur ?',
//       description: 'Cette action est irréversible. Le travailleur sera définitivement supprimé.',
//       confirmText: 'Supprimer',
//       variant: 'danger',
//     });
//     if (!ok) return;
//     try {
//       await deleteWorker.mutateAsync(id);
//       if (detailWorker?.id === id) setDetailWorker(null);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   if (isLoading) return <PageLoading />;

//   return (
//     <div className="space-y-6">
//       <ErrorAlert message={errorMsg} />

//       <PageHeader
//         title="Travailleurs"
//         description={isZoneManager ? 'Travailleurs de votre zone' : 'Gérez vos artisans et travailleurs'}
//         badge={workers?.length ?? 0}
//         action={
//           <Dialog
//             open={dialogOpen}
//             onOpenChange={(open) => {
//               if (open) setIsDialogOpen(true);
//               else resetFormState();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="rounded-xl" onClick={() => setIsDialogOpen(true)}>
//                 <Plus className="w-4 h-4 mr-2" />Ajouter un travailleur
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{isEditMode ? 'Modifier le travailleur' : 'Ajouter un travailleur'}</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <PhotoUpload
//                   gender={watchedGender as 'male' | 'female'}
//                   currentUrl={removePhoto ? undefined : editingWorker?.photo_url}
//                   onFileChange={handlePhotoChange}
//                 />
//                 <Input {...register('name')} placeholder="Nom du travailleur" className="rounded-xl" />
//                 {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//                 <Input {...register('phone')} placeholder="05XXXXXXXX" className="rounded-xl" />
//                 <FormSearchableSelect
//                   control={control}
//                   name="gender"
//                   options={[
//                     { value: 'male', label: 'Homme' },
//                     { value: 'female', label: 'Femme' },
//                   ]}
//                   placeholder="Genre"
//                 />
//                 <FormSearchableSelect
//                   control={control}
//                   name="service_id"
//                   options={serviceOptions}
//                   placeholder="Service"
//                   searchPlaceholder="Tapez le nom du service..."
//                 />
//                 {!isZoneManager ? (
//                   <FormSearchableSelect
//                     control={control}
//                     name="zone_id"
//                     options={zoneFormOptions}
//                     placeholder="Zone"
//                     searchPlaceholder="Tapez le nom de la zone..."
//                   />
//                 ) : (
//                   <input type="hidden" {...register('zone_id')} />
//                 )}
//                 <Button type="submit" className="w-full rounded-xl" disabled={createWorker.isPending || updateWorker.isPending}>
//                   {isEditMode ? 'Enregistrer' : 'Ajouter'}
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//         {[
//           { label: 'Total', value: workers?.length ?? 0, color: 'text-[#0A2240]' },
//           { label: 'Actifs', value: activeCount, color: 'text-emerald-600' },
//           { label: 'Inactifs', value: inactiveCount, color: 'text-gray-400' },
//         ].map((stat) => (
//           <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
//             <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//             <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
//           </div>
//         ))}
//       </div>

//       <FilterBar resultCount={filteredWorkers?.length ?? 0} resultLabel="travailleur(s) trouvé(s)">
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="relative lg:col-span-2">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <Input
//               placeholder="Rechercher par nom, téléphone, zone ou service..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 rounded-xl border-gray-200"
//             />
//           </div>
//           {!isZoneManager && (
//             <SearchableSelect
//               value={zoneFilter}
//               onValueChange={setZoneFilter}
//               options={zoneOptions}
//               placeholder="Filtrer par zone"
//               searchPlaceholder="Tapez le nom de la zone..."
//             />
//           )}
//           <SearchableSelect
//             value={serviceFilter}
//             onValueChange={setServiceFilter}
//             options={serviceFilterOptions}
//             placeholder="Filtrer par service"
//             searchPlaceholder="Tapez le nom du service..."
//           />
//           <SearchableSelect
//             value={statusFilter}
//             onValueChange={setStatusFilter}
//             options={statusOptions}
//             placeholder="Filtrer par statut"
//             searchPlaceholder="Rechercher un statut..."
//           />
//         </div>
//       </FilterBar>

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredWorkers?.length === 0 ? (
//           <EmptyState icon={Users} message="Aucun travailleur trouvé" />
//         ) : (
//           filteredWorkers?.map((worker) => (
//             <EntityCard key={worker.id} inactive={worker.status === 'inactive'}>
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <img
//                     src={worker.photo_url || getAvatarUrl(worker.gender)}
//                     alt={worker.name}
//                     className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100 shrink-0"
//                   />
//                   <div className="min-w-0">
//                     <h3 className="font-semibold text-[#0A2240] truncate">{worker.name}</h3>
//                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
//                       <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
//                         {worker.status === 'active' ? 'Actif' : 'Inactif'}
//                       </Badge>
//                       <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
//                         <Calendar className="w-3 h-3" />
//                         {formatCardDate(worker.created_at)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex gap-1 shrink-0">
//                   <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => setDetailWorker(worker)}>
//                     <Eye className="w-4 h-4" />
//                   </Button>
//                   <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => openEdit(worker)}>
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                   <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(worker.id)}>
//                     <Trash2 className="w-4 h-4 text-red-400" />
//                   </Button>
//                 </div>
//               </div>
//               <div className="space-y-2 text-sm">
//                 <div className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.phone}</span></div>
//                 <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.zones?.name}</span></div>
//                 <div className="flex items-center gap-2 text-gray-500"><Briefcase className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.services?.name}</span></div>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="flex-1 rounded-xl"
//                   onClick={() => handleToggleStatus(worker.id, worker.status)}
//                 >
//                   {worker.status === 'active'
//                     ? <><UserX className="w-4 h-4 mr-1" />Désactiver</>
//                     : <><UserCheck className="w-4 h-4 mr-1" />Activer</>}
//                 </Button>
//               </div>
//             </EntityCard>
//           ))
//         )}
//       </div>

//       {detailWorker && (
//         <PersonDetailModal
//           open={!!detailWorker}
//           onOpenChange={(open) => !open && setDetailWorker(null)}
//           name={detailWorker.name}
//           gender={detailWorker.gender}
//           photoUrl={detailWorker.photo_url}
//           createdAt={detailWorker.created_at}
//           badge={{
//             label: detailWorker.status === 'active' ? 'Actif' : 'Inactif',
//             className: detailWorker.status === 'active'
//               ? 'bg-emerald-100 text-emerald-800'
//               : 'bg-gray-100 text-gray-600',
//           }}
//           fields={[
//             { label: 'Téléphone', value: detailWorker.phone, icon: Phone },
//             { label: 'Zone', value: detailWorker.zones?.name ?? '', icon: MapPin },
//             { label: 'Service', value: detailWorker.services?.name ?? '', icon: Briefcase },
//             { label: 'Genre', value: detailWorker.gender === 'male' ? 'Homme' : 'Femme', icon: User },
//           ]}
//           onEdit={() => openEdit(detailWorker)}
//         />
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  PageLoading,
  EmptyState,
} from '@/components/admin/page-shell';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useWorkers,
  useCreateWorker,
  useUpdateWorker,
  useUpdateWorkerStatus,
  useDeleteWorker,
} from '@/hooks/useWorkers';
import { useServices } from '@/hooks/useServices';
import { useZones } from '@/hooks/useZones';
import { useAuth } from '@/contexts/auth-context';
import { getAvatarUrl } from '@/lib/utils';
import { uploadStaffPhoto } from '@/lib/storage';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import {
  Plus,
  User,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Trash2,
  Search,
  Users,
  Pencil,
  Eye,
  Calendar,
  Briefcase,
  Shield,
} from 'lucide-react';
import type { Worker } from '@/types';

const workerSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  service_id: z.string().min(1, 'Veuillez choisir un service'),
  zone_id: z.string().min(1, 'Veuillez choisir une zone'),
  gender: z.enum(['male', 'female']),
});

type WorkerForm = z.infer<typeof workerSchema>;

function formatCardDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
}

export function WorkersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [detailWorker, setDetailWorker] = useState<Worker | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { profile } = useAuth();
  const isZoneManager = profile?.role === 'zone_manager';
  const isSuperAdmin = profile?.role === 'super_admin';
  const { data: workers, isLoading } = useWorkers();
  const { data: services } = useServices();
  const { data: zones } = useZones();
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const updateStatus = useUpdateWorkerStatus();
  const deleteWorker = useDeleteWorker();
  const { confirm } = useConfirm();

  const displayZones = isZoneManager
    ? zones?.filter((z) => z.id === profile?.zone_id)
    : zones;

  const isEditMode = !!editingWorker;
  const dialogOpen = isDialogOpen || isEditMode;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<WorkerForm>({ resolver: zodResolver(workerSchema) });

  const watchedGender = watch('gender') || editingWorker?.gender || 'male';

  const serviceOptions = useMemo(
    () => services?.map((s) => ({ value: s.id, label: s.name })) ?? [],
    [services]
  );

  const zoneOptions = useMemo(
    () => [
      { value: 'all', label: 'Toutes les zones' },
      ...(zones?.map((z) => ({ value: z.id, label: z.name })) ?? []),
    ],
    [zones]
  );

  const zoneFormOptions = useMemo(
    () => displayZones?.map((z) => ({ value: z.id, label: z.name })) ?? [],
    [displayZones]
  );

  const serviceFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Tous les services' },
      ...(services?.map((s) => ({ value: s.id, label: s.name })) ?? []),
    ],
    [services]
  );

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' },
  ];

  useEffect(() => {
    if (isZoneManager && profile?.zone_id) {
      setValue('zone_id', profile.zone_id);
    }
  }, [isZoneManager, profile?.zone_id, setValue]);

  const filteredWorkers = useMemo(() => {
    return workers?.filter((worker) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        worker.name.toLowerCase().includes(q) ||
        worker.phone.includes(q) ||
        worker.zones?.name?.toLowerCase().includes(q) ||
        worker.services?.name?.toLowerCase().includes(q);

      const matchesZone = zoneFilter === 'all' || worker.zone_id === zoneFilter;
      const matchesService = serviceFilter === 'all' || worker.service_id === serviceFilter;
      const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;

      return matchesSearch && matchesZone && matchesService && matchesStatus;
    });
  }, [workers, searchTerm, zoneFilter, serviceFilter, statusFilter]);

  const activeCount = workers?.filter((w) => w.status === 'active').length ?? 0;
  const inactiveCount = workers?.filter((w) => w.status === 'inactive').length ?? 0;

  const resetFormState = () => {
    reset();
    setPhotoFile(null);
    setRemovePhoto(false);
    setEditingWorker(null);
    setIsDialogOpen(false);
    if (isZoneManager && profile?.zone_id) setValue('zone_id', profile.zone_id);
  };

  const openEdit = (worker: Worker) => {
    // Seul le super_admin peut modifier
    if (!isSuperAdmin) {
      setErrorMsg('Vous n\'avez pas les droits pour modifier un travailleur');
      return;
    }
    setDetailWorker(null);
    setEditingWorker(worker);
    reset({
      name: worker.name,
      phone: worker.phone,
      service_id: worker.service_id,
      zone_id: worker.zone_id,
      gender: worker.gender,
    });
    setPhotoFile(null);
    setRemovePhoto(false);
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (!file && (editingWorker?.photo_url)) setRemovePhoto(true);
    else setRemovePhoto(false);
  };

  const savePhoto = async (id: string, existingUrl?: string) => {
    if (photoFile) {
      return uploadStaffPhoto(photoFile, 'workers', id);
    }
    if (removePhoto) return null;
    return existingUrl;
  };

  const onSubmit = async (data: WorkerForm) => {
    setErrorMsg('');
    try {
      const payload = isZoneManager && profile?.zone_id
        ? { ...data, zone_id: profile.zone_id }
        : data;

      if (editingWorker) {
        // Seul le super_admin peut modifier
        if (!isSuperAdmin) {
          setErrorMsg('Vous n\'avez pas les droits pour modifier un travailleur');
          return;
        }
        const photo_url = await savePhoto(editingWorker.id, editingWorker.photo_url);
        await updateWorker.mutateAsync({
          id: editingWorker.id,
          ...payload,
          ...(photo_url !== undefined ? { photo_url: photo_url ?? undefined } : {}),
        });
        resetFormState();
      } else {
        const created = await createWorker.mutateAsync(payload);
        if (photoFile && created?.id) {
          const photo_url = await uploadStaffPhoto(photoFile, 'workers', created.id);
          await updateWorker.mutateAsync({ id: created.id, photo_url });
        }
        resetFormState();
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (workerId: string, currentStatus: string) => {
    // Seul le super_admin peut changer le statut
    if (!isSuperAdmin) {
      setErrorMsg('Vous n\'avez pas les droits pour modifier le statut d\'un travailleur');
      return;
    }
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateStatus.mutateAsync({ id: workerId, status: newStatus });
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    // Seul le super_admin peut supprimer
    if (!isSuperAdmin) {
      setErrorMsg('Vous n\'avez pas les droits pour supprimer un travailleur');
      return;
    }
    const ok = await confirm({
      title: 'Supprimer ce travailleur ?',
      description: 'Cette action est irréversible. Le travailleur sera définitivement supprimé.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteWorker.mutateAsync(id);
      if (detailWorker?.id === id) setDetailWorker(null);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Travailleurs"
        description={isZoneManager ? 'Travailleurs de votre zone' : 'Gérez vos artisans et travailleurs'}
        badge={workers?.length ?? 0}
        action={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (open) setIsDialogOpen(true);
              else resetFormState();
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Ajouter un travailleur
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Modifier le travailleur' : 'Ajouter un travailleur'}</DialogTitle>
                {isZoneManager && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg mt-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Vous pouvez uniquement ajouter des travailleurs. Les modifications, suppressions et désactivations sont réservées au super administrateur.
                  </p>
                )}
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PhotoUpload
                  gender={watchedGender as 'male' | 'female'}
                  currentUrl={removePhoto ? undefined : editingWorker?.photo_url}
                  onFileChange={handlePhotoChange}
                />
                <Input {...register('name')} placeholder="Nom du travailleur" className="rounded-xl" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                <Input {...register('phone')} placeholder="05XXXXXXXX" className="rounded-xl" />
                <FormSearchableSelect
                  control={control}
                  name="gender"
                  options={[
                    { value: 'male', label: 'Homme' },
                    { value: 'female', label: 'Femme' },
                  ]}
                  placeholder="Genre"
                />
                <FormSearchableSelect
                  control={control}
                  name="service_id"
                  options={serviceOptions}
                  placeholder="Service"
                  searchPlaceholder="Tapez le nom du service..."
                />
                {!isZoneManager ? (
                  <FormSearchableSelect
                    control={control}
                    name="zone_id"
                    options={zoneFormOptions}
                    placeholder="Zone"
                    searchPlaceholder="Tapez le nom de la zone..."
                  />
                ) : (
                  <input type="hidden" {...register('zone_id')} />
                )}
                <Button type="submit" className="w-full rounded-xl" disabled={createWorker.isPending || updateWorker.isPending}>
                  {isEditMode ? 'Enregistrer' : 'Ajouter'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: workers?.length ?? 0, color: 'text-[#0A2240]' },
          { label: 'Actifs', value: activeCount, color: 'text-emerald-600' },
          { label: 'Inactifs', value: inactiveCount, color: 'text-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <FilterBar resultCount={filteredWorkers?.length ?? 0} resultLabel="travailleur(s) trouvé(s)">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, téléphone, zone ou service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          {!isZoneManager && (
            <SearchableSelect
              value={zoneFilter}
              onValueChange={setZoneFilter}
              options={zoneOptions}
              placeholder="Filtrer par zone"
              searchPlaceholder="Tapez le nom de la zone..."
            />
          )}
          <SearchableSelect
            value={serviceFilter}
            onValueChange={setServiceFilter}
            options={serviceFilterOptions}
            placeholder="Filtrer par service"
            searchPlaceholder="Tapez le nom du service..."
          />
          <SearchableSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filtrer par statut"
            searchPlaceholder="Rechercher un statut..."
          />
        </div>
      </FilterBar>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers?.length === 0 ? (
          <EmptyState icon={Users} message="Aucun travailleur trouvé" />
        ) : (
          filteredWorkers?.map((worker) => (
            <EntityCard key={worker.id} inactive={worker.status === 'inactive'}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={worker.photo_url || getAvatarUrl(worker.gender)}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#0A2240] truncate">{worker.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                        {worker.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatCardDate(worker.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => setDetailWorker(worker)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {/* Seul le super_admin peut modifier */}
                  {isSuperAdmin && (
                    <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => openEdit(worker)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  {/* Seul le super_admin peut supprimer */}
                  {isSuperAdmin && (
                    <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(worker.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.phone}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.zones?.name}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><Briefcase className="w-4 h-4 text-gray-400 shrink-0" /><span>{worker.services?.name}</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                {/* Seul le super_admin peut activer/désactiver */}
                {isSuperAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => handleToggleStatus(worker.id, worker.status)}
                  >
                    {worker.status === 'active'
                      ? <><UserX className="w-4 h-4 mr-1" />Désactiver</>
                      : <><UserCheck className="w-4 h-4 mr-1" />Activer</>}
                  </Button>
                ) : (
                  <div className="flex-1 text-center text-xs text-gray-400 bg-gray-50 rounded-xl py-1.5 px-3 flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3" />
                    Action réservée à l'administrateur
                  </div>
                )}
              </div>
            </EntityCard>
          ))
        )}
      </div>

      {detailWorker && (
        <PersonDetailModal
          open={!!detailWorker}
          onOpenChange={(open) => !open && setDetailWorker(null)}
          name={detailWorker.name}
          gender={detailWorker.gender}
          photoUrl={detailWorker.photo_url}
          createdAt={detailWorker.created_at}
          badge={{
            label: detailWorker.status === 'active' ? 'Actif' : 'Inactif',
            className: detailWorker.status === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-600',
          }}
          fields={[
            { label: 'Téléphone', value: detailWorker.phone, icon: Phone },
            { label: 'Zone', value: detailWorker.zones?.name ?? '', icon: MapPin },
            { label: 'Service', value: detailWorker.services?.name ?? '', icon: Briefcase },
            { label: 'Genre', value: detailWorker.gender === 'male' ? 'Homme' : 'Femme', icon: User },
          ]}
          onEdit={isSuperAdmin ? () => openEdit(detailWorker) : undefined}
        />
      )}
    </div>
  );
}