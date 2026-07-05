import { useState } from 'react';
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
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Zone } from '@/types';

export function ZonesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { data: zones } = useZones();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  const { confirm } = useConfirm();

  const handleCreate = async () => {
    if (!zoneName.trim()) return;
    setErrorMsg('');
    try {
      await createZone.mutateAsync({ name: zoneName });
      setZoneName('');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    if (!editingZone || !zoneName.trim()) return;
    setErrorMsg('');
    try {
      await updateZone.mutateAsync({ id: editingZone.id, name: zoneName });
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

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Zones"
        description="Zones de couverture géographique"
        badge={zones?.length ?? 0}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Ajouter une zone</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Ajouter une zone</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Nom de la zone" value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="rounded-xl" />
                <Button onClick={handleCreate} className="w-full rounded-xl" disabled={createZone.isPending}>Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones?.length === 0 ? (
          <EmptyState icon={MapPin} message="Aucune zone configurée" />
        ) : (
          zones?.map((zone) => (
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
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => { setEditingZone(zone); setZoneName(zone.name); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(zone.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </EntityCard>
          ))
        )}
      </div>

      <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Modifier la zone</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="rounded-xl" />
            <Button onClick={handleUpdate} className="w-full rounded-xl">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
