
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

interface BranchListProps {
  branches: Branch[];
  onDeleteBranch: (branchId: string) => void;
  onToggleBranchStatus: (branchId: string) => void;
}

const BranchList = ({ branches, onDeleteBranch, onToggleBranchStatus }: BranchListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Branches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{branch.name}</h3>
                  <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                    {branch.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{branch.address}</p>
                <p className="text-sm text-gray-600">Manager: {branch.manager}</p>
                <p className="text-sm text-gray-600">{branch.phone}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleBranchStatus(branch.id)}
                >
                  {branch.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteBranch(branch.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchList;
