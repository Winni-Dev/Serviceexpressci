import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';

export function ContactPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#0A2240] to-[#0d2d52] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Contactez-nous</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Phone, title: 'Téléphone', value: '+225 01 23 45 67 89' },
              { icon: Mail, title: 'Email', value: 'contact@serviceexpress.ci' },
              { icon: MapPin, title: 'Adresse', value: "Abidjan, Côte d'Ivoire" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[#FF6600]" />
                </div>
                <h2 className="font-semibold text-[#0A2240] mb-1">{item.title}</h2>
                <p className="text-gray-500 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="rounded-xl" asChild>
              <a href="tel:+2250123456789">
                <Phone className="w-4 h-4 mr-2" />
                Appeler maintenant
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
