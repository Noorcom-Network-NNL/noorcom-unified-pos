
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createCustomer } from '@/services/firebaseService';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Individual' | 'Business';
  totalOrders: number;
  totalSpent: number;
  services: string[];
  createdBy: string;
  createdAt: string;
}

interface CustomerSelectionProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerAdded: (customer: Customer) => void;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onCustomerAdded
}) => {
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const { toast } = useToast();

  const handleAddNewCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in customer name and phone",
        variant: "destructive"
      });
      return;
    }

    try {
      const customerData = {
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        email: newCustomerEmail.trim() || '',
        type: 'Individual' as const,
        totalOrders: 0,
        totalSpent: 0,
        services: [],
        createdBy: 'current-user',
        createdAt: new Date().toISOString()
      };

      const customerId = await createCustomer(customerData);
      
      const newCustomer = {
        id: customerId,
        ...customerData
      };

      onCustomerAdded(newCustomer);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setShowAddCustomer(false);
      
      toast({
        title: "Success",
        description: "Customer added successfully"
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive"
      });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'walk-in') {
      const walkInCustomer: Customer = {
        id: 'walk-in',
        name: 'Walk-in Customer',
        phone: '',
        email: '',
        type: 'Individual',
        totalOrders: 0,
        totalSpent: 0,
        services: [],
        createdBy: 'current-user',
        createdAt: new Date().toISOString()
      };
      onCustomerSelect(walkInCustomer);
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        onCustomerSelect(customer);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Select Customer</Label>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={() => setShowAddCustomer(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </div>

          {showAddCustomer && (
            <div className="space-y-2">
              <Label htmlFor="newCustomerName">New Customer Name</Label>
              <Input
                id="newCustomerName"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <Label htmlFor="newCustomerPhone">New Customer Phone</Label>
              <Input
                id="newCustomerPhone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
              <Label htmlFor="newCustomerEmail">New Customer Email (Optional)</Label>
              <Input
                id="newCustomerEmail"
                type="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
              />
              <Button onClick={handleAddNewCustomer}>Add Customer</Button>
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold">Selected Customer:</h3>
            <p>Name: {selectedCustomer.name}</p>
            {selectedCustomer.phone && <p>Phone: {selectedCustomer.phone}</p>}
            {selectedCustomer.email && <p>Email: {selectedCustomer.email}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSelection;
