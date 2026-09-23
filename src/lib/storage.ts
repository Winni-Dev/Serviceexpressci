import { supabase } from '@/lib/supabase';

export async function uploadStaffPhoto(
  file: File,
  folder: 'workers' | 'managers',
  id: string
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${id}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('staff-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('staff-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadServiceImage(file: File, serviceId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${serviceId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('service-images')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('service-images').getPublicUrl(path);
  return data.publicUrl;
}

/** Upload pièce d'identité (bucket privé id-docs) */
export async function uploadIdDoc(
  file: File,
  userId: string,
  side: 'recto' | 'verso' | 'selfie'
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${side}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('id-docs')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  // Chemin stocké ; l'admin lit via signed URL
  return path;
}

export async function uploadRequestPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('request-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('request-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function getIdDocSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('id-docs')
    .createSignedUrl(path, 60 * 30);
  if (error) throw error;
  return data.signedUrl;
}
