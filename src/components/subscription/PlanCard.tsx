
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from './subscriptionTypes';
import { SubscriptionTier } from '@/contexts/TenantContext';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  loading: boolean;
  onUpgrade: (tier: SubscriptionTier) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, loading, onUpgrade }) => {
  const Icon = plan.icon;

  return (
    <Card className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <Icon className="h-8 w-8 mx-auto text-blue-600" />
        <CardTitle>{plan.name}</CardTitle>
        <div>
          <span className="text-3xl font-bold">{plan.priceDisplay}</span>
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
          onClick={() => onUpgrade(plan.tier)}
        >
          {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
