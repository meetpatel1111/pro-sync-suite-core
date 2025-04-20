import { supabase } from '@/integrations/supabase/client';

// File upload function
import dbService from './dbService';

export async function uploadFile(userId: string, file: File, name: string, description: string) {
  // Get user settings for storage provider/bucket
  const settingsResp = await dbService.getUserSettings(userId);
  const settings = settingsResp?.data || settingsResp;
  const provider = settings?.fileStorageProvider || 's3';
  const bucket = settings?.fileStorageBucket || 'pro-sync-suit-core';

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  // Assume upload to S3 is handled by backend API
  // Here, make a POST to your backend endpoint to upload the file
  // Utility to convert File to base64 in browser
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the "data:*/*;base64," prefix
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  const base64Content = await fileToBase64(file);

  const uploadRes = await fetch('/api/filevault/upload', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      bucket,
      filePath,
      fileName: name || file.name,
      description,
      mimeType: file.type,
      fileContent: base64Content,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!uploadRes.ok) {
    let errMsg = uploadRes.statusText;
    try {
      const ct = uploadRes.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const err = await uploadRes.json();
        errMsg = err?.error || JSON.stringify(err);
      } else {
        errMsg = await uploadRes.text();
      }
    } catch (e) {
      // fallback to status text
    }
    throw new Error('S3 upload failed: ' + errMsg);
  }

  // Construct S3 url
  const s3Url = `https://${bucket}.s3.amazonaws.com/${filePath}`;

  // Insert metadata to DB
  const fileData = {
    name: name || file.name,
    description,
    file_type: file.type,
    size_bytes: file.size,
    storage_path: filePath,
    storage_url: s3Url,
    storage_provider: provider,
    storage_bucket: bucket,
    is_public: true,
    is_archived: false,
    user_id: userId,
  };

  const { error: dbError } = await supabase.from('files').insert(fileData);
  if (dbError) {
    console.error('[FileVault] DB insert error:', dbError.message);
    throw new Error('DB insert failed: ' + dbError.message);
  }

  return { ...fileData, storage_url: s3Url };
}


// TODO: Implement similar CRUD functions for files, shares, permissions, etc.
