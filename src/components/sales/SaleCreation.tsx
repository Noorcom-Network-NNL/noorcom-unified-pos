
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

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

interface SaleCreationProps {
  selectedCustomer: Customer | null;
}

const SaleCreation: React.FC<SaleCreationProps> = ({ selectedCustomer }) => {
  const { toast } = useToast();

  const handleCreateSale = () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: `Sale created for ${selectedCustomer.name}!`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ready to create sale for:</p>
              <p className="font-medium">{selectedCustomer.name}</p>
              <Button onClick={handleCreateSale} className="w-full">
                Create Sale
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Please select a customer to create a sale
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleCreation;
