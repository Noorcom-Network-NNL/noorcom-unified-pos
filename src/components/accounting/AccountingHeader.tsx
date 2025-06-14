
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

const AccountingHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Accounting</h2>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Calculator className="h-4 w-4 mr-1" />
          Real-time Data
        </Badge>
      </div>
    </div>
  );
};

export default AccountingHeader;
