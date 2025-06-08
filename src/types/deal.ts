
export interface Tender {
  id: string;
  name: string;
  amount: number;
  description?: string;
  clientName: string;
  clientContact?: string;
  submissionDate: string;
  submissionStatus: 'preparing' | 'submitted' | 'under_review' | 'awarded' | 'rejected';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentAmount?: number;
  totalPaid?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TenderFormData {
  name: string;
  amount: number;
  description: string;
  clientName: string;
  clientContact: string;
  submissionDate: string;
  dueDate: string;
}
