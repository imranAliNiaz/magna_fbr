'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '../../../lib/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId'); // read invoiceId from URL

  const [formData, setFormData] = useState({
    invoiceType: '',
    invoiceDate: '',
    sellerNTNCNIC: '',
    sellerBusinessName: '',
    sellerProvince: '',
    sellerAddress: '',
    buyerNTNCNIC: '',
    buyerBusinessName: '',
    buyerProvince: '',
    buyerAddress: '',
    buyerRegistrationType: '',
    invoiceRefNo: '',
    scenarioId: '',
    items: [
      {
        hsCode: '',
        productDescription: '',
        rate: '',
        uoM: '',
        quantity: 0,
        totalValues: 0,
        valueSalesExcludingST: 0,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: '',
        furtherTax: 0,
        sroScheduleNo: '',
        fedPayable: 0,
        discount: 0,
        saleType: '',
        sroItemSerialNo: '',
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);

  const numericFields = [
    'quantity',
    'totalValues',
    'valueSalesExcludingST',
    'fixedNotifiedValueOrRetailPrice',
    'salesTaxApplicable',
    'salesTaxWithheldAtSource',
    'furtherTax',
    'fedPayable',
    'discount',
  ];

  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch invoice data if invoiceId exists
  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceId) return;

      try {
        const docRef = doc(db, "invoices", invoiceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const invoiceData = docSnap.data();

          // Ensure items array exists
          if (!invoiceData.items || invoiceData.items.length === 0) {
            invoiceData.items = [
              {
                hsCode: '',
                productDescription: '',
                rate: '',
                uoM: '',
                quantity: 0,
                totalValues: 0,
                valueSalesExcludingST: 0,
                fixedNotifiedValueOrRetailPrice: 0,
                salesTaxApplicable: 0,
                salesTaxWithheldAtSource: 0,
                extraTax: '',
                furtherTax: 0,
                sroScheduleNo: '',
                fedPayable: 0,
                discount: 0,
                saleType: '',
                sroItemSerialNo: '',
              }
            ];
          }

          setFormData({
            invoiceType: invoiceData.invoiceType || '',
            invoiceDate: invoiceData.invoiceDate || '',
            sellerNTNCNIC: invoiceData.sellerNTNCNIC || '',
            sellerBusinessName: invoiceData.sellerBusinessName || '',
            sellerProvince: invoiceData.sellerProvince || '',
            sellerAddress: invoiceData.sellerAddress || '',
            buyerNTNCNIC: invoiceData.buyerNTNCNIC || '',
            buyerBusinessName: invoiceData.buyerBusinessName || '',
            buyerProvince: invoiceData.buyerProvince || '',
            buyerAddress: invoiceData.buyerAddress || '',
            buyerRegistrationType: invoiceData.buyerRegistrationType || '',
            invoiceRefNo: invoiceData.invoiceRefNo || '',
            scenarioId: invoiceData.scenarioId || '',
            items: invoiceData.items,
          });

          setIsEditing(true);
        } else {
          alert('Invoice not found');
          router.replace('/invoice');
        }
      } catch (error) {
        alert('Failed to fetch invoice: ' + (error as Error).message);
        router.replace('/invoice');
      }
    }

    fetchInvoice();
  }, [invoiceId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    field?: string
  ) => {
    const { name, value } = e.target;
    if (index !== undefined && field) {
      const updatedItems = [...formData.items];
      if (numericFields.includes(field)) {
        if (value === '') {
          updatedItems[index][field] = '';
        } else {
          const parsed = parseFloat(value);
          updatedItems[index][field] = isNaN(parsed) ? '' : parsed;
        }
      } else {
        updatedItems[index][field] = value;
      }
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          hsCode: '',
          productDescription: '',
          rate: '',
          uoM: '',
          quantity: 0,
          totalValues: 0,
          valueSalesExcludingST: 0,
          fixedNotifiedValueOrRetailPrice: 0,
          salesTaxApplicable: 0,
          salesTaxWithheldAtSource: 0,
          extraTax: '',
          furtherTax: 0,
          sroScheduleNo: '',
          fedPayable: 0,
          discount: 0,
          saleType: '',
          sroItemSerialNo: '',
        },
      ],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const processedItems = formData.items.map((item) => {
      const newItem = { ...item };
      for (const field of numericFields) {
        if (newItem[field] === '') {
          newItem[field] = 0;
        }
      }
      return newItem;
    });

    const output = {
      invoiceType: formData.invoiceType,
      invoiceDate: normalizeDate(formData.invoiceDate),
      sellerNTNCNIC: formData.sellerNTNCNIC,
      sellerBusinessName: formData.sellerBusinessName,
      sellerProvince: formData.sellerProvince,
      sellerAddress: formData.sellerAddress,
      buyerNTNCNIC: formData.buyerNTNCNIC,
      buyerBusinessName: formData.buyerBusinessName,
      buyerProvince: formData.buyerProvince,
      buyerAddress: formData.buyerAddress,
      buyerRegistrationType: formData.buyerRegistrationType,
      invoiceRefNo: formData.invoiceRefNo,
      scenarioId: formData.scenarioId,
      items: processedItems,
    };

    try {
      if (isEditing && invoiceId) {
        // Update existing document
        const docRef = doc(db, "invoices", invoiceId);
        await updateDoc(docRef, output);
        alert('Invoice updated successfully');
      } else {
        // Add new document
        const docRef = await addDoc(collection(db, "invoices"), output);
        console.log("Document written with ID: ", docRef.id);
        alert('Invoice saved successfully');
      }

      router.push('/invoice/view');
    } catch (error) {
      alert("Failed to save invoice: " + (error as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Add the View Invoices button at the top here */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => router.push('/invoice/view')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          type="button"
        >
          View Invoices
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">{isEditing ? 'Update Invoice' : 'Create Invoice'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Invoice Type */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="invoiceType">
              Invoice Type
            </label>
            <input
              id="invoiceType"
              name="invoiceType"
              value={formData.invoiceType}
              onChange={handleChange}
              placeholder="invoiceType"
              className="p-3 border rounded-md w-full"
              required
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="invoiceDate">
              Invoice Date
            </label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={normalizeDate(formData.invoiceDate)}
              onChange={handleChange}
              className="p-3 border rounded-md w-full"
              required
            />
          </div>

          {/* Remaining fields */}
          {[
            { name: 'sellerNTNCNIC', label: 'Seller NTN / CNIC' },
            { name: 'sellerBusinessName', label: 'Seller Business Name' },
            { name: 'sellerProvince', label: 'Seller Province' },
            { name: 'sellerAddress', label: 'Seller Address' },
            { name: 'buyerNTNCNIC', label: 'Buyer NTN / CNIC' },
            { name: 'buyerBusinessName', label: 'Buyer Business Name' },
            { name: 'buyerProvince', label: 'Buyer Province' },
            { name: 'buyerAddress', label: 'Buyer Address' },
            { name: 'buyerRegistrationType', label: 'Buyer Registration Type' },
            { name: 'invoiceRefNo', label: 'Invoice Reference Number' },
            { name: 'scenarioId', label: 'Scenario ID' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block mb-1 font-medium" htmlFor={name}>
                {label}
              </label>
              <input
                id={name}
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                placeholder={name}
                className="p-3 border rounded-md w-full"
                required
              />
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
          {formData.items.map((item, index) => (
            <div key={index} className="border p-4 rounded-md mb-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Item {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(item) as (keyof typeof item)[]).map((key) => {
                  const labelMap: Record<string, string> = {
                    hsCode: 'HS Code',
                    productDescription: 'Product Description',
                    rate: 'Rate (%)',
                    uoM: 'Unit of Measure (UoM)',
                    quantity: 'Quantity',
                    totalValues: 'Total Values',
                    valueSalesExcludingST: 'Value Sales Excluding Sales Tax',
                    fixedNotifiedValueOrRetailPrice: 'Fixed Notified Value or Retail Price',
                    salesTaxApplicable: 'Sales Tax Applicable',
                    salesTaxWithheldAtSource: 'Sales Tax Withheld At Source',
                    extraTax: 'Extra Tax',
                    furtherTax: 'Further Tax',
                    sroScheduleNo: 'SRO Schedule No',
                    fedPayable: 'FED Payable',
                    discount: 'Discount',
                    saleType: 'Sale Type',
                    sroItemSerialNo: 'SRO Item Serial No',
                  };
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="block mb-1 font-medium" htmlFor={`items-${index}-${key}`}>
                        {labelMap[key] || key}
                      </label>
                      <input
                        id={`items-${index}-${key}`}
                        name={key}
                        value={numericFields.includes(key) && item[key] === 0 ? '0' : item[key]}
                        onChange={(e) => handleChange(e, index, key)}
                        placeholder={key}
                        className="p-2 border rounded-md w-full"
                        required={key === 'hsCode' || key === 'productDescription'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Add Another Item
          </button>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-lg">
          {isEditing ? 'Update Invoice' : 'Submit Invoice'}
        </button>
      </form>
    </div>
  );
}
