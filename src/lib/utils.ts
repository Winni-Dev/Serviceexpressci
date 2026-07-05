// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getAvatarUrl(gender: string) {
  return gender === 'male' 
    ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=male'
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=female';
}

export function generateWhatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('225') ? digits : `225${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URGENCY_PHONE = '0123456789';

export function getUrgencyWhatsAppLink() {
  return generateWhatsAppLink(
    WHATSAPP_URGENCY_PHONE,
    "Bonjour, j'ai besoin d'une intervention urgente via Service Express CI."
  );
}