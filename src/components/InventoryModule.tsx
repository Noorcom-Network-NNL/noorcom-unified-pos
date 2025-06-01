
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Search, 
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';

const InventoryModule = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const inventory = {
    printing: [
      { id: 1, name: 'Vinyl Rolls', quantity: 45, minStock: 10, unit: 'meters', price: 150, status: 'good' },
      { id: 2, name: 'Printing Ink (Black)', quantity: 8, minStock: 15, unit: 'cartridges', price: 2500, status: 'low' },
      { id: 3, name: 'T-Shirts (Plain)', quantity: 120, minStock: 50, unit: 'pieces', price: 300, status: 'good' },
      { id: 4, name: 'Business Card Stock', quantity: 5, minStock: 20, unit: 'packs', price: 800, status: 'critical' }
    ],
    electronics: [
      { id: 5, name: 'HP Laptops', quantity: 5, minStock: 3, unit: 'units', price: 65000, status: 'good' },
      { id: 6, name: 'Canon Printers', quantity: 3, minStock: 2, unit: 'units', price: 12500, status: 'good' },
      { id: 7, name: 'USB Cables', quantity: 2, minStock: 10, unit: 'pieces', price: 500, status: 'low' },
      { id: 8, name: 'Phone Cases', quantity: 25, minStock: 15, unit: 'pieces', price: 800, status: 'good' }
    ],
    services: [
      { id: 9, name: 'Domain Credits', quantity: 50, minStock: 20, unit: 'credits', price: 1200, status: 'good' },
      { id: 10, name: 'SSL Certificates', quantity: 8, minStock: 5, unit: 'licenses', price: 3000, status: 'good' },
      { id: 11, name: 'Hosting Space', quantity: 100, minStock: 30, unit: 'GB', price: 50, status: 'good' }
    ]
  };

  const getStatusBadge = (status) => {
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

  const getStatusIcon = (status) => {
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

  const lowStockItems = Object.values(inventory)
    .flat()
    .filter(item => item.status === 'low' || item.status === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Add New Item
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
                  <Button size="sm" variant="outline">
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
            <Input 
              placeholder="Search inventory items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Tabs */}
      <Tabs defaultValue="printing">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="printing">Printing Materials</TabsTrigger>
          <TabsTrigger value="electronics">Electronics</TabsTrigger>
          <TabsTrigger value="services">Service Credits</TabsTrigger>
        </TabsList>

        {Object.entries(inventory).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Inventory</CardTitle>
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
                      {items
                        .filter(item => 
                          searchTerm === '' || 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => (
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
                              {item.minStock} {item.unit}
                            </td>
                            <td className="py-3 px-4">
                              KSh {item.price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  Restock
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
                {Object.values(inventory).flat().length}
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
                KSh {Object.values(inventory)
                  .flat()
                  .reduce((total, item) => total + (item.quantity * item.price), 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryModule;
