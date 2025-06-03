
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ShoppingCart, FileText } from 'lucide-react';

interface ReportsSummaryCardsProps {
  totalRevenue: number;
  totalCustomers: number;
  completedSales: number;
  pendingSales: number;
  totalInvoices: number;
  totalTransactions: number;
}

const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({
  totalRevenue,
  totalCustomers,
  completedSales,
  pendingSales,
  totalInvoices,
  totalTransactions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KSh {totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalTransactions} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Active customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedSales}</div>
          <p className="text-xs text-muted-foreground">
            {pendingSales} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Invoices generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSummaryCards;
