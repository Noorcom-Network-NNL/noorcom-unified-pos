
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Category {
  id: string;
  name: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

// Category operations
export const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: new Date().toISOString()
    });
    console.log('Category created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId: string, updateData: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    console.log('Category updated with ID:', categoryId);
    return categoryId;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('Category deleted with ID:', categoryId);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Function to seed initial categories
export const seedInitialCategories = async () => {
  try {
    const existingCategories = await getCategories();
    if (existingCategories.length > 0) {
      console.log('Categories already exist, skipping seed');
      return;
    }

    const initialCategories = [
      { name: 'Printing Materials', value: 'printing', description: 'Paper, ink, toner and printing supplies' },
      { name: 'Electronics', value: 'electronics', description: 'Electronic devices and components' },
      { name: 'Service Credits', value: 'services', description: 'Service-based products and credits' },
      { name: 'Accessories', value: 'accessories', description: 'Additional accessories and add-ons' },
      { name: 'Consumables', value: 'consumables', description: 'Consumable items and supplies' }
    ];

    for (const category of initialCategories) {
      await createCategory(category);
    }
    
    console.log('Initial categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};
