
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/services/firebaseService';

interface ScheduleJobDialogProps {
  children: React.ReactNode;
}

const ScheduleJobDialog = ({ children }: ScheduleJobDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [jobType, setJobType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useFirebase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !jobType || !scheduledDate) {
      toast({
        title: "Error",
        description: "Customer name, job type, and scheduled date are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        customerName,
        jobType,
        scheduledDate,
        scheduledTime,
        notes,
        priority,
        status: 'Scheduled',
        jobNumber: `JOB-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid
      };

      await createOrder(jobData);
      console.log('Scheduling job:', jobData);
      
      toast({
        title: "Success",
        description: "Job scheduled successfully"
      });

      // Reset form
      setCustomerName('');
      setJobType('');
      setScheduledDate('');
      setScheduledTime('');
      setNotes('');
      setPriority('Medium');
      setOpen(false);
    } catch (error) {
      console.error('Error scheduling job:', error);
      toast({
        title: "Error",
        description: "Failed to schedule job",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Job
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Customer Name *</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Job Type *</label>
            <Input
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              placeholder="e.g., T-Shirt Printing, Laptop Repair"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Date *</label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Time</label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <div className="flex space-x-2 mt-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <Badge
                  key={level}
                  variant={priority === level ? "default" : "outline"}
                  className="cursor-pointer p-2 flex-1 text-center justify-center"
                  onClick={() => setPriority(level as 'Low' | 'Medium' | 'High')}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or requirements"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Scheduling...' : 'Schedule Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleJobDialog;
