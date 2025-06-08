
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { SaleItem } from './saleTypes';

interface SaleItemsListProps {
  saleItems: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const SaleItemsList: React.FC<SaleItemsListProps> = ({
  saleItems,
  onUpdateQuantity,
  onRemoveItem
}) => {
  if (saleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Sale Items</Label>
      <div className="border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
        {saleItems.map((item) => (
          <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-600">KSh {item.price.toLocaleString()} each</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <div className="w-20 text-right font-medium">
                KSh {item.total.toLocaleString()}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemoveItem(item.productId)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleItemsList;
