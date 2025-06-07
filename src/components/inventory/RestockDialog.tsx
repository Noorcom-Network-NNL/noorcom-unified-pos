
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface RestockDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onRestock: (quantity: number) => void;
}

const RestockDialog = ({ open, product, onClose, onRestock }: RestockDialogProps) => {
  const [restockQuantity, setRestockQuantity] = useState('');

  const handleRestock = () => {
    if (restockQuantity) {
      onRestock(parseInt(restockQuantity));
      setRestockQuantity('');
    }
  };

  const handleClose = () => {
    setRestockQuantity('');
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={product.name} disabled />
          </div>
          <div>
            <Label>Current Stock</Label>
            <Input value={`${product.quantity} ${product.unit}`} disabled />
          </div>
          <div>
            <Label>Add Quantity</Label>
            <Input
              type="number"
              placeholder="Enter quantity to add"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
            />
          </div>
          {restockQuantity && (
            <div>
              <Label>New Total</Label>
              <Input 
                value={`${product.quantity + parseInt(restockQuantity || '0')} ${product.unit}`} 
                disabled 
              />
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={handleRestock}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestockDialog;
