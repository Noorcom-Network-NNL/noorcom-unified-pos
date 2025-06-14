
import React from 'react';
import { useAccountingData } from '@/hooks/useAccountingData';
import AccountingHeader from './accounting/AccountingHeader';
import FinancialSummaryCards from './accounting/FinancialSummaryCards';
import AccountingTabs from './accounting/AccountingTabs';
import LoadingSpinner from './accounting/LoadingSpinner';

const AccountingModule = () => {
  const { accountingData, loading } = useAccountingData();

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <AccountingHeader />
      
      <FinancialSummaryCards
        totalRevenue={getTotalRevenue()}
        totalExpenses={getTotalExpenses()}
        netIncome={getNetIncome()}
        salesCount={accountingData.sales.length}
        expensesCount={accountingData.expenses.length}
      />

      <AccountingTabs accountingData={accountingData} />
    </div>
  );
};

export default AccountingModule;
