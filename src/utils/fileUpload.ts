import { supabase } from '../supabaseClient';

export async function uploadFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('resources')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('resources')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = fileUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  const { error } = await supabase.storage
    .from('resources')
    .remove([fileName]);

  if (error) {
    console.warn('Failed to delete file from storage:', error.message);
  }
}