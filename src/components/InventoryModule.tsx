
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { getProducts, updateProduct, getSales } from '@/services/firebaseService';
import { 
  FileText, 
  Search, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Package,
  Plus,
  Edit,
  TrendingDown,
  ShoppingCart,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  customerName: string;
  items?: { productId: string; productName: string; quantity: number; price: number }[];
  amount: number;
  date: string;
  status: string;
}

const InventoryModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });
  const [updateDialog, setUpdateDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });
  const [restockQuantity, setRestockQuantity] = useState('');
  const [updateData, setUpdateData] = useState({
    price: '',
    minStock: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchSales();
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

  const fetchSales = async () => {
    try {
      const salesData = await getSales();
      setSales(salesData as Sale[]);
    } catch (error) {
      console.error('Error fetching sales:', error);
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
        description: `${restockDialog.product.name} restocked successfully! Added ${restockQuantity} ${restockDialog.product.unit}`,
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

  const handleUpdateProduct = async () => {
    if (!updateDialog.product) return;

    try {
      const updates: any = {};
      if (updateData.price) updates.price = parseFloat(updateData.price);
      if (updateData.minStock) updates.minStock = parseInt(updateData.minStock);
      if (updateData.description) updates.description = updateData.description;

      await updateProduct(updateDialog.product.id, updates);
      
      toast({
        title: "Success",
        description: `${updateDialog.product.name} updated successfully!`,
      });

      setUpdateDialog({ open: false, product: null });
      setUpdateData({ price: '', minStock: '', description: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
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

      {/* Inventory Management Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory Overview</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="sales">Sales Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
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
                    {products.filter(product => 
                      searchTerm === '' || 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((product) => (
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
                              onClick={() => setRestockDialog({ open: true, product })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setUpdateDialog({ open: true, product });
                                setUpdateData({
                                  price: product.price.toString(),
                                  minStock: (product.minStock || 10).toString(),
                                  description: product.description || ''
                                });
                              }}
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
        </TabsContent>

        <TabsContent value="products">
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
                    {products.filter(product => 
                      searchTerm === '' || 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((product) => {
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
                          <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.quantity} {product.unit}</TableCell>
                          <TableCell>{salesData.totalSold} {product.unit}</TableCell>
                          <TableCell>KSh {totalValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setRestockDialog({ open: true, product })}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setUpdateDialog({ open: true, product });
                                  setUpdateData({
                                    price: product.price.toString(),
                                    minStock: (product.minStock || 10).toString(),
                                    description: product.description || ''
                                  });
                                }}
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
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales & Product Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products Sold</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.slice(0, 20).map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>
                          {sale.items?.map(item => (
                            <div key={item.productId} className="text-sm">
                              {item.productName} ({item.quantity})
                            </div>
                          )) || 'N/A'}
                        </TableCell>
                        <TableCell>KSh {sale.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
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
                KSh {products
                  .reduce((total, item) => total + (item.quantity * item.price), 0)
                  .toLocaleString()}
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

      {/* Restock Dialog */}
      <Dialog 
        open={restockDialog.open} 
        onOpenChange={(open) => setRestockDialog({ open, product: open ? restockDialog.product : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Stock</DialogTitle>
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
                  Add Stock
                </Button>
                <Button variant="outline" onClick={() => setRestockDialog({ open: false, product: null })}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Product Dialog */}
      <Dialog 
        open={updateDialog.open} 
        onOpenChange={(open) => setUpdateDialog({ open, product: open ? updateDialog.product : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Product Information</DialogTitle>
          </DialogHeader>
          {updateDialog.product && (
            <div className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input value={updateDialog.product.name} disabled />
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
                <Button onClick={handleUpdateProduct}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Product
                </Button>
                <Button variant="outline" onClick={() => setUpdateDialog({ open: false, product: null })}>
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
