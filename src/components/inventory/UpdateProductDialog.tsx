
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  minStock?: number;
  description?: string;
}

interface UpdateProductDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onUpdate: (updateData: any) => void;
}

const UpdateProductDialog = ({ open, product, onClose, onUpdate }: UpdateProductDialogProps) => {
  const [updateData, setUpdateData] = useState({
    price: '',
    minStock: '',
    description: ''
  });

  useEffect(() => {
    if (product) {
      setUpdateData({
        price: product.price.toString(),
        minStock: (product.minStock || 10).toString(),
        description: product.description || ''
      });
    }
  }, [product]);

  const handleUpdate = () => {
    const updates: any = {};
    if (updateData.price) updates.price = parseFloat(updateData.price);
    if (updateData.minStock) updates.minStock = parseInt(updateData.minStock);
    if (updateData.description) updates.description = updateData.description;

    onUpdate(updates);
    handleClose();
  };

  const handleClose = () => {
    setUpdateData({ price: '', minStock: '', description: '' });
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Product Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={product.name} disabled />
          </div>
          <div>
            <Label>Unit Price (KSh)</Label>
            <Input
              type="number"
              placeholder="Enter new price"
              value={updateData.price}
              onChange={(e) => setUpdateData(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>
          <div>
            <Label>Minimum Stock Level</Label>
            <Input
              type="number"
              placeholder="Enter minimum stock level"
              value={updateData.minStock}
              onChange={(e) => setUpdateData(prev => ({ ...prev, minStock: e.target.value }))}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              placeholder="Enter product description"
              value={updateData.description}
              onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleUpdate}>
              <Edit className="h-4 w-4 mr-2" />
              Update Product
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

export default UpdateProductDialog;
