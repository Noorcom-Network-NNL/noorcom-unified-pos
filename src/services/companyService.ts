
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Company operations
export const createCompany = async (companyData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'companies'), {
      ...companyData,
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
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    console.log('Company updated with ID:', companyId);
    return companyId;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};
