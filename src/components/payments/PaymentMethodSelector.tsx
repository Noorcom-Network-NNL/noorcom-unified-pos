
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

interface PaymentMethodSelectorProps {
  amount: number;
  onPaymentMethodSelect: (method: string, data?: any) => void;
  loading?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  onPaymentMethodSelect,
  loading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      icon: Wallet,
      description: 'Pay with cash',
      color: 'bg-green-100 text-green-800',
      available: true
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Pay via M-Pesa STK Push',
      color: 'bg-green-100 text-green-800',
      available: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      description: 'Pay with PayPal',
      color: 'bg-blue-100 text-blue-800',
      available: true
    },
    {
      id: 'card',
      name: 'Card',
      icon: CreditCard,
      description: 'Pay with debit/credit card',
      color: 'bg-purple-100 text-purple-800',
      available: true
    }
  ];

  const handlePaymentSelect = () => {
    if (!selectedMethod) return;

    const paymentData: any = { method: selectedMethod };

    if (selectedMethod === 'mpesa') {
      if (!phoneNumber) {
        alert('Please enter your M-Pesa phone number');
        return;
      }
      paymentData.phoneNumber = phoneNumber;
    }

    if (selectedMethod === 'paypal' && email) {
      paymentData.email = email;
    }

    onPaymentMethodSelect(selectedMethod, paymentData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Payment Method</span>
          <Badge variant="outline">KES {amount.toLocaleString()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => method.available && setSelectedMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{method.name}</span>
                      <Badge className={method.color} variant="secondary">
                        {method.available ? 'Available' : 'Coming Soon'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedMethod === 'mpesa' && (
          <div className="space-y-2 p-4 bg-green-50 rounded-lg">
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white"
            />
            <p className="text-xs text-gray-600">
              Enter your M-Pesa registered phone number
            </p>
          </div>
        )}

        {selectedMethod === 'paypal' && (
          <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
            <Label htmlFor="email">PayPal Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
            />
            <p className="text-xs text-gray-600">
              You'll be redirected to PayPal to complete payment
            </p>
          </div>
        )}

        <Button
          onClick={handlePaymentSelect}
          disabled={!selectedMethod || loading}
          className="w-full"
        >
          {loading ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
