
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import AddBranchForm from './AddBranchForm';
import BranchList from './BranchList';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

const BranchManagementTab = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Main Branch',
      address: '123 Business Street, Nairobi',
      phone: '+254700000000',
      manager: 'John Doe',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mombasa Branch',
      address: '456 Coast Road, Mombasa',
      phone: '+254700000001',
      manager: 'Jane Smith',
      status: 'active'
    }
  ]);

  const handleAddBranch = (newBranchData: Omit<Branch, 'id' | 'status'>) => {
    const branch: Branch = {
      ...newBranchData,
      id: Date.now().toString(),
      status: 'active'
    };

    setBranches([...branches, branch]);
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches(branches.filter(branch => branch.id !== branchId));
    toast({
      title: "Success",
      description: "Branch deleted successfully",
    });
  };

  const toggleBranchStatus = (branchId: string) => {
    setBranches(branches.map(branch => 
      branch.id === branchId 
        ? { ...branch, status: branch.status === 'active' ? 'inactive' : 'active' }
        : branch
    ));
  };

  return (
    <div className="space-y-4">
      <AddBranchForm onAddBranch={handleAddBranch} />
      <BranchList 
        branches={branches}
        onDeleteBranch={handleDeleteBranch}
        onToggleBranchStatus={toggleBranchStatus}
      />
    </div>
  );
};

export default BranchManagementTab;
