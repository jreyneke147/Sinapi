import { supabase } from '../supabaseClient';

const STORAGE_BUCKET = 'resources';
const ICON_DIRECTORY = 'icons';

export const ICON_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const ICON_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

function generateFilePath(file: File, directory?: string) {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const normalizedFileName = fileExt ? `${uniqueName}.${fileExt}` : uniqueName;
  return directory ? `${directory}/${normalizedFileName}` : normalizedFileName;
}

async function uploadToStorage(file: File, path: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

function getPublicUrl(path: string) {
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  return urlData.publicUrl;
}

function extractPathFromPublicUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const bucketIndex = segments.findIndex(segment => segment === STORAGE_BUCKET);
    if (bucketIndex === -1) {
      return segments.length > 0 ? segments[segments.length - 1] : null;
    }
    return segments.slice(bucketIndex + 1).join('/');
  } catch (error) {
    console.warn('Failed to parse file URL for deletion:', error);
    const fallbackParts = fileUrl.split('/');
    return fallbackParts.length > 0 ? fallbackParts[fallbackParts.length - 1] : null;
  }
}

export async function uploadFile(file: File): Promise<string> {
  const path = generateFilePath(file);
  await uploadToStorage(file, path);
  return getPublicUrl(path);
}

export async function uploadIcon(file: File): Promise<string> {
  if (!ICON_ALLOWED_MIME_TYPES.includes(file.type as typeof ICON_ALLOWED_MIME_TYPES[number])) {
    throw new Error('Invalid icon file type. Allowed types are PNG, JPG, and WEBP.');
  }

  if (file.size > ICON_MAX_FILE_SIZE) {
    throw new Error('Icon file exceeds the maximum size of 2 MB.');
  }

  const path = generateFilePath(file, ICON_DIRECTORY);
  await uploadToStorage(file, path);
  return getPublicUrl(path);
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const path = extractPathFromPublicUrl(fileUrl);
  if (!path) {
    console.warn('Could not determine file path for deletion:', fileUrl);
    return;
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.warn('Failed to delete file from storage:', error.message);
  }
}