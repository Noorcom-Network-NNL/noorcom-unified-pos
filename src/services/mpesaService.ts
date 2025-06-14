
import { collection, addDoc, doc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: '0NYKkVOd6wwGdGkFtferGvuiRC0jTwAp',
  consumerSecret: 'Lr7Y0hj9DnicFeua',
  shortcode: '806876',
  passkey: 'd48aed22b2e43718f1e34e5df707986b121005d167f65bc5091139622ea26db9',
  callbackUrl: `${window.location.origin}/api/mpesa/callback`,
  baseUrl: 'https://sandbox.safaricom.co.ke', // Change to 'https://api.safaricom.co.ke' for production
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

// Get OAuth token for M-Pesa API
const getMpesaToken = async (): Promise<string> => {
  const auth = btoa(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`);
  
  const response = await fetch(`${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get M-Pesa token');
  }

  const data = await response.json();
  return data.access_token;
};

// Generate timestamp for M-Pesa API
const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Generate password for M-Pesa STK Push
const generatePassword = (timestamp: string): string => {
  const password = `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`;
  return btoa(password);
};

// Process M-Pesa STK Push payment
export const processMpesaPayment = async (paymentData: MpesaPaymentRequest): Promise<MpesaPaymentResponse> => {
  try {
    console.log('Processing M-Pesa payment:', paymentData);
    
    // Get OAuth token
    const token = await getMpesaToken();
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    
    // Format phone number (ensure it starts with 254)
    let phoneNumber = paymentData.phoneNumber.replace(/\s+/g, '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '254' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+254')) {
      phoneNumber = phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('254')) {
      phoneNumber = '254' + phoneNumber;
    }

    // Store payment intent in Firebase
    const paymentDoc = await addDoc(collection(db, 'payments'), {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      phoneNumber: phoneNumber,
      description: paymentData.description,
      status: 'pending',
      provider: 'mpesa',
      createdAt: Timestamp.fromDate(new Date())
    });

    // STK Push request payload
    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: paymentData.amount,
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: paymentData.orderId,
      TransactionDesc: paymentData.description
    };

    // Make STK Push request
    const response = await fetch(`${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('M-Pesa STK Push response:', responseData);

    if (responseData.ResponseCode === '0') {
      // Update payment record with checkout request ID
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        checkoutRequestId: responseData.CheckoutRequestID,
        merchantRequestId: responseData.MerchantRequestID,
        updatedAt: Timestamp.fromDate(new Date())
      });

      return {
        success: true,
        checkoutRequestId: responseData.CheckoutRequestID
      };
    } else {
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        status: 'failed',
        error: responseData.ResponseDescription,
        updatedAt: Timestamp.fromDate(new Date())
      });

      return {
        success: false,
        error: responseData.ResponseDescription || 'STK Push failed'
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

// Query payment status from STK Push
export const queryMpesaPaymentStatus = async (checkoutRequestId: string): Promise<boolean> => {
  try {
    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const queryPayload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(`${MPESA_CONFIG.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('M-Pesa query response:', responseData);

    return responseData.ResultCode === '0';
  } catch (error) {
    console.error('M-Pesa query error:', error);
    return false;
  }
};

// Handle M-Pesa callback (this would typically be a server endpoint)
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
