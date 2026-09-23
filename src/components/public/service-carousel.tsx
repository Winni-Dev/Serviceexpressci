// import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface ServiceCarouselProps {
//   children: ReactNode;
//   className?: string;
//     autoplay?: boolean;
// }

// /** Bandeau horizontal avec flèches aux extrémités (mobile + desktop) */
// export function ServiceCarousel({ children, className, autoplay = true }: ServiceCarouselProps) {
//   const scrollerRef = useRef<HTMLDivElement>(null);
//   const [canLeft, setCanLeft] = useState(false);
//   const [canRight, setCanRight] = useState(false);
//   const [autoDir, setAutoDir] = useState<1 | -1>(1);
//   const autoplayRef = useRef<number | null>(null);
//   const pausedRef = useRef(false);
//   const resetTimeoutRef = useRef<number | null>(null);
//   const overflowAnimRef = useRef<number | null>(null);
//   const [noOverflow, setNoOverflow] = useState(false);

//   const updateEdges = useCallback(() => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     const max = el.scrollWidth - el.clientWidth;
//     setCanLeft(el.scrollLeft > 4);
//     setCanRight(max > 4 && el.scrollLeft < max - 4);
//   }, []);

//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     updateEdges();
//     const onScroll = () => updateEdges();
//     el.addEventListener('scroll', onScroll, { passive: true });
//     const ro = new ResizeObserver(updateEdges);
//     ro.observe(el);
//     window.addEventListener('resize', updateEdges);
//     return () => {
//       el.removeEventListener('scroll', onScroll);
//       ro.disconnect();
//       window.removeEventListener('resize', updateEdges);
//     };
//   }, [updateEdges, children]);

//   // Autoplay: smooth scroll and ping-pong between edges
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;

//     const step = () => {
//       if (pausedRef.current) return;
//       const max = el.scrollWidth - el.clientWidth;
//       if (max <= 4) return; // handled by overflow animation
//       setNoOverflow(false);
//       // page-style scroll: move to the next page and stay; loop back when reaching end
//       const amount = Math.max(el.clientWidth * 0.85, 220);
//       const willReachEnd = el.scrollLeft + amount >= max - 2;

//       if (!willReachEnd) {
//         el.scrollBy({ left: amount, behavior: 'smooth' });
//         return;
//       }

//       // move to the end first
//       el.scrollTo({ left: max, behavior: 'smooth' });

//       // clear current autoplay and schedule jump back to start after 2s, then restart autoplay
//       if (autoplayRef.current) {
//         window.clearInterval(autoplayRef.current);
//         autoplayRef.current = null;
//       }
//       if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
//       resetTimeoutRef.current = window.setTimeout(() => {
//         // immediate jump back to start
//         el.scrollTo({ left: 0, behavior: 'auto' });
//         // restart autoplay only if still overflow
//         const newMax = el.scrollWidth - el.clientWidth;
//         if (autoplay && newMax > 4 && !pausedRef.current) {
//           autoplayRef.current = window.setInterval(step, 4000);
//         }
//         resetTimeoutRef.current = null;
//       }, 4000) as unknown as number;
//     };

//     // only start autoplay if there is overflow to the right
//     const initialMax = el.scrollWidth - el.clientWidth;
//     if (autoplay && initialMax > 4) {
//       // clear any existing to avoid dupes
//       if (autoplayRef.current) window.clearInterval(autoplayRef.current);
//       autoplayRef.current = window.setInterval(step, 4000);
//     }

//     // start/stop fallback animation when no overflow
//     const checkOverflow = () => {
//       const max = el.scrollWidth - el.clientWidth;
//       if (max <= 4) {
//         setNoOverflow(true);
//       } else {
//         setNoOverflow(false);
//       }
//     };
//     checkOverflow();
//     const ro = new ResizeObserver(checkOverflow);
//     ro.observe(el);

//     return () => {
//       if (autoplayRef.current) window.clearInterval(autoplayRef.current);
//       autoplayRef.current = null;
//       if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
//       resetTimeoutRef.current = null;
//       ro.disconnect();
//     };
//   }, [autoDir, autoplay]);

//   // Fallback transform animation when there's no overflow
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     // if autoplay is disabled, ensure no transform animation runs
//     if (!autoplay) {
//       el.style.transform = '';
//       return;
//     }
//     let start = 0;
//     const amplitude = Math.min(120, el.clientWidth * 0.08); // px — bigger sway when no overflow
//     const freq = 0.0008; // speed (slower, smoother)

//     const animate = (t: number) => {
//       if (pausedRef.current) {
//         overflowAnimRef.current = requestAnimationFrame(animate);
//         return;
//       }
//       if (!noOverflow) {
//         el.style.transform = '';
//         return;
//       }
//       if (!start) start = t;
//       const x = Math.sin((t - start) * freq) * amplitude;
//       el.style.transform = `translateX(${x}px)`;
//       overflowAnimRef.current = requestAnimationFrame(animate);
//     };

//     if (noOverflow) {
//       overflowAnimRef.current = requestAnimationFrame(animate);
//     } else {
//       if (overflowAnimRef.current) cancelAnimationFrame(overflowAnimRef.current);
//       overflowAnimRef.current = null;
//       el.style.transform = '';
//     }

//     return () => {
//       if (overflowAnimRef.current) cancelAnimationFrame(overflowAnimRef.current);
//       overflowAnimRef.current = null;
//       if (el) el.style.transform = '';
//     };

//   }, [noOverflow, autoplay]);

//   const scrollByDir = (dir: -1 | 1) => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     const amount = Math.max(el.clientWidth * 0.85, 220);
//     el.scrollBy({ left: dir * amount, behavior: 'smooth' });
//   };

//   return (
//     <div className={cn('relative group/carousel', className)}>
//       <button
//         type="button"
//         aria-label="Défiler vers la gauche"
//         disabled={!canLeft}
//         onClick={() => scrollByDir(-1)}
//         className={cn(
//           'absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-1 sm:-translate-x-3',
//           'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full',
//           'border-2 border-[#0A2240]/15 bg-[#f0f2f6]/95 backdrop-blur-md',
//           'text-[#0A2240] shadow-[0_8px_24px_rgba(10,34,64,0.18)]',
//           'transition-all duration-300 hover:border-[#FF6600] hover:text-[#FF6600] hover:scale-105',
//           'disabled:opacity-0 disabled:pointer-events-none disabled:scale-90',
//           'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6600]/40'
//         )}
//       >
//         <ChevronLeft className="w-5 h-5" />
//       </button>

//       <button
//         type="button"
//         aria-label="Défiler vers la droite"
//         disabled={!canRight}
//         onClick={() => scrollByDir(1)}
//         className={cn(
//           'absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1 sm:translate-x-3',
//           'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full',
//           'border-2 border-[#0A2240]/15 bg-[#f0f2f6]/95 backdrop-blur-md',
//           'text-[#0A2240] shadow-[0_8px_24px_rgba(10,34,64,0.18)]',
//           'transition-all duration-300 hover:border-[#FF6600] hover:text-[#FF6600] hover:scale-105',
//           'disabled:opacity-0 disabled:pointer-events-none disabled:scale-90',
//           'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6600]/40'
//         )}
//       >
//         <ChevronRight className="w-5 h-5" />
//       </button>

//       {/* Dégradés latéraux */}
//       <div
//         className={cn(
//           'pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 z-10 bg-gradient-to-r from-[#f8f9fb] to-transparent transition-opacity duration-300',
//           canLeft ? 'opacity-100' : 'opacity-0'
//         )}
//       />
//       <div
//         className={cn(
//           'pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 z-10 bg-gradient-to-l from-[#f8f9fb] to-transparent transition-opacity duration-300',
//           canRight ? 'opacity-100' : 'opacity-0'
//         )}
//       />

//       <div
//         ref={scrollerRef}
//         onMouseEnter={() => (pausedRef.current = true)}
//         onMouseLeave={() => (pausedRef.current = false)}
//         className="flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 pt-1 px-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//       >
//         {children}
//       </div>
//     </div>
//   );
// }


import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCarouselProps {
  children: ReactNode;
  className?: string;
  autoplay?: boolean;
}

/** Bandeau horizontal avec flèches élégantes (mobile + desktop) */
export function ServiceCarousel({ children, className, autoplay = true }: ServiceCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const resetTimeoutRef = useRef<number | null>(null);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    const onScroll = () => updateEdges();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, children]);

  // Autoplay discret et lent
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !autoplay) return;

    const step = () => {
      if (pausedRef.current) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return;
      const amount = Math.max(el.clientWidth * 0.9, 240);
      const willReachEnd = el.scrollLeft + amount >= max - 2;

      if (!willReachEnd) {
        el.scrollBy({ left: amount, behavior: 'smooth' });
        return;
      }

      el.scrollTo({ left: max, behavior: 'smooth' });
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = window.setTimeout(() => {
        el.scrollTo({ left: 0, behavior: 'auto' });
        const newMax = el.scrollWidth - el.clientWidth;
        if (newMax > 4 && !pausedRef.current) {
          autoplayRef.current = window.setInterval(step, 8000);
        }
        resetTimeoutRef.current = null;
      }, 3000) as unknown as number;
    };

    const initialMax = el.scrollWidth - el.clientWidth;
    if (initialMax > 4) {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
      autoplayRef.current = window.setInterval(step, 8000);
    }

    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    };
  }, [autoplay, children]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.9, 240);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const arrowClasses = cn(
    'absolute top-1/2 z-20 -translate-y-1/2',
    'flex h-10 w-10 items-center justify-center rounded-full',
    'bg-background/80 backdrop-blur-md',
    'border border-border/60',
    'text-foreground/80',
    'shadow-[0_4px_16px_rgba(10,34,64,0.10)]',
    'transition-all duration-300 ease-out',
    'hover:bg-background hover:text-foreground hover:scale-105 hover:border-foreground/20',
    'disabled:opacity-0 disabled:pointer-events-none disabled:scale-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2'
  );

  return (
    <div className={cn('relative group/carousel', className)}>
      {/* Flèche gauche */}
      <button
        type="button"
        aria-label="Défiler vers la gauche"
        disabled={!canLeft}
        onClick={() => scrollByDir(-1)}
        className={cn(arrowClasses, 'left-0 -translate-x-1 sm:-translate-x-3')}
      >
        <ChevronLeft className="w-4.5 h-4.5" strokeWidth={1.75} />
      </button>

      {/* Flèche droite */}
      <button
        type="button"
        aria-label="Défiler vers la droite"
        disabled={!canRight}
        onClick={() => scrollByDir(1)}
        className={cn(arrowClasses, 'right-0 translate-x-1 sm:translate-x-3')}
      >
        <ChevronRight className="w-4.5 h-4.5" strokeWidth={1.75} />
      </button>

      {/* Dégradés latéraux très subtils (indication de scroll) */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-10 z-10',
          'bg-gradient-to-r from-background via-background/60 to-transparent',
          'transition-opacity duration-500',
          canLeft ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 z-10',
          'bg-gradient-to-l from-background via-background/60 to-transparent',
          'transition-opacity duration-500',
          canRight ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        ref={scrollerRef}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        className={cn(
          'flex gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory',
          'pb-3 pt-1 px-1',
          'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
      >
        {children}
      </div>
    </div>
  );
}