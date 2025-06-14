
const BUCKET_NAME = 'pro-sync-suit-core';
const REGION = 'us-east-1';
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

export const s3Service = {
  async uploadFile(file: File, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Uploading file to public S3 bucket:', filePath);
      
      // For public buckets, we'll use a simple PUT request
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
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('File uploaded successfully to S3:', filePath);
      return { success: true };
    } catch (error) {
      console.error('S3 upload error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  async downloadFile(filePath: string): Promise<{ data?: Blob; error?: string }> {
    try {
      const url = `${S3_BASE_URL}/${filePath}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return { data: blob };
    } catch (error) {
      console.error('S3 download error:', error);
      return { error: error instanceof Error ? error.message : 'Download failed' };
    }
  },

  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `${S3_BASE_URL}/${filePath}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      console.log('File deleted successfully from S3:', filePath);
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  },

  async getFileInfo(filePath: string): Promise<{ size?: number; lastModified?: Date; error?: string }> {
    try {
      const url = `${S3_BASE_URL}/${filePath}`;
      
      const response = await fetch(url, {
        method: 'HEAD',
      });

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.status} ${response.statusText}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');
      
      return {
        size: contentLength ? parseInt(contentLength) : undefined,
        lastModified: lastModified ? new Date(lastModified) : undefined,
      };
    } catch (error) {
      console.error('S3 head object error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to get file info' };
    }
  },

  async getSignedDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<{ url?: string; error?: string }> {
    try {
      // For public buckets, we can just return the direct URL
      const url = `${S3_BASE_URL}/${filePath}`;
      return { url };
    } catch (error) {
      console.error('S3 signed URL error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to generate signed URL' };
    }
  }
};
