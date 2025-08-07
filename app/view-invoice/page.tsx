'use client';

import { useState, useEffect } from 'react';

export default function ViewInvoice() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoice');
        const data = await res.json();
        if (data.success) {
          setInvoices(data.invoices);
        } else {
          setError(data.error || 'Failed to fetch invoices');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const handleView = (id: string) => {
    alert(`View details for invoice ID: ${id}`);
    // TODO: Implement detailed view or navigate to detailed invoice page
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await fetch(`/api/invoice/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      } else {
        alert('Failed to delete invoice: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting invoice: ' + (err as Error).message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading invoices...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (invoices.length === 0) return <div className="p-6 text-center">No invoices found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow-lg overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Invoices</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left">Invoice Type</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Invoice Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(({ _id, invoiceType, invoiceDate }) => (
            <tr key={_id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{invoiceType}</td>
              <td className="border border-gray-300 px-4 py-2">{invoiceDate}</td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                <button
                  onClick={() => handleView(_id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
