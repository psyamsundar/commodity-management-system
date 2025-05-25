import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function getDB() {
  if (db) return db;

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });

  // Initialize tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      quantity INTEGER,
      price REAL
    );
  `);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS product_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT,
    quantity INTEGER,
    price REAL,
    action TEXT,
    user_email TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


  return db;
}
