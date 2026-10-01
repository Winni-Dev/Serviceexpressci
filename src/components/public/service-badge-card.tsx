import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServiceIcon, getServiceColor, getServiceDescription } from '@/lib/service-icons';
import { useRequestModal } from '@/contexts/request-modal-context';
import { cn } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceBadgeCardProps {
  service: Service;
  index?: number;
  /** Nombre de cards visibles par ligne sur desktop (home ~4, catalogue 5) */
  perRow?: 4 | 5;
}

export function ServiceBadgeCard({ service, index = 0, perRow = 4 }: ServiceBadgeCardProps) {
  const { openRequest } = useRequestModal();
  const Icon = getServiceIcon(service.icon);
  const description =
    service.description?.trim() || getServiceDescription(service.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      className={cn(
        'snap-start shrink-0 w-[78%] max-w-[260px] sm:w-[calc((100%-1rem)/2)] sm:max-w-none',
        perRow === 5
          ? 'lg:w-[calc((100%-4rem)/5)]'
          : 'lg:w-[calc((100%-3rem)/4)]'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => openRequest(service)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openRequest(service); }}
        className={
          `group h-full flex flex-col overflow-hidden rounded-[22px]
          border border-[#2D2D2D]
          bg-[#141414]
          shadow-[0_10px_30px_rgba(0,0,0,0.28)]
          hover:border-[#C27D3D]/50
          hover:shadow-[0_18px_36px_rgba(0,0,0,0.35)]
          hover:-translate-y-1
          transition-all duration-350 ease-in-out
          cursor-pointer`}
      >
        <div className="relative aspect-[5/4] w-full overflow-hidden border-b border-[#2D2D2D] bg-[#0A0A0A]">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(194,125,61,0.18),_transparent_45%)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C27D3D]/25 bg-[#1C1C1C] shadow-sm shadow-black/20">
                <Icon className={`h-6 w-6 ${getServiceColor(service.icon)}`} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-4 text-center">
          <h3 className="mb-1 text-sm font-semibold leading-snug text-white line-clamp-1">
            {service.name}
          </h3>
          <p className="mb-3 min-h-[2.25rem] text-[11px] leading-relaxed text-[#A0A0A0] line-clamp-2">
            {description}
          </p>
          <Button
            size="sm"
            className="mt-auto h-8 w-full rounded-lg text-[11px] font-medium"
            onClick={(e) => { e.stopPropagation(); openRequest(service); }}
          >
            Commander
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

