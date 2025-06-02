
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Plus } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';
import { createCustomer } from '@/services/firebaseService';

interface AddCustomerDialogProps {
  children: React.ReactNode;
}

const AddCustomerDialog = ({ children }: AddCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Individual' | 'Business'>('Individual');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useFirebase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        name,
        email,
        phone,
        type,
        totalOrders: 0,
        totalSpent: 0,
        status: 'Active',
        services: [],
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid
      };

      console.log('Creating customer:', customerData);
      
      // Save to Firebase
      await createCustomer(customerData);
      
      toast({
        title: "Success",
        description: "Customer added successfully"
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setType('Individual');
      setOpen(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
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
            <User className="h-5 w-5 mr-2" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Customer Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Customer Type</label>
            <div className="flex space-x-2 mt-2">
              <Badge
                variant={type === 'Individual' ? "default" : "outline"}
                className="cursor-pointer p-2 flex-1 text-center justify-center"
                onClick={() => setType('Individual')}
              >
                Individual
              </Badge>
              <Badge
                variant={type === 'Business' ? "default" : "outline"}
                className="cursor-pointer p-2 flex-1 text-center justify-center"
                onClick={() => setType('Business')}
              >
                Business
              </Badge>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
