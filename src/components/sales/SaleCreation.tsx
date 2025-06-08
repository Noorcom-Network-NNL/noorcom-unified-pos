
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { getProducts, createSale } from '@/services/firebaseService';
import { ShoppingCart } from 'lucide-react';
import { Customer, Product, SaleItem } from './saleTypes';
import ProductSelector from './ProductSelector';
import SaleItemsList from './SaleItemsList';
import SaleSummary from './SaleSummary';

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
      
      setSaleItems(items => 
        items.map(item => 
          item.productId === selectedProductId 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
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

      await createSale(saleData);
      
      toast({
        title: "Success",
        description: `Sale created for ${selectedCustomer.name}! Total: KSh ${getTotalAmount().toLocaleString()}`,
      });

      setSaleItems([]);
      setPaymentMethod('cash');
      setSelectedProductId('');
      
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

              <ProductSelector
                products={products}
                selectedProductId={selectedProductId}
                onProductSelect={setSelectedProductId}
                onAddProduct={addProductToSale}
              />

              <SaleItemsList
                saleItems={saleItems}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItem}
              />

              <SaleSummary
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                totalAmount={getTotalAmount()}
                onCreateSale={handleCreateSale}
                loading={loading}
                hasItems={saleItems.length > 0}
              />
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
