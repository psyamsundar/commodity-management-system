import { getDB } from '../../lib/db';
import { parse } from 'cookie';

export default async function handler(req, res) {
  const db = await getDB();

  const cookies = parse(req.headers.cookie || '');
  const user = cookies.user ? JSON.parse(decodeURIComponent(cookies.user)) : null;

  if (!user || !['manager', 'storekeeper'].includes(user.role)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const products = await db.all('SELECT * FROM products');
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    if (user.role !== 'storekeeper' && user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, quantity, price } = req.body;
    if (!name || quantity == null || price == null) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existingProduct = await db.get(
      'SELECT * FROM products WHERE name = ? AND price = ?',
      [name, price]
    );

    const timestamp = new Date().toISOString();

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + quantity;

      await db.run(
        'UPDATE products SET quantity = ? WHERE id = ?',
        [newQuantity, existingProduct.id]
      );

      await db.run(
        `INSERT INTO product_logs (product_name, quantity, price, action, user_email, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, quantity, price, 'update', user.email, timestamp]
      );

      const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', existingProduct.id);
      return res.status(200).json(updatedProduct);
    } else {
      const result = await db.run(
        'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)',
        [name, quantity, price]
      );

      await db.run(
        `INSERT INTO product_logs (product_name, quantity, price, action, user_email, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, quantity, price, 'add', user.email, timestamp]
      );

      const newProduct = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
      return res.status(201).json(newProduct);
    }
  }

  if (req.method === 'PUT') {
    if (user.role !== 'storekeeper' && user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id, name, quantity, price } = req.body;
    if (!id || !name || quantity == null || price == null) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.run(
      'UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?',
      [name, quantity, price, id]
    );

    await db.run(
      `INSERT INTO product_logs (product_name, quantity, price, action, user_email, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, quantity, price, 'edit', user.email, new Date().toISOString()]
    );

    const updated = await db.get('SELECT * FROM products WHERE id = ?', id);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    if (user.role !== 'storekeeper' && user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Missing product ID' });
    }

    const existing = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.run('DELETE FROM products WHERE id = ?', id);

    await db.run(
      `INSERT INTO product_logs (product_name, quantity, price, action, user_email, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [existing.name, existing.quantity, existing.price, 'delete', user.email, new Date().toISOString()]
    );

    return res.status(200).json({ message: 'Product deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
