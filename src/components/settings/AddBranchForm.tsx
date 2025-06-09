
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

interface AddBranchFormProps {
  onAddBranch: (branch: Omit<Branch, 'id' | 'status'>) => void;
}

const AddBranchForm = ({ onAddBranch }: AddBranchFormProps) => {
  const { toast } = useToast();
  const [newBranch, setNewBranch] = useState<Omit<Branch, 'id' | 'status'>>({
    name: '',
    address: '',
    phone: '',
    manager: '',
  });

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onAddBranch(newBranch);
    setNewBranch({ name: '', address: '', phone: '', manager: '' });
    
    toast({
      title: "Success",
      description: "Branch added successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Add New Branch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Branch Name</Label>
            <Input
              id="branch-name"
              value={newBranch.name}
              onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
              placeholder="Enter branch name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-manager">Manager</Label>
            <Input
              id="branch-manager"
              value={newBranch.manager}
              onChange={(e) => setNewBranch({...newBranch, manager: e.target.value})}
              placeholder="Manager name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-address">Address</Label>
          <Input
            id="branch-address"
            value={newBranch.address}
            onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
            placeholder="Branch address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-phone">Phone</Label>
          <Input
            id="branch-phone"
            value={newBranch.phone}
            onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
            placeholder="Branch phone number"
          />
        </div>

        <Button onClick={handleAddBranch} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddBranchForm;
