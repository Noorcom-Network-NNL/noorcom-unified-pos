
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="mobile">Mobile Money</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasItems && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>KSh {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button 
        onClick={onCreateSale} 
        className="w-full" 
        disabled={loading || !hasItems}
      >
        {loading ? 'Creating Sale...' : 
         !hasItems ? 'Add Products to Create Sale' : 
         `Create Sale (KSh ${totalAmount.toLocaleString()})`}
      </Button>
    </div>
  );
};

export default SaleSummary;
