
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Product } from './saleTypes';

interface ProductSelectorProps {
  products: Product[];
  onAddProduct: (productId: string, quantity: number) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onAddProduct
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddProduct = () => {
    if (selectedProductId && quantity > 0) {
      onAddProduct(selectedProductId, quantity);
      setSelectedProductId('');
      setQuantity(1);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Add Products</Label>
      
      <div className="space-y-3">
        <div>
          <Label className="text-sm">Select Product</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {products
                .filter(product => product.quantity > 0)
                .map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - KSh {product.price.toLocaleString()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Selected: <span className="font-medium">{selectedProduct.name}</span></p>
            <p className="text-sm text-gray-600">Price: <span className="font-medium">KSh {selectedProduct.price.toLocaleString()}</span></p>
          </div>
        )}

        <div>
          <Label className="text-sm">Quantity</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleAddProduct} 
          className="w-full" 
          disabled={!selectedProductId || quantity <= 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Sale
        </Button>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-gray-500">Loading products...</p>
      )}
    </div>
  );
};

export default ProductSelector;
