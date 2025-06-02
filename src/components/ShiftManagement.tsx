
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';

const ShiftManagement = () => {
  const [currentShift, setCurrentShift] = useState(null);
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const { currentUser } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Listen to today's sales
    const salesQuery = query(
      collection(db, 'sales'),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<', Timestamp.fromDate(endOfDay)),
      orderBy('date', 'desc')
    );

    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Today\'s sales:', sales);
      setTodaySales(sales);
    });

    // Check for active shift
    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'active'),
      orderBy('startTime', 'desc')
    );

    const unsubscribeShifts = onSnapshot(shiftsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const shift = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        console.log('Active shift:', shift);
        setCurrentShift(shift);
      } else {
        setCurrentShift(null);
      }
    });

    return () => {
      unsubscribeSales();
      unsubscribeShifts();
    };
  }, [currentUser]);

  const startShift = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const shiftData = {
        userId: currentUser.uid,
        startTime: Timestamp.fromDate(new Date()),
        status: 'active',
        createdAt: Timestamp.fromDate(new Date())
      };

      await addDoc(collection(db, 'shifts'), shiftData);
      
      toast({
        title: "Shift Started",
        description: "Your shift has been started successfully"
      });
    } catch (error) {
      console.error('Error starting shift:', error);
      toast({
        title: "Error",
        description: "Failed to start shift",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const closeShift = async () => {
    if (!currentShift) return;

    setLoading(true);
    try {
      const totalSales = todaySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const totalOrders = todaySales.length;

      const shiftSummary = {
        shiftId: currentShift.id,
        userId: currentUser.uid,
        startTime: currentShift.startTime,
        endTime: Timestamp.fromDate(new Date()),
        totalSales,
        totalOrders,
        salesData: todaySales,
        status: 'closed',
        createdAt: Timestamp.fromDate(new Date())
      };

      await addDoc(collection(db, 'shiftSummaries'), shiftSummary);
      
      // Update shift status (you'd need to implement updateDoc)
      console.log('Shift closed with summary:', shiftSummary);
      
      toast({
        title: "Shift Closed",
        description: `Shift closed with ${totalOrders} orders and KSh ${totalSales.toLocaleString()} in sales`
      });

      setShowCloseDialog(false);
    } catch (error) {
      console.error('Error closing shift:', error);
      toast({
        title: "Error",
        description: "Failed to close shift",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const totalSales = todaySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const totalOrders = todaySales.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Shift Management
          </div>
          {currentShift ? (
            <Badge className="bg-green-100 text-green-800">
              Shift Active
            </Badge>
          ) : (
            <Badge variant="outline">
              No Active Shift
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentShift ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  KSh {totalSales.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Today's Sales</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{totalOrders}</p>
                <p className="text-sm text-gray-600">Orders Today</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {currentShift.startTime?.toDate ? 
                    new Date().getHours() - currentShift.startTime.toDate().getHours() : 0
                  }h
                </p>
                <p className="text-sm text-gray-600">Hours Worked</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">
                  Shift started: {currentShift.startTime?.toDate?.() ? 
                    currentShift.startTime.toDate().toLocaleTimeString() : 
                    'Unknown'
                  }
                </p>
              </div>
              
              <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Close Shift
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Close Shift</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Are you sure you want to close your current shift?</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Shift Summary:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Sales:</p>
                          <p className="font-semibold">KSh {totalSales.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Orders:</p>
                          <p className="font-semibold">{totalOrders}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCloseDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={closeShift}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Closing...' : 'Close Shift'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Shift</h3>
            <p className="text-gray-600 mb-4">Start your shift to begin tracking sales</p>
            <Button onClick={startShift} disabled={loading}>
              <Clock className="h-4 w-4 mr-2" />
              {loading ? 'Starting...' : 'Start Shift'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftManagement;
