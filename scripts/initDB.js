const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');
const fs = require('fs').promises;

async function initDatabase() {
  const dataDir = resolve(process.cwd(), 'data');
  const dbPath = resolve(dataDir, 'mydatabase.sqlite');

  try {
    // Ensure data directory exists with proper permissions
    await fs.mkdir(dataDir, { recursive: true, mode: 0o755 });
    
    // Create or check database file permissions
    const fileExists = await fs.access(dbPath).then(() => true).catch(() => false);
    if (!fileExists) {
      // Create empty file with write permissions
      await fs.writeFile(dbPath, '', { mode: 0o666 });
    }
    
    // Set permissions to read/write for owner and group, read-only for others
    await fs.chmod(dbPath, 0o666);

    // Initialize database
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) reject(err);
        
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
          `, (err) => {
            if (err) {
              db.close();
              reject(err);
            } else {
              db.close();
              resolve();
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Run initialization
initDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });