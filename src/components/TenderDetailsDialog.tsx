
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, FileText, User, Phone, Mail } from 'lucide-react';
import { Tender } from '@/types/deal';
import { updateTender } from '@/services/firebaseService';

interface TenderDetailsDialogProps {
  tender: Tender | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const TenderDetailsDialog = ({ tender, open, onOpenChange, onUpdate }: TenderDetailsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    submissionStatus: tender?.submissionStatus || 'preparing',
    paymentStatus: tender?.paymentStatus || 'pending',
    paymentAmount: tender?.paymentAmount || 0,
    totalPaid: tender?.totalPaid || 0,
    dueDate: tender?.dueDate || '',
    description: tender?.description || '',
    clientContact: tender?.clientContact || ''
  });

  React.useEffect(() => {
    if (tender) {
      setFormData({
        submissionStatus: tender.submissionStatus,
        paymentStatus: tender.paymentStatus,
        paymentAmount: tender.paymentAmount || 0,
        totalPaid: tender.totalPaid || 0,
        dueDate: tender.dueDate || '',
        description: tender.description || '',
        clientContact: tender.clientContact || ''
      });
    }
  }, [tender]);

  const handleUpdate = async () => {
    if (!tender) return;

    try {
      setLoading(true);
      await updateTender(tender.id, formData);
      
      toast({
        title: "Success",
        description: "Tender updated successfully"
      });

      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating tender:', error);
      toast({
        title: "Error",
        description: "Failed to update tender",
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

  if (!tender) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {tender.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Tender Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">KSh {tender.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Created</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date(tender.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Client Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>{tender.clientName}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Contact</Label>
                {editMode ? (
                  <Input
                    value={formData.clientContact}
                    onChange={(e) => setFormData({...formData, clientContact: e.target.value})}
                    placeholder="Phone or email"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span>{tender.clientContact || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Status Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Submission Status</Label>
                {editMode ? (
                  <Select value={formData.submissionStatus} onValueChange={(value) => setFormData({...formData, submissionStatus: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge(tender.submissionStatus, 'submission')
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                {editMode ? (
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge(tender.paymentStatus, 'payment')
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Payment Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Expected Payment</Label>
                {editMode ? (
                  <Input
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({...formData, paymentAmount: Number(e.target.value)})}
                    placeholder="Expected amount"
                  />
                ) : (
                  <span>KSh {(tender.paymentAmount || 0).toLocaleString()}</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Total Paid</Label>
                {editMode ? (
                  <Input
                    type="number"
                    value={formData.totalPaid}
                    onChange={(e) => setFormData({...formData, totalPaid: Number(e.target.value)})}
                    placeholder="Amount paid"
                  />
                ) : (
                  <span>KSh {(tender.totalPaid || 0).toLocaleString()}</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                ) : (
                  <span>{tender.dueDate ? new Date(tender.dueDate).toLocaleDateString() : 'Not set'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Description</Label>
            {editMode ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tender description"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {tender.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Submission Date</Label>
              <span>{tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString() : 'Not set'}</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
              <span>{tender.updatedAt ? new Date(tender.updatedAt).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                Edit Details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenderDetailsDialog;
