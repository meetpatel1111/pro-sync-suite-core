
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_NAME = 'pro-sync-suit-core';
const REGION = 'us-east-1'; // Update with your bucket's region

// S3 client configuration
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const s3Service = {
  async uploadFile(file: File, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Uploading file directly to S3:', filePath);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: file,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);
      console.log('File uploaded successfully to S3:', filePath);
      
      return { success: true };
    } catch (error) {
      console.error('S3 upload error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  async downloadFile(filePath: string): Promise<{ data?: Blob; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });

      const response = await s3Client.send(command);
      
      if (response.Body) {
        // Convert stream to blob
        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const blob = new Blob(chunks, { type: response.ContentType });
        return { data: blob };
      }
      
      return { error: 'No file data received' };
    } catch (error) {
      console.error('S3 download error:', error);
      return { error: error instanceof Error ? error.message : 'Download failed' };
    }
  },

  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });

      await s3Client.send(command);
      console.log('File deleted successfully from S3:', filePath);
      
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  },

  async getFileInfo(filePath: string): Promise<{ size?: number; lastModified?: Date; error?: string }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });

      const response = await s3Client.send(command);
      
      return {
        size: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch (error) {
      console.error('S3 head object error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to get file info' };
    }
  },

  async getSignedDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<{ url?: string; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return { url };
    } catch (error) {
      console.error('S3 signed URL error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to generate signed URL' };
    }
  }
};
