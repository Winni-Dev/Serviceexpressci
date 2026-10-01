import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Menu, X, Home, Briefcase, ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RequestModalProvider } from '@/contexts/request-modal-context';
import { BrandLogo } from '@/components/shared/brand-logo';
import { getUrgencyWhatsAppLink } from '@/lib/utils';
import { getSafeUrl } from '@/lib/security';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getHomeForRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const urgencyLink = getSafeUrl(getUrgencyWhatsAppLink(), 'https://wa.me/2250143344342');

const navLinks = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/services', label: 'Nos Services', icon: Briefcase },
];

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const spaceLink = profile ? getHomeForRole(profile.role) : '/espace';

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) =>
    session ? (
      <div className={mobile ? 'flex flex-col gap-2' : 'flex items-center gap-2 ml-2'}>
        <Button size="sm" onClick={() => navigate(spaceLink)}>
          <User className="w-4 h-4 mr-1" />
          Mon espace
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/');
          }}
        >
          Déconnexion
        </Button>
      </div>
    ) : (
      <div className={mobile ? 'flex flex-col gap-2' : 'flex items-center gap-2 ml-2'}>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => navigate('/connexion')}
        >
          Connexion
        </Button>
        <Button size="sm" onClick={() => navigate('/inscription')}>
          S'inscrire
        </Button>
      </div>
    );

  return (
    <RequestModalProvider>
      <div className="min-h-screen bg-[#000000] text-white flex flex-col">
        <header
          className={`sticky top-0 z-50 transition-all duration-300 border-b ${
            scrolled
              ? 'bg-[#0A0A0A]/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.32)] border-[#2D2D2D]'
              : 'bg-[#0A0A0A] border-[#1C1C1C]'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              <BrandLogo to="/" textClassName="text-white text-base md:text-lg" size="sm" />

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        isActive
                          ? 'text-[#FEC18A] bg-[#C27D3D]/10 border border-[#C27D3D]/20'
                          : 'text-[#F5F5F5]/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <AuthButtons />
                <Button
                  size="sm"
                  className="ml-2"
                  asChild
                >
                  <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    Urgence
                  </a>
                </Button>
              </nav>

              <button
                className="md:hidden p-2 rounded-xl hover:bg-white/5 border border-[#2D2D2D]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden overflow-hidden border-t border-[#2D2D2D]"
                >
                  <nav className="py-4 space-y-1">
                    {navLinks.map((item) => {
                      const isActive = location.pathname === item.to;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                            isActive ? 'bg-[#C27D3D]/10 text-[#FEC18A]' : 'text-[#F5F5F5]/70'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                          <ChevronRight className="w-4 h-4 ml-auto text-white/30" />
                        </Link>
                      );
                    })}
                    <div className="px-4 pt-2 space-y-2">
                      <AuthButtons mobile />
                      <Button className="w-full" asChild>
                        <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                          <Phone className="w-4 h-4 mr-2" />
                          Urgence WhatsApp
                        </a>
                      </Button>
                    </div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-[#141414] text-white py-12 mt-auto border-t border-[#2D2D2D]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <BrandLogo textClassName="text-white text-base" size="sm" />
                <p className="text-[#A0A0A0] text-sm mt-3">
                  Votre solution de services à domicile en Côte d'Ivoire.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 md:justify-end text-sm text-[#A0A0A0]">
                {navLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="hover:text-[#FEC18A] transition-colors">
                    {item.label}
                  </Link>
                ))}
                <Link to="/inscription" className="hover:text-[#FEC18A] transition-colors">
                  S'inscrire
                </Link>
                <a href={urgencyLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#FEC18A] transition-colors">
                  Urgence
                </a>
              </div>
            </div>
            <div className="border-t border-[#2D2D2D] mt-10 pt-6 text-center text-[#707070] text-sm">
              &copy; {new Date().getFullYear()} Service Express CI. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </RequestModalProvider>
  );
}
