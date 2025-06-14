
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface BalanceSheetProps {
  accounts: any[];
  journalEntries: any[];
}

const BalanceSheet = ({ accounts, journalEntries }: BalanceSheetProps) => {
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

    // For assets, debit increases balance
    // For liabilities and equity, credit increases balance
    if (accountType === 'Asset') {
      return Math.max(debitTotal - creditTotal, 0);
    } else {
      return Math.max(creditTotal - debitTotal, 0);
    }
  };

  const getAccountsByType = (type: string) => {
    return accounts
      .filter(account => account.accountType === type)
      .map(account => ({
        ...account,
        balance: calculateAccountBalance(account.id, account.accountType)
      }))
      .filter(account => account.balance > 0);
  };

  const assets = getAccountsByType('Asset');
  const liabilities = getAccountsByType('Liability');
  const equity = getAccountsByType('Equity');

  const totalAssets = assets.reduce((sum, account) => sum + account.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, account) => sum + account.balance, 0);
  const totalEquity = equity.reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Balance Sheet
        </CardTitle>
        <p className="text-sm text-gray-600">
          As of {new Date().toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assets Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-700 border-b-2 border-blue-200 pb-2">
            ASSETS
          </h3>
          {assets.length > 0 ? (
            assets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center p-2">
                <span>{asset.accountName}</span>
                <span className="font-medium">KSh {asset.balance.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No asset accounts with balances</p>
          )}
          <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg font-bold border-t">
            <span>TOTAL ASSETS</span>
            <span>KSh {totalAssets.toLocaleString()}</span>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-700 border-b-2 border-red-200 pb-2">
            LIABILITIES
          </h3>
          {liabilities.length > 0 ? (
            liabilities.map(liability => (
              <div key={liability.id} className="flex justify-between items-center p-2">
                <span>{liability.accountName}</span>
                <span className="font-medium">KSh {liability.balance.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No liability accounts with balances</p>
          )}
          <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg font-bold border-t">
            <span>TOTAL LIABILITIES</span>
            <span>KSh {totalLiabilities.toLocaleString()}</span>
          </div>
        </div>

        {/* Equity Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-700 border-b-2 border-purple-200 pb-2">
            EQUITY
          </h3>
          {equity.length > 0 ? (
            equity.map(equityAccount => (
              <div key={equityAccount.id} className="flex justify-between items-center p-2">
                <span>{equityAccount.accountName}</span>
                <span className="font-medium">KSh {equityAccount.balance.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No equity accounts with balances</p>
          )}
          <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg font-bold border-t">
            <span>TOTAL EQUITY</span>
            <span>KSh {totalEquity.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Liabilities + Equity */}
        <div className="border-t-2 pt-4">
          <div className={`flex justify-between items-center p-4 rounded-lg font-bold text-lg ${
            isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span>TOTAL LIABILITIES + EQUITY</span>
            <span>KSh {totalLiabilitiesAndEquity.toLocaleString()}</span>
          </div>
        </div>

        {/* Balance Check */}
        <div className={`p-4 rounded-lg ${
          isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Balance Check:</span>
            <span className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
            </span>
          </div>
          <div className="text-sm mt-2">
            <div>Total Assets: KSh {totalAssets.toLocaleString()}</div>
            <div>Total Liabilities + Equity: KSh {totalLiabilitiesAndEquity.toLocaleString()}</div>
            {!isBalanced && (
              <div className="text-red-600 font-semibold">
                Difference: KSh {Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSheet;
