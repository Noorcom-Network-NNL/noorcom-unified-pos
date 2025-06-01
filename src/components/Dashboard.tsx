
import React from 'react';
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

const Dashboard = () => {
  const stats = [
    {
      title: 'Today\'s Sales',
      value: 'KSh 45,320',
      change: '+12%',
      icon: CreditCard,
      color: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: '23',
      change: '+3',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Active Customers',
      value: '1,247',
      change: '+5%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Low Stock Items',
      value: '8',
      change: '-2',
      icon: AlertCircle,
      color: 'text-orange-600'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      service: 'T-Shirt Printing',
      amount: 'KSh 2,500',
      status: 'In Progress',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      service: 'Domain Renewal',
      amount: 'KSh 1,200',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      service: 'Laptop Sale',
      amount: 'KSh 65,000',
      status: 'Pending',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ];

  const businessModules = [
    {
      name: 'Branding & Printing',
      orders: 12,
      revenue: 'KSh 28,400',
      status: 'Active',
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Electronics Sales',
      orders: 8,
      revenue: 'KSh 156,300',
      status: 'Active',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Web Services',
      orders: 15,
      revenue: 'KSh 45,200',
      status: 'Active',
      color: 'from-green-500 to-emerald-500'
    }
  ];

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
              {recentOrders.map((order) => (
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
              ))}
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
            <Button className="h-20 flex-col space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span>New Sale</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Create Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Job</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
