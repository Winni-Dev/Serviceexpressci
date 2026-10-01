import React, { useState, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { CHART_PALETTE } from '@/lib/dashboard-analytics';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  ClipboardList,
  Users,
  Search,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const tooltipStyle = {
  backgroundColor: '#18181B',
  border: '1px solid #27272A',
  borderRadius: '10px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
  color: '#F4F4F5',
  fontSize: '12px',
  padding: '8px 12px',
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <Card className={`rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] shadow-sm ${className ?? ''}`}>
      <CardHeader className="pb-2 pt-4 px-4 sm:pt-5 sm:px-5 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-white tracking-tight">{title}</CardTitle>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</CardContent>
    </Card>
  );
}

interface RequestsTrendChartProps {
  data: { date: string; fullDate: string; demandes: number }[];
}

export function RequestsTrendChart({ data }: RequestsTrendChartProps) {
  return (
    <ChartCard title="Évolution des demandes" subtitle="7 derniers jours">
      <div className="h-[260px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C27D3D" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C27D3D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#F4F4F5', fontWeight: 600, marginBottom: '4px' }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
              formatter={(value) => [`${value ?? 0} demande(s)`, 'Total']}
            />
            <Area
              type="monotone"
              dataKey="demandes"
              stroke="#C27D3D"
              strokeWidth={2}
              fill="url(#colorDemandes)"
              dot={{ fill: '#C27D3D', stroke: '#000000', strokeWidth: 1.5, r: 3 }}
              activeDot={{ r: 5, fill: '#D99A5B', stroke: '#121212', strokeWidth: 2 }}
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
      <div className="h-[260px] sm:h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="48%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="#121212"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#F4F4F5' }}
                formatter={(value, name) => [`${value ?? 0}`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-xs text-zinc-300 font-medium">{value}</span>}
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

  const toggleAction = hasManyZones ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowAll(!showAll)}
      className="rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-300 hover:text-[#D99A5B] hover:border-[#C27D3D]/50 transition-all flex-shrink-0 h-7 px-2.5"
    >
      {showAll ? (
        <>
          <ChevronUp className="w-3.5 h-3.5 mr-1" />
          Moins
        </>
      ) : (
        <>
          <ChevronDown className="w-3.5 h-3.5 mr-1" />
          Tout ({data.length})
        </>
      )}
    </Button>
  ) : undefined;

  return (
    <ChartCard title={title} subtitle={subtitle} action={toggleAction}>
      <div className={`transition-all duration-300 ${showAll ? 'h-[380px]' : 'h-[280px]'}`}>
        {displayedData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayedData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#A1A1AA' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={95}
                tick={{ fontSize: 11, fill: '#E4E4E7' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#F4F4F5' }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: '8px' }}
                formatter={(v) => <span className="text-xs text-zinc-300">{v}</span>}
              />
              {/* Série 1 / Principale : #C27D3D */}
              <Bar dataKey="demandes" name="Demandes" fill="#C27D3D" radius={[0, 4, 4, 0]} barSize={11} />
              {/* Série 2 / Complémentaire : #22D3EE (Cyan Néon) */}
              <Bar dataKey="travailleurs" name="Travailleurs actifs" fill="#22D3EE" radius={[0, 4, 4, 0]} barSize={11} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {hasManyZones && !showAll && (
        <div className="text-center text-xs text-zinc-500 mt-2">
          Affichage des 8 zones les plus actives sur {sortedData.length}
        </div>
      )}
    </ChartCard>
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
          <div className="flex h-full items-center justify-center text-zinc-500 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#A1A1AA' }}
                axisLine={false}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
                height={50}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#F4F4F5' }}
                formatter={(v) => [`${v ?? 0} demande(s)`, 'Total']}
              />
              <Bar dataKey="demandes" radius={[6, 6, 0, 0]} barSize={26}>
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

  const sortedData = [...data].sort((a, b) => b.demandes - a.demandes);
  const displayedData = sortedData.slice(0, 6);
  const hasMore = sortedData.length > 6;

  const filteredData = sortedData.filter((zone) =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ZoneCard = ({ zone, index, isInModal = false }: { zone: any; index: number; isInModal?: boolean }) => {
    const maxDemandes = Math.max(...sortedData.map((z) => z.demandes));
    const percentage = maxDemandes > 0 ? (zone.demandes / maxDemandes) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`rounded-xl border border-[#27272A] bg-[#18181B] p-3.5 hover:border-[#C27D3D]/40 transition-all duration-200 ${
          isInModal ? 'hover:shadow-lg' : ''
        }`}
      >
        <div>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C27D3D] flex-shrink-0" />
                <h4 className="font-semibold text-white text-sm truncate">{zone.name}</h4>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-zinc-500" />
                  {zone.demandes} demandes
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  {zone.travailleurs}/{zone.travailleursTotal} actifs
                </span>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 h-1.5 rounded-full bg-[#27272A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C27D3D] to-[#D99A5B] transition-all duration-500"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Card className="rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 sm:pt-5 sm:px-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold text-white tracking-tight">Vue par zone</CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">
              {sortedData.length} zones • {sortedData.reduce((acc, z) => acc + z.demandes, 0)} demandes totales
            </p>
          </div>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-300 hover:text-[#D99A5B] hover:border-[#C27D3D]/50 transition-all flex-shrink-0 h-7 px-2.5"
            >
              Voir tout ({sortedData.length})
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {displayedData.map((zone, index) => (
              <ZoneCard key={zone.id} zone={zone} index={index} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-zinc-400 hover:text-[#D99A5B] text-xs h-7"
              >
                + {sortedData.length - 6} autres zones à voir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal avec recherche */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 rounded-2xl overflow-hidden bg-[#121212] border border-[#27272A]">
          <DialogHeader className="p-5 pb-3 border-b border-[#27272A]">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#C27D3D]" />
                Toutes les zones
                <span className="text-xs font-normal text-zinc-400 ml-1">
                  ({filteredData.length} zones)
                </span>
              </DialogTitle>
              <DialogClose className="rounded-full p-1.5 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </DialogClose>
            </div>

            {/* Barre de recherche */}
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[#27272A] bg-[#18181B] text-white placeholder:text-zinc-500 focus:border-[#C27D3D] focus:ring-1 focus:ring-[#C27D3D]/30 outline-none transition-all text-xs sm:text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchTerm && filteredData.length === 0 && (
              <div className="text-center py-4 text-zinc-500 text-xs">
                Aucune zone trouvée pour "{searchTerm}"
              </div>
            )}
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-170px)] px-5 pb-5">
            <div className="grid sm:grid-cols-2 gap-3 pt-3">
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