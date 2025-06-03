
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download } from 'lucide-react';

interface SaleData {
  id: string;
  amount: number;
  customerName: string;
  service: string;
  date: any;
  status: string;
  paymentMethod: string;
  createdAt: any;
}

interface ReportsSalesDetailsProps {
  filteredSales: SaleData[];
}

const ReportsSalesDetails: React.FC<ReportsSalesDetailsProps> = ({ filteredSales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => exportToCSV(filteredSales, 'sales_report')} variant="outline">
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
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales
                .filter(sale => 
                  (filterStatus === 'all' || sale.status === filterStatus) &&
                  (searchTerm === '' || 
                   sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   sale.service.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                )
                .slice(0, 50)
                .map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {sale.createdAt?.toDate ? 
                        sale.createdAt.toDate().toLocaleDateString() : 
                        new Date(sale.createdAt).toLocaleDateString()
                      }
                    </TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.service}</TableCell>
                    <TableCell>KSh {(Number(sale.amount) || 0).toLocaleString()}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'completed' ? 'default' : 'outline'}>
                        {sale.status}
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

export default ReportsSalesDetails;
