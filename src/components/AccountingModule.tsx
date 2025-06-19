
import React from 'react';
import { useAccountingData } from '@/hooks/useAccountingData';
import AccountingHeader from './accounting/AccountingHeader';
import FinancialSummaryCards from './accounting/FinancialSummaryCards';
import AccountingTabs from './accounting/AccountingTabs';
import LoadingSpinner from './accounting/LoadingSpinner';

const AccountingModule = () => {
  const { accountingData, loading, error } = useAccountingData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading accounting data: {error}</p>
      </div>
    );
  }

  const totalRevenue = accountingData.sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const totalExpenses = accountingData.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <AccountingHeader />
      <FinancialSummaryCards
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netIncome={netIncome}
        salesCount={accountingData.sales.length}
        expensesCount={accountingData.expenses.length}
      />
      <AccountingTabs accountingData={accountingData} />
    </div>
  );
};

export default AccountingModule;
