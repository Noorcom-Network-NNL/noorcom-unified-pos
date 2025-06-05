
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { getProducts, updateProduct } from '@/services/firebaseService';
import { 
  FileText, 
  Search, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Package,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

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

const InventoryModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });
  const [restockQuantity, setRestockQuantity] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsData = await getProducts();
      const typedProducts: Product[] = productsData.map((product: any) => ({
        id: product.id,
        name: product.name || '',
        price: product.price || 0,
        quantity: product.quantity || 0,
        category: product.category || 'general',
        unit: product.unit || 'pieces',
        minStock: product.minStock || 10,
        description: product.description,
        status: product.quantity <= 0 ? 'critical' : product.quantity <= (product.minStock || 10) ? 'low' : 'good'
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!restockDialog.product || !restockQuantity) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    try {
      const newQuantity = restockDialog.product.quantity + parseInt(restockQuantity);
      await updateProduct(restockDialog.product.id, { quantity: newQuantity });
      
      toast({
        title: "Success",
        description: `${restockDialog.product.name} restocked successfully!`,
      });

      setRestockDialog({ open: false, product: null });
      setRestockQuantity('');
      fetchProducts();
    } catch (error) {
      console.error('Error restocking product:', error);
      toast({
        title: "Error",
        description: "Failed to restock product",
        variant: "destructive"
      });
    }
  };

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

  const lowStockItems = products.filter(item => item.status === 'low' || item.status === 'critical');

  const categorizedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const filteredProducts = (categoryProducts: Product[]) => {
    return categoryProducts.filter(item => 
      searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <Button onClick={fetchProducts}>
          <FileText className="h-4 w-4 mr-2" />
          Refresh Inventory
        </Button>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
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
                    onClick={() => setRestockDialog({ open: true, product: item })}
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input 
                placeholder="Search inventory items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Tabs */}
      <Tabs defaultValue={Object.keys(categorizedProducts)[0] || 'all'}>
        <TabsList className="grid w-full grid-cols-3">
          {Object.keys(categorizedProducts).slice(0, 3).map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categorizedProducts).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category.replace('_', ' ')} Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Item</th>
                        <th className="text-left py-3 px-4">Quantity</th>
                        <th className="text-left py-3 px-4">Min Stock</th>
                        <th className="text-left py-3 px-4">Unit Price</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts(items).map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(item.status)}
                              <span className="ml-2 font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-4">
                            {item.minStock || 10} {item.unit}
                          </td>
                          <td className="py-3 px-4">
                            KSh {item.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setRestockDialog({ open: true, product: item })}
                              >
                                Restock
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts(items).length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No items found in this category</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                KSh {products
                  .reduce((total, item) => total + (item.quantity * item.price), 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restock Dialog */}
      <Dialog 
        open={restockDialog.open} 
        onOpenChange={(open) => setRestockDialog({ open, product: open ? restockDialog.product : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          {restockDialog.product && (
            <div className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input value={restockDialog.product.name} disabled />
              </div>
              <div>
                <Label>Current Stock</Label>
                <Input value={`${restockDialog.product.quantity} ${restockDialog.product.unit}`} disabled />
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
                    value={`${restockDialog.product.quantity + parseInt(restockQuantity || '0')} ${restockDialog.product.unit}`} 
                    disabled 
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={handleRestock}>
                  <Plus className="h-4 w-4 mr-2" />
                  Restock
                </Button>
                <Button variant="outline" onClick={() => setRestockDialog({ open: false, product: null })}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryModule;
