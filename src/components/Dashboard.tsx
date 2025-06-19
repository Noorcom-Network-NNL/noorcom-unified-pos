
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  CreditCard,
  FileText,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { testFirebaseConnection } from '@/services/firebaseService';
import { useToast } from '@/hooks/use-toast';
import NewSaleDialog from '@/components/NewSaleDialog';
import AddCustomerDialog from '@/components/AddCustomerDialog';
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog';
import ScheduleJobDialog from '@/components/ScheduleJobDialog';

const Dashboard = () => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    sales: [],
    customers: [],
    products: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test Firebase connection when dashboard loads
    const testConnection = async () => {
      try {
        const isConnected = await testFirebaseConnection();
        if (isConnected) {
          console.log('Firebase integration working successfully');
        }
      } catch (error) {
        console.error('Firebase connection test failed:', error);
        toast({
          title: "Database Connection",
          description: "Failed to connect to Firebase database",
          variant: "destructive"
        });
      }
    };
    
    testConnection();

    // Set up real-time listeners for dashboard data
    const unsubscribers: (() => void)[] = [];

    try {
      // Listen to today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const salesQuery = query(
        collection(db, 'sales'), 
        where('createdAt', '>=', today),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDashboardData(prev => ({ ...prev, sales: salesData }));
      });
      unsubscribers.push(unsubscribeSales);

      // Listen to customers
      const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
        const customersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDashboardData(prev => ({ ...prev, customers: customersData }));
      });
      unsubscribers.push(unsubscribeCustomers);

      // Listen to products for low stock
      const productsQuery = query(collection(db, 'products'));
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDashboardData(prev => ({ ...prev, products: productsData }));
      });
      unsubscribers.push(unsubscribeProducts);

      // Listen to recent orders (sales with more details)
      const recentOrdersQuery = query(
        collection(db, 'sales'), 
        orderBy('createdAt', 'desc'), 
        limit(5)
      );
      const unsubscribeRecentOrders = onSnapshot(recentOrdersQuery, (snapshot) => {
        const recentOrdersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDashboardData(prev => ({ ...prev, recentOrders: recentOrdersData }));
      });
      unsubscribers.push(unsubscribeRecentOrders);

      setLoading(false);
    } catch (error) {
      console.error('Error setting up dashboard listeners:', error);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [toast]);

  // Calculate real stats
  const todaysSales = dashboardData.sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const pendingOrders = dashboardData.recentOrders.filter(order => order.status === 'pending').length;
  const activeCustomers = dashboardData.customers.length;
  const lowStockItems = dashboardData.products.filter(product => 
    (product.stock || 0) <= (product.lowStockThreshold || 5)
  ).length;

  const stats = [
    {
      title: 'Today\'s Sales',
      value: `KSh ${todaysSales.toLocaleString()}`,
      change: '+12%',
      icon: CreditCard,
      color: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      change: `+${pendingOrders}`,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toString(),
      change: '+5%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      change: lowStockItems > 0 ? '-2' : '0',
      icon: AlertCircle,
      color: lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'
    }
  ];

  const formatRecentOrders = () => {
    return dashboardData.recentOrders.map(order => ({
      id: order.id,
      customer: order.customerName || 'Unknown Customer',
      service: order.service || order.items?.[0]?.name || 'Sale',
      amount: `KSh ${(order.amount || 0).toLocaleString()}`,
      status: order.status || 'completed',
      statusColor: order.status === 'completed' ? 'bg-green-100 text-green-800' :
                   order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                   'bg-yellow-100 text-yellow-800'
    }));
  };

  const businessModules = [
    {
      name: 'Branding & Printing',
      orders: dashboardData.recentOrders.filter(order => 
        order.service?.toLowerCase().includes('print') || 
        order.service?.toLowerCase().includes('brand')
      ).length,
      revenue: `KSh ${dashboardData.sales
        .filter(sale => sale.service?.toLowerCase().includes('print') || sale.service?.toLowerCase().includes('brand'))
        .reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
        .toLocaleString()}`,
      status: 'Active',
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Electronics Sales',
      orders: dashboardData.recentOrders.filter(order => 
        order.service?.toLowerCase().includes('laptop') || 
        order.service?.toLowerCase().includes('electronic')
      ).length,
      revenue: `KSh ${dashboardData.sales
        .filter(sale => sale.service?.toLowerCase().includes('laptop') || sale.service?.toLowerCase().includes('electronic'))
        .reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
        .toLocaleString()}`,
      status: 'Active',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Web Services',
      orders: dashboardData.recentOrders.filter(order => 
        order.service?.toLowerCase().includes('web') || 
        order.service?.toLowerCase().includes('domain')
      ).length,
      revenue: `KSh ${dashboardData.sales
        .filter(sale => sale.service?.toLowerCase().includes('web') || sale.service?.toLowerCase().includes('domain'))
        .reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
        .toLocaleString()}`,
      status: 'Active',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to NoorcomPOS</h2>
        <p className="text-blue-100">Manage your multi-service business operations efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from yesterday</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Modules Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Business Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessModules.map((module, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {module.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Orders Today</p>
                      <p className="font-semibold">{module.orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">{module.revenue}</p>
                    </div>
                  </div>
                  <div className={`h-2 bg-gradient-to-r ${module.color} rounded-full mt-3`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formatRecentOrders().length > 0 ? (
                formatRecentOrders().map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-600">{order.service}</p>
                      <p className="text-xs text-gray-500">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <Badge className={order.statusColor}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent orders found</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NewSaleDialog>
              <Button className="h-20 flex-col space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span>New Sale</span>
              </Button>
            </NewSaleDialog>
            <CreateInvoiceDialog>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <FileText className="h-6 w-6" />
                <span>Create Invoice</span>
              </Button>
            </CreateInvoiceDialog>
            <AddCustomerDialog>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Add Customer</span>
              </Button>
            </AddCustomerDialog>
            <ScheduleJobDialog>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Schedule Job</span>
              </Button>
            </ScheduleJobDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
