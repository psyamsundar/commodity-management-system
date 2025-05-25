// pages/dashboard.js
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from './_app';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!user) return router.push('/login');
    if (user.role !== 'manager') return;

    const fetchData = async () => {
      const productsRes = await fetch('/api/products');
      const logsRes = await fetch('/api/product-logs');

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    };

    fetchData();
  }, [user, router]);

  if (!user || user.role !== 'manager') {
    return <p className="p-4">Access denied</p>;
  }

  // Summary calculations
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const recentLogs = logs.slice(0, 5);
  const lowStock = products.filter(p => p.quantity < 5);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Section 1: Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-2xl">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Quantity</h2>
          <p className="text-2xl">{totalQuantity}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Value</h2>
          <p className="text-2xl">₹{totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Section 2: Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <ul className="space-y-2">
          {recentLogs.map(log => (
            <li key={log.id} className="border-b pb-1">
              {new Date(log.timestamp).toLocaleString()} — {log.user_email} {log.action}d "{log.product_name}" (Qty: {log.quantity}, Price: ₹{log.price})
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: Low Stock Alerts */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Low Stock Alerts</h2>
        {lowStock.length === 0 ? (
          <p>All products sufficiently stocked.</p>
        ) : (
          <ul className="space-y-1">
            {lowStock.map(p => (
              <li key={p.id} className="text-red-600">
                {p.name} — Only {p.quantity} left
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
