
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit } from 'lucide-react';

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
  items?: { productId: string; productName: string; quantity: number; price: number }[];
}

interface ProductManagementTabProps {
  products: Product[];
  sales: Sale[];
  searchTerm: string;
  onRestock: (product: Product) => void;
  onUpdate: (product: Product) => void;
}

const ProductManagementTab = ({ products, sales, searchTerm, onRestock, onUpdate }: ProductManagementTabProps) => {
  const getProductSalesData = (productId: string) => {
    const productSales = sales.filter(sale => 
      sale.items?.some(item => item.productId === productId)
    );
    
    const totalSold = productSales.reduce((total, sale) => {
      const productItem = sale.items?.find(item => item.productId === productId);
      return total + (productItem?.quantity || 0);
    }, 0);

    return { salesCount: productSales.length, totalSold };
  };

  const filteredProducts = products.filter(product => 
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Total Sold</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const salesData = getProductSalesData(product.id);
                const totalValue = product.quantity * product.price;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>KES {product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.quantity} {product.unit}</TableCell>
                    <TableCell>{salesData.totalSold} {product.unit}</TableCell>
                    <TableCell>KES {totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onRestock(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onUpdate(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductManagementTab;
