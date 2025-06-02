
import React from 'react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  description: string;
  dueDate: string;
  createdAt: string;
  items?: InvoiceItem[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoiceNumber, customerName, amount, description, dueDate, createdAt, items, companyInfo }, ref) => {
    const defaultCompanyInfo = {
      name: "NoorcomPOS",
      address: "123 Business Street, Nairobi, Kenya",
      phone: "+254 700 000 000",
      email: "info@noorcompos.com"
    };

    const company = companyInfo || defaultCompanyInfo;
    const invoiceItems = items || [{ description, quantity: 1, unitPrice: amount, total: amount }];

    return (
      <div ref={ref} className="bg-white p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">{company.name}</h1>
            <div className="text-gray-600 mt-2">
              <p>{company.address}</p>
              <p>Phone: {company.phone}</p>
              <p>Email: {company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-600 mt-2">#{invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
            <p className="text-gray-700 font-medium">{customerName}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-600">Invoice Date: </span>
              <span className="font-medium">{new Date(createdAt).toLocaleDateString()}</span>
            </div>
            {dueDate && (
              <div>
                <span className="text-gray-600">Due Date: </span>
                <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">KSh {item.unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">KSh {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="font-semibold">Subtotal:</span>
              <span>KSh {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="font-semibold">Tax (16%):</span>
              <span>KSh {(amount * 0.16).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
              <span>Total:</span>
              <span>KSh {(amount * 1.16).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Thank you for your business!</p>
          <p className="mt-2">Payment is due within 30 days unless otherwise specified.</p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
