-- Active: 1743052210836@@127.0.0.1@3306
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  cover_image TEXT,
  people TEXT,
  date TEXT
);

DELETE FROM sessions
WHERE id = 2;

CREATE TABLE IF NOT EXISTS session_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  image_path TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
