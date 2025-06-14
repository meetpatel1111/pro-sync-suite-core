
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'pro-sync-suit-core';
const REGION = 'us-east-1';
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

export const s3Service = {
  async uploadFile(file: File, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Uploading file to storage:', filePath);
      
      // Try S3 first if available
      try {
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

        if (response.ok) {
          console.log('File uploaded successfully to S3:', filePath);
          return { success: true };
        }
        
        throw new Error(`S3 upload failed: ${response.status}`);
      } catch (s3Error) {
        console.warn('S3 upload failed, using Supabase storage:', s3Error);
        
        // Fallback to Supabase storage
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
      }
    } catch (error) {
      console.error('Upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  },

  async downloadFile(filePath: string): Promise<{ data?: Blob; error?: string }> {
    try {
      // Try S3 first
      try {
        const url = `${S3_BASE_URL}/${filePath}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const blob = await response.blob();
          return { data: blob };
        }
        
        throw new Error(`S3 download failed: ${response.status}`);
      } catch (s3Error) {
        console.warn('S3 download failed, trying Supabase storage:', s3Error);
        
        // Fallback to Supabase storage
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .download(filePath);

        if (error) {
          throw error;
        }

        return { data };
      }
    } catch (error) {
      console.error('Download failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Download failed' 
      };
    }
  },

  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Try S3 first
      try {
        const url = `${S3_BASE_URL}/${filePath}`;
        const response = await fetch(url, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('File deleted successfully from S3:', filePath);
          return { success: true };
        }
        
        throw new Error(`S3 delete failed: ${response.status}`);
      } catch (s3Error) {
        console.warn('S3 delete failed, trying Supabase storage:', s3Error);
        
        // Fallback to Supabase storage
        const { error } = await supabase.storage
          .from('pro-sync-suit-core')
          .remove([filePath]);

        if (error) {
          throw error;
        }

        console.log('File deleted successfully from Supabase storage:', filePath);
        return { success: true };
      }
    } catch (error) {
      console.error('Delete failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  },

  async getFileInfo(filePath: string): Promise<{ size?: number; lastModified?: Date; error?: string }> {
    try {
      // Try S3 first
      try {
        const url = `${S3_BASE_URL}/${filePath}`;
        const response = await fetch(url, {
          method: 'HEAD',
        });

        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          const lastModified = response.headers.get('last-modified');
          
          return {
            size: contentLength ? parseInt(contentLength) : undefined,
            lastModified: lastModified ? new Date(lastModified) : undefined,
          };
        }
        
        throw new Error(`S3 head request failed: ${response.status}`);
      } catch (s3Error) {
        console.warn('S3 file info failed, trying Supabase storage:', s3Error);
        
        // Fallback to Supabase storage - list files to get info
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
      }
    } catch (error) {
      console.error('Get file info failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to get file info' 
      };
    }
  },

  async getSignedDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<{ url?: string; error?: string }> {
    try {
      // Try S3 first (for public bucket, return direct URL)
      try {
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
        const { data, error } = await supabase.storage
          .from('pro-sync-suit-core')
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          throw error;
        }

        return { url: data.signedUrl };
      }
    } catch (error) {
      console.error('Get signed URL failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to generate signed URL' 
      };
    }
  }
};
