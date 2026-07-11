// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   ScrollableDialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { PageHeader, EntityCard, ErrorAlert, EmptyState } from '@/components/admin/page-shell';
// import { ServiceIconPicker } from '@/components/admin/service-icon-picker';
// import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
// import { useConfirm } from '@/contexts/confirm-context';
// import { getErrorMessage } from '@/lib/auth';
// import { getServiceIcon } from '@/lib/service-icons';
// import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
// import type { Service } from '@/types';

// export function ServicesPage() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingService, setEditingService] = useState<Service | null>(null);
//   const [serviceName, setServiceName] = useState('');
//   const [selectedIcon, setSelectedIcon] = useState('Wrench');
//   const [errorMsg, setErrorMsg] = useState('');
//   const { data: services } = useServices();
//   const createService = useCreateService();
//   const updateService = useUpdateService();
//   const deleteService = useDeleteService();
//   const { confirm } = useConfirm();

//   const handleCreate = async () => {
//     if (!serviceName.trim()) return;
//     setErrorMsg('');
//     try {
//       await createService.mutateAsync({ name: serviceName, icon: selectedIcon });
//       setServiceName('');
//       setIsDialogOpen(false);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editingService || !serviceName.trim()) return;
//     setErrorMsg('');
//     try {
//       await updateService.mutateAsync({ id: editingService.id, name: serviceName, icon: selectedIcon });
//       setEditingService(null);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleDelete = async (id: string) => {
//     const ok = await confirm({
//       title: 'Supprimer ce service ?',
//       description: 'Ce service ne sera plus disponible pour les clients.',
//       confirmText: 'Supprimer',
//       variant: 'danger',
//     });
//     if (!ok) return;
//     try {
//       await deleteService.mutateAsync(id);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const openEdit = (service: Service) => {
//     setEditingService(service);
//     setServiceName(service.name);
//     setSelectedIcon(service.icon);
//   };

//   const openCreate = () => {
//     setServiceName('');
//     setSelectedIcon('Wrench');
//     setErrorMsg('');
//     setIsDialogOpen(true);
//   };

//   return (
//     <div className="space-y-6">
//       <ErrorAlert message={errorMsg} />

//       <PageHeader
//         title="Services"
//         description="Services proposés aux clients"
//         badge={services?.length ?? 0}
//         action={
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="rounded-xl" onClick={openCreate}>
//                 <Plus className="w-4 h-4 mr-2" />Ajouter un service
//               </Button>
//             </DialogTrigger>
//             <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
//               <DialogHeader>
//                 <DialogTitle>Ajouter un service</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-xs text-gray-500 mb-1.5 block">Nom du service</label>
//                   <Input
//                     placeholder="Ex. Plomberie, Électricité..."
//                     value={serviceName}
//                     onChange={(e) => setServiceName(e.target.value)}
//                     className="rounded-xl"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500 mb-1.5 block">Icône</label>
//                   <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
//                 </div>
//                 <Button onClick={handleCreate} className="w-full rounded-xl">Créer</Button>
//               </div>
//             </ScrollableDialogContent>
//           </Dialog>
//         }
//       />

//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {services?.length === 0 ? (
//           <EmptyState icon={Wrench} message="Aucun service configuré" />
//         ) : (
//           services?.map((service) => {
//             const IconComponent = getServiceIcon(service.icon);
//             return (
//               <EntityCard key={service.id} className="text-center relative">
//                 <div className="absolute top-3 right-3 flex gap-1">
//                   <Button variant="outline" size="sm" className="rounded-lg h-7 w-7 p-0" onClick={() => openEdit(service)}>
//                     <Pencil className="w-3 h-3" />
//                   </Button>
//                   <Button variant="outline" size="sm" className="rounded-lg h-7 w-7 p-0" onClick={() => handleDelete(service.id)}>
//                     <Trash2 className="w-3 h-3 text-red-400" />
//                   </Button>
//                 </div>
//                 <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#FF6600]/20 to-[#FF6600]/5 rounded-2xl flex items-center justify-center">
//                   <IconComponent className="w-7 h-7 text-[#FF6600]" />
//                 </div>
//                 <h3 className="font-semibold text-[#0A2240]">{service.name}</h3>
//               </EntityCard>
//             );
//           })
//         )}
//       </div>

//       <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
//         <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
//           <DialogHeader>
//             <DialogTitle>Modifier le service</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="text-xs text-gray-500 mb-1.5 block">Nom du service</label>
//               <Input
//                 value={serviceName}
//                 onChange={(e) => setServiceName(e.target.value)}
//                 className="rounded-xl"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 mb-1.5 block">Icône</label>
//               <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
//             </div>
//             <Button onClick={handleUpdate} className="w-full rounded-xl">Enregistrer</Button>
//           </div>
//         </ScrollableDialogContent>
//       </Dialog>
//     </div>
//   );
// }


import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  ScrollableDialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader, EntityCard, ErrorAlert, EmptyState } from '@/components/admin/page-shell';
import { ServiceIconPicker } from '@/components/admin/service-icon-picker';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { getServiceIcon } from '@/lib/service-icons';
import { Plus, Pencil, Trash2, Wrench, Search, X, AlertCircle } from 'lucide-react';
import type { Service } from '@/types';

export function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wrench');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const { data: services } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const { confirm } = useConfirm();

  // Filtrer les services en fonction de la recherche
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchTerm.trim()) return services;
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // Vérifier si un nom de service existe déjà (en excluant le service en cours d'édition)
  const isServiceNameDuplicate = (name: string, excludeId?: string) => {
    if (!services) return false;
    const normalizedName = name.trim().toLowerCase();
    return services.some(service => 
      service.name.toLowerCase() === normalizedName && 
      service.id !== excludeId
    );
  };

  const handleCreate = async () => {
    const trimmedName = serviceName.trim();
    if (!trimmedName) {
      setErrorMsg('Le nom du service est requis');
      return;
    }

    // Vérifier les doublons
    if (isServiceNameDuplicate(trimmedName)) {
      setDuplicateError(`Un service nommé "${trimmedName}" existe déjà. Veuillez choisir un nom différent.`);
      setErrorMsg('');
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    try {
      await createService.mutateAsync({ name: trimmedName, icon: selectedIcon });
      setServiceName('');
      setSelectedIcon('Wrench');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    const trimmedName = serviceName.trim();
    if (!editingService || !trimmedName) return;

    // Vérifier les doublons (exclure le service en cours d'édition)
    if (isServiceNameDuplicate(trimmedName, editingService.id)) {
      setDuplicateError(`Un service nommé "${trimmedName}" existe déjà. Veuillez choisir un nom différent.`);
      setErrorMsg('');
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    try {
      await updateService.mutateAsync({ 
        id: editingService.id, 
        name: trimmedName, 
        icon: selectedIcon 
      });
      setEditingService(null);
      setServiceName('');
      setSelectedIcon('Wrench');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer ce service ?',
      description: 'Ce service ne sera plus disponible pour les clients.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteService.mutateAsync(id);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setSelectedIcon(service.icon);
    setDuplicateError('');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setServiceName('');
    setSelectedIcon('Wrench');
    setErrorMsg('');
    setDuplicateError('');
    setIsDialogOpen(true);
  };

  // Réinitialiser les erreurs quand le nom change
  const handleNameChange = (value: string) => {
    setServiceName(value);
    setDuplicateError('');
    setErrorMsg('');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Gérer la fermeture du dialogue
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setServiceName('');
      setSelectedIcon('Wrench');
      setEditingService(null);
      setErrorMsg('');
      setDuplicateError('');
      setIsDialogOpen(false);
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Services"
        description="Services proposés aux clients"
        badge={filteredServices.length ?? 0}
        action={
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />Ajouter un service
              </Button>
            </DialogTrigger>
            <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Affichage de l'erreur de doublon */}
                {duplicateError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{duplicateError}</span>
                  </div>
                )}
                
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nom du service *</label>
                  <Input
                    placeholder="Ex. Plomberie, Électricité..."
                    value={serviceName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`rounded-xl ${duplicateError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingService) {
                          handleUpdate();
                        } else {
                          handleCreate();
                        }
                      }
                    }}
                  />
                  {duplicateError && (
                    <p className="text-xs text-red-500 mt-1">Veuillez choisir un nom différent</p>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Icône</label>
                  <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
                </div>
                
                <Button 
                  onClick={editingService ? handleUpdate : handleCreate} 
                  className="w-full rounded-xl" 
                  disabled={
                    createService.isPending || 
                    updateService.isPending || 
                    !serviceName.trim() || 
                    !!duplicateError
                  }
                >
                  {createService.isPending || updateService.isPending 
                    ? 'Chargement...' 
                    : editingService 
                    ? 'Enregistrer' 
                    : 'Créer'}
                </Button>

                {!editingService && services && services.length > 0 && (
                  <div className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                    {services.length} service(s) existant(s)
                  </div>
                )}
              </div>
            </ScrollableDialogContent>
          </Dialog>
        }
      />

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Résultats de la recherche */}
      {searchTerm && filteredServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun service trouvé pour "<span className="font-semibold">{searchTerm}</span>"</p>
          <p className="text-sm mt-1">Essayez avec un autre terme de recherche</p>
        </div>
      )}

      {/* Liste des services */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.length === 0 && !searchTerm ? (
          <EmptyState icon={Wrench} message="Aucun service configuré" />
        ) : (
          filteredServices.map((service) => {
            const IconComponent = getServiceIcon(service.icon);
            return (
              <EntityCard key={service.id} className="text-center relative">
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-7 w-7 p-0 hover:border-[#FF6600] hover:text-[#FF6600] transition-colors" 
                    onClick={() => openEdit(service)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-7 w-7 p-0 hover:border-red-400 hover:text-red-400 transition-colors" 
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#FF6600]/20 to-[#FF6600]/5 rounded-2xl flex items-center justify-center">
                  <IconComponent className="w-7 h-7 text-[#FF6600]" />
                </div>
                <h3 className="font-semibold text-[#0A2240]">{service.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Créé le {new Date(service.created_at).toLocaleDateString('fr-FR')}
                </p>
              </EntityCard>
            );
          })
        )}
      </div>
    </div>
  );
}