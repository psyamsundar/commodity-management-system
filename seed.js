// seed.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)
  `);

  stmt.run('manager@site.com', 'password', 'manager');
  stmt.run('storekeeper@site.com', 'password', 'storekeeper');

  stmt.finalize();

  console.log('Seeded users.');
});

db.close();
