// components/ProductActionHistory.js
export default function ProductActionHistory({ logs }) {
  return (
    <div className="mt-10 bg-white dark:bg-gray-800 p-4 rounded shadow overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Product Action History</h2>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left">
            <th className="p-3 font-medium">Timestamp</th>
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Quantity</th>
            <th className="p-3 font-medium">Price</th>
            <th className="p-3 font-medium">Action</th>
            <th className="p-3 font-medium">User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b dark:border-gray-700">
              <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-3">{log.product_name}</td>
              <td className="p-3">{log.quantity}</td>
              <td className="p-3">₹{log.price.toFixed(2)}</td>
              <td className="p-3 capitalize">{log.action}</td>
              <td className="p-3">{log.user_email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
