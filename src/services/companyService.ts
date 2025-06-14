
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper function to remove undefined values from objects
const removeUndefinedValues = (obj: any) => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Company operations
export const createCompany = async (companyData: any) => {
  try {
    const cleanedData = removeUndefinedValues(companyData);
    const docRef = await addDoc(collection(db, 'companies'), {
      ...cleanedData,
      createdAt: new Date().toISOString()
    });
    console.log('Company created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const getCompanies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'companies'));
    const companies: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() });
    });
    return companies;
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

export const updateCompany = async (companyId: string, updateData: any) => {
  try {
    const cleanedData = removeUndefinedValues(updateData);
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      ...cleanedData,
      updatedAt: new Date().toISOString()
    });
    console.log('Company updated with ID:', companyId);
    return companyId;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};
