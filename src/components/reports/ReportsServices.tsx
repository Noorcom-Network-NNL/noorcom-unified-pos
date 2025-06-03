
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface ReportsServicesProps {
  filteredSales: SaleData[];
}

const ReportsServices: React.FC<ReportsServicesProps> = ({ filteredSales }) => {
  const serviceData = filteredSales.reduce((acc, sale) => {
    acc[sale.service] = (acc[sale.service] || 0) + (Number(sale.amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  const serviceChartData = Object.entries(serviceData)
    .map(([service, revenue]) => ({ name: service, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={serviceChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ReportsServices;
