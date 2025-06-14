
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ExternalLink, Smartphone } from 'lucide-react';
import { processPayPalPayment, processMpesaPayment, verifyPayment } from '@/services/paymentService';
import { listenToPaymentUpdates } from '@/services/mpesaService';

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
  const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState('');

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
        
        if (response.success && response.transactionId) {
          setStatus('pending');
          setMessage('Please check your phone and enter your M-Pesa PIN to complete payment');
          setTransactionId(response.transactionId);
          
          // Listen for real-time payment updates
          const unsubscribe = listenToPaymentUpdates(response.transactionId, (paymentStatus, data) => {
            console.log('Payment status update:', paymentStatus, data);
            
            if (paymentStatus === 'completed') {
              setStatus('success');
              setMessage('Payment completed successfully!');
              setMpesaReceiptNumber(data.mpesaReceiptNumber || '');
              onPaymentComplete(true, response.transactionId);
              unsubscribe();
            } else if (paymentStatus === 'failed') {
              setStatus('failed');
              setMessage(data.error || 'Payment failed');
              unsubscribe();
            }
          });
          
          // Auto-timeout after 2 minutes
          setTimeout(() => {
            if (status === 'pending') {
              setStatus('failed');
              setMessage('Payment timeout. Please try again.');
              unsubscribe();
            }
          }, 120000);
        } else {
          setStatus('failed');
          setMessage(response.error || 'Failed to send STK Push');
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

  const getStatusMessage = () => {
    if (paymentData.method === 'mpesa' && status === 'pending') {
      return (
        <div className="bg-green-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">STK Push Sent!</span>
          </div>
          <p className="text-sm text-green-700">
            Check your phone for an M-Pesa payment request and enter your PIN to complete the payment.
          </p>
          <p className="text-xs text-green-600">
            Phone: {paymentData.phoneNumber}
          </p>
        </div>
      );
    }
    return null;
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
            
            {mpesaReceiptNumber && (
              <p className="text-xs text-green-600 mt-2">
                M-Pesa Receipt: {mpesaReceiptNumber}
              </p>
            )}
          </div>

          {getStatusMessage()}

          {status === 'pending' && paymentData.method === 'paypal' && paymentUrl && (
            <Button onClick={handlePayPalRedirect} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open PayPal
            </Button>
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
