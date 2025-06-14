
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { processMpesaPayment, queryMpesaPaymentStatus } from './mpesaService';

export interface PaymentRequest {
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: 'paypal' | 'mpesa';
  description: string;
  orderId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

// PayPal Integration (mock implementation)
export const processPayPalPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    console.log('Processing PayPal payment:', paymentData);
    
    // Store payment intent in Firebase
    const paymentDoc = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      status: 'pending',
      provider: 'paypal',
      createdAt: Timestamp.fromDate(new Date())
    });

    // Simulate PayPal flow
    const mockPayPalResponse = {
      id: `PAYPAL_${Date.now()}`,
      status: 'PENDING',
      links: [{
        href: `https://www.sandbox.paypal.com/checkoutnow?token=MOCK_TOKEN_${Date.now()}`,
        rel: 'approve'
      }]
    };

    // Update payment record with PayPal response
    await updateDoc(doc(db, 'payments', paymentDoc.id), {
      paypalTransactionId: mockPayPalResponse.id,
      paymentUrl: mockPayPalResponse.links[0].href,
      updatedAt: Timestamp.fromDate(new Date())
    });

    return {
      success: true,
      transactionId: mockPayPalResponse.id,
      paymentUrl: mockPayPalResponse.links[0].href
    };
  } catch (error) {
    console.error('PayPal payment error:', error);
    return {
      success: false,
      error: 'Failed to process PayPal payment'
    };
  }
};

// M-Pesa Integration using Firebase
export const processMpesaPayment_Firebase = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    console.log('Processing M-Pesa payment with Firebase:', paymentData);
    
    if (!paymentData.customerPhone) {
      return {
        success: false,
        error: 'Phone number is required for M-Pesa payments'
      };
    }

    const mpesaRequest = {
      amount: paymentData.amount,
      phoneNumber: paymentData.customerPhone,
      orderId: paymentData.orderId,
      description: paymentData.description
    };

    const response = await processMpesaPayment(mpesaRequest);

    if (response.success) {
      return {
        success: true,
        transactionId: response.checkoutRequestId
      };
    } else {
      return {
        success: false,
        error: response.error || 'M-Pesa payment failed'
      };
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    return {
      success: false,
      error: 'Failed to process M-Pesa payment'
    };
  }
};

export const verifyPayment = async (transactionId: string, provider: 'paypal' | 'mpesa'): Promise<boolean> => {
  try {
    console.log(`Verifying ${provider} payment:`, transactionId);
    
    if (provider === 'mpesa') {
      return await queryMpesaPaymentStatus(transactionId);
    } else {
      // For PayPal, simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      return Math.random() > 0.2; // 80% success rate for demo
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Export the Firebase M-Pesa function as the main one
export { processMpesaPayment_Firebase as processMpesaPayment };
