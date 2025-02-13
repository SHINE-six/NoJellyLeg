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
    const rows = db.prepare('SELECT * FROM sessions').all();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.close();
  }
}

// export async function POST(request) {
//   try {
//     const data = await request.json();
//     const result = await new Promise((resolve, reject) => {
//       db.run(
//         'INSERT INTO sessions (name, location, image, people) VALUES (?, ?, ?, ?)',
//         [data.name, data.location, data.image, JSON.stringify(data.people || [])],
//         function(err) {
//           if (err) reject(err);
//           else resolve({ id: this.lastID });
//         }
//       );
//     });
//     return NextResponse.json(result);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
