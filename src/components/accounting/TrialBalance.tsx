
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Scale } from 'lucide-react';

interface TrialBalanceProps {
  accounts: any[];
  journalEntries: any[];
}

const TrialBalance = ({ accounts, journalEntries }: TrialBalanceProps) => {
  const calculateAccountBalance = (accountId: string, accountType: string) => {
    let debitTotal = 0;
    let creditTotal = 0;

    journalEntries.forEach(entry => {
      entry.entries?.forEach((line: any) => {
        if (line.accountId === accountId) {
          debitTotal += line.debit || 0;
          creditTotal += line.credit || 0;
        }
      });
    });

    // For assets and expenses, debit increases balance
    // For liabilities, equity, and revenue, credit increases balance
    if (accountType === 'Asset' || accountType === 'Expense') {
      return { debit: debitTotal - creditTotal, credit: 0 };
    } else {
      return { debit: 0, credit: creditTotal - debitTotal };
    }
  };

  const trialBalanceData = accounts.map(account => {
    const balance = calculateAccountBalance(account.id, account.accountType);
    return {
      ...account,
      debitBalance: Math.max(balance.debit, 0),
      creditBalance: Math.max(balance.credit, 0)
    };
  }).filter(account => account.debitBalance > 0 || account.creditBalance > 0);

  const totalDebits = trialBalanceData.reduce((sum, account) => sum + account.debitBalance, 0);
  const totalCredits = trialBalanceData.reduce((sum, account) => sum + account.creditBalance, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const getAccountTypeColor = (type: string) => {
    const colors = {
      Asset: 'bg-blue-100 text-blue-800',
      Liability: 'bg-red-100 text-red-800',
      Equity: 'bg-purple-100 text-purple-800',
      Revenue: 'bg-green-100 text-green-800',
      Expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Trial Balance
          </CardTitle>
          <Badge variant={isBalanced ? "default" : "destructive"}>
            {isBalanced ? "Balanced" : "Out of Balance"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trialBalanceData.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.accountCode}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>
                  <Badge className={getAccountTypeColor(account.accountType)}>
                    {account.accountType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {account.debitBalance > 0 ? `KSh ${account.debitBalance.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {account.creditBalance > 0 ? `KSh ${account.creditBalance.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 font-bold">
              <TableCell colSpan={3}>TOTALS</TableCell>
              <TableCell className="text-right">KSh {totalDebits.toLocaleString()}</TableCell>
              <TableCell className="text-right">KSh {totalCredits.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {!isBalanced && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">Trial Balance is Out of Balance</p>
            <p className="text-red-600 text-sm">
              Difference: KSh {Math.abs(totalDebits - totalCredits).toLocaleString()}
            </p>
            <p className="text-red-600 text-sm mt-1">
              Please review your journal entries for errors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialBalance;
