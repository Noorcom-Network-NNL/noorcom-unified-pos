
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { processPayPalPayment, processMpesaPayment, verifyPayment } from '@/services/paymentService';

interface PaymentProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  paymentData: {
    amount: number;
    method: string;
    phoneNumber?: string;
    email?: string;
    orderId: string;
    description: string;
  };
  onPaymentComplete: (success: boolean, transactionId?: string) => void;
}

const PaymentProcessingDialog: React.FC<PaymentProcessingDialogProps> = ({
  open,
  onClose,
  paymentData,
  onPaymentComplete
}) => {
  const [status, setStatus] = useState<'processing' | 'pending' | 'success' | 'failed' | 'simulation'>('processing');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    if (open && paymentData) {
      processPayment();
    }
  }, [open, paymentData]);

  const processPayment = async () => {
    setStatus('processing');
    setMessage('Initiating payment...');

    try {
      const paymentRequest = {
        amount: paymentData.amount,
        currency: 'KES',
        customerPhone: paymentData.phoneNumber,
        customerEmail: paymentData.email,
        paymentMethod: paymentData.method as 'paypal' | 'mpesa',
        description: paymentData.description,
        orderId: paymentData.orderId
      };

      let response;

      if (paymentData.method === 'paypal') {
        response = await processPayPalPayment(paymentRequest);
        
        if (response.success && response.paymentUrl) {
          setStatus('pending');
          setMessage('Redirecting to PayPal...');
          setPaymentUrl(response.paymentUrl);
          setTransactionId(response.transactionId || '');
        } else {
          setStatus('failed');
          setMessage(response.error || 'PayPal payment failed');
        }
      } else if (paymentData.method === 'mpesa') {
        setMessage('Processing M-Pesa payment...');
        response = await processMpesaPayment(paymentRequest);
        
        if (response.success) {
          setStatus('simulation');
          setMessage('⚠️ SIMULATION MODE: This is a demo without real M-Pesa integration');
          setTransactionId(response.transactionId || '');
        } else {
          setStatus('failed');
          setMessage(response.error || 'M-Pesa payment failed');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setStatus('failed');
      setMessage('Payment processing failed. Please try again.');
    }
  };

  const handlePayPalRedirect = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      // Simulate successful payment for demo
      setTimeout(() => {
        setStatus('success');
        setMessage('PayPal payment completed successfully!');
        onPaymentComplete(true, transactionId);
      }, 10000);
    }
  };

  const handleSimulationClose = () => {
    onPaymentComplete(false); // Don't mark as successful since it's just a simulation
    onClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
      case 'pending':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'simulation':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Processing</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4 py-6">
          {getStatusIcon()}
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              KES {paymentData?.amount?.toLocaleString()} via {paymentData?.method?.toUpperCase()}
            </h3>
            <p className="text-gray-600">{message}</p>
            
            {transactionId && (
              <p className="text-xs text-gray-500 mt-2">
                Transaction ID: {transactionId}
              </p>
            )}
          </div>

          {status === 'pending' && paymentData.method === 'paypal' && paymentUrl && (
            <Button onClick={handlePayPalRedirect} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open PayPal
            </Button>
          )}
          
          {status === 'simulation' && (
            <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-yellow-700">
                🚧 <strong>Demo Mode:</strong> No real STK Push sent to your phone.
              </p>
              <p className="text-xs text-yellow-600">
                For production M-Pesa integration, you need a backend server or Supabase Edge Functions to handle the API calls securely.
              </p>
              <Button onClick={handleSimulationClose} variant="outline" className="w-full">
                Close Demo
              </Button>
            </div>
          )}

          {(status === 'success' || status === 'failed') && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProcessingDialog;
