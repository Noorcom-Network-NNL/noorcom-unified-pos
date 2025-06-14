
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PaymentMethodSelector from '../payments/PaymentMethodSelector';
import PaymentProcessingDialog from '../payments/PaymentProcessingDialog';

interface SaleSummaryProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  totalAmount: number;
  onCreateSale: () => void;
  loading: boolean;
  hasItems: boolean;
}

const SaleSummary: React.FC<SaleSummaryProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  totalAmount,
  onCreateSale,
  loading,
  hasItems
}) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentData, setSelectedPaymentData] = useState<any>(null);

  const handlePaymentMethodSelect = (method: string, data?: any) => {
    onPaymentMethodChange(method);
    
    if (method === 'mpesa' || method === 'paypal') {
      setSelectedPaymentData({
        amount: totalAmount,
        method,
        phoneNumber: data?.phoneNumber,
        email: data?.email,
        orderId: `SALE-${Date.now()}`,
        description: `POS Sale - ${hasItems ? 'Multiple items' : 'No items'}`
      });
      setShowPaymentDialog(true);
    } else {
      // For cash and card payments, proceed directly
      onCreateSale();
    }
  };

  const handlePaymentComplete = (success: boolean, transactionId?: string) => {
    setShowPaymentDialog(false);
    if (success) {
      onCreateSale();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <PaymentMethodSelector
          amount={totalAmount}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          loading={loading}
        />
      </div>

      {hasItems && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>KES {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {paymentMethod === 'cash' || paymentMethod === 'card' ? (
        <Button 
          onClick={onCreateSale} 
          className="w-full" 
          disabled={loading || !hasItems}
        >
          {loading ? 'Creating Sale...' : 
           !hasItems ? 'Add Products to Create Sale' : 
           `Create Sale (KES ${totalAmount.toLocaleString()})`}
        </Button>
      ) : null}

      <PaymentProcessingDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        paymentData={selectedPaymentData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default SaleSummary;
