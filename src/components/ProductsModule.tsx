
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/productService';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFirebase } from '@/contexts/FirebaseContext';

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

const ProductsModule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });
  const { toast } = useToast();
  const { hasPermission } = useFirebase();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    unit: '',
    minStock: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      category: '',
      unit: '',
      minStock: '',
      description: ''
    });
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.quantity || !formData.category || !formData.unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        unit: formData.unit,
        minStock: formData.minStock ? parseInt(formData.minStock) : 10,
        description: formData.description,
        status: parseInt(formData.quantity) > (formData.minStock ? parseInt(formData.minStock) : 10) ? 'good' : 'low'
      };

      await createProduct(productData);
      
      toast({
        title: "Success",
        description: `Product "${formData.name}" added successfully!`,
      });

      resetForm();
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      unit: product.unit,
      minStock: product.minStock?.toString() || '10',
      description: product.description || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.quantity || !formData.category || !formData.unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        unit: formData.unit,
        minStock: formData.minStock ? parseInt(formData.minStock) : 10,
        description: formData.description,
        status: parseInt(formData.quantity) > (formData.minStock ? parseInt(formData.minStock) : 10) ? 'good' : 'low'
      };

      await updateProduct(editingProduct.id, updateData);
      
      toast({
        title: "Success",
        description: `Product "${formData.name}" updated successfully!`,
      });

      resetForm();
      setShowEditDialog(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return;

    setLoading(true);
    try {
      await deleteProduct(deleteDialog.product.id);
      
      toast({
        title: "Success",
        description: `Product "${deleteDialog.product.name}" deleted successfully!`,
      });

      setDeleteDialog({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (product: Product) => {
    const minStock = product.minStock || 10;
    if (product.quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.quantity <= minStock) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter product name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (KSh) *</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="printing">Printing Materials</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="services">Service Credits</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit *</Label>
        <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pieces">Pieces</SelectItem>
            <SelectItem value="meters">Meters</SelectItem>
            <SelectItem value="units">Units</SelectItem>
            <SelectItem value="packs">Packs</SelectItem>
            <SelectItem value="cartridges">Cartridges</SelectItem>
            <SelectItem value="credits">Credits</SelectItem>
            <SelectItem value="licenses">Licenses</SelectItem>
            <SelectItem value="GB">GB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minStock">Minimum Stock</Label>
        <Input
          id="minStock"
          type="number"
          value={formData.minStock}
          onChange={(e) => handleInputChange('minStock', e.target.value)}
          placeholder="10"
        />
      </div>

      <div className="space-y-2 md:col-span-2 lg:col-span-3">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Optional product description"
        />
      </div>

      <div className="flex space-x-2 mt-6 md:col-span-2 lg:col-span-3">
        {isEdit ? (
          <>
            <Button onClick={handleUpdateProduct} disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingProduct(null);
              resetForm();
            }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleAddProduct} disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddForm(false);
              resetForm();
            }}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        {hasPermission('admin') && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Add Product Form */}
      {showAddForm && hasPermission('admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm />
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products Inventory ({products.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  {hasPermission('admin') && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={hasPermission('admin') ? 7 : 6} className="text-center py-8 text-gray-500">
                      No products found. Add your first product above.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-500">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.quantity} {product.unit}</TableCell>
                      <TableCell className="capitalize">{product.unit}</TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      {hasPermission('admin') && (
                        <TableCell className="text-right">
                          <div className="flex space-x-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDeleteDialog({ open: true, product })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.quantity > (p.minStock || 10)).length}
              </p>
              <p className="text-sm text-gray-600">In Stock</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.quantity <= (p.minStock || 10) && p.quantity > 0).length}
              </p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity <= 0).length}
              </p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: open ? deleteDialog.product : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{deleteDialog.product?.name}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsModule;
