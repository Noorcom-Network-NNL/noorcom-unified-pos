
import React from 'react';
import { SaleItem } from './saleTypes';

interface ReceiptTemplateProps {
  saleData: {
    customerName: string;
    items: SaleItem[];
    totalAmount: number;
    paymentMethod: string;
    date: string;
    saleId?: string;
  };
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ saleData, companyInfo }, ref) => {
    const defaultCompanyInfo = {
      name: "NoorcomPOS",
      address: "123 Business Street, Nairobi, Kenya",
      phone: "+254 700 000 000",
      email: "info@noorcompos.com"
    };

    const company = companyInfo || defaultCompanyInfo;
    const tax = saleData.totalAmount * 0.16;
    const subtotal = saleData.totalAmount;
    const total = subtotal + tax;

    return (
      <div ref={ref} className="bg-white p-6 max-w-md mx-auto" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold">{company.name}</h1>
          <p className="text-sm">{company.address}</p>
          <p className="text-sm">Phone: {company.phone}</p>
          <p className="text-sm">Email: {company.email}</p>
        </div>

        <div className="border-t border-b border-dashed py-2 mb-4">
          <h2 className="text-center font-bold">RECEIPT</h2>
        </div>

        {/* Receipt Info */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(saleData.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{new Date(saleData.date).toLocaleTimeString()}</span>
          </div>
          {saleData.saleId && (
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{saleData.saleId.slice(-8).toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{saleData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="capitalize">{saleData.paymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-dashed pt-2 mb-4">
          <div className="text-sm font-bold mb-2">ITEMS</div>
          {saleData.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="flex-1">{item.productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{item.quantity} x KES {item.price.toLocaleString()}</span>
                <span>KES {item.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed pt-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (16%):</span>
            <span>KES {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-dashed pt-1 mt-1">
            <span>TOTAL:</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-4 border-t border-dashed pt-2">
          <p>Thank you for your business!</p>
          <p>Have a great day!</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate;
