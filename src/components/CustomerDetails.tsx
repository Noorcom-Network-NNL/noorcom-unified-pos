
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, FileText } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerDetailsProps {
  customer: Customer | null;
}

const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const getCustomerTypeColor = (type: string) => {
    return type === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (!customer) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a customer to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Customer Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{customer.name}</h3>
          <Badge className={getCustomerTypeColor(customer.type || 'Individual')}>
            {customer.type || 'Individual'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-2">📱</span>
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{customer.totalOrders || 0}</p>
            <p className="text-xs text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              KSh {(customer.totalSpent || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Spent</p>
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
  );
};

export default CustomerDetails;
