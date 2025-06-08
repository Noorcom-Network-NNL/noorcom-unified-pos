
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building, MapPin, Plus, Trash2 } from 'lucide-react';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logo?: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

const SettingsDialog = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'NoorcomPOS',
    address: '123 Business Street, Nairobi',
    phone: '+254700000000',
    email: 'info@noorcompos.com',
    taxId: 'TAX123456789',
  });

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

  const [newBranch, setNewBranch] = useState<Omit<Branch, 'id' | 'status'>>({
    name: '',
    address: '',
    phone: '',
    manager: '',
  });

  const handleCompanyUpdate = () => {
    // Here you would typically save to Firebase
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
  };

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const branch: Branch = {
      ...newBranch,
      id: Date.now().toString(),
      status: 'active'
    };

    setBranches([...branches, branch]);
    setNewBranch({ name: '', address: '', phone: '', manager: '' });
    
    toast({
      title: "Success",
      description: "Branch added successfully",
    });
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
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your company information and branches
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-tax">Tax ID</Label>
                    <Input
                      id="company-tax"
                      value={companyInfo.taxId}
                      onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleCompanyUpdate}>
                  Update Company Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches" className="space-y-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Existing Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{branch.name}</h3>
                          <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                            {branch.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{branch.address}</p>
                        <p className="text-sm text-gray-600">Manager: {branch.manager}</p>
                        <p className="text-sm text-gray-600">{branch.phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBranchStatus(branch.id)}
                        >
                          {branch.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBranch(branch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
