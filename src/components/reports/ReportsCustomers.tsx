
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  totalOrders: number;
  createdAt: any;
}

interface SaleData {
  id: string;
  amount: number;
  customerName: string;
  service: string;
  date: any;
  status: string;
  paymentMethod: string;
  createdAt: any;
}

interface ReportsCustomersProps {
  customers: CustomerData[];
  sales: SaleData[];
}

const ReportsCustomers: React.FC<ReportsCustomersProps> = ({ customers, sales }) => {
  const topCustomers = customers
    .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0))
    .slice(0, 5);

  const generateMonthlyData = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const monthSales = sales.filter(sale => {
        const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
        return saleDate >= monthStart && saleDate < monthEnd;
      });
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        sales: monthSales.length,
        revenue: monthSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
      });
    }
    return data;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Analytics</h3>
        <Button onClick={() => exportToCSV(customers, 'customers_report')} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{customer.name}</h4>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KSh {(Number(customer.totalSpent) || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{customer.totalOrders || 0} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsCustomers;
