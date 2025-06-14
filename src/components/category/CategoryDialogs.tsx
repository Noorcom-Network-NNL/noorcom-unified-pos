
import React from 'react';
import { Tags } from 'lucide-react';
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
import CategoryForm, { type CategoryFormData } from './CategoryForm';
import { type Category } from '@/services/categoryService';

interface CategoryDialogsProps {
  // Edit dialog props
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  formData: CategoryFormData;
  loading: boolean;
  onInputChange: (field: keyof CategoryFormData, value: string) => void;
  onUpdateCategory: () => void;
  onCancelEdit: () => void;
  
  // Delete dialog props
  deleteDialog: { open: boolean; category: Category | null };
  setDeleteDialog: (dialog: { open: boolean; category: Category | null }) => void;
  onDeleteCategory: () => void;
}

const CategoryDialogs: React.FC<CategoryDialogsProps> = ({
  showEditDialog,
  setShowEditDialog,
  formData,
  loading,
  onInputChange,
  onUpdateCategory,
  onCancelEdit,
  deleteDialog,
  setDeleteDialog,
  onDeleteCategory,
}) => {
  return (
    <>
      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Tags className="h-5 w-5 mr-2" />
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm 
            formData={formData}
            loading={loading}
            isEdit={true}
            onInputChange={onInputChange}
            onSubmit={onUpdateCategory}
            onCancel={onCancelEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, category: open ? deleteDialog.category : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{deleteDialog.category?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryDialogs;
