import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  CreditCard,
  Calendar,
  FileText,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSale } from '@/services/firebaseService';
import { useFirebase } from '@/contexts/FirebaseContext';

const SalesModule = () => {
  const [cart, setCart] = useState([]);
  const [activeService, setActiveService] = useState('printing');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useFirebase();

  const services = {
    printing: [
      { id: 1, name: 'T-Shirt Printing', price: 500, category: 'Apparel' },
      { id: 2, name: 'Business Cards', price: 1200, category: 'Stationery' },
      { id: 3, name: 'Banner Printing', price: 2500, category: 'Signage' },
      { id: 4, name: 'Sticker Printing', price: 300, category: 'Labels' }
    ],
    electronics: [
      { id: 5, name: 'HP Laptop', price: 65000, category: 'Computers', stock: 5 },
      { id: 6, name: 'Canon Printer', price: 12500, category: 'Printers', stock: 3 },
      { id: 7, name: 'Samsung Phone', price: 25000, category: 'Mobile', stock: 8 },
      { id: 8, name: 'USB Cable', price: 500, category: 'Accessories', stock: 15 }
    ],
    webservices: [
      { id: 9, name: 'Domain Registration', price: 1200, category: 'Domains' },
      { id: 10, name: 'Web Hosting', price: 2400, category: 'Hosting' },
      { id: 11, name: 'SSL Certificate', price: 3000, category: 'Security' },
      { id: 12, name: 'Email Hosting', price: 1800, category: 'Email' }
    ]
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1, id: Date.now() }]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processPayment = async (paymentMethod) => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive"
      });
      return;
    }

    if (!customerName || !customerPhone) {
      toast({
        title: "Error", 
        description: "Customer name and phone are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerName,
        customerPhone,
        customerEmail,
        items: cart,
        totalAmount: getTotalAmount(),
        paymentMethod,
        status: 'Completed',
        createdBy: currentUser?.uid,
        createdAt: new Date().toISOString()
      };

      await createSale(saleData);
      
      toast({
        title: "Success",
        description: `Payment processed successfully via ${paymentMethod}`
      });

      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const generateQuote = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive"
      });
      return;
    }

    if (!customerName) {
      toast({
        title: "Error",
        description: "Customer name is required for quote",
        variant: "destructive"
      });
      return;
    }

    // Generate quote content
    const quoteContent = `
QUOTE - ${Date.now()}
===================

Customer: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

Items:
${cart.map(item => `- ${item.name}: KSh ${item.price.toLocaleString()}`).join('\n')}

Total: KSh ${getTotalAmount().toLocaleString()}

Valid for 30 days from ${new Date().toLocaleDateString()}
    `;

    // Create and download quote
    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quote-${customerName}-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Quote generated and downloaded"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sales Terminal</h2>
        <Badge variant="outline" className="text-green-600 border-green-200">
          Terminal Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product/Service Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Products & Services
              </CardTitle>
              <div className="flex space-x-2">
                <Input placeholder="Search products..." className="flex-1" />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeService} onValueChange={setActiveService}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="printing">Printing</TabsTrigger>
                  <TabsTrigger value="electronics">Electronics</TabsTrigger>
                  <TabsTrigger value="webservices">Web Services</TabsTrigger>
                </TabsList>

                {Object.entries(services).map(([serviceKey, items]) => (
                  <TabsContent key={serviceKey} value={serviceKey} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              <p className="text-lg font-bold text-blue-600">KSh {item.price.toLocaleString()}</p>
                              {item.stock && (
                                <p className="text-xs text-gray-500">Stock: {item.stock}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(item)}
                              className="ml-2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Current Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">KSh {item.price.toLocaleString()}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-xl text-blue-600">
                        KSh {getTotalAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input 
                  placeholder="Customer Name *" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input 
                  placeholder="Phone Number *" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Input 
                  placeholder="Email (optional)" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {cart.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => processPayment('Card')}
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Process Payment'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => processPayment('Cash')}
                    disabled={loading}
                  >
                    Cash
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => processPayment('M-Pesa')}
                    disabled={loading}
                  >
                    M-Pesa
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={generateQuote}
                  disabled={loading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Quote
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
