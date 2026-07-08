// import { useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//   ClipboardList,
//   Users,
//   CheckCircle,
//   Clock,
//   MapPin,
//   AlertCircle,
//   ArrowRight,
//   UserCheck,
//   Ban,
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { PageLoading } from '@/components/admin/page-shell';
// import { StatCard } from '@/components/admin/dashboard/stat-card';
// import {
//   RequestsTrendChart,
//   StatusPieChart,
//   ZoneBarChart,
//   ServicesBarChart,
//   ZoneOverview,
// } from '@/components/admin/dashboard/charts';
// import { useRequests } from '@/hooks/useRequests';
// import { useWorkers } from '@/hooks/useWorkers';
// import { useZones } from '@/hooks/useZones';
// import { useAuth } from '@/contexts/auth-context';
// import {
//   getRequestsTrend,
//   getStatusDistribution,
//   getZoneStats,
//   getTopServices,
//   getCompletionRate,
//   getRecentGrowth,
//   STATUS_LABELS,
// } from '@/lib/dashboard-analytics';

// const statusBadgeClass: Record<string, string> = {
//   new: 'bg-amber-100 text-amber-800 border-amber-200',
//   assigned: 'bg-blue-100 text-blue-800 border-blue-200',
//   in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
//   done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
//   cancelled: 'bg-red-100 text-red-800 border-red-200',
// };

// export function DashboardPage() {
//   const { profile } = useAuth();
//   const { data: requests, isLoading: loadingRequests } = useRequests();
//   const { data: workers, isLoading: loadingWorkers } = useWorkers();
//   const { data: zones, isLoading: loadingZones } = useZones();

//   const isZoneManager = profile?.role === 'zone_manager';
//   const isLoading = loadingRequests || loadingWorkers || loadingZones;

//   const analytics = useMemo(() => {
//     const reqs = requests ?? [];
//     const wrk = workers ?? [];
//     const zns = zones ?? [];

//     const visibleZones = isZoneManager && profile?.zone_id
//       ? zns.filter((z) => z.id === profile.zone_id)
//       : zns;

//     const zoneStats = getZoneStats(reqs, wrk, visibleZones);
//     const activeWorkers = wrk.filter((w) => w.status === 'active').length;

//     return {
//       totalRequests: reqs.length,
//       newRequests: reqs.filter((r) => r.status === 'new').length,
//       inProgress: reqs.filter((r) => r.status === 'in_progress' || r.status === 'assigned').length,
//       doneRequests: reqs.filter((r) => r.status === 'done').length,
//       cancelled: reqs.filter((r) => r.status === 'cancelled').length,
//       activeWorkers,
//       totalWorkers: wrk.length,
//       zonesCount: visibleZones.length,
//       trend: getRequestsTrend(reqs),
//       statusData: getStatusDistribution(reqs),
//       zoneChartData: zoneStats.map((z) => ({
//         name: z.name,
//         demandes: z.demandes,
//         travailleurs: z.travailleurs,
//       })),
//       zoneOverview: zoneStats,
//       topServices: getTopServices(reqs),
//       completionRate: getCompletionRate(reqs),
//       growth: getRecentGrowth(reqs),
//       recentRequests: [...reqs]
//         .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//         .slice(0, 6),
//     };
//   }, [requests, workers, zones, isZoneManager, profile?.zone_id]);

//   if (isLoading) return <PageLoading />;

//   return (
//     <div className="space-y-6">
//       {/* KPI Cards */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//         <StatCard title="Total demandes" value={analytics.totalRequests} icon={ClipboardList} accent="blue" trend={analytics.growth} trendLabel="vs sem. passée" delay={0} />
//         <StatCard title="Nouvelles" value={analytics.newRequests} icon={AlertCircle} accent="amber" delay={0.05} />
//         <StatCard title="En cours" value={analytics.inProgress} icon={Clock} accent="orange" delay={0.1} />
//         <StatCard title="Terminées" value={analytics.doneRequests} icon={CheckCircle} accent="green" delay={0.15} />
//         <StatCard title="Travailleurs" value={analytics.activeWorkers} icon={Users} accent="purple" delay={0.2} />
//         {!isZoneManager && (
//           <StatCard title="Zones" value={analytics.zonesCount} icon={MapPin} accent="blue" delay={0.25} />
//         )}
//         {isZoneManager && (
//           <StatCard title="Annulées" value={analytics.cancelled} icon={Ban} accent="red" delay={0.25} />
//         )}
//       </div>

//       {/* Charts row 1 */}
//       <div className="grid lg:grid-cols-5 gap-6">
//         <div className="lg:col-span-3">
//           <RequestsTrendChart data={analytics.trend} />
//         </div>
//         <div className="lg:col-span-2">
//           <StatusPieChart data={analytics.statusData} />
//         </div>
//       </div>

//       {/* Charts row 2 */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         <ZoneBarChart
//           data={analytics.zoneChartData}
//           title="Demandes & travailleurs par zone"
//           subtitle="Comparaison par zone géographique"
//         />
//         <ServicesBarChart data={analytics.topServices} />
//       </div>

//       {/* Zone overview */}
//       {!isZoneManager && analytics.zoneOverview.length > 0 && (
//         <ZoneOverview data={analytics.zoneOverview} />
//       )}

//       {/* Quick stats + recent */}
//       <div className="grid lg:grid-cols-3 gap-6">
//         <Card className="rounded-2xl border-gray-100 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-base font-semibold text-[#0A2240]">Résumé rapide</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="w-5 h-5 text-amber-600" />
//                 <span className="text-sm font-medium">En attente de traitement</span>
//               </div>
//               <span className="text-lg font-bold text-amber-700">{analytics.newRequests}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
//               <div className="flex items-center gap-3">
//                 <UserCheck className="w-5 h-5 text-blue-600" />
//                 <span className="text-sm font-medium">Assignées / en cours</span>
//               </div>
//               <span className="text-lg font-bold text-blue-700">{analytics.inProgress}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-600" />
//                 <span className="text-sm font-medium">Taux de réussite</span>
//               </div>
//               <span className="text-lg font-bold text-emerald-700">{analytics.completionRate}%</span>
//             </div>
//             <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50">
//               <div className="flex items-center gap-3">
//                 <Users className="w-5 h-5 text-violet-600" />
//                 <span className="text-sm font-medium">Ratio travailleurs/demandes</span>
//               </div>
//               <span className="text-lg font-bold text-violet-700">
//                 {analytics.totalRequests > 0
//                   ? (analytics.activeWorkers / analytics.totalRequests).toFixed(1)
//                   : '—'}
//               </span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="lg:col-span-2 rounded-2xl border-gray-100 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle className="text-base font-semibold text-[#0A2240]">Demandes récentes</CardTitle>
//               <p className="text-sm text-gray-500 mt-1">Les 6 dernières demandes reçues</p>
//             </div>
//             <Link to="/admin/requests">
//               <Button variant="outline" size="sm" className="rounded-lg">
//                 Tout voir <ArrowRight className="w-3.5 h-3.5 ml-1" />
//               </Button>
//             </Link>
//           </CardHeader>
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader>
//                 <TableRow className="hover:bg-transparent">
//                   <TableHead>Client</TableHead>
//                   <TableHead>Service</TableHead>
//                   <TableHead>Zone</TableHead>
//                   <TableHead>Statut</TableHead>
//                   <TableHead>Date</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {analytics.recentRequests.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center text-gray-400 py-8">
//                       Aucune demande pour le moment
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   analytics.recentRequests.map((request) => (
//                     <TableRow key={request.id} className="hover:bg-gray-50/80">
//                       <TableCell>
//                         <div>
//                           <p className="font-medium text-sm">{request.name}</p>
//                           <p className="text-xs text-gray-500">{request.phone}</p>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm">{request.services?.name}</TableCell>
//                       <TableCell className="text-sm">{request.zones?.name}</TableCell>
//                       <TableCell>
//                         <Badge className={statusBadgeClass[request.status] ?? ''}>
//                           {STATUS_LABELS[request.status] ?? request.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-sm text-gray-500">
//                         {format(new Date(request.created_at), 'dd MMM HH:mm', { locale: fr })}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


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
  TrendingUp,
  TrendingDown,
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

const statusBadgeClass: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
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
      className="space-y-8"
    >
      {/* En-tête */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A2240]">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vue d'ensemble de l'activité {isZoneManager ? 'de votre zone' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-4 h-4" />
          <span>Mise à jour: {format(new Date(), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total demandes" value={analytics.totalRequests} icon={ClipboardList} accent="blue" trend={analytics.growth} trendLabel="vs sem. passée" delay={0} />
        <StatCard title="Nouvelles" value={analytics.newRequests} icon={AlertCircle} accent="amber" delay={0.05} />
        <StatCard title="En cours" value={analytics.inProgress} icon={Clock} accent="orange" delay={0.1} />
        <StatCard title="Terminées" value={analytics.doneRequests} icon={CheckCircle} accent="green" delay={0.15} />
        <StatCard title="Travailleurs" value={analytics.activeWorkers} icon={Users} accent="purple" delay={0.2} />
        {!isZoneManager && (
          <StatCard title="Zones" value={analytics.zonesCount} icon={MapPin} accent="blue" delay={0.25} />
        )}
        {isZoneManager && (
          <StatCard title="Annulées" value={analytics.cancelled} icon={Ban} accent="red" delay={0.25} />
        )}
      </motion.div>

      {/* Charts row 1 */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RequestsTrendChart data={analytics.trend} />
        </div>
        <div className="lg:col-span-2">
          <StatusPieChart data={analytics.statusData} />
        </div>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
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

      {/* Quick stats + recent */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0A2240] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF6600]" />
              Résumé rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group flex items-center justify-between p-4 rounded-xl bg-amber-50/80 hover:bg-amber-50 transition-colors border border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100/80 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">En attente de traitement</span>
              </div>
              <span className="text-xl font-bold text-amber-700">{analytics.newRequests}</span>
            </div>
            
            <div className="group flex items-center justify-between p-4 rounded-xl bg-blue-50/80 hover:bg-blue-50 transition-colors border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Assignées / en cours</span>
              </div>
              <span className="text-xl font-bold text-blue-700">{analytics.inProgress}</span>
            </div>
            
            <div className="group flex items-center justify-between p-4 rounded-xl bg-emerald-50/80 hover:bg-emerald-50 transition-colors border border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/80 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
              </div>
              <span className="text-xl font-bold text-emerald-700">{analytics.completionRate}%</span>
            </div>
            
            <div className="group flex items-center justify-between p-4 rounded-xl bg-violet-50/80 hover:bg-violet-50 transition-colors border border-violet-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100/80 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Ratio travailleurs/demandes</span>
              </div>
              <span className="text-xl font-bold text-violet-700">
                {analytics.totalRequests > 0
                  ? (analytics.activeWorkers / analytics.totalRequests).toFixed(1)
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg shadow-gray-100/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#0A2240] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#FF6600]" />
                Demandes récentes
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Les 6 dernières demandes reçues</p>
            </div>
            <Link to="/admin/requests">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-[#FF6600] hover:text-[#FF6600] transition-all duration-300 group">
                Tout voir 
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-gray-50/50">
                  <TableHead className="text-xs font-semibold text-gray-500">Client</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Service</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Zone</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Statut</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      Aucune demande pour le moment
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.recentRequests.map((request, index) => (
                    <TableRow 
                      key={request.id} 
                      className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-[#0A2240]">{request.name}</p>
                          <p className="text-xs text-gray-400">{request.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{request.services?.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{request.zones?.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusBadgeClass[request.status] ?? ''} rounded-full px-3 py-1 text-xs font-medium`}>
                          {STATUS_LABELS[request.status] ?? request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
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