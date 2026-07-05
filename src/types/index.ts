// src/types/index.ts
export type Role = 'super_admin' | 'zone_manager' | 'accountant';
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'done' | 'cancelled';
export type WorkerStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  zone_id?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  created_at: string;
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
  created_by?: string;
  created_at: string;
  zones?: { name: string };
  services?: { name: string };
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

export interface Accountant {
  id: string;
  email: string;
  role: 'accountant';
  created_at: string;
}

export interface Request {
  id: string;
  name: string;
  phone: string;
  service_id: string;
  quartier: string;
  zone_id: string;
  description: string;
  status: RequestStatus;
  worker_id?: string;
  created_at: string;
  services?: { name: string };
  zones?: { name: string };
  workers?: { name: string };
}

export interface Attendance {
  id: string;
  worker_id: string;
  amount: number;
  total_received: number;
  description: string;
  date: string;
  created_by?: string;
  created_at: string;
  workers?: { name: string };
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
