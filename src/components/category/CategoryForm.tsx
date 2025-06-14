
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFormData {
  name: string;
  value: string;
  description: string;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  loading: boolean;
  isEdit?: boolean;
  onInputChange: (field: keyof CategoryFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const CategoryForm = React.memo(({ 
  formData, 
  loading, 
  isEdit = false, 
  onInputChange, 
  onSubmit, 
  onCancel 
}: CategoryFormProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Category Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        placeholder="Enter category name"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="value">Category Value *</Label>
      <Input
        id="value"
        value={formData.value}
        onChange={(e) => onInputChange('value', e.target.value)}
        placeholder="category-value"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        placeholder="Optional description"
      />
    </div>

    <div className="flex space-x-2 pt-4">
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Category' : 'Add Category')}
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
));

CategoryForm.displayName = 'CategoryForm';

export default CategoryForm;
export type { CategoryFormData };
