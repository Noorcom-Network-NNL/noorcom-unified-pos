
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/contexts/FirebaseContext';

export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

interface TenantProfile {
  id: string;
  name: string;
  domain?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  maxUsers: number;
  maxLocations: number;
  features: string[];
  createdAt: string;
  trialEndsAt?: string;
  billingEmail: string;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    companyInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
      taxId: string;
      logo?: string;
    };
  };
}

interface TenantContextType {
  currentTenant: TenantProfile | null;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  isWithinLimits: (resource: 'users' | 'locations') => Promise<boolean>;
  updateTenantSettings: (settings: Partial<TenantProfile['settings']>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

const SUBSCRIPTION_FEATURES = {
  free: ['basic_pos', 'single_location', 'basic_reports'],
  basic: ['basic_pos', 'multi_location', 'advanced_reports', 'inventory_management'],
  professional: ['basic_pos', 'multi_location', 'advanced_reports', 'inventory_management', 'user_management', 'api_access'],
  enterprise: ['basic_pos', 'multi_location', 'advanced_reports', 'inventory_management', 'user_management', 'api_access', 'custom_integrations', 'priority_support']
};

const SUBSCRIPTION_LIMITS = {
  free: { maxUsers: 2, maxLocations: 1 },
  basic: { maxUsers: 10, maxLocations: 3 },
  professional: { maxUsers: 50, maxLocations: 10 },
  enterprise: { maxUsers: 999, maxLocations: 999 }
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { currentUser, userProfile } = useFirebase();
  const [currentTenant, setCurrentTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenantProfile = async (tenantId: string) => {
    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      const tenantSnap = await getDoc(tenantRef);
      
      if (tenantSnap.exists()) {
        const tenantData = tenantSnap.data();
        setCurrentTenant({
          id: tenantSnap.id,
          ...tenantData
        } as TenantProfile);
      } else {
        // Create default tenant for new organizations
        const defaultTenant: Omit<TenantProfile, 'id'> = {
          name: 'My Business',
          subscriptionTier: 'free',
          subscriptionStatus: 'trialing',
          maxUsers: SUBSCRIPTION_LIMITS.free.maxUsers,
          maxLocations: SUBSCRIPTION_LIMITS.free.maxLocations,
          features: SUBSCRIPTION_FEATURES.free,
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          billingEmail: currentUser?.email || '',
          settings: {
            timezone: 'UTC',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            companyInfo: {
              name: 'My Business',
              address: '',
              phone: '',
              email: currentUser?.email || '',
              taxId: ''
            }
          }
        };
        
        await setDoc(tenantRef, defaultTenant);
        setCurrentTenant({ id: tenantId, ...defaultTenant });
      }
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!currentTenant) return false;
    return currentTenant.features.includes(feature);
  };

  const isWithinLimits = async (resource: 'users' | 'locations'): Promise<boolean> => {
    if (!currentTenant) return false;

    try {
      let currentCount = 0;
      
      if (resource === 'users') {
        const usersQuery = query(
          collection(db, 'users'),
          where('tenantId', '==', currentTenant.id)
        );
        const usersSnapshot = await getDocs(usersQuery);
        currentCount = usersSnapshot.size;
        return currentCount < currentTenant.maxUsers;
      } else if (resource === 'locations') {
        const locationsQuery = query(
          collection(db, 'locations'),
          where('tenantId', '==', currentTenant.id)
        );
        const locationsSnapshot = await getDocs(locationsQuery);
        currentCount = locationsSnapshot.size;
        return currentCount < currentTenant.maxLocations;
      }
    } catch (error) {
      console.error('Error checking limits:', error);
    }
    
    return false;
  };

  const updateTenantSettings = async (settings: Partial<TenantProfile['settings']>) => {
    if (!currentTenant) return;

    try {
      const tenantRef = doc(db, 'tenants', currentTenant.id);
      const updatedSettings = { ...currentTenant.settings, ...settings };
      
      await setDoc(tenantRef, {
        settings: updatedSettings,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCurrentTenant({
        ...currentTenant,
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Error updating tenant settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser && userProfile) {
      // Use user's organization or create one based on email domain
      const tenantId = userProfile.tenantId || `tenant_${currentUser.uid}`;
      fetchTenantProfile(tenantId);
    } else {
      setCurrentTenant(null);
    }
    setLoading(false);
  }, [currentUser, userProfile]);

  const value = {
    currentTenant,
    loading,
    hasFeature,
    isWithinLimits,
    updateTenantSettings
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
