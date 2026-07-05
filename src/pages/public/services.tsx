import { Link, useSearchParams } from 'react-router-dom';
import { ServiceList } from '@/components/public/service-list';
import { Home, ChevronRight } from 'lucide-react';

export function ServicesPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0A2240] to-[#0d2d52] text-white py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-[#FF6600] transition-colors">
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/90">Nos services</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Nos services</h1>
          <p className="text-white/70 max-w-2xl">
            Sélectionnez un service et commandez directement en ligne
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <ServiceList showSearch variant="full" defaultSearch={query} key={query} />
        </div>
      </section>
    </div>
  );
}
