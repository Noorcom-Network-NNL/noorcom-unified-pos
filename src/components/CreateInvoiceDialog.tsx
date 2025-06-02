
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Printer } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';
import { createInvoice } from '@/services/firebaseService';
import InvoiceTemplate from './InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CreateInvoiceDialogProps {
  children: React.ReactNode;
}

const CreateInvoiceDialog = ({ children }: CreateInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const { currentUser } = useFirebase();
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount || !description) {
      toast({
        title: "Error",
        description: "Customer name, amount, and description are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newInvoiceData = {
        customerName,
        amount: parseFloat(amount),
        description,
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

    // Create a simplified thermal receipt format
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
      Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}
      ${invoiceData.dueDate ? `Due: ${new Date(invoiceData.dueDate).toLocaleDateString()}` : ''}
      
      --------------------------------
      
      ${invoiceData.description}
      Amount: KSh ${invoiceData.amount.toFixed(2)}
      Tax (16%): KSh ${(invoiceData.amount * 0.16).toFixed(2)}
      
      --------------------------------
      TOTAL: KSh ${(invoiceData.amount * 1.16).toFixed(2)}
      --------------------------------
      
      Thank you for your business!
      
      ================================
    `;

    // Open print dialog with thermal formatting
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
    setAmount('');
    setDescription('');
    setDueDate('');
    setShowPreview(false);
    setInvoiceData(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={showPreview ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {showPreview ? 'Invoice Preview' : 'Create Invoice'}
          </DialogTitle>
        </DialogHeader>
        
        {!showPreview ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name *</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Amount (KSh) *</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter service description"
                required
              />
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
              description={invoiceData.description}
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
