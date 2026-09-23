// import type { ReactNode } from 'react';
// import { cn } from '@/lib/utils';

// interface StatsScrollRowProps {
//   children: ReactNode;
//   className?: string;
//   /** Colonnes desktop (défaut 4) */
//   cols?: 2 | 3 | 4;
// }

// /** Mobile: overflow-x · Desktop: grille normale */
// export function StatsScrollRow({ children, className, cols = 4 }: StatsScrollRowProps) {
//   const lgCols =
//     cols === 2 ? 'lg:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

//   return (
//     <div
//       className={cn(
//         'flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1',
//         'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
//         'lg:grid lg:gap-4 lg:overflow-visible lg:pb-0',
//         lgCols,
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// }

// interface StatBadgeProps {
//   label: string;
//   value: ReactNode;
//   hint?: string;
//   tone?: 'brand' | 'accent' | 'muted' | 'success';
//   icon?: ReactNode;
//   className?: string;
//   masked?: boolean;
// }

// const tones = {
//   brand:
//     'bg-gradient-to-br from-[#0A2240] to-[#143a66] text-white border-white/10 shadow-[0_10px_30px_rgba(10,34,64,0.25)]',
//   accent:
//     'bg-gradient-to-br from-[#FF6600] to-[#e55a00] text-white border-white/10 shadow-[0_10px_30px_rgba(255,102,0,0.25)]',
//   muted: 'bg-white text-[#0A2240] border-gray-100 shadow-sm',
//   success: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
// };

// export function StatBadge({
//   label,
//   value,
//   hint,
//   tone = 'muted',
//   icon,
//   className,
//   masked = false,
// }: StatBadgeProps) {
//   return (
//     <div
//       className={cn(
//         'snap-start shrink-0 w-[min(200px,72vw)] sm:w-[210px] lg:w-auto lg:min-w-0 lg:shrink rounded-2xl border p-4 lg:p-5',
//         tones[tone],
//         className
//       )}
//     >
//       <div className="flex items-center gap-2 text-xs opacity-80 mb-1.5">
//         {icon}
//         <span className="font-medium truncate">{label}</span>
//       </div>
//       <p className="relative text-2xl lg:text-3xl font-bold tracking-tight truncate h-[1.1em]">
//         <span
//           className={cn(
//             'block w-full transition-all duration-300 origin-center',
//             masked ? 'blur-sm scale-105 opacity-60' : 'blur-0 scale-100 opacity-100'
//           )}
//         >
//           {value}
//         </span>
//         <span
//           aria-hidden
//           className={cn(
//             'absolute inset-0 flex items-center justify-center text-2xl lg:text-3xl font-bold transition-opacity duration-300',
//             masked ? 'opacity-100' : 'opacity-0 pointer-events-none'
//           )}
//         >
//           ••••••
//         </span>
//       </p>
//       {hint && <p className="text-[11px] opacity-70 mt-1 truncate">{hint}</p>}
//     </div>
//   );
// }


import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsScrollRowProps {
  children: ReactNode;
  className?: string;
  /** Colonnes desktop (défaut 4) — utilisé seulement si `scroll` est false */
  cols?: 2 | 3 | 4;
  /** Force le scroll horizontal même sur desktop (défaut: true) */
  scroll?: boolean;
}

/**
 * Mobile & Desktop : overflow-x scroll horizontal
 * Les cartes défilent horizontalement avec snap.
 */
export function StatsScrollRow({
  children,
  className,
  cols = 4,
  scroll = true,
}: StatsScrollRowProps) {
  const lgCols =
    cols === 2 ? 'lg:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  // Mode scroll horizontal (défaut) : s'applique sur TOUS les écrans
  if (scroll) {
    return (
      <div
        className={cn(
          'flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory',
          'px-1 pb-3 -mx-1',
          'scroll-smooth',
          'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className
        )}
      >
        {children}
      </div>
    );
  }

  // Mode grille (fallback si scroll={false})
  return (
    <div
      className={cn(
        'flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1',
        'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'lg:grid lg:gap-5 lg:overflow-visible lg:pb-0 lg:px-0',
        lgCols,
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatBadgeProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'brand' | 'accent' | 'muted' | 'success';
  icon?: ReactNode;
  className?: string;
  masked?: boolean;
}

const tones = {
  brand: {
    wrapper:
      'bg-gradient-to-br from-[#0A2240] via-[#0d2c52] to-[#143a66] text-white border-cyan-400/20',
    glow: 'from-cyan-400/40 via-blue-500/20 to-transparent',
    accent: 'text-cyan-300',
  },
  accent: {
    wrapper:
      'bg-gradient-to-br from-[#FF6600] via-[#ff7a1f] to-[#e55a00] text-white border-orange-300/30',
    glow: 'from-orange-400/50 via-amber-400/20 to-transparent',
    accent: 'text-amber-200',
  },
  muted: {
    wrapper:
      'bg-white/80 backdrop-blur-xl text-[#0A2240] border-slate-200/60',
    glow: 'from-slate-300/40 via-slate-200/10 to-transparent',
    accent: 'text-[#FF6600]',
  },
  success: {
    wrapper:
      'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/80 text-emerald-900 border-emerald-300/60',
    glow: 'from-emerald-400/40 via-teal-300/20 to-transparent',
    accent: 'text-emerald-600',
  },
} as const;

export function StatBadge({
  label,
  value,
  hint,
  tone = 'muted',
  icon,
  className,
  masked = false,
}: StatBadgeProps) {
  const t = tones[tone];

  return (
    <div
      className={cn(
        'group relative snap-start shrink-0',
        // Largeur fixe sur tous les écrans pour le scroll horizontal
        'w-[min(220px,78vw)] sm:w-[240px] lg:w-[260px]',
        'rounded-2xl border p-4 lg:p-5 overflow-hidden',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:shadow-2xl',
        t.wrapper,
        className
      )}
    >
      {/* Halo lumineux animé */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-50',
          'bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-90',
          t.glow
        )}
      />

      {/* Ligne lumineuse supérieure */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0 left-4 right-4 h-px',
          'bg-gradient-to-r from-transparent via-white/60 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
        )}
      />

      {/* Grille décorative subtile */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-xs opacity-90">
          {icon && (
            <span
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-lg',
                'bg-white/10 backdrop-blur-sm border border-white/10',
                'transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3'
              )}
            >
              {icon}
            </span>
          )}
          <span className="font-semibold uppercase tracking-wider text-[10px] truncate">
            {label}
          </span>
        </div>

        <p className="relative text-2xl lg:text-3xl font-bold tracking-tight truncate h-[1.15em]">
          <span
            className={cn(
              'block w-full transition-all duration-500 origin-center',
              masked ? 'blur-md scale-110 opacity-40' : 'blur-0 scale-100 opacity-100'
            )}
          >
            {value}
          </span>
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 flex items-center justify-center text-2xl lg:text-3xl font-bold tracking-widest transition-all duration-500',
              masked ? 'opacity-100 blur-0' : 'opacity-0 blur-md pointer-events-none'
            )}
          >
            ••••••
          </span>
        </p>

        {hint && (
          <p className="text-[11px] opacity-70 mt-1.5 truncate font-medium">{hint}</p>
        )}
      </div>

      {/* Bordure lumineuse au survol */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl',
          'ring-1 ring-inset ring-white/0 group-hover:ring-white/20 transition-all duration-500'
        )}
      />
    </div>
  );
}