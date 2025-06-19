
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AccountingData {
  sales: any[];
  expenses: any[];
  accounts: any[];
  journalEntries: any[];
}

export const useAccountingData = () => {
  const [accountingData, setAccountingData] = useState<AccountingData>({
    sales: [],
    expenses: [],
    accounts: [],
    journalEntries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    try {
      // Listen to sales data
      const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccountingData(prev => ({ ...prev, sales: salesData }));
      });
      unsubscribers.push(unsubscribeSales);

      // Listen to expenses data
      const expensesQuery = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
      const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const expensesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccountingData(prev => ({ ...prev, expenses: expensesData }));
      });
      unsubscribers.push(unsubscribeExpenses);

      // Listen to accounts data
      const accountsQuery = query(collection(db, 'accounts'), orderBy('accountCode'));
      const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
        const accountsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccountingData(prev => ({ ...prev, accounts: accountsData }));
      });
      unsubscribers.push(unsubscribeAccounts);

      // Listen to journal entries data
      const journalQuery = query(collection(db, 'journalEntries'), orderBy('date', 'desc'));
      const unsubscribeJournal = onSnapshot(journalQuery, (snapshot) => {
        const journalData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccountingData(prev => ({ ...prev, journalEntries: journalData }));
      });
      unsubscribers.push(unsubscribeJournal);

      setLoading(false);
    } catch (err) {
      console.error('Error setting up accounting data listeners:', err);
      setError('Failed to load accounting data');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { accountingData, loading, error };
};
