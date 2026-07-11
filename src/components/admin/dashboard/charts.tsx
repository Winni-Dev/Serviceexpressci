// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CHART_PALETTE } from '@/lib/dashboard-analytics';

// const tooltipStyle = {
//   borderRadius: '12px',
//   border: '1px solid #e5e7eb',
//   boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
// };

// interface ChartCardProps {
//   title: string;
//   subtitle?: string;
//   children: React.ReactNode;
//   className?: string;
// }

// function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
//   return (
//     <Card className={`rounded-2xl border-gray-100 shadow-sm ${className ?? ''}`}>
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base font-semibold text-[#0A2240]">{title}</CardTitle>
//         {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
//       </CardHeader>
//       <CardContent>{children}</CardContent>
//     </Card>
//   );
// }

// interface RequestsTrendChartProps {
//   data: { date: string; fullDate: string; demandes: number }[];
// }

// export function RequestsTrendChart({ data }: RequestsTrendChartProps) {
//   return (
//     <ChartCard title="Évolution des demandes" subtitle="7 derniers jours">
//       <div className="h-[280px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//             <defs>
//               <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//             <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
//             <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
//             <Tooltip
//               contentStyle={tooltipStyle}
//               labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
//               formatter={(value) => [`${value ?? 0} demande(s)`, 'Total']}
//             />
//             <Area
//               type="monotone"
//               dataKey="demandes"
//               stroke="#FF6600"
//               strokeWidth={2.5}
//               fill="url(#colorDemandes)"
//               dot={{ fill: '#FF6600', strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, fill: '#FF6600' }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </ChartCard>
//   );
// }

// interface StatusPieChartProps {
//   data: { name: string; value: number; color: string }[];
// }

// export function StatusPieChart({ data }: StatusPieChartProps) {
//   const total = data.reduce((sum, d) => sum + d.value, 0);

//   return (
//     <ChartCard title="Répartition par statut" subtitle={`${total} demande(s) au total`}>
//       <div className="h-[280px]">
//         {data.length === 0 ? (
//           <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={data}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={95}
//                 paddingAngle={3}
//                 dataKey="value"
//               >
//                 {data.map((entry, i) => (
//                   <Cell key={entry.name} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value ?? 0}`, name]} />
//               <Legend
//                 verticalAlign="bottom"
//                 iconType="circle"
//                 formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </ChartCard>
//   );
// }

// interface ZoneBarChartProps {
//   data: { name: string; demandes: number; travailleurs: number }[];
//   title: string;
//   subtitle?: string;
// }

// export function ZoneBarChart({ data, title, subtitle }: ZoneBarChartProps) {
//   return (
//     <ChartCard title={title} subtitle={subtitle}>
//       <div className="h-[300px]">
//         {data.length === 0 ? (
//           <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
//               <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
//               <YAxis
//                 type="category"
//                 dataKey="name"
//                 width={100}
//                 tick={{ fontSize: 11, fill: '#374151' }}
//                 axisLine={false}
//                 tickLine={false}
//               />
//               <Tooltip contentStyle={tooltipStyle} />
//               <Legend iconType="circle" formatter={(v) => <span className="text-sm text-gray-600">{v}</span>} />
//               <Bar dataKey="demandes" name="Demandes" fill="#FF6600" radius={[0, 6, 6, 0]} barSize={14} />
//               <Bar dataKey="travailleurs" name="Travailleurs actifs" fill="#0A2240" radius={[0, 6, 6, 0]} barSize={14} />
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </ChartCard>
//   );
// }

// interface ServicesBarChartProps {
//   data: { name: string; demandes: number }[];
// }

// export function ServicesBarChart({ data }: ServicesBarChartProps) {
//   return (
//     <ChartCard title="Services les plus demandés" subtitle="Top 5">
//       <div className="h-[260px]">
//         {data.length === 0 ? (
//           <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 11, fill: '#6b7280' }}
//                 axisLine={false}
//                 tickLine={false}
//                 angle={-20}
//                 textAnchor="end"
//                 interval={0}
//                 height={60}
//               />
//               <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
//               <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v ?? 0} demande(s)`, 'Total']} />
//               <Bar dataKey="demandes" radius={[8, 8, 0, 0]} barSize={36}>
//                 {data.map((_, i) => (
//                   <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </ChartCard>
//   );
// }

// interface ZoneOverviewProps {
//   data: { id: string; name: string; demandes: number; travailleurs: number; travailleursTotal: number }[];
// }

// export function ZoneOverview({ data }: ZoneOverviewProps) {
//   if (!data.length) return null;

//   return (
//     <ChartCard title="Vue par zone" subtitle="Demandes et effectifs">
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
//         {data.map((zone, i) => (
//           <div
//             key={zone.id}
//             className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center gap-2 mb-3">
//               <div
//                 className="h-2.5 w-2.5 rounded-full"
//                 style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
//               />
//               <h4 className="font-semibold text-[#0A2240] truncate">{zone.name}</h4>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <p className="text-2xl font-bold text-[#FF6600]">{zone.demandes}</p>
//                 <p className="text-xs text-gray-500">Demandes</p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#0A2240]">{zone.travailleurs}</p>
//                 <p className="text-xs text-gray-500">Actifs / {zone.travailleursTotal}</p>
//               </div>
//             </div>
//             <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
//               <div
//                 className="h-full rounded-full bg-[#FF6600] transition-all"
//                 style={{
//                   width: `${Math.min(100, zone.demandes > 0 ? (zone.demandes / Math.max(...data.map((z) => z.demandes))) * 100 : 0)}%`,
//                 }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </ChartCard>
//   );
// }



import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { MapPin, ChevronDown, ChevronUp, X, Users, ClipboardList, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHART_PALETTE } from '@/lib/dashboard-analytics';

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

// Couleurs pour les statuts
const STATUS_COLORS = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  new: 'Nouvelles',
  assigned: 'Assignées',
  in_progress: 'En cours',
  done: 'Terminées',
  cancelled: 'Annulées',
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <Card className={`rounded-2xl border-gray-100 shadow-sm ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#0A2240]">{title}</CardTitle>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface RequestsTrendChartProps {
  data: { date: string; fullDate: string; demandes: number }[];
}

export function RequestsTrendChart({ data }: RequestsTrendChartProps) {
  return (
    <ChartCard title="Évolution des demandes" subtitle="7 derniers jours">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
              formatter={(value) => [`${value ?? 0} demande(s)`, 'Total']}
            />
            <Area
              type="monotone"
              dataKey="demandes"
              stroke="#FF6600"
              strokeWidth={2.5}
              fill="url(#colorDemandes)"
              dot={{ fill: '#FF6600', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#FF6600' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface StatusPieChartProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard title="Répartition par statut" subtitle={`${total} demande(s) au total`}>
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value ?? 0}`, name]} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

interface ZoneBarChartProps {
  data: { name: string; demandes: number; travailleurs: number }[];
  title: string;
  subtitle?: string;
}

export function ZoneBarChart({ data, title, subtitle }: ZoneBarChartProps) {
  const [showAll, setShowAll] = useState(false);
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.demandes - a.demandes);
  }, [data]);

  const displayedData = useMemo(() => {
    return showAll ? sortedData : sortedData.slice(0, 8);
  }, [sortedData, showAll]);

  const hasManyZones = sortedData.length > 8;

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-[#0A2240]">{title}</CardTitle>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {hasManyZones && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="rounded-xl border-gray-200 hover:border-[#FF6600] hover:text-[#FF6600] transition-all duration-300 flex-shrink-0"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Voir tout ({data.length})
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className={`transition-all duration-300 ${showAll ? 'h-[400px]' : 'h-[300px]'}`}>
          {displayedData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={displayedData} 
                layout="vertical" 
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis 
                  type="number" 
                  allowDecimals={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" formatter={(v) => <span className="text-sm text-gray-600">{v}</span>} />
                <Bar dataKey="demandes" name="Demandes" fill="#FF6600" radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="travailleurs" name="Travailleurs actifs" fill="#0A2240" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {hasManyZones && !showAll && (
          <div className="text-center text-sm text-gray-400 mt-2">
            Affichage des 8 zones les plus actives sur {sortedData.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ServicesBarChartProps {
  data: { name: string; demandes: number }[];
}

export function ServicesBarChart({ data }: ServicesBarChartProps) {
  return (
    <ChartCard title="Services les plus demandés" subtitle="Top 5">
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v ?? 0} demande(s)`, 'Total']} />
              <Bar dataKey="demandes" radius={[8, 8, 0, 0]} barSize={36}>
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

interface ZoneOverviewProps {
  data: { 
    id: string; 
    name: string; 
    demandes: number; 
    travailleurs: number; 
    travailleursTotal: number;
  }[];
}

export function ZoneOverview({ data }: ZoneOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!data.length) return null;

  // Trier par nombre de demandes
  const sortedData = [...data].sort((a, b) => b.demandes - a.demandes);
  const displayedData = sortedData.slice(0, 6);
  const hasMore = sortedData.length > 6;

  // Filtrer les données pour la recherche
  const filteredData = sortedData.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Composant de carte de zone simplifié (sans les statuts)
  const ZoneCard = ({ zone, index, isInModal = false }: { zone: any; index: number; isInModal?: boolean }) => {
    const maxDemandes = Math.max(...sortedData.map(z => z.demandes));
    const percentage = maxDemandes > 0 ? (zone.demandes / maxDemandes) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-all duration-300 ${
          isInModal ? 'hover:shadow-lg' : ''
        }`}
      >
        <div>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6600] flex-shrink-0" />
                <h4 className="font-semibold text-[#0A2240] truncate">{zone.name}</h4>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-gray-500">
                  <ClipboardList className="w-3.5 h-3.5" />
                  {zone.demandes} demandes
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  {zone.travailleurs}/{zone.travailleursTotal} actifs
                </span>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF6600] transition-all duration-500"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#0A2240]">Vue par zone</CardTitle>
            <p className="text-sm text-gray-500">
              {sortedData.length} zones • {sortedData.reduce((acc, z) => acc + z.demandes, 0)} demandes totales
            </p>
          </div>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl border-gray-200 hover:border-[#FF6600] hover:text-[#FF6600] transition-all duration-300 flex-shrink-0"
            >
              Voir tout ({sortedData.length})
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {displayedData.map((zone, index) => (
              <ZoneCard key={zone.id} zone={zone} index={index} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 hover:text-[#FF6600] text-sm"
              >
                + {sortedData.length - 6} autres zones à voir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal avec recherche */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-[#0A2240] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6600]" />
                Toutes les zones
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filteredData.length} zones)
                </span>
              </DialogTitle>
              {/* Un seul bouton de fermeture */}
              <DialogClose className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
                <span className="sr-only">Fermer</span>
              </DialogClose>
            </div>
            
            {/* Barre de recherche */}
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 outline-none transition-all duration-200 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Résultats de la recherche */}
            {searchTerm && filteredData.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucune zone trouvée pour "{searchTerm}"
              </div>
            )}
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 pb-6">
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {filteredData.map((zone, index) => (
                <ZoneCard key={zone.id} zone={zone} index={index} isInModal />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}