
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, TrendingUp, PieChart } from 'lucide-react';

interface AccountingReportsProps {
  accountingData: {
    sales: any[];
    expenses: any[];
    accounts: any[];
    journalEntries: any[];
  };
}

const AccountingReports = ({ accountingData }: AccountingReportsProps) => {
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAccountsReport = () => {
    const accountsData = accountingData.accounts.map(account => ({
      Code: account.accountCode,
      Name: account.accountName,
      Type: account.accountType,
      Balance: account.balance || 0,
      Status: account.isActive ? 'Active' : 'Inactive'
    }));
    exportToCSV(accountsData, 'chart_of_accounts_report');
  };

  const exportJournalReport = () => {
    const journalData = accountingData.journalEntries.flatMap(entry => 
      entry.entries?.map((line: any) => ({
        Date: new Date(entry.date).toLocaleDateString(),
        Reference: entry.reference,
        Description: entry.description,
        Account: line.accountName,
        Debit: line.debit || 0,
        Credit: line.credit || 0
      })) || []
    );
    exportToCSV(journalData, 'journal_entries_report');
  };

  const exportSalesReport = () => {
    const salesData = accountingData.sales.map(sale => ({
      Date: new Date(sale.date || sale.createdAt).toLocaleDateString(),
      Customer: sale.customerName,
      Service: sale.service || 'N/A',
      Amount: sale.amount || 0,
      Status: sale.status,
      PaymentMethod: sale.paymentMethod || 'N/A'
    }));
    exportToCSV(salesData, 'sales_report');
  };

  const exportExpensesReport = () => {
    const expensesData = accountingData.expenses.map(expense => ({
      Date: new Date(expense.date || expense.createdAt).toLocaleDateString(),
      Category: expense.category || 'Other',
      Description: expense.description || 'N/A',
      Amount: expense.amount || 0,
      PaymentMethod: expense.paymentMethod || 'N/A'
    }));
    exportToCSV(expensesData, 'expenses_report');
  };

  const getTotalRevenue = () => {
    return accountingData.sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  };

  const getTotalExpenses = () => {
    return accountingData.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  };

  const getNetIncome = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  const reports = [
    {
      title: 'Chart of Accounts',
      description: 'Complete list of all accounts with balances',
      icon: FileText,
      count: accountingData.accounts.length,
      action: exportAccountsReport,
      color: 'blue'
    },
    {
      title: 'Journal Entries',
      description: 'All journal entries with detailed transactions',
      icon: FileText,
      count: accountingData.journalEntries.length,
      action: exportJournalReport,
      color: 'green'
    },
    {
      title: 'Sales Report',
      description: 'Detailed sales transactions and revenue',
      icon: TrendingUp,
      count: accountingData.sales.length,
      action: exportSalesReport,
      color: 'purple'
    },
    {
      title: 'Expenses Report',
      description: 'All business expenses by category',
      icon: PieChart,
      count: accountingData.expenses.length,
      action: exportExpensesReport,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                KSh {getTotalRevenue().toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                KSh {getTotalExpenses().toLocaleString()}
              </div>
              <div className="text-sm text-red-700">Total Expenses</div>
            </div>
            <div className={`text-center p-4 border rounded-lg ${
              getNetIncome() >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className={`text-2xl font-bold ${
                getNetIncome() >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                KSh {Math.abs(getNetIncome()).toLocaleString()}
              </div>
              <div className={`text-sm ${
                getNetIncome() >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                Net {getNetIncome() >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <p className="text-sm text-gray-600">
            Generate and download detailed reports in CSV format
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.title}
                  className={`p-4 border rounded-lg ${getColorClasses(report.color)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold">{report.title}</h3>
                    </div>
                    <Badge variant="outline">
                      {report.count} records
                    </Badge>
                  </div>
                  <p className="text-sm mb-4 opacity-80">
                    {report.description}
                  </p>
                  <Button
                    onClick={report.action}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingReports;
