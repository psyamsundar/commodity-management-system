import Link from 'next/link';
import ThemeToggleButton from './ThemeToggleButton';

export default function Navbar({ user, theme, setTheme }) {
  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 p-4 text-black dark:text-white">
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          {!user && (
            <span className="text-lg font-semibold">Commodity Management</span>
          )}
          {user && (
            <Link href="/products" className="hover:underline">Products</Link>
          )}
          {user?.role === 'manager' && (
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          )}
        </div>

        <div className="space-x-4 flex items-center">
          <ThemeToggleButton />
          {user ? (
            <>
              <span className="text-sm">{user.username}</span>
              <button onClick={logout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Logout</button>
            </>
          ) : (
            <Link href="/login" className="bg-blue-500 px-3 py-1 rounded text-white">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
