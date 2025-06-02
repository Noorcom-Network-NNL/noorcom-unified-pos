
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
}

const CustomerList = ({ customers, selectedCustomer, onCustomerSelect }: CustomerListProps) => {
  const getCustomerTypeColor = (type: string) => {
    return type === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Directory ({customers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer) => (
            <div 
              key={customer.id} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => onCustomerSelect(customer)}
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
                  <Badge className={getCustomerTypeColor(customer.type || 'Individual')}>
                    {customer.type || 'Individual'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {customer.totalOrders || 0} orders
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    KSh {(customer.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerList;
