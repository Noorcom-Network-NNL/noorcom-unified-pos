
import { useRef } from 'react';

export const useReceiptPrint = () => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (componentRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { margin: 0; padding: 20px; font-family: monospace; }
                @media print {
                  body { margin: 0; padding: 0; }
                  @page { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${componentRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return { componentRef, handlePrint };
};
