'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function InvoiceView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const querySnapshot = await getDocs(collection(db, 'invoices'));
        let invoicesList: any[] = [];
        querySnapshot.forEach((doc) => {
          invoicesList.push({ _id: doc.id, ...doc.data() });
        });
        setInvoices(invoicesList);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const handleView = (id: string) => {
    router.push(`/invoice?invoiceId=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'invoices', id));
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      alert('Error deleting invoice: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-[100%] mx-auto p-6 bg-white rounded  overflow-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/invoice')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            type="button"
          >
            Back
          </button>
        </div>
        <div className="p-6 text-center">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-[100%] mx-auto p-6 bg-white rounded  overflow-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/invoice')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            type="button"
          >
            Back
          </button>
        </div>
        <div className="p-6 text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-[100%] mx-auto p-6 bg-white rounded  overflow-auto">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/invoice')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          type="button"
        >
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Invoices</h1>

      {invoices.length === 0 ? (
        <div className="p-6 text-center">No invoices found.</div>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left font-semibold">Invoice Type</th>
              <th className="p-3 text-left font-semibold">Invoice Date</th>
              <th className="p-3 text-left font-semibold">Seller Business Name</th>
              <th className="p-3 text-left font-semibold">Buyer Business Name</th>
              <th className="p-3 text-left font-semibold">Invoice Ref No</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(
              ({
                _id,
                invoiceType,
                invoiceDate,
                sellerBusinessName,
                buyerBusinessName,
                invoiceRefNo,
              }) => (
                <tr
                  key={_id}
                  className="even:bg-gray-50 odd:bg-white hover:bg-blue-100 transition-colors"
                >
                  <td className="p-3">{invoiceType || '-'}</td>
                  <td className="p-3">{invoiceDate || '-'}</td>
                  <td className="p-3">{sellerBusinessName || '-'}</td>
                  <td className="p-3">{buyerBusinessName || '-'}</td>
                  <td className="p-3">{invoiceRefNo || '-'}</td>
                  <td className="p-3 space-x-2 flex ">
                    <button
                      onClick={() => handleView(_id)}
                      className="px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(_id)}
                      className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
