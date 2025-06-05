import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Calendar, 
  Settings, 
  User, 
  CreditCard,
  FileText,
  Search,
  Mail,
  LogOut,
  Package
} from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import SalesModule from '@/components/SalesModule';
import ProductsModule from '@/components/ProductsModule';
import InventoryModule from '@/components/InventoryModule';
import CustomersModule from '@/components/CustomersModule';
import ReportsModule from '@/components/ReportsModule';
import NewSaleDialog from '@/components/NewSaleDialog';
import AddCustomerDialog from '@/components/AddCustomerDialog';
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog';
import ScheduleJobDialog from '@/components/ScheduleJobDialog';
import UserManagementModule from '@/components/UserManagementModule';

const Index = () => {
  const { currentUser, userProfile, logout, hasPermission } = useFirebase();
  const [activeModule, setActiveModule] = useState('dashboard');

  // Show login form if user is not authenticated
  if (!currentUser || !userProfile) {
    return <LoginForm />;
  }

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Calendar, requiredRole: 'cashier' as const },
    { id: 'sales', name: 'Sales', icon: ShoppingCart, requiredRole: 'cashier' as const },
    { id: 'products', name: 'Products', icon: Package, requiredRole: 'cashier' as const },
    { id: 'inventory', name: 'Inventory', icon: FileText, requiredRole: 'inventory_clerk' as const },
    { id: 'customers', name: 'Customers', icon: User, requiredRole: 'cashier' as const },
    { id: 'reports', name: 'Reports', icon: Search, requiredRole: 'accountant' as const },
    { id: 'users', name: 'User Management', icon: Settings, requiredRole: 'admin' as const },
  ];

  // Filter modules based on user permissions
  const availableModules = modules.filter(module => hasPermission(module.requiredRole));

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <SalesModule />;
      case 'products':
        return <ProductsModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'customers':
        return <CustomersModule />;
      case 'reports':
        return <ReportsModule />;
      case 'users':
        return <UserManagementModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NoorcomPOS</h1>
              <p className="text-sm text-gray-500">Multi-Service Point of Sale</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              Online
            </Badge>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile.name || currentUser.email}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile.role.replace('_', ' ')}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
            {hasPermission('admin') && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-4">
            <div className="space-y-2">
              {availableModules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeModule === module.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{module.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {hasPermission('cashier') && (
                  <NewSaleDialog>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      New Sale
                    </Button>
                  </NewSaleDialog>
                )}
                {hasPermission('cashier') && (
                  <AddCustomerDialog>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </AddCustomerDialog>
                )}
                {hasPermission('accountant') && (
                  <CreateInvoiceDialog>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </CreateInvoiceDialog>
                )}
                {hasPermission('manager') && (
                  <ScheduleJobDialog>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Job
                    </Button>
                  </ScheduleJobDialog>
                )}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default Index;
