CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  cover_image TEXT,
  map TEXT,
  session_media_s3 JSON,
  people TEXT,
  date TEXT
);

SELECT * FROM sessions;

DELETE FROM sessions WHERE id = 2;