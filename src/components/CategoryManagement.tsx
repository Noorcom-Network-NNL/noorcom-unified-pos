
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  seedInitialCategories,
  type Category 
} from '@/services/categoryService';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface CategoryFormData {
  name: string;
  value: string;
  description: string;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null
  });
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    initializeCategories();
  }, []);

  const initializeCategories = async () => {
    setLoading(true);
    try {
      await seedInitialCategories();
      await fetchCategories();
    } catch (error) {
      console.error('Error initializing categories:', error);
      toast({
        title: "Error",
        description: "Failed to initialize categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = useCallback((field: keyof CategoryFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate value from name
      if (field === 'name') {
        newData.value = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      
      return newData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      value: '',
      description: ''
    });
  }, []);

  const handleAddCategory = useCallback(async () => {
    if (!formData.name || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createCategory(formData);
      
      toast({
        title: "Success",
        description: `Category "${formData.name}" added successfully!`,
      });

      resetForm();
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, toast, resetForm]);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      value: category.value,
      description: category.description || ''
    });
    setShowEditDialog(true);
  }, []);

  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory || !formData.name || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateCategory(editingCategory.id, formData);
      
      toast({
        title: "Success",
        description: `Category "${formData.name}" updated successfully!`,
      });

      resetForm();
      setShowEditDialog(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [editingCategory, formData, toast, resetForm]);

  const handleDeleteCategory = async () => {
    if (!deleteDialog.category) return;

    setLoading(true);
    try {
      await deleteCategory(deleteDialog.category.id);
      
      toast({
        title: "Success",
        description: `Category "${deleteDialog.category.name}" deleted successfully!`,
      });

      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const CategoryForm = React.memo(({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter category name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Category Value *</Label>
        <Input
          id="value"
          value={formData.value}
          onChange={(e) => handleInputChange('value', e.target.value)}
          placeholder="category-value"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Optional description"
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button onClick={isEdit ? handleUpdateCategory : handleAddCategory} disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Category' : 'Add Category')}
        </Button>
        <Button variant="outline" onClick={() => {
          if (isEdit) {
            setShowEditDialog(false);
            setEditingCategory(null);
          } else {
            setShowAddForm(false);
          }
          resetForm();
        }}>
          Cancel
        </Button>
      </div>
    </div>
  ));

  CategoryForm.displayName = 'CategoryForm';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Category Management</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tags className="h-5 w-5 mr-2" />
              Add New Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No categories found. Add your first category above.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{category.value}</TableCell>
                    <TableCell className="text-sm text-gray-500">{category.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteDialog({ open: true, category })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Tags className="h-5 w-5 mr-2" />
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: open ? deleteDialog.category : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{deleteDialog.category?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManagement;
