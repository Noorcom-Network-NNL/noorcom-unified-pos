
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { getProducts, updateProduct, getSales } from '@/services/firebaseService';
import { FileText, Search } from 'lucide-react';

// Import new components
import InventoryAlerts from './inventory/InventoryAlerts';
import InventoryOverviewTab from './inventory/InventoryOverviewTab';
import ProductManagementTab from './inventory/ProductManagementTab';
import SalesTrackingTab from './inventory/SalesTrackingTab';
import RestockDialog from './inventory/RestockDialog';
import UpdateProductDialog from './inventory/UpdateProductDialog';
import InventoryStats from './inventory/InventoryStats';

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

  const handleRestock = async (quantity: number) => {
    if (!restockDialog.product) return;

    try {
      const newQuantity = restockDialog.product.quantity + quantity;
      await updateProduct(restockDialog.product.id, { quantity: newQuantity });
      
      toast({
        title: "Success",
        description: `${restockDialog.product.name} restocked successfully! Added ${quantity} ${restockDialog.product.unit}`,
      });

      setRestockDialog({ open: false, product: null });
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

  const handleUpdateProduct = async (updateData: any) => {
    if (!updateDialog.product) return;

    try {
      await updateProduct(updateDialog.product.id, updateData);
      
      toast({
        title: "Success",
        description: `${updateDialog.product.name} updated successfully!`,
      });

      setUpdateDialog({ open: false, product: null });
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

  const lowStockItems = products.filter(item => item.status === 'low' || item.status === 'critical');

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

      <InventoryAlerts 
        lowStockItems={lowStockItems}
        onRestock={(product) => setRestockDialog({ open: true, product })}
      />

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
          <InventoryOverviewTab
            products={products}
            searchTerm={searchTerm}
            onRestock={(product) => setRestockDialog({ open: true, product })}
            onUpdate={(product) => setUpdateDialog({ open: true, product })}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagementTab
            products={products}
            sales={sales}
            searchTerm={searchTerm}
            onRestock={(product) => setRestockDialog({ open: true, product })}
            onUpdate={(product) => setUpdateDialog({ open: true, product })}
          />
        </TabsContent>

        <TabsContent value="sales">
          <SalesTrackingTab sales={sales} />
        </TabsContent>
      </Tabs>

      <InventoryStats 
        products={products}
        sales={sales}
        lowStockItems={lowStockItems}
      />

      <RestockDialog
        open={restockDialog.open}
        product={restockDialog.product}
        onClose={() => setRestockDialog({ open: false, product: null })}
        onRestock={handleRestock}
      />

      <UpdateProductDialog
        open={updateDialog.open}
        product={updateDialog.product}
        onClose={() => setUpdateDialog({ open: false, product: null })}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
};

export default InventoryModule;
