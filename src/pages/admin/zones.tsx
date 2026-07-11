// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { PageHeader, EntityCard, ErrorAlert, EmptyState } from '@/components/admin/page-shell';
// import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/hooks/useZones';
// import { useConfirm } from '@/contexts/confirm-context';
// import { getErrorMessage } from '@/lib/auth';
// import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
// import type { Zone } from '@/types';

// export function ZonesPage() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingZone, setEditingZone] = useState<Zone | null>(null);
//   const [zoneName, setZoneName] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const { data: zones } = useZones();
//   const createZone = useCreateZone();
//   const updateZone = useUpdateZone();
//   const deleteZone = useDeleteZone();
//   const { confirm } = useConfirm();

//   const handleCreate = async () => {
//     if (!zoneName.trim()) return;
//     setErrorMsg('');
//     try {
//       await createZone.mutateAsync({ name: zoneName });
//       setZoneName('');
//       setIsDialogOpen(false);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editingZone || !zoneName.trim()) return;
//     setErrorMsg('');
//     try {
//       await updateZone.mutateAsync({ id: editingZone.id, name: zoneName });
//       setEditingZone(null);
//       setZoneName('');
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   const handleDelete = async (id: string) => {
//     const ok = await confirm({
//       title: 'Supprimer cette zone ?',
//       description: 'Les données liées à cette zone pourraient être affectées.',
//       confirmText: 'Supprimer',
//       variant: 'danger',
//     });
//     if (!ok) return;
//     try {
//       await deleteZone.mutateAsync(id);
//     } catch (error) {
//       setErrorMsg(getErrorMessage(error));
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <ErrorAlert message={errorMsg} />

//       <PageHeader
//         title="Zones"
//         description="Zones de couverture géographique"
//         badge={zones?.length ?? 0}
//         action={
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Ajouter une zone</Button>
//             </DialogTrigger>
//             <DialogContent className="rounded-2xl">
//               <DialogHeader><DialogTitle>Ajouter une zone</DialogTitle></DialogHeader>
//               <div className="space-y-4">
//                 <Input placeholder="Nom de la zone" value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="rounded-xl" />
//                 <Button onClick={handleCreate} className="w-full rounded-xl" disabled={createZone.isPending}>Créer</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {zones?.length === 0 ? (
//           <EmptyState icon={MapPin} message="Aucune zone configurée" />
//         ) : (
//           zones?.map((zone) => (
//             <EntityCard key={zone.id}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="p-3 bg-[#FF6600]/10 rounded-xl">
//                     <MapPin className="w-5 h-5 text-[#FF6600]" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-[#0A2240]">{zone.name}</h3>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       Créée le {new Date(zone.created_at).toLocaleDateString('fr-FR')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => { setEditingZone(zone); setZoneName(zone.name); }}>
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                   <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(zone.id)}>
//                     <Trash2 className="w-4 h-4 text-red-400" />
//                   </Button>
//                 </div>
//               </div>
//             </EntityCard>
//           ))
//         )}
//       </div>

//       <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
//         <DialogContent className="rounded-2xl">
//           <DialogHeader><DialogTitle>Modifier la zone</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="rounded-xl" />
//             <Button onClick={handleUpdate} className="w-full rounded-xl">Enregistrer</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader, EntityCard, ErrorAlert, EmptyState } from '@/components/admin/page-shell';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/hooks/useZones';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { MapPin, Plus, Pencil, Trash2, Search, X, AlertCircle } from 'lucide-react';
import type { Zone } from '@/types';

export function ZonesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const { data: zones } = useZones();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  const { confirm } = useConfirm();

  // Filtrer les zones en fonction de la recherche
  const filteredZones = useMemo(() => {
    if (!zones) return [];
    if (!searchTerm.trim()) return zones;
    return zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [zones, searchTerm]);

  // Vérifier si un nom de zone existe déjà (en excluant la zone en cours d'édition)
  const isZoneNameDuplicate = (name: string, excludeId?: string) => {
    if (!zones) return false;
    const normalizedName = name.trim().toLowerCase();
    return zones.some(zone => 
      zone.name.toLowerCase() === normalizedName && 
      zone.id !== excludeId
    );
  };

  const handleCreate = async () => {
    const trimmedName = zoneName.trim();
    if (!trimmedName) {
      setErrorMsg('Le nom de la zone est requis');
      return;
    }

    // Vérifier les doublons
    if (isZoneNameDuplicate(trimmedName)) {
      setDuplicateError(`Une zone nommée "${trimmedName}" existe déjà. Veuillez choisir un nom différent.`);
      setErrorMsg('');
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    try {
      await createZone.mutateAsync({ name: trimmedName });
      setZoneName('');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    const trimmedName = zoneName.trim();
    if (!trimmedName || !editingZone) return;

    // Vérifier les doublons (exclure la zone en cours d'édition)
    if (isZoneNameDuplicate(trimmedName, editingZone.id)) {
      setDuplicateError(`Une zone nommée "${trimmedName}" existe déjà. Veuillez choisir un nom différent.`);
      setErrorMsg('');
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    try {
      await updateZone.mutateAsync({ id: editingZone.id, name: trimmedName });
      setEditingZone(null);
      setZoneName('');
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer cette zone ?',
      description: 'Les données liées à cette zone pourraient être affectées.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteZone.mutateAsync(id);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  // Réinitialiser les erreurs quand on ferme le dialogue
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setZoneName('');
      setEditingZone(null);
      setErrorMsg('');
      setDuplicateError('');
      setIsDialogOpen(false);
    } else {
      setIsDialogOpen(true);
    }
  };

  // Réinitialiser les erreurs quand le nom change
  const handleNameChange = (value: string) => {
    setZoneName(value);
    setDuplicateError('');
    setErrorMsg('');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Zones"
        description="Zones de couverture géographique"
        badge={filteredZones.length ?? 0}
        action={
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Ajouter une zone</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingZone ? 'Modifier la zone' : 'Ajouter une zone'}</DialogTitle>
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
                  <label className="text-sm font-medium text-gray-700">Nom de la zone *</label>
                  <Input 
                    placeholder="Nom de la zone" 
                    value={zoneName} 
                    onChange={(e) => handleNameChange(e.target.value)} 
                    className={`rounded-xl mt-1 ${duplicateError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingZone) {
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
                
                <Button 
                  onClick={editingZone ? handleUpdate : handleCreate} 
                  className="w-full rounded-xl" 
                  disabled={createZone.isPending || updateZone.isPending || !zoneName.trim() || !!duplicateError}
                >
                  {createZone.isPending || updateZone.isPending 
                    ? 'Chargement...' 
                    : editingZone 
                    ? 'Enregistrer' 
                    : 'Créer'}
                </Button>
                
                {!editingZone && zones && zones.length > 0 && (
                  <div className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                    {zones.length} zone(s) existante(s)
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher une zone..."
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
      {searchTerm && filteredZones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune zone trouvée pour "<span className="font-semibold">{searchTerm}</span>"</p>
          <p className="text-sm mt-1">Essayez avec un autre terme de recherche</p>
        </div>
      )}

      {/* Liste des zones */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.length === 0 && !searchTerm ? (
          <EmptyState icon={MapPin} message="Aucune zone configurée" />
        ) : (
          filteredZones.map((zone) => (
            <EntityCard key={zone.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#FF6600]/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#FF6600]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A2240]">{zone.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Créée le {new Date(zone.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-8 w-8 p-0 hover:border-[#FF6600] hover:text-[#FF6600] transition-colors" 
                    onClick={() => { 
                      setEditingZone(zone); 
                      setZoneName(zone.name);
                      setDuplicateError('');
                      setErrorMsg('');
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-8 w-8 p-0 hover:border-red-400 hover:text-red-400 transition-colors" 
                    onClick={() => handleDelete(zone.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </EntityCard>
          ))
        )}
      </div>

      {/* Dialog de modification */}
      <Dialog open={!!editingZone} onOpenChange={(open) => {
        if (!open) {
          setEditingZone(null);
          setZoneName('');
          setDuplicateError('');
          setErrorMsg('');
        }
      }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {duplicateError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{duplicateError}</span>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Nom de la zone *</label>
              <Input 
                value={zoneName} 
                onChange={(e) => handleNameChange(e.target.value)} 
                className={`rounded-xl mt-1 ${duplicateError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Nom de la zone"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUpdate();
                  }
                }}
              />
              {duplicateError && (
                <p className="text-xs text-red-500 mt-1">Veuillez choisir un nom différent</p>
              )}
            </div>
            
            <Button 
              onClick={handleUpdate} 
              className="w-full rounded-xl" 
              disabled={updateZone.isPending || !zoneName.trim() || !!duplicateError}
            >
              {updateZone.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}