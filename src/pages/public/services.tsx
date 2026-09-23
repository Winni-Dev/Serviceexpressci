// import { Link, useSearchParams } from 'react-router-dom';
// import { ServiceList } from '@/components/public/service-list';
// import { useServiceCategories } from '@/hooks/useServices';

// export function ServicesPage() {
//   const [searchParams] = useSearchParams();
//   const query = searchParams.get('q') ?? '';
//   const categoryId = searchParams.get('category');
//   const { data: categories } = useServiceCategories();

//   const category = categoryId
//     ? categories?.find((c) => c.id === categoryId)
//     : undefined;

//   return (
//     <div className="bg-[#f8f9fb] min-h-[60vh]">
//       <section className="py-8 md:py-10">
//         <div className="container px-4 mx-auto space-y-4">
//           {category && (
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <h1 className="text-xl font-bold text-[#0A2240]">{category.name}</h1>
//               <Link to="/services" className="text-sm text-[#FF6600] hover:underline">
//                 Tous les services
//               </Link>
//             </div>
//           )}
//           <ServiceList
//             showSearch
//             showCategoryFilter={!categoryId}
//             rowsOf={5}
//             perRow={5}
//             autoplay={false}
//             defaultSearch={query}
//             categoryId={categoryId}
//             key={`${query}-${categoryId || 'all'}`}
//           />
//         </div>
//       </section>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceList } from '@/components/public/service-list';
import { useServiceCategories, useServices } from '@/hooks/useServices';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Layers,
  Search as SearchIcon,
  Command,
  LayoutGrid,
  Home,
  ChevronRight,
  X,
  ArrowDownUp,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*                               Petits helpers                               */
/* -------------------------------------------------------------------------- */

type SortKey = 'default' | 'az' | 'za';

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Recommandé',
  az: 'A → Z',
  za: 'Z → A',
};

/* -------------------------------------------------------------------------- */
/*                          Dialog Recherche (⌘K)                             */
/* -------------------------------------------------------------------------- */

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  onSubmit: (q: string) => void;
}

function SearchDialog({ open, onClose, initialQuery, onSubmit }: SearchDialogProps) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    if (open) setValue(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden border shadow-2xl rounded-2xl border-border/70 bg-background"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(value.trim());
                onClose();
              }}
              className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5"
            >
              <SearchIcon className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.75} />
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Rechercher un service…"
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1 transition-colors rounded-md text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </form>

            <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>Appuyez sur Entrée pour valider</span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
                esc
              </kbd>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Page Services                                */
/* -------------------------------------------------------------------------- */

export function ServicesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('category');

  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();

  const category = categoryId
    ? categories?.find((c) => c.id === categoryId)
    : undefined;

  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');
  const [sortOpen, setSortOpen] = useState(false);

  /* -------- ⌘K / Ctrl+K global shortcut -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* -------- Fermer le menu de tri au clic extérieur -------- */
  useEffect(() => {
    if (!sortOpen) return;
    const close = () => setSortOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [sortOpen]);

  /* -------- Comptages -------- */
  const totalServices = services?.length ?? 0;
  const categoryServicesCount = useMemo(() => {
    if (!categoryId) return totalServices;
    return services?.filter((s) => s.category_id === categoryId).length ?? 0;
  }, [services, categoryId, totalServices]);

  const displayedCount = useMemo(() => {
    if (!services) return 0;
    let list = services;
    if (categoryId) list = list.filter((s) => s.category_id === categoryId);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.service_categories?.name?.toLowerCase().includes(q)
      );
    }
    return list.length;
  }, [services, categoryId, query]);

  const submitSearch = (q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q);
    else params.delete('q');
    navigate(`/services?${params.toString()}`);
  };

  const activeFiltersCount =
    (query ? 1 : 0) + (categoryId ? 1 : 0) + (sort !== 'default' ? 1 : 0);

  return (
    <div className="min-h-[60vh] bg-background">
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialQuery={query}
        onSubmit={submitSearch}
      />

      <div className="container px-4 mx-auto">
        {/* ===================== TOOLBAR STICKY ===================== */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="sticky z-30 pt-4 pb-2 top-2"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/85 px-3 py-2.5 shadow-[0_1px_2px_rgba(10,34,64,0.04),0_8px_24px_-12px_rgba(10,34,64,0.10)] backdrop-blur-xl">
            {/* === Left : logo + breadcrumb === */}
            <div className="flex items-center min-w-0 gap-3">
              <Link
                to="/"
                aria-label="Accueil"
                className="flex items-center gap-2 pl-1 transition-opacity hover:opacity-80"
              >
                {/* <span className="flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-background">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                </span> */}
              </Link>

              <span className="hidden w-px h-4 bg-border/70 sm:block" />

              <nav
                aria-label="Fil d'Ariane"
                className="flex min-w-0 items-center gap-1.5 text-[12.5px]"
              >
                <Link
                  to="/"
                  className="hidden items-center gap-1.5 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:inline-flex"
                >
                  <Home className="w-3 h-3" strokeWidth={1.75} />
                  <span className="font-medium">Accueil</span>
                </Link>
                <ChevronRight
                  className="hidden w-3 h-3 text-muted-foreground/50 sm:block"
                  strokeWidth={1.75}
                />
                <Link
                  to="/services"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors',
                    category
                      ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      : 'font-medium text-foreground'
                  )}
                >
                  <LayoutGrid className="w-3 h-3" strokeWidth={1.75} />
                  <span className="font-medium">Services</span>
                </Link>
                {category && (
                  <>
                    <ChevronRight
                      className="w-3 h-3 text-muted-foreground/50"
                      strokeWidth={1.75}
                    />
                    <span className="inline-flex max-w-[160px] items-center truncate rounded-md bg-muted/50 px-1.5 py-0.5 font-medium text-foreground">
                      {category.name}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* === Right : tri + recherche === */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Tri */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOpen((v) => !v);
                  }}
                  className={cn(
                    'group inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors duration-200',
                    'hover:border-foreground/20 hover:text-foreground',
                    sort !== 'default' && 'border-foreground/30 text-foreground'
                  )}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <ArrowDownUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-40 mt-1.5 w-40 overflow-hidden rounded-xl border border-border/70 bg-background shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setSort(k);
                            setSortOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] transition-colors',
                            sort === k
                              ? 'bg-muted/50 text-foreground'
                              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          )}
                        >
                          <span className="font-medium">{SORT_LABELS[k]}</span>
                          {sort === k && (
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recherche ⌘K */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground"
              >
                <SearchIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Rechercher</span>
                <kbd className="hidden items-center gap-0.5 rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 sm:inline-flex">
                  <Command className="h-2.5 w-2.5" />
                  <span>K</span>
                </kbd>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===================== HERO ===================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 pb-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              {category && (
                <Link
                  to="/services"
                  className="group mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft
                    className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5"
                    strokeWidth={2}
                  />
                  <span>Tous les services</span>
                </Link>
              )}

              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground md:text-3xl">
                  {category ? category.name : 'Tous les services'}
                </h1>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {displayedCount}
                </span>
              </div>

              {category?.description ? (
                <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              ) : query ? (
                <p className="text-[13.5px] text-muted-foreground">
                  Résultats pour{' '}
                  <span className="font-medium text-foreground">“{query}”</span>
                </p>
              ) : (
                <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                  Parcourez l'ensemble de notre catalogue et trouvez la prestation
                  adaptée à votre besoin.
                </p>
              )}
            </div>

            {/* Badges de filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={() => submitSearch('')}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    <span>“{query}”</span>
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                )}
                {category && (
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    <Layers className="w-3 h-3" strokeWidth={1.75} />
                    <span>{category.name}</span>
                    <X className="w-3 h-3" strokeWidth={2} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.section>

        {/* ===================== SECTION HEADER (comptage + reset) ===================== */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] font-semibold tracking-tight text-foreground">
              Résultats
            </span>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-muted-foreground">
              {displayedCount}
            </span>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                navigate('/services');
                setSort('default');
              }}
              className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* ===================== LISTE DE SERVICES ===================== */}
        <section className="pb-16">
          <ServiceList
            showSearch
            showCategoryFilter={!categoryId}
            rowsOf={5}
            perRow={5}
            autoplay={false}
            defaultSearch={query}
            categoryId={categoryId}
            key={`${query}-${categoryId || 'all'}-${sort}`}
          />
        </section>
      </div>
    </div>
  );
}