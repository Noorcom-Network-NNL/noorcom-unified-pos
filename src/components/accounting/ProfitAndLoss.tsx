
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProfitAndLossProps {
  sales: any[];
  expenses: any[];
  accounts: any[];
}

const ProfitAndLoss = ({ sales, expenses, accounts }: ProfitAndLossProps) => {
  const [period, setPeriod] = useState('all');

  const filterByPeriod = (data: any[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return data.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      switch (period) {
        case 'month':
          return itemDate >= startOfMonth;
        case 'year':
          return itemDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  const filteredSales = filterByPeriod(sales);
  const filteredExpenses = filterByPeriod(expenses);

  // Calculate revenue
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);

  // Calculate expenses by category
  const expenseCategories = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other Expenses';
    acc[category] = (acc[category] || 0) + (Number(expense.amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(expenseCategories).reduce((sum: number, amount: number) => sum + amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  const getPeriodLabel = () => {
    switch (period) {
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'All Time';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Profit & Loss Statement
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-600">Period: {getPeriodLabel()}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-700">REVENUE</h3>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span>Sales Revenue</span>
            <span className="font-semibold">KSh {totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg font-bold">
            <span>Total Revenue</span>
            <span>KSh {totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-700">EXPENSES</h3>
          {Object.entries(expenseCategories).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span>{category}</span>
              <span className="font-semibold">KSh {amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg font-bold">
            <span>Total Expenses</span>
            <span>KSh {totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Net Income Section */}
        <div className="border-t-2 pt-4">
          <div className={`flex justify-between items-center p-4 rounded-lg font-bold text-lg ${
            netIncome >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              {netIncome >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-2" />
              )}
              <span>NET {netIncome >= 0 ? 'PROFIT' : 'LOSS'}</span>
            </div>
            <span>KSh {Math.abs(netIncome).toLocaleString()}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {profitMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Profit Margin</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredSales.length}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitAndLoss;
