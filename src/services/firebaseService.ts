
import { 
  collection, 
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('Firebase connection successful! Collection size:', snapshot.size);
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

// Re-export all services for backward compatibility
export * from './companyService';
export * from './userService';
export * from './customerService';
export * from './productService';
export * from './salesService';
export * from './orderService';
export * from './serviceManagementService';
export * from './financialService';
export * from './tenderService';
