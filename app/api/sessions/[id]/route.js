import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { resolve } from 'path';

// Initialize database connection
function getDb() {
  const dataDir = resolve(process.cwd(), 'data');
  const dbPath = resolve(dataDir, 'mydatabase.sqlite');
  const db = new Database(dbPath);

  return db;
}

export async function PUT(request, context) {
  const { params } = context;
  let db;
  try {
    db = getDb();
    const data = await request.json();
    console.log('Received data:', data);
    
    const stmt = db.prepare('UPDATE sessions SET people = ? WHERE id = ?');
    stmt.run(JSON.stringify(data.people), parseInt(params.id, 10));
    
    return NextResponse.json({ people: data.people });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.close();
  }
}