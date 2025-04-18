// filepath: /home/shine/Documents/NoJellyLeg/src/utils/uploadToS3.ts
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Required environment variables for AWS S3
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-2';
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_KEY;

// Validate required environment variables
if (!S3_BUCKET || !AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
  throw new Error('Missing required AWS S3 environment variables. Please check your .env file.');
}

// Configure AWS SDK
AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

const s3 = new AWS.S3();

/**
 * Uploads a base64 data URL to S3 and returns the S3 URL
 * @param dataUrl Base64 data URL of the file to upload
 * @param type Type of media ('cover' or 'content')
 * @returns The S3 URL of the uploaded file
 */
export async function uploadToS3(dataUrl: string, type: 'cover' | 'content'): Promise<string> {
  // Check if this is already an S3 URL, if so, just return it
  if (dataUrl.startsWith('https://') && dataUrl.includes('amazonaws.com')) {
    return dataUrl;
  }

  try {
    // Extract content type and base64 data from data URL
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URL');
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename with proper extension
    const extension = contentType.split('/')[1] || 'png';
    const filename = `${type}-${uuidv4()}.${extension}`;
    
    // Ensure bucket name is defined
    if (!S3_BUCKET) {
      throw new Error('S3 bucket name is undefined');
    }
    
    // Upload to S3
    const params = {
      Bucket: S3_BUCKET,
      Key: `${type}s/${filename}`,
      Body: buffer,
      ContentType: contentType,
      ContentEncoding: 'base64'
    };
    
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Generates a pre-signed URL for an S3 object
 * @param objectKey The S3 object key
 * @param expiresIn How long the URL is valid in seconds (default: 1 hour)
 * @returns The pre-signed URL
 */
export function generatePresignedUrl(objectKey: string, expiresIn = 3600): string {
  try {
    // Check if objectKey is already a full URL
    if (objectKey.startsWith('https://')) {
      // Extract the object key from the URL
      const urlObj = new URL(objectKey);
      const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
      objectKey = pathname;
    }

    // Generate pre-signed URL
    const params = {
      Bucket: S3_BUCKET || '',
      Key: objectKey,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    // Return the original key if we can't generate a pre-signed URL
    return objectKey;
  }
}
