import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from './_app';

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    router.push(user.role === 'manager' ? '/dashboard' : '/products');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
      router.push(userData.role === 'manager' ? '/dashboard' : '/products');
    } else {
      const err = await res.json();
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white dark:bg-gray-800">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded w-full text-black dark:text-white bg-white dark:bg-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded w-full text-black dark:text-white bg-white dark:bg-gray-700"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
