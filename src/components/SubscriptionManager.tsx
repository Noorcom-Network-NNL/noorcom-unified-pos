
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Users, 
  MapPin, 
  Check, 
  Zap, 
  Star,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useTenant, SubscriptionTier } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

const SubscriptionManager = () => {
  const { currentTenant, hasFeature } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const currency = currentTenant.settings?.currency || 'KES';

  const plans = [
    {
      tier: 'free' as SubscriptionTier,
      name: 'Free',
      price: `${currency} 0`,
      period: 'forever',
      icon: Star,
      features: [
        'Single location',
        'Up to 2 users',
        'Basic POS functionality',
        'Basic reports',
        'Email support'
      ],
      limits: { users: 2, locations: 1 }
    },
    {
      tier: 'basic' as SubscriptionTier,
      name: 'Basic',
      price: `${currency} 2,900`,
      period: 'per month',
      icon: Zap,
      features: [
        'Up to 3 locations',
        'Up to 10 users',
        'Advanced inventory management',
        'Advanced reports & analytics',
        'Priority email support',
        'API access'
      ],
      limits: { users: 10, locations: 3 }
    },
    {
      tier: 'professional' as SubscriptionTier,
      name: 'Professional',
      price: `${currency} 9,900`,
      period: 'per month',
      icon: Crown,
      popular: true,
      features: [
        'Up to 10 locations',
        'Up to 50 users',
        'User role management',
        'Custom integrations',
        'Advanced analytics',
        'Phone & email support',
        'API access'
      ],
      limits: { users: 50, locations: 10 }
    },
    {
      tier: 'enterprise' as SubscriptionTier,
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      icon: Users,
      features: [
        'Unlimited locations',
        'Unlimited users',
        'White-label solution',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security'
      ],
      limits: { users: 999, locations: 999 }
    }
  ];

  const currentPlan = plans.find(plan => plan.tier === currentTenant.subscriptionTier);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setLoading(true);
    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      toast({
        title: "Upgrade initiated",
        description: `Redirecting to payment for ${tier} plan...`,
      });
      
      // Simulate payment process
      setTimeout(() => {
        toast({
          title: "Upgrade successful",
          description: `You've been upgraded to ${tier} plan!`,
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      {/* Current Subscription Status */}
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
              <p className="text-2xl font-bold">{currentPlan?.price}</p>
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

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.tier === currentTenant.subscriptionTier;
          
          return (
            <Card key={plan.tier} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <Icon className="h-8 w-8 mx-auto text-blue-600" />
                <CardTitle>{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent || loading}
                  onClick={() => handleUpgrade(plan.tier)}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionManager;
