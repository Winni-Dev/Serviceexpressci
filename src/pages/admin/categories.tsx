import { useMemo, useState } from 'react';
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
import {
  useServiceCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useServices,
} from '@/hooks/useServices';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { Plus, Pencil, Trash2, FolderOpen, ArrowUp, ArrowDown } from 'lucide-react';
import type { ServiceCategory } from '@/types';

export function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const { confirm } = useConfirm();

  const sorted = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
    );
  }, [categories]);

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    services?.forEach((s) => {
      if (s.category_id) map.set(s.category_id, (map.get(s.category_id) || 0) + 1);
    });
    return map;
  }, [services]);

  const reset = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Le nom est requis');
      return;
    }
    setErrorMsg('');
    try {
      if (editing) {
        await updateCategory.mutateAsync({
          id: editing.id,
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        const maxOrder = sorted.reduce((m, c) => Math.max(m, c.sort_order), -1);
        await createCategory.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          sort_order: maxOrder + 1,
        });
      }
      reset();
      setOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (cat: ServiceCategory) => {
    const count = countByCategory.get(cat.id) || 0;
    const ok = await confirm({
      title: 'Supprimer cette catégorie ?',
      description:
        count > 0
          ? `${count} service(s) seront passés en « Sans catégorie ».`
          : 'Cette catégorie sera définitivement supprimée.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteCategory.mutateAsync(cat.id);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const move = async (id: string, direction: -1 | 1) => {
    const ids = sorted.map((c) => c.id);
    const index = ids.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderCategories.mutateAsync(next);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const openEdit = (cat: ServiceCategory) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setErrorMsg('');
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <ErrorAlert message={errorMsg} />

      <PageHeader
        title="Catégories"
        description="Organisez les services affichés sur le site (ordre + regroupement)"
        badge={sorted.length}
        action={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              if (!v) reset();
              setOpen(v);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="rounded-xl"
                onClick={() => {
                  reset();
                  setOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nom *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Maison, Urgences..."
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Optionnel — affichée sur le site"
                  />
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={handleSave}
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {editing ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </ScrollableDialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.length === 0 ? (
          <EmptyState icon={FolderOpen} message="Aucune catégorie — les services restent dans « Tout »" />
        ) : (
          sorted.map((cat, index) => (
            <EntityCard key={cat.id} className="relative">
              <div className="absolute top-3 right-3 flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-7 w-7 p-0"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-7 w-7 p-0"
                  onClick={() => handleDelete(cat)}
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center mb-3">
                <FolderOpen className="w-6 h-6 text-[#FF6600]" />
              </div>
              <h3 className="font-semibold text-[#0A2240]">{cat.name}</h3>
              {cat.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {countByCategory.get(cat.id) || 0} service(s)
              </p>
              <div className="flex items-center gap-1 mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 rounded-lg"
                  disabled={index === 0 || reorderCategories.isPending}
                  onClick={() => move(cat.id, -1)}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <span className="text-[10px] text-gray-400 px-1">Ordre {index + 1}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 rounded-lg"
                  disabled={index === sorted.length - 1 || reorderCategories.isPending}
                  onClick={() => move(cat.id, 1)}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            </EntityCard>
          ))
        )}
      </div>
    </div>
  );
}
