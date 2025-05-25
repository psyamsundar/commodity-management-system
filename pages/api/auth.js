import { serialize } from 'cookie';
import { getDB } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const db = await getDB();

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.setHeader('Set-Cookie', serialize('user', encodeURIComponent(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
  })), {
    path: '/', 
    httpOnly: false, 
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax', 
    secure: process.env.NODE_ENV === 'production',
  }));

  res.status(200).json({ id: user.id, email: user.email, role: user.role });
}
