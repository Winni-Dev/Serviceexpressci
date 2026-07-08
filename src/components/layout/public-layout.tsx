// import { Link, Outlet } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Phone, Menu, X } from 'lucide-react';
// import { useState } from 'react';
// import { RequestModalProvider } from '@/contexts/request-modal-context';
// import { BrandLogo } from '@/components/shared/brand-logo';
// import { getUrgencyWhatsAppLink } from '@/lib/utils';

// const urgencyLink = getUrgencyWhatsAppLink();

// const navLinks = [
//   { to: '/', label: 'Accueil' },
//   { to: '/services', label: 'Nos Services' },
//   { to: '/contact', label: 'Contact' },
// ];

// export function PublicLayout() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <RequestModalProvider>
//       <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
//         <header className="sticky top-0 z-50 bg-[#0A2240]/95 backdrop-blur-md text-white border-b border-white/10">
//           <div className="container mx-auto px-4">
//             <div className="flex items-center justify-between h-16">
//               <BrandLogo to="/" textClassName="text-white text-base" size="sm" />

//               <nav className="hidden md:flex items-center gap-8">
//                 {navLinks.map((item) => (
//                   <Link
//                     key={item.to}
//                     to={item.to}
//                     className="text-sm font-medium text-white/80 hover:text-[#FF6600] transition-colors"
//                   >
//                     {item.label}
//                   </Link>
//                 ))}
//                 <Button size="sm" className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]" asChild>
//                   <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
//                     <Phone className="w-4 h-4 mr-2" />
//                     Urgence
//                   </a>
//                 </Button>
//               </nav>

//               <button
//                 className="md:hidden p-2 rounded-lg hover:bg-white/10"
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 aria-label="Menu"
//               >
//                 {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </button>
//             </div>

//             {isMenuOpen && (
//               <div className="md:hidden pb-4 border-t border-white/10 pt-4">
//                 <nav className="flex flex-col gap-3">
//                   {navLinks.map((item) => (
//                     <Link
//                       key={item.to}
//                       to={item.to}
//                       className="text-white/80 hover:text-[#FF6600] transition-colors"
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       {item.label}
//                     </Link>
//                   ))}
//                   <Button size="sm" className="w-full rounded-xl bg-[#FF6600] hover:bg-[#e55a00]" asChild>
//                     <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
//                       <Phone className="w-4 h-4 mr-2" />
//                       Urgence WhatsApp
//                     </a>
//                   </Button>
//                 </nav>
//               </div>
//             )}
//           </div>
//         </header>

//         <main className="flex-1">
//           <Outlet />
//         </main>

//         <footer className="bg-[#0A2240] text-white py-12 mt-auto">
//           <div className="container mx-auto px-4">
//             <div className="grid md:grid-cols-3 gap-8">
//               <div>
//                 <BrandLogo textClassName="text-white text-base" size="sm" />
//                 <p className="text-white/60 text-sm leading-relaxed mt-3">
//                   Votre solution de services à domicile en Côte d'Ivoire.
//                 </p>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-3 text-sm">Liens rapides</h4>
//                 <ul className="space-y-2 text-sm">
//                   {navLinks.map((item) => (
//                     <li key={item.to}>
//                       <Link to={item.to} className="text-white/60 hover:text-white transition-colors">
//                         {item.label}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-3 text-sm">Contact</h4>
//                 <ul className="space-y-2 text-sm text-white/60">
//                   <li>Abidjan, Côte d'Ivoire</li>
//                   <li>+225 01 23 45 67 89</li>
//                   <li>contact@serviceexpress.ci</li>
//                 </ul>
//               </div>
//             </div>
//             <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-sm">
//               <p>&copy; {new Date().getFullYear()} Service Express CI. Tous droits réservés.</p>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </RequestModalProvider>
//   );
// }


import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Menu, X, Home, Briefcase, Mail, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RequestModalProvider } from '@/contexts/request-modal-context';
import { BrandLogo } from '@/components/shared/brand-logo';
import { getUrgencyWhatsAppLink } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const urgencyLink = getUrgencyWhatsAppLink();

const navLinks = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/services', label: 'Nos Services', icon: Briefcase },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Animation du menu mobile
  const menuVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      y: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      y: -20,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 }
    })
  };

  return (
    <RequestModalProvider>
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <header 
          className={`
            sticky top-0 z-50 transition-all duration-300
            ${scrolled 
              ? 'bg-[#0A2240]/95 backdrop-blur-xl shadow-lg shadow-[#0A2240]/20' 
              : 'bg-[#0A2240]'
            }
            text-white border-b border-white/10
          `}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo avec animation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <BrandLogo to="/" textClassName="text-white text-base md:text-lg" size="sm" />
              </motion.div>

              {/* Navigation desktop */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item, index) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.to}
                        className={`
                          relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                          flex items-center gap-2
                          ${isActive 
                            ? 'text-[#FF6600] bg-[#FF6600]/10' 
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                        
                        {/* Indicateur de page active */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#FF6600] rounded-full"
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Bouton Urgence avec animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-gradient-to-r from-[#FF6600] to-[#e55a00] hover:shadow-lg hover:shadow-[#FF6600]/30 transition-all duration-300 ml-2"
                    asChild
                  >
                    <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4 mr-2" />
                      Urgence
                      {/* <Sparkles className="w-3 h-3 ml-1" /> */}
                    </a>
                  </Button>
                </motion.div>
              </nav>

              {/* Bouton menu mobile */}
              <motion.button
                className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors relative"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Menu mobile */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="md:hidden overflow-hidden border-t border-white/10"
                >
                  <nav className="py-4 space-y-1">
                    {navLinks.map((item, index) => {
                      const isActive = location.pathname === item.to;
                      const Icon = item.icon;
                      
                      return (
                        <motion.div
                          key={item.to}
                          custom={index}
                          variants={linkVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link
                            to={item.to}
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                              ${isActive 
                                ? 'bg-[#FF6600]/10 text-[#FF6600]' 
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeMobile"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6600]"
                              />
                            )}
                            <ChevronRight className={`
                              w-4 h-4 ml-auto transition-transform
                              ${isActive ? 'text-[#FF6600]' : 'text-white/30'}
                            `} />
                          </Link>
                        </motion.div>
                      );
                    })}
                    
                    <motion.div
                      custom={navLinks.length}
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                      className="pt-2 px-4"
                    >
                      <Button 
                        className="w-full rounded-xl bg-gradient-to-r from-[#FF6600] to-[#e55a00] hover:shadow-lg hover:shadow-[#FF6600]/30 transition-all duration-300"
                        asChild
                      >
                        <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                          <Phone className="w-4 h-4 mr-2" />
                          Urgence WhatsApp
                          {/* <Sparkles className="w-3 h-3 ml-1" /> */}
                        </a>
                      </Button>
                    </motion.div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer modernisé */}
        <footer className="bg-[#0A2240] text-white py-12 mt-auto border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Colonne 1 - Logo et description */}
              <div className="md:col-span-1">
                <BrandLogo textClassName="text-white text-base" size="sm" />
                <p className="text-white/50 text-sm leading-relaxed mt-3">
                  Votre solution de services à domicile en Côte d'Ivoire.
                </p>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF6600] transition-colors flex items-center justify-center">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF6600] transition-colors flex items-center justify-center">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF6600] transition-colors flex items-center justify-center">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>

              {/* Colonne 2 - Liens rapides */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-white/80">Liens rapides</h4>
                <ul className="space-y-2 text-sm">
                  {navLinks.map((item) => (
                    <li key={item.to}>
                      <Link 
                        to={item.to} 
                        className="text-white/50 hover:text-[#FF6600] transition-colors flex items-center gap-1 group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne 3 - Services */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-white/80">Services</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li className="hover:text-white transition-colors cursor-pointer">Plomberie</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Électricité</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Climatisation</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Ménage</li>
                </ul>
              </div>

              {/* Colonne 4 - Contact */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-white/80">Contact</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6600] mt-0.5">📍</span>
                    Abidjan, Côte d'Ivoire
                  </li>
                  <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                    <span className="text-[#FF6600]">📞</span>
                    +225 01 23 45 67 89
                  </li>
                  <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                    <span className="text-[#FF6600]">✉️</span>
                    contact@serviceexpress.ci
                  </li>
                </ul>
              </div>
            </div>

            {/* Séparateur et copyright */}
            <div className="border-t border-white/5 mt-10 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/30 text-sm">
                  &copy; {new Date().getFullYear()} Service Express CI. Tous droits réservés.
                </p>
                <div className="flex gap-6 text-sm text-white/30">
                  <Link to="#" className="hover:text-white/60 transition-colors">Mentions légales</Link>
                  <Link to="#" className="hover:text-white/60 transition-colors">Politique de confidentialité</Link>
                  <Link to="#" className="hover:text-white/60 transition-colors">CGU</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </RequestModalProvider>
  );
}