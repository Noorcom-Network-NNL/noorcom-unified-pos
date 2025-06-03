
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, ShoppingCart, Users, FileText } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import ReportsSummaryCards from './reports/ReportsSummaryCards';
import ReportsOverview from './reports/ReportsOverview';
import ReportsSalesDetails from './reports/ReportsSalesDetails';
import ReportsCustomers from './reports/ReportsCustomers';
import ReportsServices from './reports/ReportsServices';
import ReportsInvoices from './reports/ReportsInvoices';

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
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up comprehensive data listeners for reports...');
    
    const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SaleData[];
      setSales(salesData);
    });

    const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerData[];
      setCustomers(customersData);
    });

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

  const getFilteredData = (data: any[], dateField: string = 'createdAt') => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

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

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed');
  const pendingSales = filteredSales.filter(sale => sale.status === 'pending');

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

      <ReportsSummaryCards 
        totalRevenue={totalRevenue}
        totalCustomers={filteredCustomers.length}
        completedSales={completedSales.length}
        pendingSales={pendingSales.length}
        totalInvoices={filteredInvoices.length}
        totalTransactions={filteredSales.length}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Details</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReportsOverview sales={sales} filteredSales={filteredSales} />
        </TabsContent>

        <TabsContent value="sales">
          <ReportsSalesDetails filteredSales={filteredSales} />
        </TabsContent>

        <TabsContent value="customers">
          <ReportsCustomers customers={customers} sales={sales} />
        </TabsContent>

        <TabsContent value="services">
          <ReportsServices filteredSales={filteredSales} />
        </TabsContent>

        <TabsContent value="invoices">
          <ReportsInvoices filteredInvoices={filteredInvoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsModule;
