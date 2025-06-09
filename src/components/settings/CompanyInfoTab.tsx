import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';
import { getCompanies, createCompany, updateCompany } from '@/services/companyService';

interface CompanyInfo {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logo?: string;
}

const CompanyInfoTab = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'NoorcomPOS',
    address: '123 Business Street, Nairobi',
    phone: '+254700000000',
    email: 'info@noorcompos.com',
    taxId: 'TAX123456789',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load company info from Firebase on component mount
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const companies = await getCompanies();
        if (companies && companies.length > 0) {
          const company = companies[0]; // Assuming single company setup
          setCompanyInfo({
            id: company.id,
            name: company.name || 'NoorcomPOS',
            address: company.address || '123 Business Street, Nairobi',
            phone: company.phone || '+254700000000',
            email: company.email || 'info@noorcompos.com',
            taxId: company.taxId || 'TAX123456789',
            logo: company.logo
          });
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      }
    };

    loadCompanyInfo();
  }, []);

  const handleCompanyUpdate = async () => {
    if (!companyInfo.name || !companyInfo.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (companyInfo.id) {
        // Update existing company
        await updateCompany(companyInfo.id, companyInfo);
      } else {
        // Create new company
        const newCompanyId = await createCompany(companyInfo);
        setCompanyInfo({ ...companyInfo, id: newCompanyId });
      }
      
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input
              id="company-email"
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-address">Address</Label>
          <Input
            id="company-address"
            value={companyInfo.address}
            onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input
              id="company-phone"
              value={companyInfo.phone}
              onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-tax">Tax ID</Label>
            <Input
              id="company-tax"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
            />
          </div>
        </div>

        <Button onClick={handleCompanyUpdate} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Company Information'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoTab;
