const Database = require('better-sqlite3');
const { resolve } = require('path');

// Use /tmp for Vercel's writable directory
const dbPath = process.env.VERCEL 
  ? '/tmp/mydatabase.sqlite' 
  : resolve(process.cwd(), 'data', 'mydatabase.sqlite');
  
const db = new Database(dbPath);

// Create tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    image TEXT,
    people TEXT,
    datetime TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.close();