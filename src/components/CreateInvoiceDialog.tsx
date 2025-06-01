
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';
import { createInvoice } from '@/services/firebaseService';

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
  const { currentUser } = useFirebase();
  const { toast } = useToast();

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
      const invoiceData = {
        customerName,
        amount: parseFloat(amount),
        description,
        dueDate,
        status: 'Pending',
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid
      };

      await createInvoice(invoiceData);
      console.log('Creating invoice:', invoiceData);
      
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });

      // Reset form
      setCustomerName('');
      setAmount('');
      setDescription('');
      setDueDate('');
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
