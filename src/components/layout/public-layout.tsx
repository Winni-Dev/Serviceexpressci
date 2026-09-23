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

const urgencyLink = getSafeUrl(getUrgencyWhatsAppLink(), 'https://wa.me/2250123456789');

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
        <Button
          size="sm"
          className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]"
          onClick={() => navigate(spaceLink)}
        >
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
        <Button
          size="sm"
          className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]"
          onClick={() => navigate('/inscription')}
        >
          S'inscrire
        </Button>
      </div>
    );

  return (
    <RequestModalProvider>
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <header
          className={`sticky top-0 z-50 transition-all duration-300 text-white border-b border-white/10 ${
            scrolled
              ? 'bg-[#0A2240]/95 backdrop-blur-xl shadow-lg shadow-[#0A2240]/20'
              : 'bg-[#0A2240]'
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
                          ? 'text-[#FF6600] bg-[#FF6600]/10'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
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
                  className="rounded-xl bg-gradient-to-r from-[#FF6600] to-[#e55a00] ml-2"
                  asChild
                >
                  <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    Urgence
                  </a>
                </Button>
              </nav>

              <button
                className="md:hidden p-2 rounded-xl hover:bg-white/10"
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
                  className="md:hidden overflow-hidden border-t border-white/10"
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
                            isActive ? 'bg-[#FF6600]/10 text-[#FF6600]' : 'text-white/70'
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
                      <Button className="w-full rounded-xl bg-[#FF6600]" asChild>
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

        <footer className="bg-[#0A2240] text-white py-12 mt-auto border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <BrandLogo textClassName="text-white text-base" size="sm" />
                <p className="text-white/50 text-sm mt-3">
                  Votre solution de services à domicile en Côte d'Ivoire.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 md:justify-end text-sm text-white/50">
                {navLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="hover:text-[#FF6600]">
                    {item.label}
                  </Link>
                ))}
                <Link to="/inscription" className="hover:text-[#FF6600]">
                  S'inscrire
                </Link>
                <a href={urgencyLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600]">
                  Urgence
                </a>
              </div>
            </div>
            <div className="border-t border-white/5 mt-10 pt-6 text-center text-white/30 text-sm">
              &copy; {new Date().getFullYear()} Service Express CI. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </RequestModalProvider>
  );
}
