'use server';

import { query } from './db';
import { uploadToS3, generatePresignedUrl } from './uploadToS3';

// Define types for database records
interface Session {
  id: number;
  name: string;
  location: string;
  cover_image: string | null;
  map: string | null;
  people: string;
  date: string;
  session_media_s3?: string[] | null;
  media_count?: number;
  content_medias?: string[];
}

/**
 * Functions for interacting with the sessions table
 */
// Get all sessions
export async function getAllSessions(): Promise<Session[]> {
  const result = await query('SELECT * FROM sessions ORDER BY date DESC');
  
  // Process sessions to add media_count and convert S3 URLs to pre-signed URLs
  const processedSessions = (result.rows as Session[]).map((session: Session) => {
    // Parse the session_media_s3 JSON field if it exists
    const mediaArray = session.session_media_s3 
      ? (typeof session.session_media_s3 === 'string' 
          ? JSON.parse(session.session_media_s3) 
          : session.session_media_s3)
      : [];
    
    // Generate pre-signed URL for the cover image if it exists
    const coverImage = session.cover_image 
      ? generatePresignedUrl(session.cover_image)
      : null;
    
    // Generate pre-signed URLs for all media
    const contentMedias = Array.isArray(mediaArray) 
      ? mediaArray.map(mediaUrl => generatePresignedUrl(mediaUrl))
      : [];
    
    return {
      ...session,
      cover_image: coverImage,
      media_count: Array.isArray(mediaArray) ? mediaArray.length : 0,
      content_medias: contentMedias
    };
  });
  
  return processedSessions;
}

// Get a single session by ID with all its medias
export async function getSessionById(id: number): Promise<Session | null> {
  // Get the session data
  const sessionResult = await query('SELECT * FROM sessions WHERE id = ?', [id]);
  const session = (sessionResult.rows as Session[])[0];
  
  if (!session) return null;
  
  // Parse the session_media_s3 JSON field if it exists
  const mediaArray = session.session_media_s3 
    ? (typeof session.session_media_s3 === 'string' 
        ? JSON.parse(session.session_media_s3) 
        : session.session_media_s3)
    : [];

  // Generate pre-signed URLs for the cover image and all content medias
  const coverImage = session.cover_image 
    ? generatePresignedUrl(session.cover_image)
    : null;
  
  const contentMedias = Array.isArray(mediaArray) 
    ? mediaArray.map(mediaUrl => generatePresignedUrl(mediaUrl))
    : [];

  // Return session with pre-signed URLs
  return {
    ...session,
    cover_image: coverImage,
    content_medias: contentMedias
  };
}

// Create a new session and its associated medias
export async function createSession(session: {
  name: string;
  location: string;
  cover_image: string;
  map?: string;
  content_medias: string[];
  people: string;
  date?: string;
}): Promise<Session | null> {
  const { name, location, cover_image, map, content_medias, people, date } = session;
  
  try {
    // 1. Upload cover media to S3
    console.log('cover_image', cover_image);
    const s3CoverUrl = await uploadToS3(cover_image, 'cover');
    
    // 2. Upload content medias to S3
    const s3MediaUrls: string[] = [];
    if (content_medias && content_medias.length > 0) {
      for (const mediaDataUrl of content_medias) {
        console.log('mediaDataUrl', mediaDataUrl);
        const s3MediaUrl = await uploadToS3(mediaDataUrl, 'content');
        s3MediaUrls.push(s3MediaUrl);
      }
    }
    
    // 3. Insert the session with S3 URLs for cover media and content medias
    const sessionSql = date
      ? 'INSERT INTO sessions (name, location, cover_image, map, people, date, session_media_s3) VALUES (?, ?, ?, ?, ?, ?, ?)'
      : 'INSERT INTO sessions (name, location, cover_image, map, people, session_media_s3) VALUES (?, ?, ?, ?, ?, ?)';
    
    const sessionParams = date
      ? [name, location, s3CoverUrl, map || null, people, date, JSON.stringify(s3MediaUrls)]
      : [name, location, s3CoverUrl, map || null, people, JSON.stringify(s3MediaUrls)];
    
    await query(sessionSql, sessionParams);
    
    // 4. Get the new session ID
    const newSessionIdResult = await query('SELECT LAST_INSERT_ID() as id');
    const newSessionId = (newSessionIdResult.rows as any[])[0]?.id;
    
    // 5. Return the newly created session
    return getSessionById(newSessionId);
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Update an existing session
export async function updateSession(
  id: number,
  sessionData: Partial<{
    name: string;
    location: string;
    cover_image: string;
    map: string;
    content_medias: string[];
    people: string;
    date: string;
  }>
): Promise<Session | null> {
  const { content_medias, ...sessionFields } = sessionData;
  
  try {
    // Get current session to access current media array
    const currentSession = await getSessionById(id);
    if (!currentSession) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    // 1. Upload new cover media to S3 if provided
    if (sessionFields.cover_image && sessionFields.cover_image.startsWith('data:')) {
      console.log('sessionFields.cover_image', sessionFields.cover_image);
      sessionFields.cover_image = await uploadToS3(sessionFields.cover_image, 'cover');
    }
    
    // 2. Process new content medias if provided
    let updatedMedias: string[] = currentSession.content_medias || [];
    
    if (content_medias && content_medias.length > 0) {
      // Upload new medias (those that are base64 data URLs)
      const newMediaUrls: string[] = [];
      
      for (const mediaDataUrl of content_medias) {
        if (mediaDataUrl.startsWith('data:')) {
          console.log('mediaDataUrl', mediaDataUrl);
          const s3MediaUrl = await uploadToS3(mediaDataUrl, 'content');
          newMediaUrls.push(s3MediaUrl);
        } else {
          // This is an already uploaded media
          newMediaUrls.push(mediaDataUrl);
        }
      }
      
      // Determine if we're replacing or adding
      if (sessionData.content_medias && 'content_medias' in sessionData) {
        // If content_medias was explicitly passed, we're replacing the entire array
        updatedMedias = newMediaUrls;
      } else {
        // Otherwise, we're adding to the existing array
        updatedMedias = [...updatedMedias, ...newMediaUrls];
      }
    }
    
    // 3. Update the session data including the session_media_s3 field
    const updates: string[] = [];
    const values = [];
    
    // Add the regular fields
    Object.entries(sessionFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    // Add the session_media_s3 field
    updates.push('session_media_s3 = ?');
    values.push(JSON.stringify(updatedMedias));
    
    values.push(id); // Add ID to the values array for the WHERE clause
    
    await query(
      `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // 4. Return the updated session
    return getSessionById(id);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

// Add a single media to a session
export async function addSessionMedia(sessionId: number, mediaPath: string): Promise<boolean> {
  try {
    // Get current session
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }
    
    // Get current media array and add new media
    const mediaArray = session.content_medias || [];
    mediaArray.push(mediaPath);
    
    // Update the session with the new media array
    await query(
      'UPDATE sessions SET session_media_s3 = ? WHERE id = ?',
      [JSON.stringify(mediaArray), sessionId]
    );
    
    return true;
  } catch (error) {
    console.error('Error adding session media:', error);
    throw error;
  }
}

// Interface for session media items
interface SessionMedia {
  media_path: string;
}

// Get all medias for a session
export async function getSessionMedias(sessionId: number): Promise<SessionMedia[]> {
  const session = await getSessionById(sessionId);
  if (!session) {
    return [];
  }
  
  // Convert the content_medias array to the expected format
  return (session.content_medias || []).map(path => ({ media_path: path }));
}

// Delete a session
export async function deleteSession(id: number): Promise<boolean> {
  try {
    // Since we've merged the tables, we only need to delete from sessions table
    await query('DELETE FROM sessions WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// Delete a specific media from a session
export async function deleteSessionMedia(mediaId: number, sessionId: number): Promise<boolean> {
  try {
    // Get current session
    const session = await getSessionById(sessionId);
    if (!session || !session.content_medias) {
      throw new Error(`Session with id ${sessionId} not found or has no media`);
    }
    
    // Filter out the media to delete (assumes mediaId is the index in the array)
    const updatedMedias = session.content_medias.filter((_, index) => index !== mediaId);
    
    // Update the session with the new media array
    await query(
      'UPDATE sessions SET session_media_s3 = ? WHERE id = ?',
      [JSON.stringify(updatedMedias), sessionId]
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting session media:', error);
    throw error;
  }
}