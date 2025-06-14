
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Receipt, PieChart } from 'lucide-react';

interface FinancialSummaryCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  salesCount: number;
  expensesCount: number;
}

const FinancialSummaryCards = ({ 
  totalRevenue, 
  totalExpenses, 
  netIncome, 
  salesCount, 
  expensesCount 
}: FinancialSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KSh {totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            From {salesCount} sales
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
            KSh {totalExpenses.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            From {expensesCount} expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            KSh {netIncome.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue - Expenses
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;
