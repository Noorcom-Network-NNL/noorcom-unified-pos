
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar,
  CreditCard,
  FileText,
  User,
  ShoppingCart
} from 'lucide-react';

const ReportsModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const salesData = {
    week: {
      totalSales: 145230,
      totalOrders: 47,
      avgOrderValue: 3089,
      growth: 12.5
    },
    month: {
      totalSales: 520800,
      totalOrders: 168,
      avgOrderValue: 3100,
      growth: 8.3
    },
    year: {
      totalSales: 6249600,
      totalOrders: 2016,
      avgOrderValue: 3102,
      growth: 15.7
    }
  };

  const servicePerformance = [
    {
      service: 'Branding & Printing',
      revenue: 45230,
      orders: 23,
      growth: 15.2,
      color: 'from-red-500 to-pink-500'
    },
    {
      service: 'Electronics Sales',
      revenue: 78600,
      orders: 12,
      growth: 8.7,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      service: 'Web Services',
      revenue: 21400,
      orders: 12,
      growth: 22.1,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const topProducts = [
    { name: 'T-Shirt Printing', sales: 15, revenue: 7500 },
    { name: 'Business Cards', sales: 8, revenue: 9600 },
    { name: 'Domain Registration', sales: 12, revenue: 14400 },
    { name: 'HP Laptops', sales: 3, revenue: 195000 },
    { name: 'Banner Printing', sales: 6, revenue: 15000 }
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      customer: 'John Doe',
      service: 'T-Shirt Printing',
      amount: 2500,
      method: 'M-Pesa',
      date: '2024-05-30',
      status: 'Completed'
    },
    {
      id: 'TXN-002',
      customer: 'Tech Solutions Ltd',
      service: 'Laptop Sale',
      amount: 65000,
      method: 'Bank Transfer',
      date: '2024-05-30',
      status: 'Completed'
    },
    {
      id: 'TXN-003',
      customer: 'Jane Smith',
      service: 'Domain Renewal',
      amount: 1200,
      method: 'Card',
      date: '2024-05-29',
      status: 'Completed'
    }
  ];

  const currentData = salesData[selectedPeriod];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
            size="sm"
          >
            This Week
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
            size="sm"
          >
            This Month
          </Button>
          <Button 
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
            size="sm"
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {currentData.totalSales.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+{currentData.growth}%</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentData.totalOrders}
                </p>
                <p className="text-sm text-green-600">+12 from last period</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {currentData.avgOrderValue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+5.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
                <p className="text-sm text-green-600">+18 new</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servicePerformance.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{service.service}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      +{service.growth}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">KSh {service.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Orders</p>
                      <p className="font-semibold">{service.orders}</p>
                    </div>
                  </div>
                  <div className={`h-2 bg-gradient-to-r ${service.color} rounded-full mt-3`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products/Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      KSh {product.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Transaction ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Payment Method</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{transaction.id}</td>
                    <td className="py-3 px-4">{transaction.customer}</td>
                    <td className="py-3 px-4">{transaction.service}</td>
                    <td className="py-3 px-4">KSh {transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{transaction.method}</td>
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-800">
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Showing 3 of 47 transactions</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsModule;
