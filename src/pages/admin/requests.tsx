import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, ScrollableDialogContent } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PageHeader, FilterBar, AdminCard, PageLoading } from '@/components/admin/page-shell';
import { useRequests, useUpdateRequestStatus } from '@/hooks/useRequests';
import { useWorkers } from '@/hooks/useWorkers';
import { useZones } from '@/hooks/useZones';
import { Search, Eye, ClipboardList, X, User, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Request } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  new: 'Nouvelle',
  assigned: 'Assignée',
  in_progress: 'En cours',
  done: 'Terminée',
  cancelled: 'Annulée',
};

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouvelles' },
  { value: 'assigned', label: 'Assignées' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
];

export function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [communeFilter, setCommuneFilter] = useState('all');
  const [detailRequest, setDetailRequest] = useState<Request | null>(null);
  const { data: requests, isLoading } = useRequests();
  const { data: workers } = useWorkers();
  const { data: zones } = useZones();
  const updateStatus = useUpdateRequestStatus();

  const communeOptions = useMemo(() => {
    const communes = [...new Set(requests?.map((r) => r.quartier).filter(Boolean))].sort();
    return [
      { value: 'all', label: 'Toutes les communes' },
      ...communes.map((c) => ({ value: c, label: c })),
    ];
  }, [requests]);

  const zoneOptions = useMemo(
    () => [
      { value: 'all', label: 'Toutes les zones' },
      ...(zones?.map((z) => ({ value: z.id, label: z.name })) ?? []),
    ],
    [zones]
  );

  const activeRequest = detailRequest
    ? requests?.find((r) => r.id === detailRequest.id) ?? detailRequest
    : null;

  const assignmentWorkerOptions = useMemo(() => {
    const zoneId = activeRequest?.zone_id;
    if (!zoneId || !workers) return [];

    const activeInZone = workers.filter(
      (w) => w.status === 'active' && w.zone_id === zoneId
    );

    const assignedId = activeRequest?.worker_id;
    const assignedOutsideZone =
      assignedId && !activeInZone.some((w) => w.id === assignedId)
        ? workers.find((w) => w.id === assignedId)
        : null;

    const list = assignedOutsideZone ? [...activeInZone, assignedOutsideZone] : activeInZone;

    return list.map((w) => ({
      value: w.id,
      label: w.name,
    }));
  }, [workers, activeRequest?.zone_id, activeRequest?.worker_id]);

  const filteredRequests = requests?.filter((request) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      request.name.toLowerCase().includes(q) ||
      request.phone.includes(searchTerm) ||
      request.services?.name?.toLowerCase().includes(q) ||
      request.quartier?.toLowerCase().includes(q) ||
      request.zones?.name?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesZone = zoneFilter === 'all' || request.zone_id === zoneFilter;
    const matchesCommune = communeFilter === 'all' || request.quartier === communeFilter;

    return matchesSearch && matchesStatus && matchesZone && matchesCommune;
  });

  const handleStatusChange = async (requestId: string, newStatus: string, workerId?: string) => {
    const request = requests?.find((r) => r.id === requestId);
    if (workerId && request) {
      const worker = workers?.find((w) => w.id === workerId);
      if (worker && worker.zone_id !== request.zone_id) {
        console.error('Ce travailleur n\'appartient pas à la zone de la demande');
        return;
      }
    }

    try {
      await updateStatus.mutateAsync({ id: requestId, status: newStatus, workerId });
      setDetailRequest((prev) =>
        prev?.id === requestId
          ? { ...prev, status: newStatus as Request['status'], worker_id: workerId ?? prev.worker_id }
          : prev
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes clients"
        description="Gérez et suivez toutes les demandes de service"
        badge={requests?.length ?? 0}
      />

      <FilterBar resultCount={filteredRequests?.length ?? 0} resultLabel="demande(s) trouvée(s)">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, téléphone, service, commune..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <SearchableSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filtrer par statut"
            searchPlaceholder="Rechercher un statut..."
          />
          <SearchableSelect
            value={zoneFilter}
            onValueChange={setZoneFilter}
            options={zoneOptions}
            placeholder="Filtrer par zone"
            searchPlaceholder="Tapez le nom de la zone..."
          />
          <SearchableSelect
            value={communeFilter}
            onValueChange={setCommuneFilter}
            options={communeOptions}
            placeholder="Filtrer par commune"
            searchPlaceholder="Tapez le nom de la commune..."
          />
        </div>
      </FilterBar>

      <AdminCard padding={false} className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Commune</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Travailleur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Aucune demande trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests?.map((request) => (
                <TableRow key={request.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-[#0A2240]">{request.name}</p>
                      <p className="text-xs text-gray-500">{request.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{request.services?.name}</TableCell>
                  <TableCell className="text-sm">{request.zones?.name}</TableCell>
                  <TableCell className="text-sm">{request.quartier}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {request.workers?.name || <span className="text-gray-400">Non assigné</span>}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-8 w-8 p-0"
                      onClick={() => setDetailRequest(request)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminCard>

      {activeRequest && (
        <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setDetailRequest(null)}>
          <ScrollableDialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 gap-0 [&>button]:hidden">
            <div className="relative bg-gradient-to-r from-[#0A2240] to-[#0d2d52] px-4 py-3">
              <button
                type="button"
                onClick={() => setDetailRequest(null)}
                className="absolute right-3 top-3 rounded-full p-1 bg-white/10 hover:bg-white/20"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="pr-8">
                <p className="text-white/60 text-xs">Demande client</p>
                <h2 className="text-lg font-bold text-white mt-0.5">{activeRequest.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge className={statusColors[activeRequest.status]}>
                    {statusLabels[activeRequest.status]}
                  </Badge>
                  <span className="text-[10px] text-white/60">
                    {format(new Date(activeRequest.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {[
                { label: 'Téléphone', value: activeRequest.phone, icon: Phone },
                { label: 'Service', value: activeRequest.services?.name ?? '', icon: Briefcase },
                { label: 'Zone', value: activeRequest.zones?.name ?? '', icon: MapPin },
                { label: 'Commune', value: activeRequest.quartier, icon: MapPin },
                { label: 'Travailleur', value: activeRequest.workers?.name ?? 'Non assigné', icon: User },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <field.icon className="w-3.5 h-3.5 text-[#FF6600]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{field.label}</p>
                    <p className="text-sm font-medium text-[#0A2240] break-words">{field.value}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#FF6600]" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Description</p>
                </div>
                <p className="text-sm text-[#0A2240] leading-relaxed">{activeRequest.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50 space-y-2 rounded-b-2xl">
              <p className="text-sm font-semibold text-[#0A2240] pt-3">Modifier la demande</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Statut</label>
                <SearchableSelect
                  value={activeRequest.status}
                  onValueChange={(value) =>
                    handleStatusChange(activeRequest.id, value, activeRequest.worker_id)
                  }
                  options={statusOptions.filter((s) => s.value !== 'all')}
                  placeholder="Changer le statut"
                  searchPlaceholder="Rechercher un statut..."
                />
              </div>
              <div className="pb-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Assigner un travailleur
                  {activeRequest.zones?.name && (
                    <span className="text-gray-400 font-normal"> — zone {activeRequest.zones.name}</span>
                  )}
                </label>
                <SearchableSelect
                  value={activeRequest.worker_id ?? ''}
                  onValueChange={(workerId) =>
                    handleStatusChange(activeRequest.id, 'assigned', workerId)
                  }
                  options={assignmentWorkerOptions}
                  placeholder={
                    assignmentWorkerOptions.length > 0
                      ? 'Choisir un travailleur'
                      : 'Aucun travailleur dans cette zone'
                  }
                  searchPlaceholder="Tapez le nom du travailleur..."
                  emptyMessage="Aucun travailleur dans cette zone"
                  disabled={assignmentWorkerOptions.length === 0}
                />
              </div>
            </div>
          </ScrollableDialogContent>
        </Dialog>
      )}
    </div>
  );
}
