import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-black dark:text-white"
    >
      {theme === 'light' ? '🌞' : '🌜'}
    </button>
  );
}

