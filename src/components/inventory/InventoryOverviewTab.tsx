
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { CheckCircle, AlertCircle, Plus, Edit } from 'lucide-react';

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

interface InventoryOverviewTabProps {
  products: Product[];
  searchTerm: string;
  onRestock: (product: Product) => void;
  onUpdate: (product: Product) => void;
}

const InventoryOverviewTab = ({ products, searchTerm, onRestock, onUpdate }: InventoryOverviewTabProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'low':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredProducts = products.filter(product => 
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(product.status)}
                      <span className="ml-2 font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>{product.quantity} {product.unit}</TableCell>
                  <TableCell>{product.minStock || 10} {product.unit}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryOverviewTab;
