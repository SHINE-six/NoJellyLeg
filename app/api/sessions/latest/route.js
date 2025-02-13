import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { resolve } from 'path';

// Initialize database connection
function getDb() {
  // Use /tmp for Vercel's writable directory
  const dbPath = process.env.VERCEL 
    ? '/tmp/mydatabase.sqlite' 
    : resolve(process.cwd(), 'data', 'mydatabase.sqlite');
    
  const db = new Database(dbPath);

  return db;
}

export async function GET() {
  let db;
  try {
    db = getDb();
    const row = db.prepare(
      'SELECT * FROM sessions ORDER BY datetime DESC LIMIT 1'
    ).get();

    console.log('Latest session:', row);
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.close();
  }
}