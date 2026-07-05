import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  SERVICE_ICON_CATALOG,
  SERVICE_ICON_CATEGORIES,
  getServiceIcon,
} from '@/lib/service-icons';

interface ServiceIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function ServiceIconPicker({ value, onChange }: ServiceIconPickerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const SelectedIcon = getServiceIcon(value);
  const selectedEntry = SERVICE_ICON_CATALOG.find((i) => i.key === value);

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVICE_ICON_CATALOG.filter((icon) => {
      const matchesCategory = category === 'all' || icon.category === category;
      const matchesSearch =
        !q ||
        icon.key.toLowerCase().includes(q) ||
        icon.label.toLowerCase().includes(q) ||
        icon.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6600]/20 to-[#FF6600]/5 shadow-sm">
          <SelectedIcon className="h-6 w-6 text-[#FF6600]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Icône sélectionnée
          </p>
          <p className="truncate text-sm font-semibold text-[#0A2240]">
            {selectedEntry?.label ?? value}
          </p>
          {selectedEntry && (
            <p className="text-xs text-gray-400">{selectedEntry.category}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une icône..."
          className="rounded-xl border-gray-200 pl-9"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
            category === 'all'
              ? 'bg-[#0A2240] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Toutes
        </button>
        {SERVICE_ICON_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              category === cat
                ? 'bg-[#0A2240] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2">
        {filteredIcons.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Aucune icône trouvée</p>
        ) : (
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
            {filteredIcons.map((icon) => {
              const Icon = getServiceIcon(icon.key);
              const isSelected = value === icon.key;
              return (
                <button
                  key={icon.key}
                  type="button"
                  title={icon.label}
                  onClick={() => onChange(icon.key)}
                  className={cn(
                    'group relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-[#FF6600] bg-[#FF6600]/10 shadow-sm'
                      : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isSelected ? 'text-[#FF6600]' : 'text-[#0A2240] group-hover:text-[#FF6600]'
                    )}
                  />
                  {isSelected && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6600]">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400">
        {filteredIcons.length} icône{filteredIcons.length > 1 ? 's' : ''} disponible
        {filteredIcons.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}
