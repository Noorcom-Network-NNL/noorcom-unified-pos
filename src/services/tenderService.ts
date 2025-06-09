
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tender operations
export const createTender = async (tenderData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'tenders'), {
      ...tenderData,
      createdAt: new Date().toISOString()
    });
    console.log('Tender created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tender:', error);
    throw error;
  }
};

export const getTenders = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'tenders'), orderBy('createdAt', 'desc'))
    );
    const tenders: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      tenders.push({ id: doc.id, ...doc.data() });
    });
    return tenders;
  } catch (error) {
    console.error('Error getting tenders:', error);
    throw error;
  }
};

export const updateTender = async (tenderId: string, updateData: any) => {
  try {
    const tenderRef = doc(db, 'tenders', tenderId);
    await updateDoc(tenderRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    console.log('Tender updated with ID:', tenderId);
    return tenderId;
  } catch (error) {
    console.error('Error updating tender:', error);
    throw error;
  }
};
