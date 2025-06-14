
import React, { useState } from 'react';
import { useTenant, SubscriptionTier } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import PaymentProcessingDialog from '@/components/payments/PaymentProcessingDialog';
import CurrentSubscriptionCard from '@/components/subscription/CurrentSubscriptionCard';
import PlanCard from '@/components/subscription/PlanCard';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';
import { SUBSCRIPTION_PLANS } from '@/components/subscription/subscriptionPlans';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SubscriptionManager = () => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    tier: SubscriptionTier;
    name: string;
    price: number;
  } | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

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

  const handleUpgrade = async (tier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    if (!plan) return;

    if (tier === 'enterprise') {
      toast({
        title: "Contact Sales",
        description: "Please contact our sales team for Enterprise pricing and setup.",
      });
      return;
    }

    if (plan.price === 0) {
      toast({
        title: "No payment required",
        description: "This plan is free.",
      });
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentMethodDialog(true);
  };

  const handlePaymentMethodSelect = (method: string, data?: any) => {
    if (!selectedPlan) return;

    if (method === 'cash' || method === 'card') {
      toast({
        title: "Payment method not supported",
        description: "Please use M-Pesa or PayPal for subscription payments.",
        variant: "destructive",
      });
      return;
    }

    const paymentInfo = {
      amount: selectedPlan.price,
      method,
      phoneNumber: data?.phoneNumber,
      email: data?.email,
      orderId: `SUB_${Date.now()}`,
      description: `${selectedPlan.name} Plan Subscription`
    };

    setPaymentData(paymentInfo);
    setShowPaymentMethodDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = (success: boolean, transactionId?: string) => {
    setShowPaymentDialog(false);
    setShowPaymentMethodDialog(false);
    setSelectedPlan(null);
    setPaymentData(null);
    
    if (success) {
      toast({
        title: "Upgrade successful!",
        description: `You've been upgraded to ${selectedPlan?.name} plan. Transaction ID: ${transactionId}`,
      });
    } else {
      toast({
        title: "Payment failed",
        description: "Your subscription upgrade was not processed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setPaymentData(null);
  };

  const handlePaymentMethodDialogClose = () => {
    setShowPaymentMethodDialog(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6">
      <CurrentSubscriptionCard currentTenant={currentTenant} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTenant.subscriptionTier;
          
          return (
            <PlanCard
              key={plan.tier}
              plan={plan}
              isCurrent={isCurrent}
              loading={loading}
              onUpgrade={handleUpgrade}
            />
          );
        })}
      </div>

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentMethodDialog} onOpenChange={handlePaymentMethodDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPlan && (
              <PaymentMethodSelector
                amount={selectedPlan.price}
                onPaymentMethodSelect={handlePaymentMethodSelect}
                loading={loading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Processing Dialog */}
      {paymentData && (
        <PaymentProcessingDialog
          open={showPaymentDialog}
          onClose={handlePaymentDialogClose}
          paymentData={paymentData}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default SubscriptionManager;
