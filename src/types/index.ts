// src/types/index.ts
export type Role =
  | 'super_admin'
  | 'zone_manager'
  | 'accountant'
  | 'client'
  | 'partner'
  | 'worker';

export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'done' | 'cancelled';
export type WorkerStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Profile {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  role: Role;
  zone_id?: string | null;
  created_at: string;
  zones?: { name: string };
}

export interface WorkerRating {
  id: string;
  request_id: string;
  worker_id: string;
  client_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface WorkerRatingStats {
  worker_id: string;
  avg_rating: number;
  rating_count: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  image_url?: string | null;
  description?: string | null;
  category_id?: string | null;
  sort_order: number;
  created_at: string;
  service_categories?: { id: string; name: string } | null;
}

export interface Zone {
  id: string;
  name: string;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  service_id: string;
  zone_id: string;
  gender: Gender;
  photo_url?: string;
  status: WorkerStatus;
  user_id?: string | null;
  partner_id?: string | null;
  created_by?: string;
  created_at: string;
  zones?: { name: string };
  services?: { name: string };
  worker_zones?: { zone_id: string; zones?: { name: string } }[];
}

export interface ZoneManager {
  id: string;
  name: string;
  phone: string;
  email?: string;
  zone_id: string;
  user_id?: string;
  gender: Gender;
  photo_url?: string;
  created_at: string;
  zones?: { name: string };
}

export interface Partner {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  photo_url?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Accountant {
  id: string;
  email: string;
  role: 'accountant';
  created_at: string;
}

export interface RequestPriceAdjustment {
  id: string;
  request_id: string;
  worker_id: string;
  client_id?: string | null;
  previous_price: number;
  extra_price: number;
  new_total: number;
  reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string | null;
  workers?: {
    id?: string;
    name?: string;
    photo_url?: string | null;
  };
}

export interface Request {
  id: string;
  name: string;
  phone: string;
  service_id: string;
  quartier: string;
  zone_id: string;
  description: string;
  photo_url?: string | null;
  status: RequestStatus;
  worker_id?: string | null;
  client_id?: string | null;
  price?: number | null;
  price_adjustment_note?: string | null;
  last_adjustment_id?: string | null;
  created_at: string;
  services?: { name: string };
  zones?: { name: string };
  workers?: {
    id?: string;
    name: string;
    photo_url?: string | null;
    phone?: string;
    service_id?: string;
    zone_id?: string;
    services?: { name: string };
    zones?: { name: string };
  };
  my_rating?: WorkerRating | null;
}

export interface RequestProposal {
  id: string;
  request_id: string;
  worker_id: string;
  amount: number;
  message?: string | null;
  status: ProposalStatus;
  created_at: string;
  workers?: {
    id: string;
    name: string;
    phone: string;
    photo_url?: string | null;
    service_id?: string;
    zone_id?: string;
    services?: { name: string };
    zones?: { name: string };
    worker_zones?: { zone_id: string; zones?: { name: string } }[];
  };
  avg_rating?: number;
  rating_count?: number;
  requests?: {
    id: string;
    name: string;
    phone: string;
    status: RequestStatus;
    description?: string;
    photo_url?: string | null;
    price?: number | null;
    services?: { name: string };
    zones?: { name: string };
  };
}

export interface PartnerApplication {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  experience: string;
  services_offered: string;
  zones_interest: string;
  why_partner: string;
  has_tools: boolean;
  has_transport: boolean;
  id_recto_url: string;
  id_verso_url: string;
  selfie_url?: string | null;
  status: ApplicationStatus;
  admin_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface WorkerInvitation {
  id: string;
  partner_user_id: string;
  phone: string;
  service_id: string;
  zone_ids: string[];
  status: InvitationStatus;
  invitee_user_id?: string | null;
  worker_id?: string | null;
  created_at: string;
  services?: { name: string };
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  type?: string | null;
  link?: string | null;
  read: boolean;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface Attendance {
  id: string;
  worker_id: string;
  amount: number;
  total_received: number;
  levy_amount?: number;
  paid?: boolean;
  paid_at?: string | null;
  paid_amount?: number | null;
  paid_by?: string | null;
  description: string;
  client_name?: string | null;
  request_id?: string | null;
  date: string;
  levied_at?: string | null;
  created_by?: string;
  created_at: string;
  workers?: { name: string; photo_url?: string | null };
}

export interface CreateZoneManagerInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  zone_id: string;
  gender: Gender;
}

export interface CreateAccountantInput {
  email: string;
  password: string;
}

export const CLIENT_ROLES: Role[] = ['client', 'partner', 'worker'];
export const STAFF_ROLES: Role[] = ['super_admin', 'zone_manager', 'accountant', 'partner'];
