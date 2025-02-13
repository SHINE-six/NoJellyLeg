import { NextResponse } from 'next/server';
const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');

const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
  } else {
    console.log('Database opened successfully');
  }
});

export async function PUT(request, { params }) {

  try {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}