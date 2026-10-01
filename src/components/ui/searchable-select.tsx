// import { useEffect, useMemo, useRef, useState } from 'react';
// import { Check, ChevronDown, Search } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Input } from '@/components/ui/input';

// export interface SearchableSelectOption {
//   value: string;
//   label: string;
// }

// interface SearchableSelectProps {
//   value: string;
//   onValueChange: (value: string) => void;
//   options: SearchableSelectOption[];
//   placeholder?: string;
//   searchPlaceholder?: string;
//   emptyMessage?: string;
//   disabled?: boolean;
//   className?: string;
// }

// export function SearchableSelect({
//   value,
//   onValueChange,
//   options,
//   placeholder = 'Sélectionner...',
//   searchPlaceholder = 'Tapez pour rechercher...',
//   emptyMessage = 'Aucun résultat',
//   disabled = false,
//   className,
// }: SearchableSelectProps) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState('');
//   const containerRef = useRef<HTMLDivElement>(null);

//   const selectedLabel = options.find((o) => o.value === value)?.label;

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return options;
//     return options.filter((o) => o.label.toLowerCase().includes(q));
//   }, [options, search]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setOpen(false);
//         setSearch('');
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSelect = (optionValue: string) => {
//     onValueChange(optionValue);
//     setOpen(false);
//     setSearch('');
//   };

//   return (
//     <div ref={containerRef} className={cn('relative w-full', className)}>
//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() => !disabled && setOpen((o) => !o)}
//         className={cn(
//           'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left',
//           'focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent',
//           'disabled:cursor-not-allowed disabled:opacity-50',
//           !selectedLabel && 'text-gray-400'
//         )}
//       >
//         <span className="truncate">{selectedLabel || placeholder}</span>
//         <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
//       </button>

//       {open && (
//         <div className="absolute z-[100] mt-1 w-full rounded-lg border bg-white shadow-lg">
//           <div className="p-2 border-b">
//             <div className="relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <Input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder={searchPlaceholder}
//                 className="pl-8 h-9"
//                 autoFocus
//               />
//             </div>
//           </div>
//           <ul className="max-h-52 overflow-y-auto py-1">
//             {filtered.length === 0 ? (
//               <li className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</li>
//             ) : (
//               filtered.map((option) => (
//                 <li key={option.value}>
//                   <button
//                     type="button"
//                     onClick={() => handleSelect(option.value)}
//                     className={cn(
//                       'flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100',
//                       value === option.value && 'bg-[#FF6600]/10 text-[#FF6600]'
//                     )}
//                   >
//                     <Check className={cn('w-4 h-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
//                     <span className="truncate">{option.label}</span>
//                   </button>
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Tapez pour rechercher...',
  emptyMessage = 'Aucun résultat',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Empêcher le zoom sur mobile lors du focus de l'input de recherche
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') {
        target.style.fontSize = '16px';
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') {
        target.style.fontSize = '';
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearch('');
  };

  // Forcer l'ouverture au clic sur mobile
  const handleButtonClick = (e: React.MouseEvent) => {
    if (!disabled) {
      e.preventDefault();
      setOpen((o) => !o);
      // Focus sur l'input après l'ouverture
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleButtonClick}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[#2D2D2D] bg-[#262626] px-3 py-2 text-sm text-left text-white',
          'focus:outline-none focus:ring-2 focus:ring-[#C27D3D]/30 focus:border-[#C27D3D]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !selectedLabel && 'text-[#707070]',
          'text-base sm:text-sm'
        )}
        style={{ fontSize: '16px' }}
      >
        <span className="min-w-0 flex-1 break-words whitespace-normal text-left">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-[100] mt-1 w-full rounded-xl border border-[#2D2D2D] bg-[#141414] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
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
                autoFocus
                onFocus={(e) => {
                  e.target.style.fontSize = '16px';
                }}
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#A0A0A0]">{emptyMessage}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/5',
                      value === option.value && 'bg-[#C27D3D]/10 text-[#FEC18A]'
                    )}
                  >
                    <Check className={cn('h-4 w-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
                    <span className="min-w-0 flex-1 break-words whitespace-normal text-left">
                      {option.label}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}