
import { SubscriptionTier } from '@/contexts/TenantContext';
import { LucideIcon } from 'lucide-react';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  icon: LucideIcon;
  popular?: boolean;
  features: string[];
  limits: { users: number; locations: number };
}
