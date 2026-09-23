import { useMemo, useState, useRef } from 'react';
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
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useServiceCategories,
  useReorderServices,
} from '@/hooks/useServices';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { getServiceIcon } from '@/lib/service-icons';
import { uploadServiceImage } from '@/lib/storage';
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  Search,
  X,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ImagePlus,
} from 'lucide-react';
import type { Service } from '@/types';

export function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wrench');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: services } = useServices();
  const { data: categories } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const reorderServices = useReorderServices();
  const { confirm } = useConfirm();

  const sortedServices = useMemo(() => {
    if (!services) return [];
    return [...services].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
    );
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return sortedServices;
    const q = searchTerm.toLowerCase();
    return sortedServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.service_categories?.name?.toLowerCase().includes(q)
    );
  }, [sortedServices, searchTerm]);

  const isServiceNameDuplicate = (name: string, excludeId?: string) => {
    if (!services) return false;
    const normalizedName = name.trim().toLowerCase();
    return services.some(
      (service) => service.name.toLowerCase() === normalizedName && service.id !== excludeId
    );
  };

  const resetForm = () => {
    setServiceName('');
    setSelectedIcon('Wrench');
    setDescription('');
    setCategoryId('');
    setImagePreview(null);
    setImageFile(null);
    setEditingService(null);
    setErrorMsg('');
    setDuplicateError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImagePick = (file: File | null) => {
    setImageFile(file);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCreate = async () => {
    const trimmedName = serviceName.trim();
    if (!trimmedName) {
      setErrorMsg('Le nom du service est requis');
      return;
    }
    if (isServiceNameDuplicate(trimmedName)) {
      setDuplicateError(`Un service nommé "${trimmedName}" existe déjà.`);
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    setSaving(true);
    try {
      const maxOrder = sortedServices.reduce((m, s) => Math.max(m, s.sort_order ?? 0), -1);
      const created = await createService.mutateAsync({
        name: trimmedName,
        icon: selectedIcon,
        description: description.trim() || null,
        category_id: categoryId || null,
        sort_order: maxOrder + 1,
      });
      if (imageFile && created?.id) {
        const url = await uploadServiceImage(imageFile, created.id);
        await updateService.mutateAsync({ id: created.id, image_url: url });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const trimmedName = serviceName.trim();
    if (!editingService || !trimmedName) return;
    if (isServiceNameDuplicate(trimmedName, editingService.id)) {
      setDuplicateError(`Un service nommé "${trimmedName}" existe déjà.`);
      return;
    }

    setErrorMsg('');
    setDuplicateError('');
    setSaving(true);
    try {
      let image_url = editingService.image_url ?? null;
      if (imageFile) {
        image_url = await uploadServiceImage(imageFile, editingService.id);
      }
      await updateService.mutateAsync({
        id: editingService.id,
        name: trimmedName,
        icon: selectedIcon,
        description: description.trim() || null,
        category_id: categoryId || null,
        image_url,
      });
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setSaving(false);
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

  const moveService = async (id: string, direction: -1 | 1) => {
    const ids = sortedServices.map((s) => s.id);
    const index = ids.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderServices.mutateAsync(next);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setSelectedIcon(service.icon);
    setDescription(service.description || '');
    setCategoryId(service.category_id || '');
    setImagePreview(service.image_url || null);
    setImageFile(null);
    setDuplicateError('');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
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
        description="Images, descriptions, catégories et ordre d'affichage"
        badge={filteredServices.length}
        action={
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un service
              </Button>
            </DialogTrigger>
            <ScrollableDialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Modifier le service' : 'Ajouter un service'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {duplicateError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{duplicateError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Image du badge</label>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt=""
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <ImagePlus className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="rounded-xl text-sm"
                        onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
                      />
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleImagePick(null)}
                        >
                          Retirer l'aperçu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nom du service *</label>
                  <Input
                    placeholder="Ex. Plomberie, Électricité..."
                    value={serviceName}
                    onChange={(e) => {
                      setServiceName(e.target.value);
                      setDuplicateError('');
                      setErrorMsg('');
                    }}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Courte description affichée sous le badge"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/30"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Sans catégorie</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Icône (fallback)</label>
                  <ServiceIconPicker value={selectedIcon} onChange={setSelectedIcon} />
                </div>

                <Button
                  onClick={editingService ? handleUpdate : handleCreate}
                  className="w-full rounded-xl"
                  disabled={saving || !serviceName.trim() || !!duplicateError}
                >
                  {saving ? 'Enregistrement...' : editingService ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </ScrollableDialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 rounded-xl"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.length === 0 ? (
          <EmptyState
            icon={Wrench}
            message={searchTerm ? 'Aucun service trouvé' : 'Aucun service configuré'}
          />
        ) : (
          filteredServices.map((service, index) => {
            const IconComponent = getServiceIcon(service.icon);
            const globalIndex = sortedServices.findIndex((s) => s.id === service.id);
            return (
              <EntityCard key={service.id} className="relative overflow-hidden p-0">
                <div className="aspect-[4/3] bg-gray-50 relative">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-[#FF6600]" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg h-8 w-8 p-0 bg-[#0A2240] text-white border-2 border-white/80 shadow-lg hover:bg-[#FF6600] hover:text-white"
                      onClick={() => openEdit(service)}
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg h-8 w-8 p-0 bg-[#0A2240] text-white border-2 border-white/80 shadow-lg hover:bg-red-500 hover:text-white"
                      onClick={() => handleDelete(service.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 text-center space-y-1">
                  <h3 className="font-semibold text-[#0A2240] text-sm">{service.name}</h3>
                  <p className="text-[11px] text-gray-400">
                    {service.service_categories?.name || 'Sans catégorie'}
                  </p>
                  {service.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
                  )}
                  {!searchTerm && (
                    <div className="flex justify-center gap-1 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 rounded-lg"
                        disabled={globalIndex <= 0 || reorderServices.isPending}
                        onClick={() => moveService(service.id, -1)}
                        title="Monter"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <span className="text-[10px] text-gray-400 self-center px-1">
                        #{index + 1}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 rounded-lg"
                        disabled={
                          globalIndex >= sortedServices.length - 1 || reorderServices.isPending
                        }
                        onClick={() => moveService(service.id, 1)}
                        title="Descendre"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </EntityCard>
            );
          })
        )}
      </div>
    </div>
  );
}
