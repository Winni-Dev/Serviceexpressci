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
