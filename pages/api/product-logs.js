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
    const logs = await db.all('SELECT * FROM product_logs ORDER BY timestamp DESC');
    return res.status(200).json(logs);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
