import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function PUT(request, context) {
  const { params } = context;
  try {
    const data = await request.json();
    // Update session
    await client.execute(
      'UPDATE sessions SET people = ? WHERE id = ?',
      [JSON.stringify(data.people), parseInt(params.id, 10)]
    );
    
    // Fetch updated session
    const { rows: [updatedSession] } = await client.execute(
      'SELECT * FROM sessions WHERE id = ?',
      [parseInt(params.id, 10)]
    );
    
    // Parse the people array from JSON string
    updatedSession.people = JSON.parse(updatedSession.people);
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}