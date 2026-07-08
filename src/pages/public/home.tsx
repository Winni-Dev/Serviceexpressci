
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Shield, Clock, Star, ChevronRight, CheckCircle } from 'lucide-react';
// import { motion, useInView } from 'framer-motion';
// import { useEffect, useRef, useState } from 'react';
// import { ServiceList } from '@/components/public/service-list';
// import { useRequestModal } from '@/contexts/request-modal-context';
// import IMGACC from '@/IMAGES/imgacc.png';

// const features = [
//   { icon: Shield, title: 'Artisans vérifiés', description: 'Tous nos artisans sont vérifiés et expérimentés' },
//   { icon: Clock, title: 'Intervention rapide', description: 'Service disponible 24h/24 et 7j/7' },
//   { icon: Star, title: 'Satisfaction garantie', description: 'Travail de qualité ou remboursé' },
// ];

// // Composant de comptage animé
// function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-100px" });

//   useEffect(() => {
//     if (!isInView) return;

//     let startTime: number;
//     let animationFrame: number;

//     const updateCount = (timestamp: number) => {
//       if (!startTime) startTime = timestamp;
//       const progress = Math.min((timestamp - startTime) / duration, 1);
      
//       // Easing function pour une animation plus naturelle
//       const easeOutQuart = 1 - Math.pow(1 - progress, 4);
//       const currentCount = Math.floor(easeOutQuart * end);
      
//       setCount(currentCount);

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(updateCount);
//       }
//     };

//     animationFrame = requestAnimationFrame(updateCount);

//     return () => {
//       if (animationFrame) cancelAnimationFrame(animationFrame);
//     };
//   }, [isInView, end, duration]);

//   const displayValue = end >= 1000 ? `${count}+` : count.toFixed(1);

//   return <span ref={ref}>{isInView ? displayValue : '0'}</span>;
// }

// // Statistiques avec compteurs animés
// const stats = [
//   { value: 500, label: 'Interventions', suffix: '+' },
//   { value: 4.9, label: 'Note moyenne', suffix: '' },
//   { value: 100, label: 'Satisfaction', suffix: '%' },
// ];

// export function HomePage() {
//   const { openRequest } = useRequestModal();

//   return (
//     <div>
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-[#0A2240] via-[#0d2d52] to-[#0A2240] text-white py-12 md:py-20 overflow-hidden">
//         {/* Effets de fond */}
//         <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6600]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6600]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

//         <div className="container mx-auto px-4 relative">
//           <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//             {/* Image - en haut sur mobile, à droite sur desktop */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="order-1 lg:order-2 relative"
//             >
//               <div className="relative max-w-sm md:max-w-md mx-auto lg:mx-0">
//                 {/* Cadre décoratif extérieur */}
//                 <div className="absolute -top-4 -right-4 w-full h-full rounded-[40px] border border-[#FF6600]/20" />
//                 <div className="absolute -bottom-4 -left-4 w-full h-full rounded-[40px] border border-[#FF6600]/10" />

//                 {/* Conteneur image avec bordure */}
//                 <div className="relative rounded-[40px] overflow-hidden shadow-2xl shadow-[#FF6600]/15">
//                   {/* Bordure dégradée - côté droit */}
//                   <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#FF6600] via-[#FF6600]/60 to-transparent z-10" />
                  
//                   {/* Bordure supérieure */}
//                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6600] to-[#FF6600]/30 z-10" />

//                   {/* Coins décoratifs */}
//                   <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#FF6600]/30 rounded-bl-[40px] z-10" />
//                   <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#FF6600]/30 rounded-tr-[40px] z-10" />

//                   {/* Overlay subtil */}
//                   <div className="absolute inset-0 bg-gradient-to-tr from-[#0A2240]/5 via-transparent to-[#FF6600]/5 z-10" />

//                   {/* Image */}
//                   <img 
//                     src={IMGACC} 
//                     alt="Service Express CI" 
//                     className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
//                   />

//                   {/* Badge flottant */}
//                   <motion.div 
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.6 }}
//                     className="absolute bottom-4 right-4 bg-[#0A2240]/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#FF6600]/30 z-20 flex items-center gap-2"
//                   >
//                     <div className="w-8 h-8 bg-[#FF6600] rounded-lg flex items-center justify-center">
//                       <Clock className="w-4 h-4 text-white" />
//                     </div>
//                     <div>
//                       <p className="text-xs font-semibold">Intervention express</p>
//                       <p className="text-[10px] text-white/60">En moins de 24h</p>
//                     </div>
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Texte - en bas sur mobile, à gauche sur desktop */}
//             <motion.div 
//               initial={{ opacity: 0, x: -30 }} 
//               animate={{ opacity: 1, x: 0 }} 
//               transition={{ duration: 0.6 }}
//               className="order-2 lg:order-1"
//             >
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="inline-flex items-center gap-2 bg-[#FF6600]/20 text-[#FF6600] px-3 py-1.5 rounded-full text-xs font-medium mb-5"
//               >
//                 <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-pulse" />
//                 Service disponible 24h/24
//               </motion.div>

//               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//                 Services à domicile{' '}
//                 <span className="text-[#FF6600] relative inline-block">
//                   rapides et fiables
//                   {/* Soulignement courbé */}
//                   <svg 
//                     className="absolute -bottom-2 left-0 w-full" 
//                     height="10" 
//                     viewBox="0 0 300 10" 
//                     fill="none"
//                   >
//                     <path 
//                       d="M2 7.5C75 2.5 150 2.5 298 7.5" 
//                       stroke="#FF6600" 
//                       strokeWidth="3" 
//                       strokeLinecap="round"
//                       strokeDasharray="300"
//                       strokeDashoffset="300"
//                     >
//                       <animate 
//                         attributeName="stroke-dashoffset" 
//                         from="300" 
//                         to="0" 
//                         dur="1.5s" 
//                         fill="freeze"
//                       />
//                     </path>
//                   </svg>
//                 </span>
//               </h1>

//               <p className="text-base text-white/70 mb-6 max-w-lg">
//                 Trouvez un artisan qualifié près de chez vous en Côte d'Ivoire.
//                 Service express, rapide et efficace.
//               </p>

//               <div className="flex flex-wrap gap-3">
//                 <Button 
//                   size="default" 
//                   className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00] shadow-lg shadow-[#FF6600]/25 hover:shadow-[#FF6600]/40 transition-all duration-300 group"
//                   onClick={() => openRequest()}
//                 >
//                   Faire une demande
//                   <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
//                 </Button>
//                 <Button
//                   size="default"
//                   variant="outline"
//                   className="rounded-xl bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
//                   asChild
//                 >
//                   <Link to="/services">Nos services</Link>
//                 </Button>
//               </div>

//               {/* Statistiques avec compteurs animés */}
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="flex gap-8 mt-8 pt-6 border-t border-white/10"
//               >
//                 {stats.map((stat, index) => (
//                   <div key={index}>
//                     <span className="text-xl font-bold text-[#FF6600]">
//                       <AnimatedCounter end={stat.value} duration={2000} />
//                       {stat.suffix}
//                     </span>
//                     <p className="text-xs text-white/50">{stat.label}</p>
//                   </div>
//                 ))}
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Section Nos services */}
//       <section className="py-16 md:py-20 bg-[#f8f9fb]">
//         <div className="container mx-auto px-4">
//           <motion.div 
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-10"
//           >
//             <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">Nos prestations</span>
//             <h2 className="text-2xl md:text-3xl font-bold text-[#0A2240] mt-1 mb-2">Nos services</h2>
//             <div className="w-12 h-0.5 bg-[#FF6600] mx-auto rounded-full" />
//             <p className="text-gray-500 text-sm max-w-xl mx-auto mt-3">
//               Choisissez un service et commandez en quelques clics
//             </p>
//           </motion.div>
//           <ServiceList limit={6} showSearch showVoirPlus variant="compact" />
//         </div>
//       </section>

//       {/* Section Pourquoi nous choisir */}
//       <section className="py-16 md:py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <motion.div 
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-10"
//           >
//             <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">Nos atouts</span>
//             <h2 className="text-2xl md:text-3xl font-bold text-[#0A2240] mt-1 mb-2">Pourquoi nous choisir ?</h2>
//             <div className="w-12 h-0.5 bg-[#FF6600] mx-auto rounded-full" />
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-6">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={feature.title}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="group text-center rounded-2xl bg-[#f8f9fb] p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
//               >
//                 <div className="w-14 h-14 bg-[#FF6600]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#FF6600]/20 transition-all duration-300">
//                   <feature.icon className="w-7 h-7 text-[#FF6600]" />
//                 </div>
//                 <h3 className="font-semibold text-lg text-[#0A2240] mb-1">{feature.title}</h3>
//                 <p className="text-gray-500 text-sm">{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Section CTA */}
//       <section className="relative bg-gradient-to-r from-[#FF6600] to-[#e55a00] text-white py-12 overflow-hidden">
//         <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
//         <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
//         <div className="container mx-auto px-4 text-center relative">
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <h2 className="text-2xl md:text-3xl font-bold mb-2">Besoin d'un service urgent ?</h2>
//             <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm">
//               Contactez-nous maintenant et obtenez une intervention rapide
//             </p>
//             <Button
//               size="default"
//               className="rounded-xl bg-white text-[#FF6600] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
//               asChild
//             >
//               <Link to="/contact">
//                 Nous contacter
//                 <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </Button>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Star, ChevronRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ServiceList } from '@/components/public/service-list';
import { useRequestModal } from '@/contexts/request-modal-context';
import IMGACC from '@/IMAGES/imgacc.png';

const features = [
  { icon: Shield, title: 'Artisans vérifiés', description: 'Tous nos artisans sont vérifiés et expérimentés' },
  { icon: Clock, title: 'Intervention rapide', description: 'Service disponible 24h/24 et 7j/7' },
  { icon: Star, title: 'Satisfaction garantie', description: 'Travail de qualité ou remboursé' },
];

// Composant de comptage animé - avec option pour désactiver l'animation
function AnimatedCounter({ end, duration = 2000, animate = true }: { end: number; duration?: number; animate?: boolean }) {
  const [count, setCount] = useState(animate ? 0 : end);
  const [hasAnimated, setHasAnimated] = useState(!animate);
  const ref = useRef<HTMLSpanElement>(null);
  
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-50px"
  });

  useEffect(() => {
    // Si l'animation est désactivée, afficher directement la valeur finale
    if (!animate) {
      setCount(end);
      setHasAnimated(true);
      return;
    }

    if (!isInView || hasAnimated) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setHasAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, end, duration, hasAnimated, animate]);

  // Fallback pour les compteurs animés
  useEffect(() => {
    if (animate && isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        if (count === 0 && end > 0) {
          setCount(end);
          setHasAnimated(true);
        }
      }, duration + 500);
      return () => clearTimeout(timer);
    }
  }, [isInView, end, duration, hasAnimated, count, animate]);

  // Affichage correct des valeurs
  let displayValue = '0';
  if ((isInView || hasAnimated || count > 0) || !animate) {
    if (end === 4.9) {
      displayValue = count.toFixed(1);
    } else if (Number.isInteger(end)) {
      displayValue = `${count}+`;
    } else {
      displayValue = count.toFixed(1);
    }
  }

  return <span ref={ref}>{displayValue}</span>;
}

// Statistiques avec compteurs animés
const stats = [
  { value: 500, label: 'Interventions', animate: false }, // Pas d'animation pour les interventions
  { value: 4.9, label: 'Note moyenne', animate: true },
  { value: 100, label: 'Satisfaction', animate: true },
];

export function HomePage() {
  const { openRequest } = useRequestModal();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0A2240] via-[#0d2d52] to-[#0A2240] text-white py-12 md:py-20 overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6600]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6600]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image - en haut sur mobile, à droite sur desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative max-w-sm md:max-w-md mx-auto lg:mx-0">
                {/* Cadre décoratif extérieur */}
                <div className="absolute -top-4 -right-4 w-full h-full rounded-[40px] border border-[#FF6600]/20" />
                <div className="absolute -bottom-4 -left-4 w-full h-full rounded-[40px] border border-[#FF6600]/10" />

                {/* Conteneur image avec bordure */}
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl shadow-[#FF6600]/15">
                  {/* Bordure dégradée - côté droit */}
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#FF6600] via-[#FF6600]/60 to-transparent z-10" />
                  
                  {/* Bordure supérieure */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6600] to-[#FF6600]/30 z-10" />

                  {/* Coins décoratifs */}
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#FF6600]/30 rounded-bl-[40px] z-10" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#FF6600]/30 rounded-tr-[40px] z-10" />

                  {/* Overlay subtil */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0A2240]/5 via-transparent to-[#FF6600]/5 z-10" />

                  {/* Image */}
                  <img 
                    src={IMGACC} 
                    alt="Service Express CI" 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                  />

                  {/* Badge flottant */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-4 right-4 bg-[#0A2240]/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#FF6600]/30 z-20 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-[#FF6600] rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Intervention express</p>
                      <p className="text-[10px] text-white/60">En moins de 24h</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Texte - en bas sur mobile, à gauche sur desktop */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-[#FF6600]/20 text-[#FF6600] px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              >
                <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-pulse" />
                Service disponible 24h/24
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Services à domicile{' '}
                <span className="text-[#FF6600] relative inline-block">
                  rapides et fiables
                  {/* Soulignement courbé */}
                  <svg 
                    className="absolute -bottom-2 left-0 w-full" 
                    height="10" 
                    viewBox="0 0 300 10" 
                    fill="none"
                  >
                    <path 
                      d="M2 7.5C75 2.5 150 2.5 298 7.5" 
                      stroke="#FF6600" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                    >
                      <animate 
                        attributeName="stroke-dashoffset" 
                        from="300" 
                        to="0" 
                        dur="1.5s" 
                        fill="freeze"
                      />
                    </path>
                  </svg>
                </span>
              </h1>

              <p className="text-base text-white/70 mb-6 max-w-lg">
                Trouvez un artisan qualifié près de chez vous en Côte d'Ivoire.
                Service express, rapide et efficace.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  size="default" 
                  className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00] shadow-lg shadow-[#FF6600]/25 hover:shadow-[#FF6600]/40 transition-all duration-300 group"
                  onClick={() => openRequest()}
                >
                  Faire une demande
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  className="rounded-xl bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  asChild
                >
                  <Link to="/services">Nos services</Link>
                </Button>
              </div>

              {/* Statistiques avec compteurs animés */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-8 mt-8 pt-6 border-t border-white/10"
              >
                {stats.map((stat, index) => {
                  let suffix = '';
                  if (stat.value === 500) suffix = '+';
                  if (stat.value === 100) suffix = '%';
                  if (stat.value === 4.9) suffix = '';
                  
                  return (
                    <div key={index}>
                      <span className="text-xl font-bold text-[#FF6600]">
                        <AnimatedCounter 
                          end={stat.value} 
                          duration={2000} 
                          animate={stat.animate !== undefined ? stat.animate : true}
                        />
                        {suffix}
                      </span>
                      <p className="text-xs text-white/50">{stat.label}</p>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Nos services */}
      <section className="py-16 md:py-20 bg-[#f8f9fb]">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">Nos prestations</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2240] mt-1 mb-2">Nos services</h2>
            <div className="w-12 h-0.5 bg-[#FF6600] mx-auto rounded-full" />
            <p className="text-gray-500 text-sm max-w-xl mx-auto mt-3">
              Choisissez un service et commandez en quelques clics
            </p>
          </motion.div>
          <ServiceList limit={6} showSearch showVoirPlus variant="compact" />
        </div>
      </section>

      {/* Section Pourquoi nous choisir */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="text-[#FF6600] font-semibold text-xs uppercase tracking-wider">Nos atouts</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2240] mt-1 mb-2">Pourquoi nous choisir ?</h2>
            <div className="w-12 h-0.5 bg-[#FF6600] mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group text-center rounded-2xl bg-[#f8f9fb] p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#FF6600]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#FF6600]/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-[#FF6600]" />
                </div>
                <h3 className="font-semibold text-lg text-[#0A2240] mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="relative bg-gradient-to-r from-[#FF6600] to-[#e55a00] text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Besoin d'un service urgent ?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm">
              Contactez-nous maintenant et obtenez une intervention rapide
            </p>
            <Button
              size="default"
              className="rounded-xl bg-white text-[#FF6600] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <Link to="/contact">
                Nous contacter
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}