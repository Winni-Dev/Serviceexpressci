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
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start gap-3">
        <img
          src={photoUrl || getAvatarUrl(gender)}
          alt={name}
          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#FF6600]/15 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[#0A2240] truncate">{name}</h3>
              <div className="mt-1">
                <StarRating
                  value={avgRating}
                  readonly
                  size="sm"
                  showValue={ratingCount > 0}
                  count={ratingCount}
                />
                {ratingCount === 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">Pas encore de note</p>
                )}
              </div>
            </div>
            {status && (
              <Badge variant={status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-500">
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {zoneName && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{zoneName}</span>
          </div>
        )}
        {serviceName && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{serviceName}</span>
          </div>
        )}
      </div>

      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}
