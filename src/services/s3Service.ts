
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'pro-sync-suit-core';
const REGION = 'us-east-1';
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

export const s3Service = {
  async uploadFile(file: File, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Uploading file to public S3 bucket:', filePath);
      
      // Try S3 first
      const url = `${S3_BASE_URL}/${filePath}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-amz-meta-original-name': file.name,
          'x-amz-meta-uploaded-at': new Date().toISOString(),
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('File uploaded successfully to S3:', filePath);
      return { success: true };
    } catch (s3Error) {
      console.warn('S3 upload failed, trying Supabase storage:', s3Error);
      
      // Fallback to Supabase storage
      try {
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }

        console.log('File uploaded successfully to Supabase storage:', filePath);
        return { success: true };
      } catch (supabaseError) {
        console.error('Both S3 and Supabase upload failed:', supabaseError);
        return { 
          success: false, 
          error: `Upload failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}` 
        };
      }
    }
  },

  async downloadFile(filePath: string): Promise<{ data?: Blob; error?: string }> {
    try {
      // Try S3 first
      const url = `${S3_BASE_URL}/${filePath}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`S3 download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return { data: blob };
    } catch (s3Error) {
      console.warn('S3 download failed, trying Supabase storage:', s3Error);
      
      // Fallback to Supabase storage
      try {
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .download(filePath);

        if (error) {
          throw error;
        }

        return { data };
      } catch (supabaseError) {
        console.error('Both S3 and Supabase download failed:', supabaseError);
        return { 
          error: `Download failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}` 
        };
      }
    }
  },

  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Try S3 first
      const url = `${S3_BASE_URL}/${filePath}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`S3 delete failed: ${response.status} ${response.statusText}`);
      }

      console.log('File deleted successfully from S3:', filePath);
      return { success: true };
    } catch (s3Error) {
      console.warn('S3 delete failed, trying Supabase storage:', s3Error);
      
      // Fallback to Supabase storage
      try {
        const { error } = await supabase.storage
          .from('pro-sync-suit-core')
          .remove([filePath]);

        if (error) {
          throw error;
        }

        console.log('File deleted successfully from Supabase storage:', filePath);
        return { success: true };
      } catch (supabaseError) {
        console.error('Both S3 and Supabase delete failed:', supabaseError);
        return { 
          success: false, 
          error: `Delete failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}` 
        };
      }
    }
  },

  async getFileInfo(filePath: string): Promise<{ size?: number; lastModified?: Date; error?: string }> {
    try {
      // Try S3 first
      const url = `${S3_BASE_URL}/${filePath}`;
      const response = await fetch(url, {
        method: 'HEAD',
      });

      if (!response.ok) {
        throw new Error(`S3 head request failed: ${response.status} ${response.statusText}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');
      
      return {
        size: contentLength ? parseInt(contentLength) : undefined,
        lastModified: lastModified ? new Date(lastModified) : undefined,
      };
    } catch (s3Error) {
      console.warn('S3 file info failed, trying Supabase storage:', s3Error);
      
      // Fallback to Supabase storage
      try {
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .list('', {
            search: filePath
          });

        if (error) {
          throw error;
        }

        const fileInfo = data.find(file => file.name === filePath.split('/').pop());
        
        return {
          size: fileInfo?.metadata?.size,
          lastModified: fileInfo?.updated_at ? new Date(fileInfo.updated_at) : undefined,
        };
      } catch (supabaseError) {
        console.error('Both S3 and Supabase file info failed:', supabaseError);
        return { 
          error: `Failed to get file info: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}` 
        };
      }
    }
  },

  async getSignedDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<{ url?: string; error?: string }> {
    try {
      // For S3 public bucket, return direct URL
      const url = `${S3_BASE_URL}/${filePath}`;
      
      // Test if the file exists in S3
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        return { url };
      }
      
      throw new Error('File not found in S3');
    } catch (s3Error) {
      console.warn('S3 signed URL failed, trying Supabase storage:', s3Error);
      
      // Fallback to Supabase storage
      try {
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          throw error;
        }

        return { url: data.signedUrl };
      } catch (supabaseError) {
        console.error('Both S3 and Supabase signed URL failed:', supabaseError);
        return { 
          error: `Failed to generate signed URL: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}` 
        };
      }
    }
  }
};
