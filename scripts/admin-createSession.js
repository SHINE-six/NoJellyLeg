const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');

const dbPath = resolve(process.cwd(), 'data', 'mydatabase.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    INSERT INTO sessions (name, location, image, people) VALUES 
    ('Session 1', 'Location 1', ", '["Alice", "Bob"]')
  `);
});