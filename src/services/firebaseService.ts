
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Sales operations
export const addSale = async (saleData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding sale:', error);
    throw error;
  }
};

export const getSales = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'sales'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
};

// Inventory operations
export const addProduct = async (productData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const updateProductStock = async (productId: string, newStock: number) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Customer operations
export const addCustomer = async (customerData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...customerData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const getCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

// Orders operations
export const addOrder = async (orderData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
