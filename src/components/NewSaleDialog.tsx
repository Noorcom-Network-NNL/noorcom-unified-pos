
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';

interface NewSaleDialogProps {
  children: React.ReactNode;
}

const NewSaleDialog = ({ children }: NewSaleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useFirebase();
  const { toast } = useToast();

  const services = [
    'T-Shirt Printing',
    'Business Cards',
    'Banner Printing', 
    'Laptop Sale',
    'Phone Sale',
    'Domain Registration',
    'Web Hosting'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedService || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create a quick sale record
      const saleData = {
        customerName,
        customerPhone,
        service: selectedService,
        amount: parseFloat(amount),
        status: 'completed',
        date: new Date().toISOString(),
        createdBy: currentUser?.uid,
        paymentMethod: 'cash'
      };

      console.log('Creating quick sale:', saleData);
      
      toast({
        title: "Success",
        description: "Quick sale recorded successfully"
      });

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setSelectedService('');
      setAmount('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Error", 
        description: "Failed to record sale",
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
            <ShoppingCart className="h-5 w-5 mr-2" />
            Quick Sale
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
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Service/Product *</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {services.map((service) => (
                <Badge
                  key={service}
                  variant={selectedService === service ? "default" : "outline"}
                  className="cursor-pointer p-2 text-center justify-center"
                  onClick={() => setSelectedService(service)}
                >
                  {service}
                </Badge>
              ))}
            </div>
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

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Recording...' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleDialog;
