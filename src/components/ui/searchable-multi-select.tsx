import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  values: string[];
  onChange: (next: string[]) => void;
  options: SearchableMultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function getSummaryLabel(selected: SearchableMultiSelectOption[], all: SearchableMultiSelectOption[]) {
  const count = selected.length;
  if (!count) return '';
  if (count === 1) return selected[0]?.label ?? '';
  if (count === all.length) return `${count} sélectionnées`;
  const firstTwo = selected.slice(0, 2).map((s) => s.label);
  const remaining = count - firstTwo.length;
  return `${firstTwo.join(', ')} +${remaining}`;
}

export function SearchableMultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Choisir...',
  searchPlaceholder = 'Rechercher...',
  disabled,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(
    () => options.filter((o) => values.includes(o.value)),
    [options, values]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const summary = useMemo(
    () => getSummaryLabel(selectedOptions, options),
    [selectedOptions, options]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const toggleValue = (v: string) => {
    if (disabled) return;
    const exists = values.includes(v);
    const next = exists ? values.filter((x) => x !== v) : [...values, v];
    onChange(next);
  };

  const clear = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', disabled && 'opacity-50')}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-[#2D2D2D] bg-[#262626] px-3 py-2 text-sm text-white',
          'focus:outline-none focus:ring-2 focus:ring-[#C27D3D]/30 focus:border-[#C27D3D]'
        )}
      >
        <span className={cn('truncate', !summary && 'text-[#707070]')}>
          {summary || placeholder}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {values.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  clear();
                }
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/5"
              aria-label="Effacer la sélection"
            >
              <X className="h-4 w-4 text-[#A0A0A0]" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-[#A0A0A0] transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-[100] mt-2 w-full rounded-xl border border-[#2D2D2D] bg-[#141414] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2D2D2D] p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707070]" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8 text-base sm:text-sm"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#A0A0A0]">{'Aucun résultat'}</div>
            ) : (
              filtered.map((option) => {
                const selected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/5',
                      selected && 'bg-[#C27D3D]/10 text-[#FEC18A]'
                    )}
                  >
                    <span className="flex w-5 items-center justify-center">
                      {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

