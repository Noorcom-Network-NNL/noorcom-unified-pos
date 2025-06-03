
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface InvoiceData {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  dueDate: any;
  createdAt: any;
}

interface ReportsInvoicesProps {
  filteredInvoices: InvoiceData[];
}

const ReportsInvoices: React.FC<ReportsInvoicesProps> = ({ filteredInvoices }) => {
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invoice Management</h3>
        <Button onClick={() => exportToCSV(filteredInvoices, 'invoices_report')} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.slice(0, 50).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {invoice.createdAt?.toDate ? 
                      invoice.createdAt.toDate().toLocaleDateString() : 
                      new Date(invoice.createdAt).toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>KSh {(Number(invoice.totalAmount) || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {invoice.dueDate?.toDate ? 
                      invoice.dueDate.toDate().toLocaleDateString() : 
                      new Date(invoice.dueDate).toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsInvoices;
