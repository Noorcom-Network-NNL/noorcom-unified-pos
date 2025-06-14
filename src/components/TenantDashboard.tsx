
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import SettingsDialog from '@/components/SettingsDialog';

const TenantDashboard = () => {
  const { currentTenant, hasFeature } = useTenant();
  const { hasPermission } = useFirebase();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    growthRate: 0
  });

  useEffect(() => {
    // Simulate loading analytics data
    setAnalytics({
      totalRevenue: 24750,
      totalOrders: 156,
      activeUsers: 8,
      growthRate: 12.5
    });
  }, []);

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading tenant dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTrialExpiringSoon = () => {
    if (!currentTenant.trialEndsAt) return false;
    const trialEnd = new Date(currentTenant.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  const currency = currentTenant.settings?.currency || 'KSh';

  return (
    <div className="space-y-6">
      {/* Tenant Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentTenant.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge className={getStatusBadgeColor(currentTenant.subscriptionStatus)}>
              {currentTenant.subscriptionTier.toUpperCase()} - {currentTenant.subscriptionStatus.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-500">
              Created {new Date(currentTenant.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {hasPermission('admin') && (
          <SettingsDialog>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Tenant Settings
            </Button>
          </SettingsDialog>
        )}
      </div>

      {/* Trial Warning */}
      {isTrialExpiringSoon() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">Trial Ending Soon</p>
                <p className="text-sm text-orange-600">
                  Your trial ends on {new Date(currentTenant.trialEndsAt!).toLocaleDateString()}. 
                  Upgrade now to continue using all features.
                </p>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency} {analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              +{analytics.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-gray-500">
              of {currentTenant.maxUsers} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">
              of {currentTenant.maxLocations} allowed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { feature: 'basic_pos', name: 'POS System', icon: DollarSign },
                { feature: 'multi_location', name: 'Multi-Location', icon: MapPin },
                { feature: 'advanced_reports', name: 'Advanced Reports', icon: BarChart3 },
                { feature: 'inventory_management', name: 'Inventory', icon: Building2 },
                { feature: 'user_management', name: 'User Management', icon: Users },
                { feature: 'api_access', name: 'API Access', icon: Settings }
              ].map(({ feature, name, icon: Icon }) => (
                <div 
                  key={feature}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    hasFeature(feature) 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{name}</span>
                  {hasFeature(feature) && <Badge variant="outline" className="ml-auto">✓</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Add New Location
            </Button>
            {hasFeature('user_management') && (
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Members
              </Button>
            )}
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;
