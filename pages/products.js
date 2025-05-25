import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from './_app';
import ProductTable from '../components/ProductTable';
import ProductActionHistory from '../components/ProductActionHistory';

export default function Products() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', price: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const [productsRes, logsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/product-logs'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function onEdit(product) {
    setEditing(product.id);
    setForm({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
  }

  function onCancel() {
    setEditing(null);
    setForm({ name: '', quantity: '', price: '' });
  }

  async function onDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const res = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
      const logsRes = await fetch('/api/product-logs');
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    } else {
      alert('Failed to delete product');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || form.quantity === '' || form.price === '') return;

    const body = {
      name: form.name,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
    };

    let res;

    if (editing) {
      body.id = editing;
      res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
    }

    if (res.ok) {
      const updatedProduct = await res.json();

      setProducts(prev => {
        const exists = prev.find(p => p.id === updatedProduct.id);
        if (exists) {
          return prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
        } else {
          return [...prev, updatedProduct];
        }
      });

      onCancel();

      const logsRes = await fetch('/api/product-logs');
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    } else {
      const errorData = await res.json();
      alert('Error saving product: ' + (errorData.message || 'Unknown error'));
    }
  }

  if (!user || (!['storekeeper', 'manager'].includes(user.role))) {
    return <p>Access denied</p>;
  }

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-6">Products</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <form
          onSubmit={onSubmit}
          className="flex-1 space-y-2 bg-white dark:bg-gray-800 p-4 rounded shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
            min="0"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            step="0.01"
            value={form.price}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
            min="0"
          />
          <div className="space-x-2">
            <button
              type="submit"
              className="bg-green-600 px-4 py-2 rounded text-white"
            >
              {editing ? 'Update' : 'Add'} Product
            </button>
            {editing && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-400 px-4 py-2 rounded text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <ProductTable
          products={products}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <ProductActionHistory logs={logs} />
    </div>
  );
}
