
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Expense operations
export const createExpense = async (expenseData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      createdAt: new Date().toISOString()
    });
    console.log('Expense created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

// Invoice operations
export const createInvoice = async (invoiceData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      createdAt: new Date().toISOString()
    });
    console.log('Invoice created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const getInvoices = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))
    );
    const invoices: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    return invoices;
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
};
