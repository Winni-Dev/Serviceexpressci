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
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader, AdminCard, FilterBar, PageLoading } from '@/components/admin/page-shell';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { useAttendance, useCreateAttendance, useApplyLevy, usePayAttendance } from '@/hooks/useAttendance';
import { useWorkers } from '@/hooks/useWorkers';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Wallet,
  Download,
  Users,
  Search,
  Receipt,
  PiggyBank,
  Percent,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import type { Attendance } from '@/types';
import {
  computeTotals,
  filterByPeriod,
  filterByWorker,
  formatFcfa,
  getPeriodLabel,
  getRecordProfit,
  getWorkerLifetimeStats,
  type PeriodMode,
} from '@/lib/accounting';
import { exportAccountingPdf } from '@/lib/accounting-pdf';

const PERIOD_MODES: { value: PeriodMode; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'month', label: 'Par mois' },
  { value: 'range', label: 'Période' },
];

export function AccountingPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    worker_id: '',
    total_received: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [periodMode, setPeriodMode] = useState<PeriodMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().toISOString().slice(0, 7)
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [levyTarget, setLevyTarget] = useState<Attendance | null>(null);
  const [levyAmount, setLevyAmount] = useState('');

  const { data: attendance, isLoading } = useAttendance();
  const { data: workers } = useWorkers();
  const createAttendance = useCreateAttendance();
  const applyLevy = useApplyLevy();
  const payAttendance = usePayAttendance();
  const { alert } = useConfirm();

  const workerOptions =
    workers?.map((w) => ({
      value: w.id,
      label: `${w.name} — ${w.zones?.name ?? ''}`,
    })) ?? [];

  const workerFilterOptions = useMemo(
    () => [{ value: '', label: 'Tous les travailleurs' }, ...workerOptions],
    [workerOptions]
  );

  const periodFilter = useMemo(
    () => ({
      mode: periodMode,
      month: selectedMonth,
      dateFrom,
      dateTo,
    }),
    [periodMode, selectedMonth, dateFrom, dateTo]
  );

  const filteredRecords = useMemo(() => {
    if (!attendance) return [];
    const byPeriod = filterByPeriod(attendance, periodFilter);
    return filterByWorker(byPeriod, workerFilter || null, workerSearch);
  }, [attendance, periodFilter, workerFilter, workerSearch]);

  const periodTotals = useMemo(() => computeTotals(filteredRecords), [filteredRecords]);

  const selectedWorker = workers?.find((w) => w.id === workerFilter);
  const workerLifetime = useMemo(
    () =>
      workerFilter && attendance
        ? getWorkerLifetimeStats(attendance, workerFilter)
        : null,
    [workerFilter, attendance]
  );

  const formProfit = useMemo(() => {
    const received = parseFloat(formData.total_received) || 0;
    const paid = parseFloat(formData.amount) || 0;
    return received - paid;
  }, [formData.total_received, formData.amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAttendance.mutateAsync({
        worker_id: formData.worker_id,
        total_received: parseFloat(formData.total_received),
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      });
      setIsDialogOpen(false);
      setFormData({
        worker_id: '',
        total_received: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleExport = () => {
    exportAccountingPdf({
      records: filteredRecords,
      periodFilter,
      workerId: workerFilter || null,
      workerName: selectedWorker?.name,
      allRecords: attendance ?? [],
    });
  };

  const activeWorkers = workers?.filter((w) => w.status === 'active').length || 0;

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptabilité"
        description="Suivi des revenus, paiements travailleurs et bénéfices"
        badge={filteredRecords.length}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau pointage
                </Button>
              </DialogTrigger>
              <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un pointage</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Travailleur
                    </label>
                    <SearchableSelect
                      value={formData.worker_id}
                      onValueChange={(value) => setFormData({ ...formData, worker_id: value })}
                      options={workerOptions}
                      placeholder="Sélectionner un travailleur"
                      searchPlaceholder="Tapez le nom du travailleur..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Montant reçu (FCFA)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.total_received}
                        onChange={(e) =>
                          setFormData({ ...formData, total_received: e.target.value })
                        }
                        placeholder="Total client"
                        required
                        className="rounded-xl"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Payé par le client</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Montant travailleur (FCFA)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Payé au travailleur"
                        required
                        className="rounded-xl"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Rémunération</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-xl border px-4 py-3 flex items-center justify-between',
                      formProfit >= 0
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-red-200 bg-red-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <PiggyBank
                        className={cn(
                          'w-4 h-4',
                          formProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                        )}
                      />
                      <span className="text-sm font-medium text-gray-700">Bénéfice</span>
                    </div>
                    <span
                      className={cn(
                        'text-lg font-bold',
                        formProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      )}
                    >
                      {formatFcfa(formProfit)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ex. Réparation plomberie — Cocody"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    Enregistrer
                  </Button>
                </form>
              </ScrollableDialogContent>
            </Dialog>
          </div>
        }
      />

      <FilterBar
        resultCount={filteredRecords.length}
        resultLabel={`pointage(s) — ${getPeriodLabel(periodFilter)}`}
      >
        <div className="flex flex-wrap gap-2">
          {PERIOD_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setPeriodMode(mode.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                periodMode === mode.value
                  ? 'bg-[#0A2240] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {periodMode === 'month' && (
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl max-w-xs"
          />
        )}

        {periodMode === 'range' && (
          <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Du</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Au</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <SearchableSelect
            value={workerFilter}
            onValueChange={setWorkerFilter}
            options={workerFilterOptions}
            placeholder="Filtrer par travailleur"
            searchPlaceholder="Rechercher un travailleur..."
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans les pointages..."
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
        </div>
      </FilterBar>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Montant total reçu"
          value={formatFcfa(periodTotals.totalReceived)}
          icon={Receipt}
          accent="blue"
          delay={0}
        />
        <StatCard
          title="Payé aux travailleurs"
          value={formatFcfa(periodTotals.totalPaid)}
          icon={Wallet}
          accent="orange"
          delay={0.05}
        />
        <StatCard
          title="Bénéfice net"
          value={formatFcfa(periodTotals.profit)}
          icon={TrendingUp}
          accent={periodTotals.profit >= 0 ? 'green' : 'red'}
          delay={0.1}
        />
        <StatCard
          title="Travailleurs actifs"
          value={activeWorkers}
          icon={Users}
          accent="purple"
          delay={0.15}
        />
      </div>

      {selectedWorker && workerLifetime && (
        <AdminCard className="border-[#FF6600]/20 bg-gradient-to-r from-[#FF6600]/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#FF6600]">
                Statistiques globales
              </p>
              <h3 className="text-lg font-bold text-[#0A2240] mt-1">{selectedWorker.name}</h3>
              <p className="text-sm text-gray-500">
                Depuis sa présence sur la plateforme
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Total reçu</p>
                <p className="text-sm font-bold text-[#0A2240]">
                  {formatFcfa(workerLifetime.totalReceived)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Total payé</p>
                <p className="text-sm font-bold text-[#0A2240]">
                  {formatFcfa(workerLifetime.totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Bénéfice</p>
                <p
                  className={cn(
                    'text-sm font-bold',
                    workerLifetime.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {formatFcfa(workerLifetime.profit)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Pointages</p>
                <p className="text-sm font-bold text-[#0A2240]">{workerLifetime.count}</p>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      <AdminCard padding={false} className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0A2240]">Pointages (auto + manuels)</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            À la fin d'une mission, un pointage est créé automatiquement. Bénéfice = 0 jusqu'au
            prélèvement.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Date</TableHead>
                <TableHead>Travailleur</TableHead>
                <TableHead>Client / mission</TableHead>
                <TableHead className="text-right">Reçu client</TableHead>
                <TableHead className="text-right">Part travailleur</TableHead>
                <TableHead className="text-right">Bénéfice</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                    Aucun pointage pour cette période
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const profit = getRecordProfit(record);
                  const hasLevy = Number(record.levy_amount || 0) > 0;
                  return (
                    <TableRow key={record.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(record.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[#0A2240]">
                        <div className="flex items-center gap-2">
                          {record.workers?.photo_url ? (
                            <img
                              src={record.workers.photo_url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : null}
                          {record.workers?.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-[220px]">
                        <p className="font-medium text-gray-700 truncate">
                          {record.client_name || '—'}
                        </p>
                        <p className="text-xs truncate">{record.description}</p>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-blue-700">
                        {formatFcfa(record.total_received ?? 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-[#FF6600]">
                        {formatFcfa(record.amount)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right text-sm font-semibold',
                          profit > 0 ? 'text-emerald-600' : 'text-gray-400'
                        )}
                      >
                        {formatFcfa(profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => {
                              setLevyTarget(record);
                              setLevyAmount(
                                hasLevy
                                  ? String(record.levy_amount)
                                  : String(Math.round(Number(record.total_received || 0) * 0.2))
                              );
                            }}
                          >
                            <Percent className="w-3.5 h-3.5 mr-1" />
                            {hasLevy ? 'Modifier' : 'Prélever'}
                          </Button>

                          {!record.paid ? (
                            <Button
                              size="sm"
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                              disabled={payAttendance.isPending}
                              onClick={async () => {
                                try {
                                  await payAttendance.mutateAsync({ id: record.id, amount: record.amount });
                                  await alert({
                                    title: 'Paiement enregistré',
                                    description: 'Le travailleur a été marqué comme payé.',
                                    variant: 'success',
                                  });
                                } catch (e) {
                                  await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
                                }
                              }}
                            >
                              Payer
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600">Payé</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </AdminCard>

      <Dialog open={!!levyTarget} onOpenChange={(o) => !o && setLevyTarget(null)}>
        <ScrollableDialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Prélèvement bénéfice</DialogTitle>
          </DialogHeader>
          {levyTarget && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-gray-50 p-4 text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Travailleur :</span>{' '}
                  <strong>{levyTarget.workers?.name}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Client :</span>{' '}
                  {levyTarget.client_name || '—'}
                </p>
                <p>
                  <span className="text-gray-500">Reçu client :</span>{' '}
                  {formatFcfa(Number(levyTarget.total_received || 0))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Montant du prélèvement (FCFA)</label>
                <Input
                  type="number"
                  min={0}
                  max={Number(levyTarget.total_received || 0)}
                  value={levyAmount}
                  onChange={(e) => setLevyAmount(e.target.value)}
                  className="rounded-xl mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Part travailleur après prélèvement :{' '}
                  {formatFcfa(
                    Math.max(
                      0,
                      Number(levyTarget.total_received || 0) - (parseFloat(levyAmount) || 0)
                    )
                  )}
                </p>
              </div>
              <Button
                className="w-full rounded-xl bg-[#0A2240] hover:bg-[#0d2d52]"
                disabled={applyLevy.isPending}
                onClick={async () => {
                  const levy = parseFloat(levyAmount);
                  if (Number.isNaN(levy) || levy < 0) {
                    await alert({
                      title: 'Montant invalide',
                      description: 'Entrez un prélèvement valide.',
                      variant: 'error',
                    });
                    return;
                  }
                  try {
                    await applyLevy.mutateAsync({ id: levyTarget.id, levy });
                    setLevyTarget(null);
                    await alert({
                      title: 'Prélèvement enregistré',
                      description:
                        'Le bénéfice est mis à jour. La part du travailleur diminue dans son espace.',
                      variant: 'success',
                    });
                  } catch (e) {
                    await alert({
                      title: 'Erreur',
                      description: getErrorMessage(e),
                      variant: 'error',
                    });
                  }
                }}
              >
                Confirmer le prélèvement
              </Button>
            </div>
          )}
        </ScrollableDialogContent>
      </Dialog>
    </div>
  );
}
