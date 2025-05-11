import { SupabaseClient } from '@supabase/supabase-js';

import { FileItem, FileMetadata, FileOperationResult, FileUpdateRequest } from '@/types/file-vault';

export async function uploadFileToVault(
  supabase: SupabaseClient,
  fileData: FileMetadata,
  file: File,
  storagePath: string
): Promise<FileOperationResult<FileItem>> {
  try {
    const { error: uploadError } = await supabase.storage
      .from('file_vault')
      .upload(storagePath, file);

    if (uploadError) return { data: null, error: uploadError };

    const { data, error: dbError } = await supabase
      .from('file_vault')
      .insert([fileData])
      .select()
      .single<FileItem>();

    if (dbError) return { data: null, error: dbError };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function getFileVaultItems(
  supabase: SupabaseClient,
  userId: string
): Promise<FileOperationResult<FileItem[]>> {
  try {
    const { data, error } = await supabase
      .from('file_vault')
      .select('*')
      .eq('created_by', userId)
      .returns<FileItem[]>();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function updateFileVaultItem(
  supabase: SupabaseClient,
  fileId: string,
  updates: Partial<FileItem>
): Promise<FileOperationResult<FileItem>> {
  try {
    const { data, error } = await supabase
      .from('file_vault')
      .update(updates)
      .eq('id', fileId)
      .select()
      .single<FileItem>();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deleteFileVaultItem(
  supabase: SupabaseClient,
  fileId: string,
  storagePath: string
): Promise<FileOperationResult<void>> {
  try {
    const { error: storageError } = await supabase.storage
      .from('file_vault')
      .remove([storagePath]);

    if (storageError) return { data: null, error: storageError };

    const { error: dbError } = await supabase
      .from('file_vault')
      .delete()
      .eq('id', fileId);

    if (dbError) return { data: null, error: dbError };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
