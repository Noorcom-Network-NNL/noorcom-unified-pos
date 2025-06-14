
import { Crown, Users, Zap, Star } from 'lucide-react';
import { SubscriptionPlan } from './subscriptionTypes';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: `KES 0`,
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
    tier: 'basic',
    name: 'Basic',
    price: 2900,
    priceDisplay: `KES 2,900`,
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
    tier: 'professional',
    name: 'Professional',
    price: 9900,
    priceDisplay: `KES 9,900`,
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
    tier: 'enterprise',
    name: 'Enterprise',
    price: 0,
    priceDisplay: 'Custom',
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
