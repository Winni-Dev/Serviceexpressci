import { icons, Wrench, type LucideIcon } from 'lucide-react';

export interface ServiceIconEntry {
  key: string;
  label: string;
  category: string;
}

export const SERVICE_ICON_CATEGORIES = [
  'Réparation',
  'Plomberie',
  'Électricité',
  'Peinture',
  'Climatisation',
  'Ménage',
  'Jardin',
  'Transport',
  'Sécurité',
  'Santé',
  'Technologie',
  'Cuisine',
  'Maison',
] as const;

export const SERVICE_ICON_CATALOG: ServiceIconEntry[] = [
  { key: 'Wrench', label: 'Clé à molette', category: 'Réparation' },
  { key: 'Hammer', label: 'Marteau', category: 'Réparation' },
  { key: 'Drill', label: 'Perceuse', category: 'Réparation' },
  { key: 'HardHat', label: 'Chantier', category: 'Réparation' },
  { key: 'Construction', label: 'Construction', category: 'Réparation' },
  { key: 'Axe', label: 'Menuiserie', category: 'Réparation' },
  { key: 'Settings', label: 'Réglage', category: 'Réparation' },

  { key: 'Droplets', label: 'Eau', category: 'Plomberie' },
  { key: 'ShowerHead', label: 'Douche', category: 'Plomberie' },
  { key: 'Pipette', label: 'Tuyauterie', category: 'Plomberie' },
  { key: 'Bath', label: 'Salle de bain', category: 'Plomberie' },
  { key: 'Waves', label: 'Canalisation', category: 'Plomberie' },

  { key: 'Zap', label: 'Éclair', category: 'Électricité' },
  { key: 'Plug', label: 'Prise', category: 'Électricité' },
  { key: 'PlugZap', label: 'Dépannage électrique', category: 'Électricité' },
  { key: 'Lightbulb', label: 'Ampoule', category: 'Électricité' },
  { key: 'Cable', label: 'Câblage', category: 'Électricité' },
  { key: 'Lamp', label: 'Lampe', category: 'Électricité' },
  { key: 'LampDesk', label: 'Éclairage bureau', category: 'Électricité' },

  { key: 'Paintbrush', label: 'Pinceau', category: 'Peinture' },
  { key: 'PaintBucket', label: 'Peinture', category: 'Peinture' },
  { key: 'Brush', label: 'Brossage', category: 'Peinture' },
  { key: 'Palette', label: 'Palette', category: 'Peinture' },

  { key: 'Wind', label: 'Ventilation', category: 'Climatisation' },
  { key: 'AirVent', label: 'Climatisation', category: 'Climatisation' },
  { key: 'Fan', label: 'Ventilateur', category: 'Climatisation' },
  { key: 'Thermometer', label: 'Température', category: 'Climatisation' },
  { key: 'Snowflake', label: 'Froid', category: 'Climatisation' },
  { key: 'Heater', label: 'Chauffage', category: 'Climatisation' },

  { key: 'Sparkles', label: 'Nettoyage', category: 'Ménage' },
  { key: 'SprayCan', label: 'Désinfection', category: 'Ménage' },
  { key: 'Trash2', label: 'Déchets', category: 'Ménage' },
  { key: 'Shirt', label: 'Linge', category: 'Ménage' },
  { key: 'WashingMachine', label: 'Lessive', category: 'Ménage' },

  { key: 'TreePine', label: 'Arbre', category: 'Jardin' },
  { key: 'Flower2', label: 'Fleurs', category: 'Jardin' },
  { key: 'Leaf', label: 'Végétal', category: 'Jardin' },
  { key: 'Shovel', label: 'Jardinage', category: 'Jardin' },
  { key: 'Fence', label: 'Clôture', category: 'Jardin' },

  { key: 'Truck', label: 'Camion', category: 'Transport' },
  { key: 'Car', label: 'Voiture', category: 'Transport' },
  { key: 'Package', label: 'Colis', category: 'Transport' },
  { key: 'Warehouse', label: 'Déménagement', category: 'Transport' },

  { key: 'Lock', label: 'Serrure', category: 'Sécurité' },
  { key: 'Key', label: 'Clé', category: 'Sécurité' },
  { key: 'Shield', label: 'Protection', category: 'Sécurité' },
  { key: 'Camera', label: 'Surveillance', category: 'Sécurité' },
  { key: 'UserCheck', label: 'Gardiennage', category: 'Sécurité' },

  { key: 'Heart', label: 'Soins', category: 'Santé' },
  { key: 'Stethoscope', label: 'Médical', category: 'Santé' },
  { key: 'Baby', label: 'Puériculture', category: 'Santé' },
  { key: 'Dog', label: 'Animaux', category: 'Santé' },
  { key: 'Cat', label: 'Toilettage', category: 'Santé' },

  { key: 'Laptop', label: 'Ordinateur', category: 'Technologie' },
  { key: 'Monitor', label: 'Écran', category: 'Technologie' },
  { key: 'Smartphone', label: 'Mobile', category: 'Technologie' },
  { key: 'Wifi', label: 'Réseau', category: 'Technologie' },

  { key: 'UtensilsCrossed', label: 'Repas', category: 'Cuisine' },
  { key: 'ChefHat', label: 'Chef', category: 'Cuisine' },
  { key: 'CookingPot', label: 'Cuisine', category: 'Cuisine' },
  { key: 'Microwave', label: 'Électroménager', category: 'Cuisine' },
  { key: 'Refrigerator', label: 'Frigo', category: 'Cuisine' },

  { key: 'Home', label: 'Maison', category: 'Maison' },
  { key: 'Building', label: 'Immeuble', category: 'Maison' },
  { key: 'DoorOpen', label: 'Porte', category: 'Maison' },
  { key: 'Bed', label: 'Chambre', category: 'Maison' },
  { key: 'Sofa', label: 'Salon', category: 'Maison' },
  { key: 'Scissors', label: 'Couture', category: 'Maison' },
  { key: 'Store', label: 'Commerce', category: 'Maison' },
  { key: 'Bug', label: 'Désinsectisation', category: 'Maison' },
  { key: 'Flame', label: 'Gaz', category: 'Maison' },
];

const CATEGORY_COLOR_MAP: Record<string, string> = {
  Réparation: 'text-blue-500',
  Plomberie: 'text-cyan-500',
  Électricité: 'text-yellow-500',
  Peinture: 'text-green-500',
  Climatisation: 'text-sky-500',
  Ménage: 'text-violet-500',
  Jardin: 'text-emerald-500',
  Transport: 'text-orange-500',
  Sécurité: 'text-red-500',
  Santé: 'text-pink-500',
  Technologie: 'text-indigo-500',
  Cuisine: 'text-amber-500',
  Maison: 'text-[#FF6600]',
};

const SERVICE_DESCRIPTION_MAP: Record<string, string> = {
  Plomberie: 'Réparation de fuites, installation de sanitaires, débouchage et entretien.',
  Électricité: 'Dépannage électrique, installation de prises et mise aux normes.',
  Peinture: 'Peinture intérieure et extérieure, finitions et rénovation.',
  Climatisation: 'Installation, entretien et réparation de climatiseurs.',
};

export function getServiceIcon(iconName: string): LucideIcon {
  return icons[iconName as keyof typeof icons] ?? Wrench;
}

export function getServiceColor(iconName: string): string {
  const entry = SERVICE_ICON_CATALOG.find((i) => i.key === iconName);
  if (entry) return CATEGORY_COLOR_MAP[entry.category] ?? 'text-[#FF6600]';
  return 'text-[#FF6600]';
}

export function getServiceDescription(name: string): string {
  return (
    SERVICE_DESCRIPTION_MAP[name] ??
    `Intervention professionnelle en ${name.toLowerCase()} à domicile.`
  );
}

export const AVAILABLE_SERVICE_ICONS = SERVICE_ICON_CATALOG.map((i) => i.key);
