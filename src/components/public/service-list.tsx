// import { useMemo, useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Loader2, Search } from 'lucide-react';
// import { useServices, useServiceCategories } from '@/hooks/useServices';
// import { ServiceBadgeCard } from '@/components/public/service-badge-card';
// import { ServiceCarousel } from '@/components/public/service-carousel';
// import type { Service } from '@/types';

// interface ServiceListProps {
//   /** Max services shown (home: 6). Omit to show all. */
//   limit?: number;
//   /**
//    * Découpe en lignes de N cards (page Services: 5 → 15 produits = 3 lignes).
//    * Sans cette prop: une seule bande horizontale.
//    */
//   rowsOf?: number;
//   showSearch?: boolean;
//   showVoirPlus?: boolean;
//   defaultSearch?: string;
//   categoryId?: string | null;
//   uncategorizedOnly?: boolean;
//   servicesOverride?: Service[];
//   showCategoryFilter?: boolean;
//   /** Largeur cards desktop: 4 (home) ou 5 (catalogue) */
//   perRow?: 4 | 5;
//   autoplay?: boolean;
// }

// function filterServices(
//   services: Service[] | undefined,
//   query: string,
//   filterCategoryId: string | null
// ) {
//   let list = services ?? [];
//   if (filterCategoryId === '__none__') {
//     list = list.filter((s) => !s.category_id);
//   } else if (filterCategoryId) {
//     list = list.filter((s) => s.category_id === filterCategoryId);
//   }
//   const q = query.trim().toLowerCase();
//   if (!q) return list;
//   return list.filter(
//     (s) =>
//       s.name.toLowerCase().includes(q) ||
//       s.description?.toLowerCase().includes(q) ||
//       s.service_categories?.name?.toLowerCase().includes(q)
//   );
// }

// function chunkServices(list: Service[], size: number): Service[][] {
//   if (size <= 0) return [list];
//   const rows: Service[][] = [];
//   for (let i = 0; i < list.length; i += size) {
//     rows.push(list.slice(i, i + size));
//   }
//   return rows;
// }

// export function ServiceList({
//   limit,
//   rowsOf,
//   showSearch = true,
//   showVoirPlus = false,
//   defaultSearch = '',
//   categoryId,
//   uncategorizedOnly,
//   servicesOverride,
//   showCategoryFilter = true,
//   perRow = 4,
//   autoplay = true,
// }: ServiceListProps) {
//   const [search, setSearch] = useState(defaultSearch);
//   const [filterCategory, setFilterCategory] = useState<string>('');
//   const { data: allServices, isLoading } = useServices();
//   const { data: categories } = useServiceCategories();
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     setSearch(defaultSearch);
//   }, [defaultSearch]);

//   const base = useMemo(() => {
//     const list = servicesOverride ?? allServices ?? [];
//     if (categoryId) return list.filter((s) => s.category_id === categoryId);
//     if (uncategorizedOnly) return list.filter((s) => !s.category_id);
//     return list;
//   }, [servicesOverride, allServices, categoryId, uncategorizedOnly]);

//   const filtered = useMemo(
//     () => filterServices(base, search, filterCategory || null),
//     [base, search, filterCategory]
//   );
//   const displayed = limit ? filtered.slice(0, limit) : filtered;
//   const hasMore = limit ? filtered.length > limit : false;
//   const rows = useMemo(
//     () => (rowsOf ? chunkServices(displayed, rowsOf) : [displayed]),
//     [displayed, rowsOf]
//   );

//   if (isLoading && !servicesOverride) {
//     return (
//       <div className="flex justify-center py-12">
//         <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
//       </div>
//     );
//   }

//   const voirPlusTo = categoryId
//     ? `/services?category=${categoryId}`
//     : filterCategory && filterCategory !== '__none__'
//       ? `/services?category=${filterCategory}`
//       : search
//         ? `/services?q=${encodeURIComponent(search)}`
//         : '/services';

//   const showFilters = showSearch && !categoryId;

//   return (
//     <div className="space-y-6">
//       {showSearch && (
//         <div className="max-w-2xl mx-auto space-y-3">
//           <div className="relative">
//             <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
//             <Input
//               ref={inputRef}
//               placeholder="Rechercher un service ou une catégorie..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 rounded-xl border-[#0A2240]/12 bg-[#eef1f5] text-base sm:text-sm shadow-sm"
//               style={{ fontSize: '16px' }}
//               inputMode="search"
//               autoCorrect="off"
//               autoCapitalize="off"
//               spellCheck="false"
//             />
//           </div>

//           {showFilters && showCategoryFilter && categories && categories.length > 0 && (
//             <div className="flex flex-wrap justify-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => setFilterCategory('')}
//                 className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
//                   !filterCategory
//                     ? 'bg-[#0A2240] text-white border-[#0A2240]'
//                     : 'bg-[#eef1f5] text-[#0A2240] border-[#0A2240]/12 hover:border-[#FF6600]/40'
//                 }`}
//               >
//                 Toutes
//               </button>
//               {categories.map((cat) => (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   onClick={() => setFilterCategory(cat.id)}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
//                     filterCategory === cat.id
//                       ? 'bg-[#FF6600] text-white border-[#FF6600]'
//                       : 'bg-[#eef1f5] text-[#0A2240] border-[#0A2240]/12 hover:border-[#FF6600]/40'
//                   }`}
//                 >
//                   {cat.name}
//                 </button>
//               ))}
//               <button
//                 type="button"
//                 onClick={() => setFilterCategory('__none__')}
//                 className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
//                   filterCategory === '__none__'
//                     ? 'bg-[#0A2240] text-white border-[#0A2240]'
//                     : 'bg-[#eef1f5] text-[#0A2240] border-[#0A2240]/12 hover:border-[#FF6600]/40'
//                 }`}
//               >
//                 Sans catégorie
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {displayed.length === 0 ? (
//         <p className="py-8 text-center text-gray-400">Aucun service trouvé</p>
//       ) : (
//         <div className="space-y-5">
//           {rows.map((row, rowIndex) => (
//             <ServiceCarousel key={`row-${rowIndex}`} autoplay={autoplay}>
//               {row.map((service, index) => (
//                 <ServiceBadgeCard
//                   key={service.id}
//                   service={service}
//                   index={rowIndex * (rowsOf || row.length) + index}
//                   perRow={perRow}
//                 />
//               ))}
//             </ServiceCarousel>
//           ))}
//         </div>
//       )}

//       {showVoirPlus && hasMore && (
//         <div className="text-center">
//           <Button size="sm" variant="outline" className="rounded-xl border-[#0A2240]/15" asChild>
//             <Link to={voirPlusTo}>Voir tout</Link>
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { useServices, useServiceCategories } from '@/hooks/useServices';
import { ServiceBadgeCard } from '@/components/public/service-badge-card';
import { ServiceCarousel } from '@/components/public/service-carousel';
import { cn } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceListProps {
  limit?: number;
  rowsOf?: number;
  showSearch?: boolean;
  showVoirPlus?: boolean;
  defaultSearch?: string;
  categoryId?: string | null;
  uncategorizedOnly?: boolean;
  servicesOverride?: Service[];
  showCategoryFilter?: boolean;
  perRow?: 4 | 5;
  autoplay?: boolean;
}

function filterServices(
  services: Service[] | undefined,
  query: string,
  filterCategoryId: string | null
) {
  let list = services ?? [];
  if (filterCategoryId === '__none__') {
    list = list.filter((s) => !s.category_id);
  } else if (filterCategoryId) {
    list = list.filter((s) => s.category_id === filterCategoryId);
  }
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.service_categories?.name?.toLowerCase().includes(q)
  );
}

function chunkServices(list: Service[], size: number): Service[][] {
  if (size <= 0) return [list];
  const rows: Service[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
}

export function ServiceList({
  limit,
  rowsOf,
  showSearch = true,
  showVoirPlus = false,
  defaultSearch = '',
  categoryId,
  uncategorizedOnly,
  servicesOverride,
  showCategoryFilter = true,
  perRow = 4,
  autoplay = true,
}: ServiceListProps) {
  const [search, setSearch] = useState(defaultSearch);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const { data: allServices, isLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);

  const base = useMemo(() => {
    const list = servicesOverride ?? allServices ?? [];
    if (categoryId) return list.filter((s) => s.category_id === categoryId);
    if (uncategorizedOnly) return list.filter((s) => !s.category_id);
    return list;
  }, [servicesOverride, allServices, categoryId, uncategorizedOnly]);

  const filtered = useMemo(
    () => filterServices(base, search, filterCategory || null),
    [base, search, filterCategory]
  );
  const displayed = limit ? filtered.slice(0, limit) : filtered;
  const hasMore = limit ? filtered.length > limit : false;
  const rows = useMemo(
    () => (rowsOf ? chunkServices(displayed, rowsOf) : [displayed]),
    [displayed, rowsOf]
  );

  if (isLoading && !servicesOverride) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
        <p className="text-xs tracking-wide text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  const voirPlusTo = categoryId
    ? `/services?category=${categoryId}`
    : filterCategory && filterCategory !== '__none__'
      ? `/services?category=${filterCategory}`
      : search
        ? `/services?q=${encodeURIComponent(search)}`
        : '/services';

  const showFilters = showSearch && !categoryId;

  const pillBase =
    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300';
  const pillActive = 'bg-foreground text-background border-foreground';
  const pillIdle =
    'bg-transparent text-foreground/70 border-border/70 hover:border-foreground/30 hover:text-foreground';

  return (
    <div className="space-y-7">
      {showSearch && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Barre de recherche épurée */}
          <div className="relative group/search">
            <Search
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4',
                'text-muted-foreground/60',
                'transition-colors duration-300 group-focus-within/search:text-foreground'
              )}
            />
            <Input
              ref={inputRef}
              placeholder="Rechercher un service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'pl-11 pr-4 rounded-full',
                'border-border/70 bg-muted/30',
                'text-base sm:text-sm',
                'h-11',
                'transition-all duration-300',
                'focus-visible:ring-2 focus-visible:ring-foreground/10 focus-visible:border-foreground/30',
                'placeholder:text-muted-foreground/60'
              )}
              style={{ fontSize: '16px' }}
              inputMode="search"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          {/* Pills de catégories */}
          {showFilters && showCategoryFilter && categories && categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory('')}
                className={cn(pillBase, !filterCategory ? pillActive : pillIdle)}
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={cn(
                    pillBase,
                    filterCategory === cat.id ? pillActive : pillIdle
                  )}
                >
                  {cat.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilterCategory('__none__')}
                className={cn(
                  pillBase,
                  filterCategory === '__none__' ? pillActive : pillIdle
                )}
              >
                Sans catégorie
              </button>
            </div>
          )}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Aucun service trouvé</p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 text-xs underline transition-colors text-foreground/70 underline-offset-4 hover:text-foreground"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((row, rowIndex) => (
            <ServiceCarousel key={`row-${rowIndex}`} autoplay={autoplay}>
              {row.map((service, index) => (
                <ServiceBadgeCard
                  key={service.id}
                  service={service}
                  index={rowIndex * (rowsOf || row.length) + index}
                  perRow={perRow}
                />
              ))}
            </ServiceCarousel>
          ))}
        </div>
      )}

      {showVoirPlus && hasMore && (
        <div className="pt-2 text-center">
          <Button
            asChild
            variant="ghost"
            className="h-auto p-0 text-sm font-medium group hover:bg-transparent"
          >
            <Link to={voirPlusTo} className="inline-flex items-center gap-1.5">
              <span className="border-b border-foreground/25 pb-0.5 transition-colors group-hover:border-foreground">
                Voir tout
              </span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}