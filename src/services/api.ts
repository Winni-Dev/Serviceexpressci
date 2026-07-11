import { supabase } from '@/lib/supabase';
import { createAuthUser } from '@/lib/auth';
import type {
  Service,
  Zone,
  Worker,
  Request,
  Attendance,
  ZoneManager,
  Profile,
  CreateZoneManagerInput,
  CreateAccountantInput,
} from '@/types';

export interface DataFilters {
  zoneId?: string;
}

// Services
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createService(service: Partial<Service>) {
  const { data, error } = await supabase.from('services').insert(service).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id: string, service: Partial<Service>) {
  const { data, error } = await supabase.from('services').update(service).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

// Zones
export async function getZones(): Promise<Zone[]> {
  const { data, error } = await supabase.from('zones').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createZone(zone: Partial<Zone>) {
  const { data, error } = await supabase.from('zones').insert(zone).select().single();
  if (error) throw error;
  return data;
}

export async function updateZone(id: string, zone: Partial<Zone>) {
  const { data, error } = await supabase.from('zones').update(zone).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteZone(id: string) {
  const { error } = await supabase.from('zones').delete().eq('id', id);
  if (error) throw error;
}

// Workers
export async function getWorkers(filters?: DataFilters) {
  let query = supabase
    .from('workers')
    .select('*, zones(name), services(name)')
    .order('created_at', { ascending: false });

  if (filters?.zoneId) {
    query = query.eq('zone_id', filters.zoneId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createWorker(worker: Partial<Worker>) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('workers')
    .insert({ ...worker, created_by: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorker(id: string, worker: Partial<Worker>) {
  const { data, error } = await supabase.from('workers').update(worker).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updateWorkerStatus(id: string, status: string) {
  const { error } = await supabase.from('workers').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteWorker(id: string) {
  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) throw error;
}

// Requests
export async function getRequests(filters?: DataFilters) {
  let query = supabase
    .from('requests')
    .select('*, services(name), zones(name), workers(name)')
    .order('created_at', { ascending: false });

  if (filters?.zoneId) {
    query = query.eq('zone_id', filters.zoneId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createRequest(request: Partial<Request>) {
  const { data, error } = await supabase.from('requests').insert(request).select().single();
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(id: string, status: string, workerId?: string | null) {
  const { error } = await supabase
    .from('requests')
    .update({ status, worker_id: workerId })
    .eq('id', id);
  if (error) throw error;
}

// Attendance
export async function getAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, workers(name)')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAttendance(attendance: Partial<Attendance>) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('attendance')
    .insert({ ...attendance, created_by: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAttendance(id: string) {
  const { error } = await supabase.from('attendance').delete().eq('id', id);
  if (error) throw error;
}

// Zone Managers
export async function getZoneManagers() {
  const { data, error } = await supabase
    .from('zone_managers')
    .select('*, zones(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createZoneManager(manager: CreateZoneManagerInput) {
  const user = await createAuthUser({
    email: manager.email,
    password: manager.password,
    role: 'zone_manager',
    zone_id: manager.zone_id,
    name: manager.name,
    phone: manager.phone,
  });

  const { data, error } = await supabase.rpc('create_zone_manager_record', {
    p_name: manager.name,
    p_phone: manager.phone,
    p_email: manager.email,
    p_zone_id: manager.zone_id,
    p_gender: manager.gender,
    p_user_id: user.id,
  });

  if (error) throw error;
  return data;
}

export async function updateZoneManager(id: string, manager: Partial<ZoneManager>) {
  const { data, error } = await supabase
    .from('zone_managers')
    .update(manager)
    .eq('id', id)
    .select('*, zones(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteZoneManager(id: string) {
  const { data: manager } = await supabase
    .from('zone_managers')
    .select('user_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('zone_managers').delete().eq('id', id);
  if (error) throw error;

  if (manager?.user_id) {
    await supabase.from('profiles').delete().eq('id', manager.user_id);
  }
}

// Accountants (via profiles)
export async function getAccountants(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'accountant')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAccountant(accountant: CreateAccountantInput) {
  const user = await createAuthUser({
    email: accountant.email,
    password: accountant.password,
    role: 'accountant',
  });
  return user;
}

export async function deleteAccountant(userId: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;
}
