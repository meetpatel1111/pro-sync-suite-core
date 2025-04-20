import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { bucket, filePath, fileContent, mimeType } = req.body;
    if (!bucket || !filePath || !fileContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(fileContent, 'base64');
    } catch (err) {
      console.error('Base64 decode error:', err);
      return res.status(400).json({ error: 'Invalid base64 file content' });
    }
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    });
    await s3.send(command);
    const url = `https://${bucket}.s3.amazonaws.com/${filePath}`;
    res.status(200).json({ success: true, url });
  } catch (error: any) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: error.message || 'Unknown S3 upload error' });
  }
}
