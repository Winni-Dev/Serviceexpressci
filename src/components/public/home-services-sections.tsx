// import { useMemo } from 'react';
// import { useServices, useServiceCategories } from '@/hooks/useServices';
// import { ServiceList } from '@/components/public/service-list';
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';

// /** Accueil : max 6 services par bande (Tous + chaque catégorie) */
// export function HomeServicesSections() {
//   const { data: services, isLoading: loadingServices } = useServices();
//   const { data: categories, isLoading: loadingCats } = useServiceCategories();

//   const categoriesWithServices = useMemo(() => {
//     if (!categories || !services) return [];
//     return categories
//       .slice()
//       .sort((a, b) => a.sort_order - b.sort_order)
//       .map((cat) => ({
//         category: cat,
//         services: services
//           .filter((s) => s.category_id === cat.id)
//           .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
//       }))
//       .filter((block) => block.services.length > 0);
//   }, [categories, services]);

//   if (loadingServices || loadingCats) {
//     return (
//       <div className="flex justify-center py-12">
//         <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-16">
//       <div>
//         <div className="mb-8 text-center">
//           <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">
//             Tous les services
//           </span>
//           <h2 className="mt-1 mb-2 text-2xl font-bold md:text-3xl text-foreground">Nos services</h2>
//           <div className="w-12 h-0.5 bg-[#FF6600] mx-auto rounded-full" />
//           <p className="max-w-xl mx-auto mt-3 text-sm text-muted-foreground">
//             Choisissez un service et commandez en quelques clics
//           </p>
//         </div>
//         <ServiceList
//           limit={6}
//           showSearch
//           showVoirPlus
//           showCategoryFilter
//           perRow={4}
//         />
//       </div>

//       {categoriesWithServices.map(({ category, services: catServices }, i) => (
//         <motion.section
//           key={category.id}
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: '-40px' }}
//           transition={{ duration: 0.4, delay: i * 0.05 }}
//         >
//           <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
//             <div>
//               <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">
//                 Catégorie
//               </span>
//               <h2 className="text-xl md:text-2xl font-bold text-foreground mt-0.5">
//                 {category.name}
//               </h2>
//               {category.description && (
//                 <p className="max-w-xl mt-1 text-sm text-muted-foreground">{category.description}</p>
//               )}
//             </div>
//             <Button variant="outline" size="sm" className="rounded-xl" asChild>
//               <Link to={`/services?category=${category.id}`}>Voir tout</Link>
//             </Button>
//           </div>
//           <ServiceList
//             limit={6}
//             showSearch={false}
//             showVoirPlus={catServices.length > 6}
//             showCategoryFilter={false}
//             servicesOverride={catServices}
//             categoryId={category.id}
//             perRow={4}
//           />
//         </motion.section>
//       ))}
//     </div>
//   );
// }


import { useMemo } from 'react';
import { useServices, useServiceCategories } from '@/hooks/useServices';
import { ServiceList } from '@/components/public/service-list';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowUpRight,
  Command,
  Layers,
  Search as SearchIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

/** Accueil : max 6 services par bande (Tous + chaque catégorie) */
export function HomeServicesSections() {
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: categories, isLoading: loadingCats } = useServiceCategories();

  const categoriesWithServices = useMemo(() => {
    if (!categories || !services) return [];
    return categories
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        category: cat,
        services: services
          .filter((s) => s.category_id === cat.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      }))
      .filter((block) => block.services.length > 0);
  }, [categories, services]);

  const totalServices = services?.length ?? 0;
  const totalCategories = categoriesWithServices.length;

  if (loadingServices || loadingCats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
        <p className="text-xs tracking-wide text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ===================== TOP TOOLBAR (app-like) ===================== */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky z-30 mb-16 top-2"
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 shadow-[0_1px_2px_rgba(10,34,64,0.04),0_8px_24px_-12px_rgba(10,34,64,0.10)] backdrop-blur-xl">
          {/* Left : breadcrumb + info */}
          <div className="flex items-center min-w-0 gap-3">
            <div className="flex items-center gap-2 pl-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-background">
               
              </span>
              <span className="hidden text-[12.5px] font-medium tracking-tight text-foreground sm:inline">
                Catalogue
              </span>
            </div>

            <span className="hidden w-px h-4 bg-border/70 sm:block" />

            <div className="hidden items-center gap-3 text-[11.5px] text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3 h-3" strokeWidth={1.75} />
                {totalServices} services
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-border" />
                {totalCategories} catégories
              </span>
            </div>
          </div>

          {/* Right : action "Recherche" */}
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground"
          >
            <SearchIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Rechercher</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 sm:inline-flex">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          </Link>
        </div>
      </motion.div>

      <div className="space-y-24 md:space-y-32">
        {/* ===================== HERO ===================== */}
        <section className="relative">
          <div className="grid items-end gap-8 mb-12 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full animate-ping bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {totalServices} services disponibles
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[38px] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground md:text-[56px] lg:text-[64px]"
              >
                Trouvez le bon service,
                <br />
                <span className="text-muted-foreground/60">en un instant.</span>
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-5 md:pb-3"
            >
              <p className="max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
                Une sélection soignée de prestations. Commandez en quelques
                secondes, suivez chaque étape en temps réel.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Button
                  asChild
                  size="sm"
                  className="h-9 gap-1.5 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90 group"
                >
                  <Link to="/services">
                    <span className="text-[13px] font-medium">Explorer</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground group"
                >
                  <Link to="/contact">
                    <span>Nous contacter</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Section bar : titre + actions (app-like) */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-semibold tracking-tight text-foreground">
                Tous les services
              </span>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-muted-foreground">
                {totalServices}
              </span>
            </div>

            <Link
              to="/services"
              className="group inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ServiceList
            limit={6}
            showSearch
            showVoirPlus
            showCategoryFilter
            perRow={4}
          />
        </section>

        {/* ===================== SECTIONS PAR CATÉGORIE ===================== */}
        {categoriesWithServices.map(({ category, services: catServices }, i) => (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Section header (app-like) */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border/70 bg-muted/40 font-mono text-[10.5px] font-medium tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13px] font-semibold tracking-tight text-foreground">
                    {category.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-muted-foreground">
                    {catServices.length}
                  </span>
                </div>

                {category.description && (
                  <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              <Link
                to={`/services?category=${category.id}`}
                className="group inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Voir la catégorie</span>
                <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ServiceList
              limit={6}
              showSearch={false}
              showVoirPlus={catServices.length > 6}
              showCategoryFilter={false}
              servicesOverride={catServices}
              categoryId={category.id}
              perRow={4}
            />
          </motion.section>
        ))}

        {/* ===================== CTA FINAL ===================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative p-8 overflow-hidden border rounded-2xl border-border/70 bg-card md:p-10">
            {/* Fond décoratif : grille subtile */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Halo discret */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-foreground/[0.04] blur-3xl"
            />

            <div className="relative grid items-center gap-8 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-6 h-1 rounded-full bg-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Besoin d'aide ?
                  </span>
                </div>

                <h3 className="text-2xl font-semibold leading-[1.1] tracking-[-0.025em] text-foreground md:text-4xl">
                  Parlons de votre projet.
                  <br />
                  <span className="text-muted-foreground/60">
                    Nous vous orientons.
                  </span>
                </h3>

                <p className="max-w-lg mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                  Notre équipe vous accompagne pour identifier la prestation
                  adaptée, affiner votre besoin et vous orienter vers la meilleure
                  solution.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <Button
                    asChild
                    className="h-10 gap-2 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 group"
                  >
                    <Link to="/contact">
                      <span className="text-[13.5px] font-medium">
                        Nous contacter
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-border/70 px-5 text-[13.5px] font-medium hover:bg-muted/50"
                  >
                    <Link to="/services">Parcourir</Link>
                  </Button>
                </div>
              </div>

              {/* Right : mini stats (app-like) */}
              <div className="md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: 'Support', v: '7j/7' },
                    { k: 'Réponse', v: '< 24h' },
                    { k: 'Paiement', v: 'Sécurisé' },
                    { k: 'Qualité', v: 'Vérifiée' },
                  ].map(({ k, v }) => (
                    <div
                      key={k}
                      className="rounded-xl border border-border/70 bg-background/60 p-3.5 transition-colors duration-300 hover:bg-muted/40"
                    >
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                        {k}
                      </p>
                      <p className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}