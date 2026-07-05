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
import { CHART_PALETTE } from '@/lib/dashboard-analytics';

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
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
  data: { id: string; name: string; demandes: number; travailleurs: number; travailleursTotal: number }[];
}

export function ZoneOverview({ data }: ZoneOverviewProps) {
  if (!data.length) return null;

  return (
    <ChartCard title="Vue par zone" subtitle="Demandes et effectifs">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((zone, i) => (
          <div
            key={zone.id}
            className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
              />
              <h4 className="font-semibold text-[#0A2240] truncate">{zone.name}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-[#FF6600]">{zone.demandes}</p>
                <p className="text-xs text-gray-500">Demandes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2240]">{zone.travailleurs}</p>
                <p className="text-xs text-gray-500">Actifs / {zone.travailleursTotal}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FF6600] transition-all"
                style={{
                  width: `${Math.min(100, zone.demandes > 0 ? (zone.demandes / Math.max(...data.map((z) => z.demandes))) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
