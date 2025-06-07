
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Sale {
  id: string;
  customerName: string;
  items?: { productId: string; productName: string; quantity: number; price: number }[];
  amount: number;
  date: string;
  status: string;
}

interface SalesTrackingTabProps {
  sales: Sale[];
}

const SalesTrackingTab = ({ sales }: SalesTrackingTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales & Product Movement</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products Sold</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.slice(0, 20).map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>
                    {sale.items?.map(item => (
                      <div key={item.productId} className="text-sm">
                        {item.productName} ({item.quantity})
                      </div>
                    )) || 'N/A'}
                  </TableCell>
                  <TableCell>KSh {sale.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SalesTrackingTab;
