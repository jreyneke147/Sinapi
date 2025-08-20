import { supabase } from './supabaseClient';

export async function uploadResourceFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from('manuals').upload(filePath, file);
  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('manuals').getPublicUrl(filePath);
  return data.publicUrl;
}
