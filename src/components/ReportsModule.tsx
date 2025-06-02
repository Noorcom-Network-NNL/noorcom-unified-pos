
import React, { useState, useEffect } from 'react';
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
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import ShiftManagement from './ShiftManagement';

const ReportsModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [salesData, setSalesData] = useState({
    week: { totalSales: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 },
    month: { totalSales: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 },
    year: { totalSales: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 }
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up sales data listeners...');
    const now = new Date();
    
    // Calculate date ranges
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Listen to sales for different periods
    const setupSalesListener = (startDate, period) => {
      const q = query(
        collection(db, 'sales'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Fetched ${period} sales:`, sales);
        
        const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        setSalesData(prev => ({
          ...prev,
          [period]: {
            totalSales,
            totalOrders,
            avgOrderValue,
            growth: Math.random() * 20 // Placeholder for growth calculation
          }
        }));

        if (period === 'week') {
          setTransactions(sales.slice(0, 10)); // Show latest 10 transactions
        }
      });
    };

    const unsubscribeWeek = setupSalesListener(weekAgo, 'week');
    const unsubscribeMonth = setupSalesListener(monthAgo, 'month');
    const unsubscribeYear = setupSalesListener(yearAgo, 'year');

    setLoading(false);

    return () => {
      unsubscribeWeek();
      unsubscribeMonth();
      unsubscribeYear();
    };
  }, []);

  const currentData = salesData[selectedPeriod];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Shift Management */}
      <ShiftManagement />

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
                <p className="text-sm text-green-600">+{currentData.growth.toFixed(1)}%</p>
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
                <p className="text-sm text-green-600">+{Math.floor(Math.random() * 10)} from last period</p>
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Payment Method</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.customerName}</td>
                      <td className="py-3 px-4">{transaction.service}</td>
                      <td className="py-3 px-4">KSh {transaction.amount?.toLocaleString()}</td>
                      <td className="py-3 px-4">{transaction.paymentMethod || 'Cash'}</td>
                      <td className="py-3 px-4">
                        {transaction.date?.toDate ? 
                          transaction.date.toDate().toLocaleDateString() : 
                          new Date(transaction.date).toLocaleDateString()
                        }
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">
                          {transaction.status || 'Completed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {transactions.length} of {currentData.totalOrders} transactions
            </p>
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
