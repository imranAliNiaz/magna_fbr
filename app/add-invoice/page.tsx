import InvoiceForm from '../components/invoice/Invoice';

export default function AddInvoice() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Invoice</h1>
      <InvoiceForm />
    </div>
  );
}
