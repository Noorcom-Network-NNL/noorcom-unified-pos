
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getCustomers } from '@/services/firebaseService';
import CustomerSelection from './sales/CustomerSelection';
import SaleCreation from './sales/SaleCreation';
import RecentSalesTable from './sales/RecentSalesTable';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Individual' | 'Business';
  totalOrders: number;
  totalSpent: number;
  services: string[];
  createdBy: string;
  createdAt: string;
}

interface Sale {
  id: string;
  customerName: string;
  service: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

const SalesModule = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customersData = await getCustomers();
      setCustomers(customersData as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerAdded = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    setSelectedCustomer(customer);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <CustomerSelection
          customers={customers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          onCustomerAdded={handleCustomerAdded}
        />
        <SaleCreation selectedCustomer={selectedCustomer} />
      </div>
      
      <RecentSalesTable sales={sales} />
    </div>
  );
};

export default SalesModule;
