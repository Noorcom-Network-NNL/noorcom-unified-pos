
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  unit: string;
  status: string;
  minStock?: number;
  description?: string;
}

interface Sale {
  id: string;
}

interface InventoryStatsProps {
  products: Product[];
  sales: Sale[];
  lowStockItems: Product[];
}

const InventoryStats = ({ products, sales, lowStockItems }: InventoryStatsProps) => {
  const inventoryValue = products.reduce((total, item) => total + (item.quantity * item.price), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {products.length}
            </p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {lowStockItems.length}
            </p>
            <p className="text-sm text-gray-600">Low Stock Alerts</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              KSh {inventoryValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Inventory Value</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {sales.length}
            </p>
            <p className="text-sm text-gray-600">Total Sales</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStats;
