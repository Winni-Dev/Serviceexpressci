import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { RequestModalProvider } from '@/contexts/request-modal-context';
import { BrandLogo } from '@/components/shared/brand-logo';
import { getUrgencyWhatsAppLink } from '@/lib/utils';

const urgencyLink = getUrgencyWhatsAppLink();

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Nos Services' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <RequestModalProvider>
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <header className="sticky top-0 z-50 bg-[#0A2240]/95 backdrop-blur-md text-white border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <BrandLogo to="/" textClassName="text-white text-base" size="sm" />

              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-sm font-medium text-white/80 hover:text-[#FF6600] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button size="sm" className="rounded-xl bg-[#FF6600] hover:bg-[#e55a00]" asChild>
                  <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    Urgence
                  </a>
                </Button>
              </nav>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {isMenuOpen && (
              <div className="md:hidden pb-4 border-t border-white/10 pt-4">
                <nav className="flex flex-col gap-3">
                  {navLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-white/80 hover:text-[#FF6600] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button size="sm" className="w-full rounded-xl bg-[#FF6600] hover:bg-[#e55a00]" asChild>
                    <a href={urgencyLink} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4 mr-2" />
                      Urgence WhatsApp
                    </a>
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-[#0A2240] text-white py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <BrandLogo textClassName="text-white text-base" size="sm" />
                <p className="text-white/60 text-sm leading-relaxed mt-3">
                  Votre solution de services à domicile en Côte d'Ivoire.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Liens rapides</h4>
                <ul className="space-y-2 text-sm">
                  {navLinks.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-white/60 hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Contact</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>Abidjan, Côte d'Ivoire</li>
                  <li>+225 01 23 45 67 89</li>
                  <li>contact@serviceexpress.ci</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-sm">
              <p>&copy; {new Date().getFullYear()} Service Express CI. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </RequestModalProvider>
  );
}
