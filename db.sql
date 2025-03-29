-- Active: 1743052210836@@127.0.0.1@3306
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  cover_image TEXT,
  people TEXT,
  date TEXT
);

SELECT * FROM sessions;

DELETE FROM sessions
WHERE id in ('7', '8', '9');

CREATE TABLE IF NOT EXISTS session_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  image_path TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
