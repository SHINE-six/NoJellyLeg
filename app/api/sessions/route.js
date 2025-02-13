import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function GET() {
  try {
    const result = await client.query('SELECT * FROM sessions');
    return NextResponse.json(result);
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
