import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function GET() {
  try {
    const result = await client.execute(
      'SELECT * FROM sessions ORDER BY datetime DESC LIMIT 1'
    );
    console.log('RESULT:', result);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}