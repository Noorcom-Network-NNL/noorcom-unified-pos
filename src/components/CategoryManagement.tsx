
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  seedInitialCategories,
  type Category 
} from '@/services/categoryService';
import { Plus, Tags } from 'lucide-react';
import CategoryForm, { type CategoryFormData } from './category/CategoryForm';
import CategoryTable from './category/CategoryTable';
import CategoryDialogs from './category/CategoryDialogs';

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

  const handleCancelAdd = () => {
    setShowAddForm(false);
    resetForm();
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingCategory(null);
    resetForm();
  };

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
            <CategoryForm 
              formData={formData}
              loading={loading}
              onInputChange={handleInputChange}
              onSubmit={handleAddCategory}
              onCancel={handleCancelAdd}
            />
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTable 
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={(category) => setDeleteDialog({ open: true, category })}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryDialogs 
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        formData={formData}
        loading={loading}
        onInputChange={handleInputChange}
        onUpdateCategory={handleUpdateCategory}
        onCancelEdit={handleCancelEdit}
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default CategoryManagement;
