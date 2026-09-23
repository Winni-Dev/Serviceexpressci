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
          `group h-full flex flex-col overflow-hidden rounded-xl
          border-2 border-[#0A2240]/12
          bg-gradient-to-b from-white to-[#f6f8fb]
          shadow-[0_6px_18px_rgba(10,34,64,0.08),0_1px_0_rgba(10,34,64,0.04)]
          hover:border-[#FF6600]/60
          hover:shadow-[0_18px_36px_rgba(10,34,64,0.16),0_0_0_2px_rgba(255,102,0,0.08)]
          hover:-translate-y-1
          transition-all duration-350 ease-in-out
          cursor-pointer`}
      >
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-gradient-to-br from-[#0A2240]/08 to-[#FF6600]/12 border-b-2 border-[#0A2240]/08">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#e8ebf0] border border-[#0A2240]/10 shadow-sm flex items-center justify-center">
                <Icon className={`w-6 h-6 ${getServiceColor(service.icon)}`} />
              </div>
            </div>
          )}
        </div>

          <div className="flex flex-col flex-1 px-4 pt-4 pb-4 text-center">
          <h3 className="font-semibold text-[#0A2240] text-sm leading-snug mb-1 line-clamp-1">
            {service.name}
          </h3>
          <p className="text-[#5a6578] mb-3 text-[11px] leading-relaxed line-clamp-2 min-h-[2.25rem]">
            {description}
          </p>
          <Button
            size="sm"
            className="rounded-lg w-full text-xs h-8 bg-[#FF6600] hover:bg-[#e55a00] shadow-sm shadow-[#FF6600]/25 mt-auto"
              onClick={(e) => { e.stopPropagation(); openRequest(service); }}
          >
            Commander
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

