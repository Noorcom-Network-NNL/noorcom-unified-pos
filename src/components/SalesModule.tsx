import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Copy, Trash, FileText, UserPlus, Phone, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { createCustomer, getCustomers } from '@/services/firebaseService';

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

interface Sale {
  id: string;
  customerName: string;
  service: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

const SalesModule = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customersData = await getCustomers();
      setCustomers(customersData as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        createdAt: new Date().toISOString() // Add missing createdAt property
      };

      const customerId = await createCustomer(customerData);
      
      const newCustomer = {
        id: customerId,
        ...customerData
      };

      setSelectedCustomer(newCustomer);
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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCreateSale = () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer first.",
        variant: "destructive",
      });
      return;
    }
    // Logic to create a sale for the selected customer
    toast({
      title: "Success",
      description: `Sale created for ${selectedCustomer.name}!`,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Select Customer</Label>
              {customers.length > 0 ? (
                <Select onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  if (customer) {
                    handleCustomerSelect(customer);
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p>No customers available.</p>
              )}
              <Button variant="secondary" onClick={() => setShowAddCustomer(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>

            {/* Add New Customer Form */}
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
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Selected Customer:</h3>
              <p>Name: {selectedCustomer.name}</p>
              <p>Phone: {selectedCustomer.phone}</p>
              {selectedCustomer.email && <p>Email: {selectedCustomer.email}</p>}
              <Button onClick={handleCreateSale}>Create Sale</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.service}</TableCell>
                    <TableCell>{sale.amount}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'completed' ? 'default' : 'outline'}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesModule;
