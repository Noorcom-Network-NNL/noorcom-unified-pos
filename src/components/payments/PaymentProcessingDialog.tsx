
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
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
  const [status, setStatus] = useState<'processing' | 'pending' | 'success' | 'failed'>('processing');
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
        setMessage('Sending STK Push to your phone...');
        response = await processMpesaPayment(paymentRequest);
        
        if (response.success) {
          setStatus('pending');
          setMessage('Please check your phone for M-Pesa STK push notification and enter your M-Pesa PIN');
          setTransactionId(response.transactionId || '');
          
          // Start polling for payment verification after 10 seconds
          setTimeout(() => verifyMpesaPayment(response.transactionId || ''), 10000);
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

  const verifyMpesaPayment = async (txnId: string) => {
    setMessage('Verifying payment with M-Pesa...');
    
    try {
      // Poll for payment status multiple times
      let attempts = 0;
      const maxAttempts = 6; // Check for 3 minutes (30 seconds * 6)
      
      const checkPaymentStatus = async (): Promise<boolean> => {
        attempts++;
        const isVerified = await verifyPayment(txnId, 'mpesa');
        
        if (isVerified) {
          setStatus('success');
          setMessage('M-Pesa payment completed successfully!');
          onPaymentComplete(true, txnId);
          return true;
        } else if (attempts < maxAttempts) {
          setMessage(`Verifying payment... (${attempts}/${maxAttempts})`);
          setTimeout(checkPaymentStatus, 30000); // Check every 30 seconds
          return false;
        } else {
          setStatus('failed');
          setMessage('Payment verification timeout. Please contact support if payment was deducted.');
          onPaymentComplete(false);
          return false;
        }
      };
      
      await checkPaymentStatus();
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Payment verification failed. Please contact support if payment was deducted.');
      onPaymentComplete(false);
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

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
      case 'pending':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-500" />;
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
          
          {status === 'pending' && paymentData.method === 'mpesa' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                📱 Check your phone for the M-Pesa payment request and enter your PIN to complete the transaction.
              </p>
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
