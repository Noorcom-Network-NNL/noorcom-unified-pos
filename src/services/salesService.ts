
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Sales operations
export const createSale = async (saleData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: new Date().toISOString()
    });
    console.log('Sale created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

export const getSales = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'sales'), orderBy('createdAt', 'desc'))
    );
    const sales: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });
    return sales;
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
};
