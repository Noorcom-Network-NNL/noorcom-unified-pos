import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Users, Package, FileText, Filter, Download, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface SaleData {
  id: string;
  amount: number;
  customerName: string;
  service: string;
  date: any; // Firestore Timestamp
  status: string;
  paymentMethod: string;
  createdAt: any; // Firestore Timestamp
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  totalOrders: number;
  createdAt: any;
}

interface InvoiceData {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  dueDate: any;
  createdAt: any;
}

const ReportsModule = () => {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up comprehensive data listeners for reports...');
    
    // Sales listener
    const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SaleData[];
      setSales(salesData);
    });

    // Customers listener
    const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerData[];
      setCustomers(customersData);
    });

    // Invoices listener
    const invoicesQuery = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InvoiceData[];
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => {
      unsubscribeSales();
      unsubscribeCustomers();
      unsubscribeInvoices();
    };
  }, []);

  // Enhanced metrics calculations
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const getFilteredData = (data: any[], dateField: string = 'createdAt') => {
    return data.filter(item => {
      const itemDate = item[dateField]?.toDate ? item[dateField].toDate() : new Date(item[dateField]);
      switch (filterPeriod) {
        case 'today': return itemDate >= startOfDay;
        case 'week': return itemDate >= startOfWeek;
        case 'month': return itemDate >= startOfMonth;
        case 'year': return itemDate >= startOfYear;
        default: return true;
      }
    });
  };

  const filteredSales = getFilteredData(sales);
  const filteredCustomers = getFilteredData(customers);
  const filteredInvoices = getFilteredData(invoices);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed');
  const pendingSales = filteredSales.filter(sale => sale.status === 'pending');
  const topCustomers = customers
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, 5);

  // Payment method distribution
  const paymentMethodData = filteredSales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(paymentMethodData).map(([method, count]) => ({
    name: method,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Service performance data
  const serviceData = filteredSales.reduce((acc, sale) => {
    acc[sale.service] = (acc[sale.service] || 0) + (sale.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const serviceChartData = Object.entries(serviceData)
    .map(([service, revenue]) => ({ name: service, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Generate chart data
  const generateDailyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const daySales = sales.filter(sale => {
        const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
        return saleDate >= dayStart && saleDate < dayEnd;
      });
      
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      });
    }
    return data;
  };

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
        revenue: monthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Detailed Reports</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comprehensive reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Detailed Reports</h2>
        <div className="flex items-center gap-4">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredSales.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingSales.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Invoices generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Details</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateDailyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => exportToCSV(filteredSales, 'sales_report')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales
                    .filter(sale => 
                      (filterStatus === 'all' || sale.status === filterStatus) &&
                      (searchTerm === '' || 
                       sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sale.service.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .slice(0, 50)
                    .map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {sale.createdAt?.toDate ? 
                            sale.createdAt.toDate().toLocaleDateString() : 
                            new Date(sale.createdAt).toLocaleDateString()
                          }
                        </TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{sale.service}</TableCell>
                        <TableCell>KSh {(sale.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === 'completed' ? 'default' : 'outline'}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Customer Analytics</h3>
            <Button onClick={() => exportToCSV(filteredCustomers, 'customers_report')} variant="outline">
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
                  {topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KSh {(customer.totalSpent || 0).toLocaleString()}</p>
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
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={serviceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoice Management</h3>
            <Button onClick={() => exportToCSV(filteredInvoices, 'invoices_report')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.slice(0, 50).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {invoice.createdAt?.toDate ? 
                          invoice.createdAt.toDate().toLocaleDateString() : 
                          new Date(invoice.createdAt).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>KSh {(invoice.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {invoice.dueDate?.toDate ? 
                          invoice.dueDate.toDate().toLocaleDateString() : 
                          new Date(invoice.dueDate).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsModule;
