
import { 
  collection, 
  addDoc, 
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Service operations
export const createService = async (serviceData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'services'), {
      ...serviceData,
      createdAt: new Date().toISOString()
    });
    console.log('Service created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const getServices = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    const services: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return services;
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

// Supplier operations
export const createSupplier = async (supplierData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'suppliers'), {
      ...supplierData,
      createdAt: new Date().toISOString()
    });
    console.log('Supplier created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};
