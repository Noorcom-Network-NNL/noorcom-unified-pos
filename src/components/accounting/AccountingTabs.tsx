
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChartOfAccounts from './ChartOfAccounts';
import JournalEntries from './JournalEntries';
import TrialBalance from './TrialBalance';
import ProfitAndLoss from './ProfitAndLoss';
import BalanceSheet from './BalanceSheet';
import AccountingReports from './AccountingReports';

interface AccountingTabsProps {
  accountingData: {
    sales: any[];
    expenses: any[];
    accounts: any[];
    journalEntries: any[];
  };
}

const AccountingTabs = ({ accountingData }: AccountingTabsProps) => {
  return (
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
  );
};

export default AccountingTabs;
