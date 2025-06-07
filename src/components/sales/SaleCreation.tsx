import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { getProducts, createSale } from '@/services/firebaseService';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Individual' | 'Business';
  totalOrders: number;
  totalSpent: number;
  services: string[];
  createdBy: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  unit: string;
  status: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

interface SaleCreationProps {
  selectedCustomer: Customer | null;
  onSaleCreated?: () => void;
}

const SaleCreation: React.FC<SaleCreationProps> = ({ selectedCustomer, onSaleCreated }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const productsData = await getProducts();
      console.log('Products from Firebase:', productsData);
      
      if (productsData && productsData.length > 0) {
        setProducts(productsData as Product[]);
      } else {
        // Fallback to sample products if none in Firebase
        console.log('No products in Firebase, using sample data');
        const sampleProducts = [
          { id: '1', name: 'Vinyl Rolls', price: 150, quantity: 45, category: 'printing', unit: 'meters', status: 'good' },
          { id: '2', name: 'Printing Ink (Black)', price: 2500, quantity: 8, category: 'printing', unit: 'cartridges', status: 'low' },
          { id: '3', name: 'T-Shirts (Plain)', price: 300, quantity: 120, category: 'printing', unit: 'pieces', status: 'good' },
          { id: '4', name: 'Business Card Stock', price: 800, quantity: 5, category: 'printing', unit: 'packs', status: 'critical' },
          { id: '5', name: 'HP Laptops', price: 65000, quantity: 5, category: 'electronics', unit: 'units', status: 'good' },
          { id: '6', name: 'Canon Printers', price: 12500, quantity: 3, category: 'electronics', unit: 'units', status: 'good' },
          { id: '7', name: 'USB Cables', price: 500, quantity: 2, category: 'electronics', unit: 'pieces', status: 'low' },
          { id: '8', name: 'Phone Cases', price: 800, quantity: 25, category: 'electronics', unit: 'pieces', status: 'good' },
          { id: '9', name: 'Domain Registration', price: 1560, quantity: 1001, category: 'web-services', unit: 'licenses', status: 'good' }
        ];
        setProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const addProductToSale = () => {
    console.log('Adding product to sale, selectedProductId:', selectedProductId);
    console.log('Available products:', products);
    
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    console.log('Found product:', product);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }

    const existingItem = saleItems.find(item => item.productId === selectedProductId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast({
          title: "Error",
          description: "Insufficient stock",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Updating existing item quantity');
      setSaleItems(items => 
        items.map(item => 
          item.productId === selectedProductId 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      console.log('Adding new item to sale');
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      };
      setSaleItems(items => [...items, newItem]);
    }
    
    setSelectedProductId('');
    console.log('Product added successfully');
    
    toast({
      title: "Success",
      description: `${product.name} added to sale`,
    });
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSaleItems(items => items.filter(item => item.productId !== productId));
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.quantity) {
      toast({
        title: "Error",
        description: "Insufficient stock",
        variant: "destructive"
      });
      return;
    }

    setSaleItems(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setSaleItems(items => items.filter(item => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.total, 0);
  };

  const handleCreateSale = async () => {
    console.log('Creating sale...');
    console.log('Selected customer:', selectedCustomer);
    console.log('Sale items:', saleItems);
    
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer first.",
        variant: "destructive"
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the sale.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items: saleItems,
        totalAmount: getTotalAmount(),
        paymentMethod,
        status: 'completed',
        date: new Date().toISOString(),
        createdBy: 'current-user'
      };

      console.log('Sale data to create:', saleData);
      await createSale(saleData);
      
      toast({
        title: "Success",
        description: `Sale created for ${selectedCustomer.name}! Total: KSh ${getTotalAmount().toLocaleString()}`,
      });

      // Reset form
      setSaleItems([]);
      setPaymentMethod('cash');
      
      // Notify parent component
      if (onSaleCreated) {
        onSaleCreated();
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Error",
        description: "Failed to create sale",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering SaleCreation component');
  console.log('Products available:', products.length);
  console.log('Selected customer:', selectedCustomer?.name);
  console.log('Current sale items:', saleItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Create Sale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedCustomer ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium">{selectedCustomer.name}</p>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Add Products</Label>
                <div className="flex space-x-2">
                  <Select value={selectedProductId} onValueChange={(value) => {
                    console.log('Product selected:', value);
                    setSelectedProductId(value);
                  }}>
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
                  <Button onClick={addProductToSale} size="sm" disabled={!selectedProductId}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {products.length === 0 && (
                  <p className="text-sm text-gray-500">No products available</p>
                )}
              </div>

              {/* Sale Items */}
              {saleItems.length > 0 && (
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
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <div className="w-20 text-right font-medium">
                            KSh {item.total.toLocaleString()}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.productId)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              {saleItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>KSh {getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreateSale} 
                className="w-full" 
                disabled={loading || saleItems.length === 0}
              >
                {loading ? 'Creating Sale...' : `Create Sale (KSh ${getTotalAmount().toLocaleString()})`}
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Please select a customer to create a sale
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleCreation;
