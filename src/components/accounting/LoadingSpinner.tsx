
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Accounting</h2>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounting data...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
