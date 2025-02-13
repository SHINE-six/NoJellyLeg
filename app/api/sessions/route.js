import { NextResponse } from 'next/server';
const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');

const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
const db = new sqlite3.Database(dbPath);

export async function GET() {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM sessions', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
