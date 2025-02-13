import { NextResponse } from 'next/server';
const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');

const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
const db = new sqlite3.Database(dbPath);

export async function GET() {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM sessions ORDER BY datetime DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
