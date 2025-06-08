
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Tender, TenderFormData } from '@/types/deal';
import { createTender, getTenders } from '@/services/firebaseService';

const DealsModule = () => {
  const { toast } = useToast();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<TenderFormData>({
    name: '',
    amount: 0,
    description: '',
    clientName: '',
    clientContact: '',
    submissionDate: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const tendersData = await getTenders();
      setTenders(tendersData as Tender[]);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast({
        title: "Error",
        description: "Failed to load tenders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.clientName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const tenderData = {
        ...formData,
        submissionStatus: 'preparing',
        paymentStatus: 'pending',
        totalPaid: 0,
        createdAt: new Date().toISOString()
      };

      await createTender(tenderData);
      
      toast({
        title: "Success",
        description: "Tender registered successfully"
      });

      setFormData({
        name: '',
        amount: 0,
        description: '',
        clientName: '',
        clientContact: '',
        submissionDate: '',
        dueDate: ''
      });
      
      setShowAddDialog(false);
      fetchTenders();
    } catch (error) {
      console.error('Error creating tender:', error);
      toast({
        title: "Error",
        description: "Failed to register tender",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'submission' | 'payment') => {
    const submissionColors = {
      preparing: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-purple-100 text-purple-800',
      awarded: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const paymentColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const colors = type === 'submission' ? submissionColors : paymentColors;
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTotalTenderValue = () => {
    return tenders.reduce((total, tender) => total + tender.amount, 0);
  };

  const getAwardedTenders = () => {
    return tenders.filter(tender => tender.submissionStatus === 'awarded');
  };

  const getTotalCollected = () => {
    return tenders.reduce((total, tender) => total + (tender.totalPaid || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Registration</h1>
          <p className="text-gray-600">Manage tenders, submissions, and payments</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Tender
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Tender</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tender Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter tender name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Tender Amount (KSh) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Enter client name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="clientContact">Client Contact</Label>
                <Input
                  id="clientContact"
                  value={formData.clientContact}
                  onChange={(e) => setFormData({...formData, clientContact: e.target.value})}
                  placeholder="Phone or email"
                />
              </div>
              
              <div>
                <Label htmlFor="submissionDate">Submission Date</Label>
                <Input
                  id="submissionDate"
                  type="date"
                  value={formData.submissionDate}
                  onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Registering...' : 'Register Tender'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tenders</p>
                <p className="text-2xl font-bold text-gray-900">{tenders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {getTotalTenderValue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Awarded</p>
                <p className="text-2xl font-bold text-gray-900">{getAwardedTenders().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {getTotalCollected().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Tenders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tender Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium">{tender.name}</TableCell>
                    <TableCell>{tender.clientName}</TableCell>
                    <TableCell>KSh {tender.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {getStatusBadge(tender.submissionStatus, 'submission')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tender.paymentStatus, 'payment')}
                    </TableCell>
                    <TableCell>
                      {tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString() : 'Not set'}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {tenders.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tenders registered yet</p>
                <p className="text-sm text-gray-400">Start by registering your first tender</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsModule;
