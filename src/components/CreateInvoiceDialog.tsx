import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Printer, Plus, Trash2, User } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';
import { createInvoice, getCustomers } from '@/services/firebaseService';
import InvoiceTemplate from './InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Customer } from '@/types/customer';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreateInvoiceDialogProps {
  children: React.ReactNode;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const CreateInvoiceDialog = ({ children }: CreateInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  
  const { currentUser } = useFirebase();
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Fetch customers when dialog opens
      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const customerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];
        setCustomers(customerData);
      });

      return () => unsubscribe();
    }
  }, [open]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email || '');
    setCustomerPhone(customer.phone);
    setShowCustomerDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      toast({
        title: "Error",
        description: "Customer name and phone are required",
        variant: "destructive"
      });
      return;
    }

    if (items.some(item => !item.description || item.price <= 0)) {
      toast({
        title: "Error",
        description: "All items must have description and valid price",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newInvoiceData = {
        customerName,
        customerEmail,
        customerPhone,
        customerId: selectedCustomer?.id,
        items,
        amount: getTotalAmount(),
        dueDate,
        status: 'Pending',
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid
      };

      await createInvoice(newInvoiceData);
      console.log('Creating invoice:', newInvoiceData);
      
      setInvoiceData(newInvoiceData);
      setShowPreview(true);
      
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current || !invoiceData) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const printThermal = () => {
    if (!invoiceData) return;

    const thermalContent = `
      ================================
      ${invoiceData.invoiceNumber}
      ================================
      
      NoorcomPOS
      123 Business Street
      Nairobi, Kenya
      Phone: +254 700 000 000
      
      --------------------------------
      
      Customer: ${invoiceData.customerName}
      Phone: ${invoiceData.customerPhone}
      ${invoiceData.customerEmail ? `Email: ${invoiceData.customerEmail}` : ''}
      Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}
      ${invoiceData.dueDate ? `Due: ${new Date(invoiceData.dueDate).toLocaleDateString()}` : ''}
      
      --------------------------------
      
      Items:
      ${invoiceData.items.map(item => 
        `${item.description}\nQty: ${item.quantity} x KSh ${item.price.toFixed(2)} = KSh ${(item.quantity * item.price).toFixed(2)}`
      ).join('\n\n')}
      
      --------------------------------
      Subtotal: KSh ${invoiceData.amount.toFixed(2)}
      Tax (16%): KSh ${(invoiceData.amount * 0.16).toFixed(2)}
      
      --------------------------------
      TOTAL: KSh ${(invoiceData.amount * 1.16).toFixed(2)}
      --------------------------------
      
      Thank you for your business!
      
      ================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Thermal Receipt - ${invoiceData.invoiceNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                width: 58mm; 
                margin: 0; 
                padding: 5px;
                line-height: 1.2;
              }
              @media print {
                body { margin: 0; }
                @page { margin: 0; size: 58mm auto; }
              }
            </style>
          </head>
          <body>
            <pre>${thermalContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Print Sent",
      description: "Thermal receipt sent to printer"
    });
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setDueDate('');
    setItems([{ id: '1', description: '', quantity: 1, price: 0 }]);
    setSelectedCustomer(null);
    setShowPreview(false);
    setInvoiceData(null);
    setUseExistingCustomer(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={showPreview ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "sm:max-w-2xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {showPreview ? 'Invoice Preview' : 'Create Invoice'}
          </DialogTitle>
        </DialogHeader>
        
        {!showPreview ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Customer Information</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={useExistingCustomer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseExistingCustomer(true)}
                >
                  Existing Customer
                </Button>
                <Button
                  type="button"
                  variant={!useExistingCustomer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseExistingCustomer(false)}
                >
                  New Customer
                </Button>
              </div>

              {useExistingCustomer ? (
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  >
                    {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                    <User className="h-4 w-4" />
                  </Button>
                  {showCustomerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.phone}</div>
                          {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                        </div>
                      ))}
                      {customers.length === 0 && (
                        <div className="p-3 text-center text-gray-500">No customers found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Phone Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Invoice Items</label>
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description *"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Price (KSh)"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-sm font-medium">
                      KSh {(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="text-right">
                <div className="text-lg font-bold">
                  Total: KSh {getTotalAmount().toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <InvoiceTemplate
              ref={invoiceRef}
              invoiceNumber={invoiceData.invoiceNumber}
              customerName={invoiceData.customerName}
              amount={invoiceData.amount}
              description={invoiceData.items.map(item => `${item.description} (${item.quantity}x)`).join(', ')}
              dueDate={invoiceData.dueDate}
              createdAt={invoiceData.createdAt}
            />
            
            <div className="flex space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                New Invoice
              </Button>
              <Button onClick={generatePDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={printThermal} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Thermal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
