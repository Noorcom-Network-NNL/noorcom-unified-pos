
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  description?: string;
  isActive: boolean;
}

interface ChartOfAccountsProps {
  accounts: Account[];
}

const ChartOfAccounts = ({ accounts }: ChartOfAccountsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '',
    description: '',
    balance: 0
  });
  const { toast } = useToast();

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountCode || !formData.accountName || !formData.accountType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, 'accounts'), {
        ...formData,
        balance: Number(formData.balance),
        isActive: true,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Account added successfully"
      });

      setFormData({
        accountCode: '',
        accountName: '',
        accountType: '',
        description: '',
        balance: 0
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive"
      });
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount || !formData.accountCode || !formData.accountName || !formData.accountType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'accounts', selectedAccount.id), {
        ...formData,
        balance: Number(formData.balance),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Account updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteDoc(doc(db, 'accounts', accountId));
        toast({
          title: "Success",
          description: "Account deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      description: account.description || '',
      balance: account.balance
    });
    setIsEditDialogOpen(true);
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      Asset: 'bg-blue-100 text-blue-800',
      Liability: 'bg-red-100 text-red-800',
      Equity: 'bg-purple-100 text-purple-800',
      Revenue: 'bg-green-100 text-green-800',
      Expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chart of Accounts</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Account Code *</label>
                    <Input
                      value={formData.accountCode}
                      onChange={(e) => setFormData({...formData, accountCode: e.target.value})}
                      placeholder="e.g., 1001"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type *</label>
                    <Select value={formData.accountType} onValueChange={(value) => setFormData({...formData, accountType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Name *</label>
                  <Input
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    placeholder="e.g., Cash in Hand"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Opening Balance</label>
                  <Input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: Number(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Add Account</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.accountCode}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>
                  <Badge className={getAccountTypeColor(account.accountType)}>
                    {account.accountType}
                  </Badge>
                </TableCell>
                <TableCell>KSh {(account.balance || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account Code *</label>
                  <Input
                    value={formData.accountCode}
                    onChange={(e) => setFormData({...formData, accountCode: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type *</label>
                  <Select value={formData.accountType} onValueChange={(value) => setFormData({...formData, accountType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Account Name *</label>
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Balance</label>
                <Input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Update Account</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ChartOfAccounts;
