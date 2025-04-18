import mysql from 'mysql2/promise';

// Required environment variables for AWS RDS MySQL
const DB_HOST = process.env.NEXT_PUBLIC_DB_HOST;
const DB_USER = process.env.NEXT_PUBLIC_DB_USER;
const DB_PASSWORD = process.env.NEXT_PUBLIC_DB_PASSWORD; 
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME;
const DB_PORT = process.env.NEXT_PUBLIC_DB_PORT || '3306';

// Create a MySQL connection pool - but only on the server side
let pool: mysql.Pool | null = null;

// Make sure this only runs on the server side
if (typeof window === 'undefined') {
  // Server-side code
  // Validate required environment variables
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing required database environment variables. Please check your .env.local file.');
  }

  // Create a MySQL connection pool
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: parseInt(DB_PORT, 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

/**
 * Execute a query against the MySQL database
 * @param sql The SQL query to execute
 * @param params Optional parameters for the query
 * @returns Result of the query
 */
export async function query(sql: string, params: any[] = []) {
  // Ensure this function is only called on the server
  if (typeof window !== 'undefined') {
    throw new Error('Database queries can only be executed on the server side');
  }
  
  if (!pool) {
    throw new Error('Database connection pool not initialized');
  }
  
  try {
    const [rows, fields] = await pool.query(sql, params);
    return { rows, fields };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a batch of queries as a transaction
 * @param queries Array of query objects with sql and params
 * @returns Array of results from each query
 */
export async function transaction(queries: { sql: string; params: any[] }[]) {
  // Ensure this function is only called on the server
  if (typeof window !== 'undefined') {
    throw new Error('Database transactions can only be executed on the server side');
  }
  
  if (!pool) {
    throw new Error('Database connection pool not initialized');
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.query(sql, params);
      results.push({ rows });
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
}
