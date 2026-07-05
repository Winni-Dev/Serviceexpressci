import { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '@/lib/utils';
import { Pencil, X } from 'lucide-react';
import type { Gender } from '@/types';

export interface DetailField {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface PersonDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  gender: Gender;
  photoUrl?: string;
  badge?: { label: string; className?: string };
  createdAt?: string;
  fields: DetailField[];
  onEdit?: () => void;
}

export function PersonDetailModal({
  open,
  onOpenChange,
  name,
  gender,
  photoUrl,
  badge,
  createdAt,
  fields,
  onEdit,
}: PersonDetailModalProps) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm rounded-2xl border-0 shadow-2xl p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col [&>button]:hidden translate-y-[-50%]"
      >
        <div className="relative bg-gradient-to-r from-[#0A2240] to-[#0d2d52] px-4 py-4 shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-1 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <img
              src={photoUrl || getAvatarUrl(gender)}
              alt={name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/20 shrink-0 bg-white"
            />
            <div className="text-left min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">{name}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {badge && (
                  <Badge className={`text-[10px] px-2 py-0 ${badge.className}`}>{badge.label}</Badge>
                )}
                {formattedDate && (
                  <span className="text-[10px] text-white/60">Créé le {formattedDate}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <field.icon className="w-3.5 h-3.5 text-[#FF6600]" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{field.label}</p>
                <p className="text-sm font-medium text-[#0A2240] break-words">{field.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        {onEdit && (
          <div className="p-4 pt-0 shrink-0">
            <Button className="w-full rounded-xl h-9 text-sm" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5 mr-2" />
              Modifier
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
