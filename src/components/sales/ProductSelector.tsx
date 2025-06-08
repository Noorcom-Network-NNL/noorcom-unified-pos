
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Product } from './saleTypes';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
  onAddProduct: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  onAddProduct
}) => {
  return (
    <div className="space-y-2">
      <Label>Add Products</Label>
      <div className="flex space-x-2">
        <Select value={selectedProductId} onValueChange={onProductSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products
              .filter(product => product.quantity > 0)
              .map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - KSh {product.price.toLocaleString()} ({product.quantity} {product.unit} available)
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddProduct} size="sm" disabled={!selectedProductId}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {products.length === 0 && (
        <p className="text-sm text-gray-500">Loading products...</p>
      )}
    </div>
  );
};

export default ProductSelector;
