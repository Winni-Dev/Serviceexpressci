import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useServices } from '@/hooks/useServices';
import { useRequestModal } from '@/contexts/request-modal-context';
import { getServiceIcon, getServiceColor, getServiceDescription } from '@/lib/service-icons';
import type { Service } from '@/types';

interface ServiceListProps {
  limit?: number;
  showSearch?: boolean;
  showVoirPlus?: boolean;
  variant?: 'compact' | 'full';
  defaultSearch?: string;
}

function filterServices(services: Service[] | undefined, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return services ?? [];
  return (services ?? []).filter((s) => s.name.toLowerCase().includes(q));
}

export function ServiceList({
  limit,
  showSearch = true,
  showVoirPlus = false,
  variant = 'compact',
  defaultSearch = '',
}: ServiceListProps) {
  const [search, setSearch] = useState(defaultSearch);
  const { openRequest } = useRequestModal();
  const { data: services, isLoading } = useServices();

  useEffect(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);

  const filtered = useMemo(() => filterServices(services, search), [services, search]);
  const displayed = limit ? filtered.slice(0, limit) : filtered;
  const hasMore = limit ? filtered.length > limit : false;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const Icon = getServiceIcon(service.icon);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <div
          className={`group h-full rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-[#FF6600]/20 transition-all duration-300 p-5 text-center`}
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#FF6600]/15 to-[#FF6600]/5 flex items-center justify-center mb-3">
            <Icon className={`w-6 h-6 ${getServiceColor(service.icon)}`} />
          </div>
          <h3 className="font-semibold text-[#0A2240] text-base mb-1.5 line-clamp-1">
            {service.name}
          </h3>
          <p className="text-gray-500 mb-4 text-xs line-clamp-2 min-h-[2.5rem]">
            {getServiceDescription(service.name)}
          </p>
          <Button
            className="rounded-xl w-full text-sm h-9"
            onClick={() => openRequest(service)}
          >
            Commander
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {showSearch && (
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 bg-white"
          />
        </div>
      )}

      {displayed.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Aucun service trouvé</p>
      ) : (
        <div className={variant === 'compact' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'grid grid-cols-2 lg:grid-cols-3 gap-5'}>
          {displayed.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}

      {showVoirPlus && (hasMore || filtered.length > 0) && (
        <div className="text-center">
          <Button size="lg" variant="outline" className="rounded-xl" asChild>
            <Link to={search ? `/services?q=${encodeURIComponent(search)}` : '/services'}>
              Voir plus
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
