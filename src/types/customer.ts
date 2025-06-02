
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  type: 'Individual' | 'Business';
  totalOrders: number;
  totalSpent: number;
  status?: string;
  services?: string[];
  createdAt: string;
  createdBy?: string;
}
