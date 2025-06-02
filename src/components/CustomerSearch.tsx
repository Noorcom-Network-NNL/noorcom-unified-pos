
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface CustomerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CustomerSearch = ({ searchTerm, onSearchChange }: CustomerSearchProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex space-x-2">
          <Input 
            placeholder="Search customers by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSearch;
