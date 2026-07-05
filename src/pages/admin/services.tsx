import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import type { Service } from '@/types';

export function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wrench');
  const [errorMsg, setErrorMsg] = useState('');
  const { data: services } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const { confirm } = useConfirm();

  const handleCreate = async () => {
    if (!serviceName.trim()) return;
    setErrorMsg('');
    try {
      await createService.mutateAsync({ name: serviceName, icon: selectedIcon });
      setServiceName('');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    if (!editingService || !serviceName.trim()) return;
    setErrorMsg('');
    try {
      await updateService.mutateAsync({ id: editingService.id, name: serviceName, icon: selectedIcon });
      setEditingService(null);
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
  };

  const openCreate = () => {
    setServiceName('');
    setSelectedIcon('Wrench');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Services"
        description="Services proposés aux clients"
        badge={services?.length ?? 0}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />Ajouter un service
              </Button>
            </DialogTrigger>
            <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nom du service</label>
                  <Input
                    placeholder="Ex. Plomberie, Électricité..."
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Icône</label>
                  <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
                </div>
                <Button onClick={handleCreate} className="w-full rounded-xl">Créer</Button>
              </div>
            </ScrollableDialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services?.length === 0 ? (
          <EmptyState icon={Wrench} message="Aucun service configuré" />
        ) : (
          services?.map((service) => {
            const IconComponent = getServiceIcon(service.icon);
            return (
              <EntityCard key={service.id} className="text-center relative">
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button variant="outline" size="sm" className="rounded-lg h-7 w-7 p-0" onClick={() => openEdit(service)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg h-7 w-7 p-0" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#FF6600]/20 to-[#FF6600]/5 rounded-2xl flex items-center justify-center">
                  <IconComponent className="w-7 h-7 text-[#FF6600]" />
                </div>
                <h3 className="font-semibold text-[#0A2240]">{service.name}</h3>
              </EntityCard>
            );
          })
        )}
      </div>

      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Nom du service</label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Icône</label>
              <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
            </div>
            <Button onClick={handleUpdate} className="w-full rounded-xl">Enregistrer</Button>
          </div>
        </ScrollableDialogContent>
      </Dialog>
    </div>
  );
}
