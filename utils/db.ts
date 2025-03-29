import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Required environment variables
const TURSO_DATABASE_URL = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;


if (!TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is required');
}

// Create client with auth token if available
const client = createClient({
  url: TURSO_DATABASE_URL,
  ...(TURSO_AUTH_TOKEN && { authToken: TURSO_AUTH_TOKEN }),
});

/**
 * Execute a query against the Turso database
 * @param sql The SQL query to execute
 * @param params Optional parameters for the query
 * @returns Result of the query
 */
// @ts-nocheck
export async function query(sql: string, params = []) {
  try {
    return await client.execute({ sql, args: params });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a batch of queries as a transaction
 * @param queries Array of {sql, params} objects to execute
 * @returns Results of the transaction
 */
export async function transaction(queries: Array<{ 
  sql: string; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any 
}>) {
  try {
    return await client.batch(
      queries.map(({ sql, params = [] }) => ({
        sql,
        args: params,
      }))
    );
  } catch (error) {
    console.error('Database transaction error:', error);
    throw error;
  }
}

export default {
  query,
  transaction,
  client,
};