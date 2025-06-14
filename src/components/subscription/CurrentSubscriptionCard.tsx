
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from './subscriptionPlans';

interface TenantProfile {
  subscriptionTier: string;
  subscriptionStatus: string;
  maxUsers: number;
  maxLocations: number;
  trialEndsAt?: string;
}

interface CurrentSubscriptionCardProps {
  currentTenant: TenantProfile;
}

const CurrentSubscriptionCard: React.FC<CurrentSubscriptionCardProps> = ({ currentTenant }) => {
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.tier === currentTenant.subscriptionTier);

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Subscription</span>
          <Badge className={getStatusBadgeColor(currentTenant.subscriptionStatus)}>
            {currentTenant.subscriptionStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {currentPlan?.icon && <currentPlan.icon className="h-5 w-5 text-blue-600" />}
              <span className="font-semibold">{currentPlan?.name} Plan</span>
            </div>
            <p className="text-2xl font-bold">{currentPlan?.priceDisplay}</p>
            <p className="text-sm text-gray-500">{currentPlan?.period}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Users</span>
                <span className="text-sm">0 / {currentTenant.maxUsers}</span>
              </div>
              <Progress value={getUsagePercentage(0, currentTenant.maxUsers)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Locations</span>
                <span className="text-sm">1 / {currentTenant.maxLocations}</span>
              </div>
              <Progress value={getUsagePercentage(1, currentTenant.maxLocations)} className="h-2" />
            </div>
          </div>

          <div className="space-y-2">
            {currentTenant.trialEndsAt && currentTenant.subscriptionStatus === 'trialing' && (
              <div className="text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                Trial ends: {new Date(currentTenant.trialEndsAt).toLocaleDateString()}
              </div>
            )}
            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
