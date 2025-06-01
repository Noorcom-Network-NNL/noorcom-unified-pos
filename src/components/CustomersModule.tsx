
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Search, 
  Mail,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

const CustomersModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+254 700 123 456',
      type: 'Individual',
      totalOrders: 12,
      totalSpent: 45800,
      lastOrder: '2024-05-28',
      status: 'Active',
      services: ['Printing', 'Electronics']
    },
    {
      id: 2,
      name: 'Tech Solutions Ltd',
      email: 'info@techsolutions.co.ke',
      phone: '+254 700 789 012',
      type: 'Business',
      totalOrders: 25,
      totalSpent: 156300,
      lastOrder: '2024-05-30',
      status: 'Active',
      services: ['Web Services', 'Electronics']
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      phone: '+254 701 234 567',
      type: 'Individual',
      totalOrders: 8,
      totalSpent: 28400,
      lastOrder: '2024-05-25',
      status: 'Active',
      services: ['Printing']
    },
    {
      id: 4,
      name: 'Creative Agency KE',
      email: 'hello@creativeagency.ke',
      phone: '+254 702 345 678',
      type: 'Business',
      totalOrders: 18,
      totalSpent: 89600,
      lastOrder: '2024-05-29',
      status: 'Active',
      services: ['Printing', 'Web Services']
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customerId: 1,
      service: 'T-Shirt Printing',
      amount: 2500,
      date: '2024-05-28',
      status: 'Completed'
    },
    {
      id: 'ORD-002',
      customerId: 2,
      service: 'Domain Renewal',
      amount: 1200,
      date: '2024-05-30',
      status: 'Completed'
    },
    {
      id: 'ORD-003',
      customerId: 3,
      service: 'Business Cards',
      amount: 1500,
      date: '2024-05-25',
      status: 'In Progress'
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getCustomerTypeColor = (type) => {
    return type === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <Button>
          <User className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <Input 
              placeholder="Search customers by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-full">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getCustomerTypeColor(customer.type)}>
                          {customer.type}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {customer.totalOrders} orders
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          KSh {customer.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div>
          {selectedCustomer ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                  <Badge className={getCustomerTypeColor(selectedCustomer.type)}>
                    {selectedCustomer.type}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">📱</span>
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Last order: {selectedCustomer.lastOrder}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedCustomer.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Total Spent (KSh)</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Services Used:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Order
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    View Order History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a customer to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customerId);
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{customer?.name}</td>
                      <td className="py-3 px-4">{order.service}</td>
                      <td className="py-3 px-4">KSh {order.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{order.date}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          order.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersModule;
