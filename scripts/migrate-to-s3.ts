// filepath: /home/shine/Documents/NoJellyLeg/src/scripts/migrate-to-s3.ts
import { createClient } from '@libsql/client';
import { query } from '../utils/db';
import { uploadToS3 } from '../utils/uploadToS3';
import fs from 'fs/promises';
import path from 'path';

// Turso database connection
const TURSO_URL = process.env.TURSO_URL
const TURSO_AUTH_TOKEN= process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  throw new Error('Missing Turso database credentials. Check your .env.local file.');
}

const tursoClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

/**
 * Fetches all sessions from the old Turso database
 */
async function fetchSessionsFromTurso() {
  const result = await tursoClient.execute('SELECT * FROM sessions');
  return result.rows;
}

/**
 * Fetches all session images from the old Turso database
 */
async function fetchSessionImagesFromTurso() {
  const result = await tursoClient.execute('SELECT * FROM session_images');
  return result.rows;
}

/**
 * Converts a data path (which could be a file path or URL) to a base64 data URL
 */
async function convertToDataUrl(imagePath: string): Promise<string> {
  // If it's already a data URL or an S3 URL, return it as is
  if (imagePath.startsWith('data:') || 
      (imagePath.startsWith('https://') && imagePath.includes('amazonaws.com'))) {
    return imagePath;
  }
  
  try {
    // Check if it's a local file path
    const buffer = await fs.readFile(imagePath);
    const mimeType = getMimeType(imagePath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error reading file ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Gets the MIME type based on file extension
 */
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Migrates the data from Turso to MySQL + S3
 */
async function migrateData() {
  try {
    console.log('Starting migration...');
    
    // 1. Fetch all sessions and images from Turso
    const sessions = await fetchSessionsFromTurso();
    const sessionImages = await fetchSessionImagesFromTurso();
    
    console.log(`Found ${sessions.length} sessions and ${sessionImages.length} session images`);
    
    // 2. Process each session
    for (const session of sessions) {
      console.log(`Processing session ${session.id}: ${session.name}`);
      
      // 3. Upload cover image to S3 if it exists
      let s3CoverUrl = null;
      if (session.cover_image) {
        console.log(`- Uploading cover image: ${session.cover_image}`);
        const coverDataUrl = await convertToDataUrl(session.cover_image);
        s3CoverUrl = await uploadToS3(coverDataUrl, 'cover');
        console.log(`- Cover image uploaded to: ${s3CoverUrl}`);
      }
      
      // 4. Find and upload all session images
      const sessionMedias = sessionImages.filter(img => img.session_id === session.id);
      const s3MediaUrls: string[] = [];
      
      console.log(`- Found ${sessionMedias.length} images for this session`);
      
      for (const media of sessionMedias) {
        console.log(`- Uploading media: ${media.image_path}`);
        const mediaDataUrl = await convertToDataUrl(media.image_path);
        const s3MediaUrl = await uploadToS3(mediaDataUrl, 'content');
        s3MediaUrls.push(s3MediaUrl);
        console.log(`- Media uploaded to: ${s3MediaUrl}`);
      }
      
      // 5. Insert into MySQL database
      console.log(`- Inserting session into MySQL`);
      await query(
        'INSERT INTO sessions (name, location, cover_image, people, date, session_media_s3) VALUES (?, ?, ?, ?, ?, ?)',
        [
          session.name,
          session.location || null,
          s3CoverUrl,
          session.people || null,
          session.date || null,
          JSON.stringify(s3MediaUrls)
        ]
      );
      
      console.log(`✓ Session ${session.id} migrated successfully!`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData();
