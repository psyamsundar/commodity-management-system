import { useState, createContext } from 'react';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';
import Navbar from '../components/Navbar';

export const UserContext = createContext(null);

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <UserContext.Provider value={{ user, setUser }}>
        <Navbar user={user} />
        <main className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Component {...pageProps} />
        </main>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default MyApp;

