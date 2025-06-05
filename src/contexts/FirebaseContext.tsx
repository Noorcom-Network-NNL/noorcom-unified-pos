
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'accountant' | 'inventory_clerk';

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  isActive: boolean;
  department?: string;
}

interface FirebaseContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const roleHierarchy: Record<UserRole, number> = {
  admin: 5,           // Full system access
  manager: 4,         // All operations except system admin
  accountant: 3,      // Financial reports, invoices, sales analysis
  cashier: 2,         // Sales, customer management, basic inventory viewing
  inventory_clerk: 1  // Inventory management, stock control
};

// Predefined admin emails
const ADMIN_EMAILS = [
  'duba@noorcomnetwork.com',
  'admin@noorcomnetwork.com'
];

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider = ({ children }: FirebaseProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminEmail = (email: string): boolean => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  };

  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userRole = isAdminEmail(user.email || '') ? 'admin' : (userData.role || 'cashier');
        
        // Update role if user is admin email but not marked as admin
        if (isAdminEmail(user.email || '') && userData.role !== 'admin') {
          await setDoc(userRef, { 
            ...userData, 
            role: 'admin',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          role: userRole,
          name: userData.name,
          isActive: userData.isActive ?? true,
          department: userData.department
        });
      } else {
        // Create default profile for new users
        const defaultRole = isAdminEmail(user.email || '') ? 'admin' : 'cashier';
        const newUserProfile = {
          email: user.email || '',
          role: defaultRole,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        // Save the new user profile to Firestore
        await setDoc(userRef, newUserProfile);
        
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          role: defaultRole,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userProfile) return false;
    return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    loading,
    hasPermission
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};
