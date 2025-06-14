
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, TrendingUp, PieChart, Receipt, Building } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import ChartOfAccounts from './accounting/ChartOfAccounts';
import JournalEntries from './accounting/JournalEntries';
import TrialBalance from './accounting/TrialBalance';
import ProfitAndLoss from './accounting/ProfitAndLoss';
import BalanceSheet from './accounting/BalanceSheet';
import AccountingReports from './accounting/AccountingReports';

interface AccountingData {
  sales: any[];
  expenses: any[];
  accounts: any[];
  journalEntries: any[];
}

const AccountingModule = () => {
  const [accountingData, setAccountingData] = useState<AccountingData>({
    sales: [],
    expenses: [],
    accounts: [],
    journalEntries: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const getTotalRevenue = () => {
    return accountingData.sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  };

  const getTotalExpenses = () => {
    return accountingData.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  };

  const getNetIncome = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Accounting</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accounting data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Accounting</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Calculator className="h-4 w-4 mr-1" />
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KSh {getTotalRevenue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {accountingData.sales.length} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KSh {getTotalExpenses().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {accountingData.expenses.length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              KSh {getNetIncome().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="profit">P&L Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <ChartOfAccounts accounts={accountingData.accounts} />
        </TabsContent>

        <TabsContent value="journal">
          <JournalEntries 
            journalEntries={accountingData.journalEntries}
            accounts={accountingData.accounts}
          />
        </TabsContent>

        <TabsContent value="trial">
          <TrialBalance 
            accounts={accountingData.accounts}
            journalEntries={accountingData.journalEntries}
          />
        </TabsContent>

        <TabsContent value="profit">
          <ProfitAndLoss 
            sales={accountingData.sales}
            expenses={accountingData.expenses}
            accounts={accountingData.accounts}
          />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheet 
            accounts={accountingData.accounts}
            journalEntries={accountingData.journalEntries}
          />
        </TabsContent>

        <TabsContent value="reports">
          <AccountingReports 
            accountingData={accountingData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingModule;
