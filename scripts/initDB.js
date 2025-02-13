const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');

const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      location TEXT,
      image TEXT,
      people TEXT,
      datetime TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

db.close();