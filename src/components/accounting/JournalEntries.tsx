
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  entries: {
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
  totalDebit: number;
  totalCredit: number;
}

interface JournalEntriesProps {
  journalEntries: JournalEntry[];
  accounts: any[];
}

const JournalEntries = ({ journalEntries, accounts }: JournalEntriesProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    entries: [
      { accountId: '', debit: 0, credit: 0 },
      { accountId: '', debit: 0, credit: 0 }
    ]
  });
  const { toast } = useToast();

  const addEntryLine = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { accountId: '', debit: 0, credit: 0 }]
    });
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setFormData({ ...formData, entries: updatedEntries });
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 2) {
      const updatedEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: updatedEntries });
    }
  };

  const getTotalDebit = () => {
    return formData.entries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
  };

  const getTotalCredit = () => {
    return formData.entries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalDebit = getTotalDebit();
    const totalCredit = getTotalCredit();

    if (totalDebit !== totalCredit) {
      toast({
        title: "Error",
        description: "Total debits must equal total credits",
        variant: "destructive"
      });
      return;
    }

    if (totalDebit === 0) {
      toast({
        title: "Error",
        description: "Please enter valid amounts",
        variant: "destructive"
      });
      return;
    }

    try {
      const journalEntryData = {
        date: formData.date,
        reference: formData.reference || `JE-${Date.now()}`,
        description: formData.description,
        entries: formData.entries.map(entry => ({
          accountId: entry.accountId,
          accountName: accounts.find(acc => acc.id === entry.accountId)?.accountName || '',
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0
        })),
        totalDebit,
        totalCredit,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'journalEntries'), journalEntryData);

      toast({
        title: "Success",
        description: "Journal entry created successfully"
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entries: [
          { accountId: '', debit: 0, credit: 0 },
          { accountId: '', debit: 0, credit: 0 }
        ]
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Journal Entries
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference</label>
                    <Input
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      placeholder="JE-001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Entry description"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Journal Entry Lines</h3>
                    <Button type="button" size="sm" onClick={addEntryLine}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Line
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    {formData.entries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <Select 
                            value={entry.accountId} 
                            onValueChange={(value) => updateEntry(index, 'accountId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.accountCode} - {account.accountName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Debit"
                            value={entry.debit || ''}
                            onChange={(e) => updateEntry(index, 'debit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Credit"
                            value={entry.credit || ''}
                            onChange={(e) => updateEntry(index, 'credit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          {formData.entries.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEntry(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 rounded">
                    <div>
                      <strong>Total Debit: KSh {getTotalDebit().toLocaleString()}</strong>
                    </div>
                    <div>
                      <strong>Total Credit: KSh {getTotalCredit().toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create Entry</Button>
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
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journalEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.reference}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>KSh {(entry.totalDebit || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default JournalEntries;
