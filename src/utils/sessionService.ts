import db from '../utils/db';

/**
 * Functions for interacting with the sessions and session_images tables
 */
// Get all sessions
export async function getAllSessions() {
  const result = await db.query('SELECT * FROM sessions ORDER BY date DESC');
  
  // For each session, get the count of images
  const sessionsWithImageCount = await Promise.all(
    result.rows.map(async (session) => {
      const imageCountResult = await db.query(
        'SELECT COUNT(*) as image_count FROM session_images WHERE session_id = ?', 
        [session.id]
      );
      
      return {
        ...session,
        image_count: imageCountResult.rows[0]?.image_count || 0
      };
    })
  );
  
  return sessionsWithImageCount;
}

// Get a single session by ID with all its images
export async function getSessionById(id: number) {
  // Get the session data
  const sessionResult = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
  const session = sessionResult.rows[0];
  
  if (!session) return null;
  
  // Get all images for this session
  const imagesResult = await db.query(
    'SELECT * FROM session_images WHERE session_id = ?',
    [id]
  );
  
  // Add the images to the session object
  return {
    ...session,
    content_images: JSON.stringify(imagesResult.rows.map(row => row.image_path))
  };
}

// Create a new session and its associated images
export async function createSession(session: {
  name: string;
  location: string;
  cover_image: string;
  content_images: string[];
  people: string;
  date?: string;
}) {
  const { name, location, cover_image, content_images, people, date } = session;
  
  // Start a transaction
  const queries = [];
  
  // 1. Insert the session
  const sessionSql = date
    ? 'INSERT INTO sessions (name, location, cover_image, people, date) VALUES (?, ?, ?, ?, ?) RETURNING *'
    : 'INSERT INTO sessions (name, location, cover_image, people) VALUES (?, ?, ?, ?) RETURNING *';
  
  const sessionParams = date
    ? [name, location, cover_image, people, date]
    : [name, location, cover_image, people];
  
  queries.push({ sql: sessionSql, params: sessionParams });
  
  // Execute the transaction to get the session ID
  const results = await db.transaction(queries);
  const newSession = results[0].rows[0];
  
  // 2. Insert the images
  if (content_images && content_images.length > 0) {
    for (const imagePath of content_images) {
      await db.query(
        'INSERT INTO session_images (session_id, image_path) VALUES (?, ?)',
        [newSession.id, imagePath]
      );
    }
  }
  
  // Return the newly created session with its images
  return getSessionById(Number(newSession.id));
}

// Update an existing session
export async function updateSession(
  id: number,
  sessionData: Partial<{
    name: string;
    location: string;
    cover_image: string;
    content_images: string[];
    people: string;
    date: string;
  }>
) {
  const { content_images, ...sessionFields } = sessionData;
  
  // 1. Update the session data if there are fields to update
  if (Object.keys(sessionFields).length > 0) {
    // Build the SET part of the query dynamically based on what fields are provided
    const updates: string[] = [];
    // @ts-nocheck
    const values = [];
    
    Object.entries(sessionFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updates.length > 0) {
      values.push(id); // Add ID to the values array for the WHERE clause
      
      await db.query(
        `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
  }
  
  // 2. Update images if provided
  if (content_images && content_images.length > 0) {
    // Add new images
    for (const imagePath of content_images) {
      await db.query(
        'INSERT INTO session_images (session_id, image_path) VALUES (?, ?)',
        [id, imagePath]
      );
    }
  }
  
  // Return the updated session with its images
  return getSessionById(id);
}

// Delete a session (cascade will automatically delete associated images)
export async function deleteSession(id: number) {
  await db.query('DELETE FROM sessions WHERE id = ?', [id]);
  return true;
}

// Add a single image to a session
export async function addSessionImage(sessionId: number, imagePath: string) {
  await db.query(
    'INSERT INTO session_images (session_id, image_path) VALUES (?, ?)',
    [sessionId, imagePath]
  );
  return true;
}

// Delete a specific image from a session
export async function deleteSessionImage(imageId: number) {
  await db.query('DELETE FROM session_images WHERE id = ?', [imageId]);
  return true;
}

// Get all images for a session
export async function getSessionImages(sessionId: number) {
  const result = await db.query(
    'SELECT * FROM session_images WHERE session_id = ?',
    [sessionId]
  );
  return result.rows;
}