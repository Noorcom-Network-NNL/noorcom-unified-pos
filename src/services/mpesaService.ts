
import { collection, addDoc, doc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// M-Pesa Configuration (for reference - actual API calls would be server-side)
const MPESA_CONFIG = {
  consumerKey: '0NYKkVOd6wwGdGkFtferGvuiRC0jTwAp',
  consumerSecret: 'Lr7Y0hj9DnicFeua',
  shortcode: '806876',
  passkey: 'd48aed22b2e43718f1e34e5df707986b121005d167f65bc5091139622ea26db9',
  callbackUrl: `${window.location.origin}/api/mpesa/callback`,
  baseUrl: 'https://sandbox.safaricom.co.ke',
};

export interface MpesaPaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  error?: string;
}

// Simulate M-Pesa STK Push payment with Firebase storage
export const processMpesaPayment = async (paymentData: MpesaPaymentRequest): Promise<MpesaPaymentResponse> => {
  try {
    console.log('Processing M-Pesa payment with Firebase:', paymentData);
    
    // Format phone number (ensure it starts with 254)
    let phoneNumber = paymentData.phoneNumber.replace(/\s+/g, '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '254' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+254')) {
      phoneNumber = phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('254')) {
      phoneNumber = '254' + phoneNumber;
    }

    // Generate a mock checkout request ID
    const checkoutRequestId = `WS_CO_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store payment intent in Firebase
    const paymentDoc = await addDoc(collection(db, 'payments'), {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      phoneNumber: phoneNumber,
      description: paymentData.description,
      status: 'pending',
      provider: 'mpesa',
      checkoutRequestId: checkoutRequestId,
      merchantRequestId: `MR_${Date.now()}`,
      createdAt: Timestamp.fromDate(new Date()),
      // Mark as simulation since we can't make real API calls from frontend
      isSimulation: true,
      stkPushStatus: 'initiated'
    });

    console.log('Payment record created in Firebase:', paymentDoc.id);
    console.log('⚠️ NOTE: This is a simulation. Real M-Pesa integration requires backend server.');

    return {
      success: true,
      checkoutRequestId: checkoutRequestId
    };
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    return {
      success: false,
      error: 'Failed to process M-Pesa payment'
    };
  }
};

// Simulate payment status query - made more realistic
export const queryMpesaPaymentStatus = async (checkoutRequestId: string): Promise<boolean> => {
  try {
    console.log('Querying M-Pesa payment status:', checkoutRequestId);
    
    // Find payment record by checkout request ID
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('checkoutRequestId', '==', checkoutRequestId)
    );
    
    const querySnapshot = await getDocs(paymentsQuery);
    
    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      const paymentData = paymentDoc.data();
      
      console.log('⚠️ SIMULATION MODE: No real M-Pesa API available in browser');
      console.log('💡 For production: Set up backend server or Supabase Edge Functions');
      
      // Instead of random success, always fail in simulation to prevent false positives
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        status: 'simulation_timeout',
        error: 'This is a simulation - no real STK Push sent. Backend integration required.',
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      return false; // Always return false in simulation to prevent false success
    }
    
    return false;
  } catch (error) {
    console.error('M-Pesa query error:', error);
    return false;
  }
};

// Handle M-Pesa callback simulation
export const handleMpesaCallback = async (callbackData: any) => {
  try {
    console.log('M-Pesa callback received:', callbackData);

    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find payment record by checkout request ID
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('checkoutRequestId', '==', checkoutRequestId)
    );
    
    const querySnapshot = await getDocs(paymentsQuery);
    
    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      
      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          status: 'completed',
          mpesaReceiptNumber,
          transactionDate,
          phoneNumber,
          resultDesc,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        // Payment failed
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          status: 'failed',
          error: resultDesc,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);
    return { success: false, error: error };
  }
};
