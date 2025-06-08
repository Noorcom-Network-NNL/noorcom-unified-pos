import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { getProducts, createSale } from '@/services/firebaseService';
import { ShoppingCart } from 'lucide-react';
import { Customer, Product, SaleItem } from './saleTypes';
import ProductSelector from './ProductSelector';
import SaleItemsList from './SaleItemsList';
import SaleSummary from './SaleSummary';
import ReceiptTemplate from './ReceiptTemplate';
import { useReceiptPrint } from '@/hooks/useReceiptPrint';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SaleCreationProps {
  selectedCustomer: Customer | null;
  onSaleCreated?: () => void;
}

const SaleCreation: React.FC<SaleCreationProps> = ({ selectedCustomer, onSaleCreated }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const { componentRef, handlePrint } = useReceiptPrint();

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
          { id: '1', name: 'A4 Printing Paper', price: 900, quantity: 51, category: 'printing', unit: 'reams', status: 'good' },
          { id: '2', name: 'Printing Ink (Black)', price: 2500, quantity: 8, category: 'printing', unit: 'cartridges', status: 'low' },
          { id: '3', name: 'T-Shirts (Plain)', price: 300, quantity: 120, category: 'printing', unit: 'pieces', status: 'good' },
          { id: '4', name: 'Business Card Stock', price: 800, quantity: 5, category: 'printing', unit: 'packs', status: 'critical' },
          { id: '5', name: 'HP Laptops', price: 65000, quantity: 5, category: 'electronics', unit: 'units', status: 'good' },
          { id: '6', name: 'Canon Printers', price: 12500, quantity: 3, category: 'electronics', unit: 'units', status: 'good' },
          { id: '7', name: 'USB Cables', price: 500, quantity: 2, category: 'electronics', unit: 'pieces', status: 'low' },
          { id: '8', name: 'Phone Cases', price: 800, quantity: 25, category: 'electronics', unit: 'pieces', status: 'good' },
          { id: '9', name: 'Domain Registration', price: 1560, quantity: 100, category: 'web-services', unit: 'licenses', status: 'good' }
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

  const addProductToSale = (productId: string, requestedQuantity: number) => {
    console.log('Adding product to sale:', productId, 'quantity:', requestedQuantity);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }

    const existingItem = saleItems.find(item => item.productId === productId);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentQuantityInCart + requestedQuantity;

    if (totalRequestedQuantity > product.quantity) {
      toast({
        title: "Error",
        description: `Insufficient stock. Available: ${product.quantity}, Requested: ${totalRequestedQuantity}`,
        variant: "destructive"
      });
      return;
    }
    
    if (existingItem) {
      setSaleItems(items => 
        items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: totalRequestedQuantity, total: totalRequestedQuantity * item.price }
            : item
        )
      );
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: requestedQuantity,
        total: product.price * requestedQuantity
      };
      setSaleItems(items => [...items, newItem]);
    }
    
    toast({
      title: "Success",
      description: `${requestedQuantity} x ${product.name} added to sale`,
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

      const createdSale = await createSale(saleData);
      
      toast({
        title: "Success",
        description: `Sale created for ${selectedCustomer.name}! Total: KSh ${getTotalAmount().toLocaleString()}`,
      });

      // Prepare receipt data
      setLastSaleData({
        ...saleData,
        saleId: createdSale?.id || 'SALE-' + Date.now()
      });

      setSaleItems([]);
      setPaymentMethod('cash');
      
      // Show receipt dialog
      setShowReceipt(true);
      
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Create Sale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {selectedCustomer ? (
              <>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Customer:</p>
                  <p className="font-medium text-lg">{selectedCustomer.name}</p>
                </div>

                <ProductSelector
                  products={products}
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
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select a customer to create a sale</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {lastSaleData && (
              <ReceiptTemplate
                ref={componentRef}
                saleData={lastSaleData}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                Print Receipt
              </Button>
              <Button variant="outline" onClick={() => setShowReceipt(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaleCreation;
