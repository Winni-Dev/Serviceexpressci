import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ClipboardList,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Ban,
  Activity,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageLoading } from '@/components/admin/page-shell';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import {
  RequestsTrendChart,
  StatusPieChart,
  ZoneBarChart,
  ServicesBarChart,
  ZoneOverview,
} from '@/components/admin/dashboard/charts';
import { useRequests } from '@/hooks/useRequests';
import { useWorkers } from '@/hooks/useWorkers';
import { useZones } from '@/hooks/useZones';
import { useAuth } from '@/contexts/auth-context';
import {
  getRequestsTrend,
  getStatusDistribution,
  getZoneStats,
  getTopServices,
  getCompletionRate,
  getRecentGrowth,
  STATUS_LABELS,
} from '@/lib/dashboard-analytics';
import { motion } from 'framer-motion';

// Badges harmonisés avec la charte : ambré doux pour attente/en cours, néon pour succès/complémentaire/erreur
const statusBadgeClass: Record<string, string> = {
  new: 'border-[#C27D3D]/30 bg-[rgba(194,125,61,0.15)] text-[#D99A5B]',
  assigned: 'border-[#22D3EE]/30 bg-[#22D3EE]/12 text-[#22D3EE]',
  in_progress: 'border-[#C27D3D]/30 bg-[rgba(194,125,61,0.15)] text-[#D99A5B]',
  done: 'border-[#34D399]/30 bg-[#34D399]/12 text-[#34D399]',
  cancelled: 'border-[#FB7185]/30 bg-[#FB7185]/12 text-[#FB7185]',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export function DashboardPage() {
  const { profile } = useAuth();
  const { data: requests, isLoading: loadingRequests } = useRequests();
  const { data: workers, isLoading: loadingWorkers } = useWorkers();
  const { data: zones, isLoading: loadingZones } = useZones();

  const isZoneManager = profile?.role === 'zone_manager';
  const isLoading = loadingRequests || loadingWorkers || loadingZones;

  const analytics = useMemo(() => {
    const reqs = requests ?? [];
    const wrk = workers ?? [];
    const zns = zones ?? [];

    const visibleZones = isZoneManager && profile?.zone_id
      ? zns.filter((z) => z.id === profile.zone_id)
      : zns;

    const zoneStats = getZoneStats(reqs, wrk, visibleZones);
    const activeWorkers = wrk.filter((w) => w.status === 'active').length;

    return {
      totalRequests: reqs.length,
      newRequests: reqs.filter((r) => r.status === 'new').length,
      inProgress: reqs.filter((r) => r.status === 'in_progress' || r.status === 'assigned').length,
      doneRequests: reqs.filter((r) => r.status === 'done').length,
      cancelled: reqs.filter((r) => r.status === 'cancelled').length,
      activeWorkers,
      totalWorkers: wrk.length,
      zonesCount: visibleZones.length,
      trend: getRequestsTrend(reqs),
      statusData: getStatusDistribution(reqs),
      zoneChartData: zoneStats.map((z) => ({
        name: z.name,
        demandes: z.demandes,
        travailleurs: z.travailleurs,
      })),
      zoneOverview: zoneStats,
      topServices: getTopServices(reqs),
      completionRate: getCompletionRate(reqs),
      growth: getRecentGrowth(reqs),
      recentRequests: [...reqs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    };
  }, [requests, workers, zones, isZoneManager, profile?.zone_id]);

  if (isLoading) return <PageLoading />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* En-tête */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Tableau de bord</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Vue d'ensemble de l'activité {isZoneManager ? 'de votre zone' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-[#121212] px-3.5 py-2 rounded-xl border border-[#27272A] shadow-sm w-fit">
          <Calendar className="w-3.5 h-3.5 text-[#D99A5B]" />
          <span>Mise à jour : {format(new Date(), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
        </div>
      </motion.div>

      {/* KPI Cards — scroll fluide mobile, grille desktop */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:gap-3.5 lg:overflow-visible lg:pb-0"
      >
        <StatCard title="Total demandes" value={analytics.totalRequests} icon={ClipboardList} accent="cyan" trend={analytics.growth} trendLabel="vs sem. passée" delay={0} />
        <StatCard title="Nouvelles" value={analytics.newRequests} icon={AlertCircle} accent="amber" delay={0.04} />
        <StatCard title="En cours" value={analytics.inProgress} icon={Clock} accent="orange" delay={0.08} />
        <StatCard title="Terminées" value={analytics.doneRequests} icon={CheckCircle} accent="green" delay={0.12} />
        <StatCard title="Travailleurs" value={analytics.activeWorkers} icon={Users} accent="purple" delay={0.16} />
        {!isZoneManager && (
          <StatCard title="Zones" value={analytics.zonesCount} icon={MapPin} accent="cyan" delay={0.2} />
        )}
        {isZoneManager && (
          <StatCard title="Annulées" value={analytics.cancelled} icon={Ban} accent="red" delay={0.2} />
        )}
      </motion.div>

      {/* Charts row 1 */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-3">
          <RequestsTrendChart data={analytics.trend} />
        </div>
        <div className="lg:col-span-2">
          <StatusPieChart data={analytics.statusData} />
        </div>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <ZoneBarChart
          data={analytics.zoneChartData}
          title="Demandes & travailleurs par zone"
          subtitle="Comparaison par zone géographique"
        />
        <ServicesBarChart data={analytics.topServices} />
      </motion.div>

      {/* Zone overview */}
      {!isZoneManager && analytics.zoneOverview.length > 0 && (
        <motion.div variants={itemVariants}>
          <ZoneOverview data={analytics.zoneOverview} />
        </motion.div>
      )}

      {/* Quick stats + recent requests */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Résumé rapide */}
        <Card className="rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D99A5B]" />
              Résumé rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2.5">
            {/* Série 1 / Ambré : En attente */}
            <div className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[rgba(194,125,61,0.08)] transition-colors border border-[#C27D3D]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[rgba(194,125,61,0.18)] flex items-center justify-center text-[#D99A5B]">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-zinc-200">En attente de traitement</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-[#D99A5B]">{analytics.newRequests}</span>
            </div>

            {/* Série 2 / Cyan Néon : Assignées / en cours */}
            <div className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#22D3EE]/08 transition-colors border border-[#22D3EE]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/15 flex items-center justify-center text-[#22D3EE]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-zinc-200">Assignées / en cours</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-[#22D3EE]">{analytics.inProgress}</span>
            </div>

            {/* Série 3 / Vert Émeraude Néon : Taux de réussite */}
            <div className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#34D399]/08 transition-colors border border-[#34D399]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 flex items-center justify-center text-[#34D399]">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-zinc-200">Taux de réussite</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-[#34D399]">{analytics.completionRate}%</span>
            </div>

            {/* Série 4 / Violet Électrique : Ratio travailleurs/demandes */}
            <div className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#C084FC]/08 transition-colors border border-[#C084FC]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C084FC]/15 flex items-center justify-center text-[#C084FC]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-zinc-200">Ratio travailleurs/demandes</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-[#C084FC]">
                {analytics.totalRequests > 0
                  ? (analytics.activeWorkers / analytics.totalRequests).toFixed(1)
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Demandes récentes */}
        <Card className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#D99A5B]" />
                Demandes récentes
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">Les 6 dernières demandes reçues</p>
            </div>
            <Link to="/admin/requests">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-200 hover:text-[#D99A5B] hover:border-[#C27D3D]/50 transition-all h-8 px-3 group"
              >
                Tout voir
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[#18181B] border-b border-[#27272A]">
                  <TableHead className="text-xs font-semibold text-zinc-400 py-2.5 px-3.5">Client</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-400 py-2.5 px-3.5">Service</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-400 py-2.5 px-3.5">Zone</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-400 py-2.5 px-3.5">Statut</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-400 py-2.5 px-3.5">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8 text-xs sm:text-sm">
                      Aucune demande pour le moment
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.recentRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-[#18181B]/70 transition-colors border-b border-[#27272A]"
                    >
                      <TableCell className="py-2.5 px-3.5">
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-white">{request.name}</p>
                          <p className="text-[11px] text-zinc-500">{request.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5">
                        <span className="text-xs sm:text-sm text-zinc-300">{request.services?.name}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5">
                        <span className="text-xs sm:text-sm text-zinc-300">{request.zones?.name}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5">
                        <Badge className={`${statusBadgeClass[request.status] ?? ''} rounded-full px-2.5 py-0.5 text-[11px] font-medium`}>
                          {STATUS_LABELS[request.status] ?? request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 text-xs text-zinc-400">
                        {format(new Date(request.created_at), 'dd MMM HH:mm', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}