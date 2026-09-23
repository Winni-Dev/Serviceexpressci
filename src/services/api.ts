import { supabase } from '@/lib/supabase';
import { createAuthUser, normalizePhone } from '@/lib/auth';
import type {
  Service,
  ServiceCategory,
  Zone,
  Worker,
  Request,
  Attendance,
  ZoneManager,
  Profile,
  CreateZoneManagerInput,
  CreateAccountantInput,
  RequestProposal,
  PartnerApplication,
  WorkerInvitation,
  AppNotification,
  Partner,
  WorkerRating,
  WorkerRatingStats,
  RequestPriceAdjustment,
} from '@/types';

export interface DataFilters {
  zoneId?: string;
}

// Services
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*, service_categories(id, name)')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
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

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data as ServiceCategory[];
}

export async function createServiceCategory(payload: Partial<ServiceCategory>) {
  const { data, error } = await supabase
    .from('service_categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function updateServiceCategory(id: string, payload: Partial<ServiceCategory>) {
  const { data, error } = await supabase
    .from('service_categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function deleteServiceCategory(id: string) {
  const { error } = await supabase.from('service_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderServiceCategories(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('service_categories').update({ sort_order: index }).eq('id', id)
    )
  );
}

export async function reorderServices(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('services').update({ sort_order: index }).eq('id', id)
    )
  );
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

/** Select workers sans ambiguïté (zone_id vs worker_zones → zones) */
const WORKER_SELECT_SAFE =
  '*, services(name), worker_zones(zone_id, zones(name))';

const WORKER_EMBED_SAFE =
  'id, name, phone, photo_url, service_id, zone_id, services(name), worker_zones(zone_id, zones(name))';

function normalizeWorkerRow<T extends Record<string, unknown>>(w: T): T & { zones?: { name: string } } {
  const wz = w.worker_zones as { zones?: { name: string } }[] | undefined;
  const fromMulti = wz?.map((z) => z.zones?.name).filter(Boolean).join(', ');
  const existing = w.zones as { name: string } | undefined;
  return {
    ...w,
    zones: existing?.name ? existing : fromMulti ? { name: fromMulti } : existing,
  };
}

// Workers
export async function getWorkers(filters?: DataFilters) {
  let query = supabase
    .from('workers')
    .select(WORKER_SELECT_SAFE)
    .order('created_at', { ascending: false });

  if (filters?.zoneId) {
    query = query.eq('zone_id', filters.zoneId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((w) => normalizeWorkerRow(w));
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

export async function promoteClientToWorker(input: {
  userId: string;
  service_id: string;
  zone_ids: string[];
  name?: string | null;
  phone?: string | null;
  gender?: Worker['gender'];
  photo_url?: string | null;
}) {
  if (!input.userId) throw new Error('Utilisateur introuvable');
  if (!input.service_id) throw new Error('Veuillez choisir un service');
  if (!input.zone_ids?.length) throw new Error('Veuillez choisir au moins une zone');

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, phone, role, photo_url')
    .eq('id', input.userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error('Profil utilisateur introuvable');

  const finalName = input.name?.trim() || profile.name?.trim() || 'Travailleur';
  const finalPhone = normalizePhone(input.phone || profile.phone || '');
  const finalPhoto = input.photo_url ?? profile.photo_url ?? null;

  const { data: existingWorker, error: existingError } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', input.userId)
    .maybeSingle();

  if (existingError) throw existingError;

  let workerId = existingWorker?.id;

  if (workerId) {
    const { data: updated, error: updateError } = await supabase
      .from('workers')
      .update({
        name: finalName,
        phone: finalPhone,
        service_id: input.service_id,
        zone_id: input.zone_ids[0],
        gender: input.gender || 'male',
        photo_url: finalPhoto ?? undefined,
        status: 'active',
      })
      .eq('id', workerId)
      .select('id')
      .single();

    if (updateError) throw updateError;
    workerId = updated.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from('workers')
      .insert({
        name: finalName,
        phone: finalPhone,
        service_id: input.service_id,
        zone_id: input.zone_ids[0],
        gender: input.gender || 'male',
        photo_url: finalPhoto ?? null,
        status: 'active',
        user_id: input.userId,
        created_by: user?.id ?? input.userId,
      })
      .select('id')
      .single();

    if (createError) throw createError;
    workerId = created.id;
  }

  if (!workerId) throw new Error('Impossible de créer le profil travailleur');

  await supabase.from('worker_zones').delete().eq('worker_id', workerId);
  const zoneRows = input.zone_ids.map((zone_id) => ({ worker_id: workerId, zone_id }));
  const { error: zoneInsertError } = await supabase.from('worker_zones').insert(zoneRows);
  if (zoneInsertError) throw zoneInsertError;

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      name: finalName,
      phone: finalPhone,
      photo_url: finalPhoto,
      role: 'worker',
    })
    .eq('id', input.userId);

  if (profileUpdateError) throw profileUpdateError;

  return { id: workerId };
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Connectez-vous pour faire une demande');

  const payload = {
    name: request.name,
    phone: normalizePhone(request.phone || ''),
    service_id: request.service_id,
    quartier: request.quartier,
    zone_id: request.zone_id,
    description: request.description,
    photo_url: request.photo_url ?? null,
    status: request.status || 'new',
    client_id: user.id,
  };

  const { data, error } = await supabase.from('requests').insert(payload).select().single();
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

export async function getMyRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .maybeSingle();

  const phone = profile?.phone ? normalizePhone(profile.phone) : '';

  // Requête simple (évite les jointures imbriquées qui cassent parfois PostgREST)
  const { data: byClient, error } = await supabase
    .from('requests')
    .select('*, services(name), zones(name), workers(name, photo_url, phone)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let requests = (byClient ?? []) as Request[];

  // Fallback : anciennes demandes liées seulement au téléphone
  if (phone) {
    const { data: byPhone } = await supabase
      .from('requests')
      .select('*, services(name), zones(name), workers(name, photo_url, phone)')
      .eq('phone', phone)
      .order('created_at', { ascending: false });

    const existing = new Set(requests.map((r) => r.id));
    for (const r of (byPhone as Request[] | null) ?? []) {
      if (!existing.has(r.id)) requests.push(r);
    }

    // Réparer client_id manquant
    const orphans = ((byPhone as Request[] | null) ?? []).filter((r) => !r.client_id);
    if (orphans.length) {
      await supabase
        .from('requests')
        .update({ client_id: user.id })
        .in(
          'id',
          orphans.map((r) => r.id)
        );
    }
  }

  requests.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const doneIds = requests.filter((r) => r.status === 'done').map((r) => r.id);
  if (!doneIds.length) return requests;

  const { data: ratings } = await supabase
    .from('worker_ratings')
    .select('*')
    .in('request_id', doneIds)
    .eq('client_id', user.id);

  const byRequest = new Map((ratings as WorkerRating[] | null)?.map((r) => [r.request_id, r]));
  return requests.map((r) => ({ ...r, my_rating: byRequest.get(r.id) ?? null }));
}

export async function getProposalsForRequest(requestId: string) {
  const { data, error } = await supabase
    .from('request_proposals')
    .select(`*, workers(${WORKER_EMBED_SAFE})`)
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const proposals = ((data ?? []) as RequestProposal[]).map((p) => ({
    ...p,
    workers: p.workers ? normalizeWorkerRow(p.workers as unknown as Record<string, unknown>) as RequestProposal['workers'] : p.workers,
  }));

  const workerIds = [...new Set(proposals.map((p) => p.worker_id))];
  if (!workerIds.length) return proposals;

  const { data: stats } = await supabase
    .from('worker_rating_stats')
    .select('*')
    .in('worker_id', workerIds);

  const statsMap = new Map(
    (stats as WorkerRatingStats[] | null)?.map((s) => [s.worker_id, s])
  );

  return proposals.map((p) => ({
    ...p,
    avg_rating: Number(statsMap.get(p.worker_id)?.avg_rating ?? 0),
    rating_count: Number(statsMap.get(p.worker_id)?.rating_count ?? 0),
  }));
}

export async function getWorkerMyProposals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!worker) return [];

  const { data, error } = await supabase
    .from('request_proposals')
    .select('*, requests(id, name, phone, status, description, price, services(name), zones(name))')
    .eq('worker_id', worker.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as RequestProposal[];
}

export async function getMatchingRequestsForWorker() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: worker, error: wErr } = await supabase
    .from('workers')
    .select('id, service_id, zone_id, worker_zones(zone_id)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (wErr) throw wErr;
  if (!worker) return [];

  const zoneIds = [
    worker.zone_id,
    ...((worker.worker_zones as { zone_id: string }[] | null)?.map((z) => z.zone_id) ?? []),
  ].filter(Boolean);

  const { data, error } = await supabase
    .from('requests')
    .select('*, services(name), zones(name)')
    .eq('status', 'new')
    .eq('service_id', worker.service_id)
    .in('zone_id', zoneIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Request[];
}

export async function getWorkerAssignedRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!worker) return [];

  const { data, error } = await supabase
    .from('requests')
    .select('*, services(name), zones(name)')
    .eq('worker_id', worker.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Request[];
}

export async function getRequestPriceAdjustments(requestId: string): Promise<RequestPriceAdjustment[]> {
  const { data, error } = await supabase
    .from('request_price_adjustments')
    .select('*, workers(name, photo_url)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RequestPriceAdjustment[];
}

export async function createRequestPriceAdjustment(input: {
  requestId: string;
  extraPrice: number;
  reason: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (workerError) throw workerError;
  if (!worker) throw new Error('Le profil travailleur est introuvable');

  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('price, client_id')
    .eq('id', input.requestId)
    .maybeSingle();
  if (requestError) throw requestError;
  if (!request) throw new Error('Demande introuvable');

  const previousPrice = Number(request.price ?? 0);
  const extraPrice = Number(input.extraPrice ?? 0);
  if (!extraPrice || extraPrice <= 0) {
    throw new Error('Le montant du supplément doit être supérieur à 0');
  }

  const { data, error } = await supabase
    .from('request_price_adjustments')
    .insert({
      request_id: input.requestId,
      worker_id: worker.id,
      client_id: request.client_id,
      previous_price: previousPrice,
      extra_price: extraPrice,
      new_total: previousPrice + extraPrice,
      reason: input.reason?.trim() || 'Travail supplémentaire constaté sur place',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as RequestPriceAdjustment;
}

export async function approveRequestPriceAdjustment(adjustmentId: string) {
  const { data: adjustment, error: readError } = await supabase
    .from('request_price_adjustments')
    .select('*')
    .eq('id', adjustmentId)
    .maybeSingle();
  if (readError) throw readError;
  if (!adjustment) throw new Error('Ajustement introuvable');

  const { error: updateError } = await supabase
    .from('requests')
    .update({ price: Number(adjustment.new_total), price_adjustment_note: adjustment.reason })
    .eq('id', adjustment.request_id);
  if (updateError) throw updateError;

  const { data, error } = await supabase
    .from('request_price_adjustments')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', adjustmentId)
    .select()
    .single();
  if (error) throw error;
  return data as RequestPriceAdjustment;
}

export async function rejectRequestPriceAdjustment(adjustmentId: string) {
  const { data, error } = await supabase
    .from('request_price_adjustments')
    .update({ status: 'rejected', approved_at: new Date().toISOString() })
    .eq('id', adjustmentId)
    .select()
    .single();
  if (error) throw error;
  return data as RequestPriceAdjustment;
}

export async function submitProposal(requestId: string, amount: number, message?: string) {
  // Synchroniser la photo profil → workers avant l'appel SQL
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const [{ data: worker }, { data: prof }] = await Promise.all([
      supabase.from('workers').select('id, photo_url').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('photo_url').eq('id', user.id).maybeSingle(),
    ]);
    if (worker && !worker.photo_url && prof?.photo_url) {
      await supabase.from('workers').update({ photo_url: prof.photo_url }).eq('id', worker.id);
    }
  }

  const { data, error } = await supabase.rpc('submit_proposal', {
    p_request_id: requestId,
    p_amount: amount,
    p_message: message ?? null,
  });
  if (error) throw error;
  return data;
}

export async function acceptProposal(proposalId: string) {
  const { data, error } = await supabase.rpc('accept_proposal', { p_proposal_id: proposalId });
  if (error) throw error;
  return data;
}

export async function cancelMyRequest(requestId: string) {
  const { data, error } = await supabase.rpc('cancel_my_request', { p_request_id: requestId });
  if (error) throw error;
  return data;
}

export async function workerUpdateRequestStatus(requestId: string, status: 'in_progress' | 'done') {
  const { data, error } = await supabase.rpc('worker_update_request_status', {
    p_request_id: requestId,
    p_status: status,
  });
  if (error) throw error;
  return data;
}

// Partner applications
export async function submitPartnerApplication(payload: {
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
  selfie_url: string;
}) {
  const { data, error } = await supabase.rpc('submit_partner_application', {
    p_name: payload.name,
    p_phone: payload.phone,
    p_experience: payload.experience,
    p_services_offered: payload.services_offered,
    p_zones_interest: payload.zones_interest,
    p_why_partner: payload.why_partner,
    p_has_tools: payload.has_tools,
    p_has_transport: payload.has_transport,
    p_id_recto_url: payload.id_recto_url,
    p_id_verso_url: payload.id_verso_url,
    p_selfie_url: payload.selfie_url,
  });
  if (error) throw error;
  return data;
}

export async function getPartnerApplications(status?: string) {
  let query = supabase
    .from('partner_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data as PartnerApplication[];
}

export async function getMyPartnerApplication() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('partner_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as PartnerApplication | null;
}

export async function reviewPartnerApplication(
  applicationId: string,
  approve: boolean,
  adminNote?: string
) {
  const { data, error } = await supabase.rpc('review_partner_application', {
    p_application_id: applicationId,
    p_approve: approve,
    p_admin_note: adminNote ?? null,
  });
  if (error) throw error;
  return data;
}

export async function getPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Partner[];
}

// Worker invitations
export async function inviteWorker(phone: string, serviceId: string, zoneIds: string[]) {
  const { data, error } = await supabase.rpc('invite_worker', {
    p_phone: normalizePhone(phone),
    p_service_id: serviceId,
    p_zone_ids: zoneIds,
  });
  if (error) throw error;
  return data;
}

export async function getMyInvitations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .maybeSingle();

  const phone = profile?.phone ? normalizePhone(profile.phone) : '';

  let query = supabase
    .from('worker_invitations')
    .select('*, services(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as WorkerInvitation[]).filter(
    (inv) =>
      inv.invitee_user_id === user.id ||
      (phone && normalizePhone(inv.phone) === phone)
  );
}

export async function getPartnerInvitations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('worker_invitations')
    .select('*, services(name)')
    .eq('partner_user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as WorkerInvitation[];
}

export async function respondWorkerInvitation(invitationId: string, accept: boolean) {
  const { data, error } = await supabase.rpc('respond_worker_invitation', {
    p_invitation_id: invitationId,
    p_accept: accept,
  });
  if (error) throw error;
  return data;
}

export async function getPartnerWorkers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('workers')
    .select(WORKER_SELECT_SAFE)
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Worker[]).map((w) => normalizeWorkerRow(w as unknown as Record<string, unknown>) as unknown as Worker);
}

export async function getMyWorkerProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('workers')
    .select(WORKER_SELECT_SAFE)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeWorkerRow(data as unknown as Record<string, unknown>) as unknown as Worker;
}

export async function getWorkerEarnings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requests: [] as Request[], attendance: [] as Attendance[] };

  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!worker) return { requests: [], attendance: [] };

  const [reqRes, attRes] = await Promise.all([
    supabase
      .from('requests')
      .select('*, services(name), zones(name)')
      .eq('worker_id', worker.id)
      .in('status', ['assigned', 'in_progress', 'done'])
      .order('created_at', { ascending: false }),
    supabase
      .from('attendance')
      .select('*')
      .eq('worker_id', worker.id)
      .order('date', { ascending: false }),
  ]);

  if (reqRes.error) throw reqRes.error;
  if (attRes.error) throw attRes.error;
  return {
    requests: reqRes.data as Request[],
    attendance: attRes.data as Attendance[],
  };
}

export async function getWorkerRatingStatsMap(workerIds: string[]) {
  if (!workerIds.length) return new Map<string, WorkerRatingStats>();
  const { data, error } = await supabase
    .from('worker_rating_stats')
    .select('*')
    .in('worker_id', workerIds);
  if (error) throw error;
  return new Map(
    ((data as WorkerRatingStats[]) ?? []).map((s) => [s.worker_id, s])
  );
}

export async function applyAttendanceLevy(attendanceId: string, levy: number) {
  const { data, error } = await supabase.rpc('apply_attendance_levy', {
    p_attendance_id: attendanceId,
    p_levy: levy,
  });
  if (error) throw error;
  return data as Attendance;
}

export async function markAttendancePaid(attendanceId: string, amount?: number) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload: Record<string, unknown> = {
    paid: true,
    paid_at: new Date().toISOString(),
  };
  if (amount != null) payload.paid_amount = amount;
  if (user?.id) payload.paid_by = user.id;

  const { data, error } = await supabase
    .from('attendance')
    .update(payload)
    .eq('id', attendanceId)
    .select()
    .single();
  if (error) throw error;
  return data as Attendance;
}

export async function getNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as AppNotification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);
  if (error) throw error;
}

export async function rateWorker(requestId: string, rating: number, comment?: string) {
  const { data, error } = await supabase.rpc('rate_worker', {
    p_request_id: requestId,
    p_rating: rating,
    p_comment: comment ?? null,
  });
  if (error) throw error;
  return data as WorkerRating;
}

export async function updateMyWorkerProfile(params: {
  photo_url?: string;
  service_id?: string;
  zone_ids?: string[];
  name?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Tentative RPC, sinon mise à jour directe
  const { data, error } = await supabase.rpc('update_my_worker_profile', {
    p_photo_url: params.photo_url ?? null,
    p_service_id: params.service_id ?? null,
    p_zone_ids: params.zone_ids ?? null,
    p_name: params.name ?? null,
  });

  if (!error && data) return data as Worker;

  const { data: workerRow, error: findErr } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!workerRow) throw error || new Error('Profil travailleur introuvable');

  const patch: Record<string, unknown> = {};
  if (params.photo_url) patch.photo_url = params.photo_url;
  if (params.service_id) patch.service_id = params.service_id;
  if (params.name) patch.name = params.name;
  if (params.zone_ids?.length) patch.zone_id = params.zone_ids[0];

  const { data: updated, error: updErr } = await supabase
    .from('workers')
    .update(patch)
    .eq('id', workerRow.id)
    .select(WORKER_SELECT_SAFE)
    .single();
  if (updErr) throw updErr;

  if (params.zone_ids?.length) {
    await supabase.from('worker_zones').delete().eq('worker_id', workerRow.id);
    await supabase.from('worker_zones').insert(
      params.zone_ids.map((zone_id) => ({ worker_id: workerRow.id, zone_id }))
    );
  }

  if (params.photo_url || params.name) {
    await supabase
      .from('profiles')
      .update({
        ...(params.photo_url ? { photo_url: params.photo_url } : {}),
        ...(params.name ? { name: params.name } : {}),
      })
      .eq('id', user.id);
  }

  return normalizeWorkerRow(updated as unknown as Record<string, unknown>) as unknown as Worker;
}

export async function updateMyPartnerPhoto(photoUrl: string) {
  const { data, error } = await supabase.rpc('update_my_partner_photo', {
    p_photo_url: photoUrl,
  });
  if (error) throw error;
  return data as Partner;
}

/** Admin — onglet Utilisateurs = clients uniquement */
export async function getAdminUsers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, zones(name)')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((profiles as Profile[]) ?? []).map((p) => ({
    ...p,
    partner: null as Partner | null,
    worker: null as Worker | null,
  }));
}

/** Partenaires acceptés (table partners + profils) */
export async function getPartnersWithProfiles() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const userIds = ((data as Partner[]) ?? []).map((p) => p.user_id);
  let profiles: Profile[] = [];
  if (userIds.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('*, zones(name)')
      .in('id', userIds);
    profiles = (profs as Profile[]) ?? [];
  }
  const byId = new Map(profiles.map((p) => [p.id, p]));

  return ((data as Partner[]) ?? []).map((p) => ({
    ...p,
    profile: byId.get(p.user_id) ?? null,
  }));
}

export async function getWorkerRatingStats(workerId: string) {
  const { data, error } = await supabase
    .from('worker_rating_stats')
    .select('*')
    .eq('worker_id', workerId)
    .maybeSingle();
  if (error) throw error;
  return data as WorkerRatingStats | null;
}

// Attendance
export async function getAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, workers(name, photo_url)')
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
  const { data: managers, error } = await supabase
    .from('zone_managers')
    .select('*, zones(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const managerUserIds = new Set(
    ((managers as ZoneManager[]) ?? []).map((m) => m.user_id).filter(Boolean)
  );

  const fromPartners: ZoneManager[] = ((partners as Partner[]) ?? [])
    .filter((p) => !managerUserIds.has(p.user_id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: undefined,
      zone_id: '',
      user_id: p.user_id,
      gender: 'male' as const,
      photo_url: p.photo_url || undefined,
      created_at: p.created_at,
      zones: { name: 'Multi-zones' },
    }));

  return [...((managers as ZoneManager[]) ?? []), ...fromPartners];
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

export async function deleteAdminUserAccount(userId: string) {
  const { data: workerRows, error: workerSelectError } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', userId);

  if (workerSelectError) throw workerSelectError;

  const workerIds = (workerRows ?? []).map((row) => row.id);

  if (workerIds.length) {
    const { error: workerProposalError } = await supabase
      .from('request_proposals')
      .delete()
      .in('worker_id', workerIds);
    if (workerProposalError) throw workerProposalError;

    const { error: workerZonesError } = await supabase
      .from('worker_zones')
      .delete()
      .in('worker_id', workerIds);
    if (workerZonesError) throw workerZonesError;
  }

  const { error: workerDeleteError } = await supabase.from('workers').delete().eq('user_id', userId);
  if (workerDeleteError) throw workerDeleteError;

  if (workerIds.length) {
    const { error: requestsByWorkerError } = await supabase
      .from('requests')
      .delete()
      .or(`client_id.eq.${userId},worker_id.in.(${workerIds.join(',')})`);
    if (requestsByWorkerError) throw requestsByWorkerError;
  } else {
    const { error: requestsError } = await supabase.from('requests').delete().eq('client_id', userId);
    if (requestsError) throw requestsError;
  }

  const { error: partnerAppError } = await supabase.from('partner_applications').delete().eq('user_id', userId);
  if (partnerAppError) throw partnerAppError;

  const { error: partnerError } = await supabase.from('partners').delete().eq('user_id', userId);
  if (partnerError) throw partnerError;

  const { error: zoneManagerError } = await supabase.from('zone_managers').delete().eq('user_id', userId);
  if (zoneManagerError) throw zoneManagerError;

  const { error: inviteError } = await supabase
    .from('worker_invitations')
    .delete()
    .or(`partner_user_id.eq.${userId},invitee_user_id.eq.${userId}`);
  if (inviteError) throw inviteError;

  const { error: notificationError } = await supabase.from('notifications').delete().eq('user_id', userId);
  if (notificationError) throw notificationError;

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
  if (profileError) throw profileError;
}

export async function deleteClientUser(userId: string) {
  return deleteAdminUserAccount(userId);
}

export async function deleteAccountant(userId: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;
}
