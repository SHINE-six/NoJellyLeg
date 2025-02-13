const Database = require('better-sqlite3');
const { resolve } = require('path');
const fs = require('fs');

const dataDir = resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = resolve(dataDir, 'mydatabase.sqlite');
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