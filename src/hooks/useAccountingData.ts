
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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

  useEffect(() => {
    console.log('Setting up accounting data listeners...');
    
    // Listen to sales data
    const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccountingData(prev => ({ ...prev, sales: salesData }));
    });

    // Listen to expenses data
    const expensesQuery = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccountingData(prev => ({ ...prev, expenses: expensesData }));
    });

    // Listen to chart of accounts
    const accountsQuery = query(collection(db, 'accounts'), orderBy('accountCode', 'asc'));
    const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccountingData(prev => ({ ...prev, accounts: accountsData }));
    });

    // Listen to journal entries
    const journalQuery = query(collection(db, 'journalEntries'), orderBy('date', 'desc'));
    const unsubscribeJournal = onSnapshot(journalQuery, (snapshot) => {
      const journalData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccountingData(prev => ({ ...prev, journalEntries: journalData }));
      setLoading(false);
    });

    return () => {
      unsubscribeSales();
      unsubscribeExpenses();
      unsubscribeAccounts();
      unsubscribeJournal();
    };
  }, []);

  return { accountingData, loading };
};
