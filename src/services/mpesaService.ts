import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const functions = getFunctions();

export interface MpesaPaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  message?: string;
  paymentId?: string;
  error?: string;
}

// Process M-Pesa STK Push payment using Firebase Cloud Functions
export const processMpesaPayment = async (paymentData: MpesaPaymentRequest): Promise<MpesaPaymentResponse> => {
  try {
    console.log('Processing M-Pesa payment with Cloud Functions:', paymentData);
    
    // Call Firebase Cloud Function
    const stkPushFunction = httpsCallable(functions, 'stkPush');
    const result = await stkPushFunction(paymentData);
    
    const response = result.data as any;
    
    if (response.success) {
      console.log('STK Push sent successfully:', response.checkoutRequestId);
      return {
        success: true,
        checkoutRequestId: response.checkoutRequestId,
        merchantRequestId: response.merchantRequestId,
        message: response.message,
        paymentId: response.paymentId
      };
    } else {
      return {
        success: false,
        error: response.message || 'STK Push failed'
      };
    }
  } catch (error: any) {
    console.error('M-Pesa payment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process M-Pesa payment'
    };
  }
};

// Query M-Pesa payment status using Firebase Cloud Functions
export const queryMpesaPaymentStatus = async (checkoutRequestId: string): Promise<boolean> => {
  try {
    console.log('Querying M-Pesa payment status:', checkoutRequestId);
    
    const queryStatusFunction = httpsCallable(functions, 'queryPaymentStatus');
    const result = await queryStatusFunction({ checkoutRequestId });
    
    const response = result.data as any;
    
    if (response.found) {
      console.log('Payment status:', response.status);
      return response.status === 'completed';
    }
    
    return false;
  } catch (error) {
    console.error('M-Pesa query error:', error);
    return false;
  }
};

// Listen to real-time payment updates
export const listenToPaymentUpdates = (
  checkoutRequestId: string, 
  onUpdate: (status: string, data?: any) => void
) => {
  const paymentsQuery = query(
    collection(db, 'payments'),
    where('checkoutRequestId', '==', checkoutRequestId)
  );
  
  return onSnapshot(paymentsQuery, (snapshot) => {
    if (!snapshot.empty) {
      const paymentData = snapshot.docs[0].data();
      onUpdate(paymentData.status, paymentData);
    }
  });
};

// Handle M-Pesa callback (this is now handled by Cloud Functions)
export const handleMpesaCallback = async (callbackData: any) => {
  // This function is now handled by the Cloud Function
  // but we keep it for backward compatibility
  console.log('Callback handling moved to Cloud Functions');
  return { success: true };
};
