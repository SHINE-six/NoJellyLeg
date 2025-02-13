import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { promises as fs } from 'fs';

async function getDb() {
  const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
  
  // Ensure data directory exists
  try {
    await fs.mkdir(resolve(process.cwd(), 'data'), { recursive: true });
    
    // Check if database exists, if not create it
    if (!await fs.access(dbPath).catch(() => false)) {
      await fs.writeFile(dbPath, '');
      // Set file permissions to allow read/write
      await fs.chmod(dbPath, 0o666);
    }
  } catch (err) {
    console.error('Error preparing database:', err);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, 
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
      (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        }
        resolve(db);
    });
  });
}

export async function PUT(request, { params }) {
  let db = null;
  
  try {
    db = await getDb();
    const data = await request.json();
    console.log('Received data:', data);
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE sessions SET people = ? WHERE id = ?',
        [JSON.stringify(data.people), params.id],
        function(err) {
          if (err) reject(err);
          else resolve({ people: data.people });
        }
      );
    });
    
    return NextResponse.json({ people: data.people });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update participants: ' + error.message }, 
      { status: 500 }
    );
    
  } finally {
    // Always close the database connection
    if (db) {
      db.close((err) => {
        if (err) console.error('Error closing database:', err);
      });
    }
  }
}