
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
}

interface InventoryAlertsProps {
  lowStockItems: Product[];
  onRestock: (product: Product) => void;
}

const InventoryAlerts = ({ lowStockItems, onRestock }: InventoryAlertsProps) => {
  if (lowStockItems.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Stock Alerts ({lowStockItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} remaining
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRestock(item)}
              >
                Restock
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts;
