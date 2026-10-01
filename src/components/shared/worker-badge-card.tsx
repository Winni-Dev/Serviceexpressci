import { StarRating } from '@/components/shared/star-rating';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '@/lib/utils';
import { Phone, MapPin, Briefcase } from 'lucide-react';
import type { Gender } from '@/types';

interface WorkerBadgeCardProps {
  name: string;
  phone?: string;
  photoUrl?: string | null;
  gender?: Gender;
  serviceName?: string;
  zoneName?: string;
  status?: string;
  avgRating?: number;
  ratingCount?: number;
  actions?: React.ReactNode;
  className?: string;
}

export function WorkerBadgeCard({
  name,
  phone,
  photoUrl,
  gender = 'male',
  serviceName,
  zoneName,
  status,
  avgRating = 0,
  ratingCount = 0,
  actions,
  className = '',
}: WorkerBadgeCardProps) {
  return (
    <div
      className={`rounded-xl sm:rounded-2xl border border-[#27272A] bg-[#121212] p-4 shadow-sm hover:border-[#C27D3D]/40 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <img
          src={photoUrl || getAvatarUrl(gender)}
          alt={name}
          className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#C27D3D]/25 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate text-sm sm:text-base">{name}</h3>
              <div className="mt-1">
                <StarRating
                  value={avgRating}
                  readonly
                  size="sm"
                  showValue={ratingCount > 0}
                  count={ratingCount}
                />
                {ratingCount === 0 && (
                  <p className="text-[11px] text-zinc-500 mt-0.5">Pas encore de note</p>
                )}
              </div>
            </div>
            {status && (
              <Badge variant={status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-[11px]">
                {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3.5 space-y-1.5 text-xs sm:text-sm text-zinc-300">
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#C27D3D] shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {zoneName && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#C27D3D] shrink-0" />
            <span className="truncate">{zoneName}</span>
          </div>
        )}
        {serviceName && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-[#C27D3D] shrink-0" />
            <span className="truncate">{serviceName}</span>
          </div>
        )}
      </div>

      {actions && <div className="mt-3.5">{actions}</div>}
    </div>
  );
}
