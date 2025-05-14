
'use client';

import type { Shipment, Trailer } from '@/types';
import { Package, CalendarDays, Users, Briefcase, Tag, Download } from 'lucide-react'; // Using lucide for icons
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ShipmentLabelProps {
  shipment: Shipment;
  trailer: Trailer;
  labelDate: string;
}

export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; 

  const qrPlaceholderGrid = Array(10).fill(0).map(() => 
    Array(10).fill(0).map(() => Math.random() > 0.5)
  );

  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!labelRef.current) return;

    // Temporarily remove the download button from capture if it's inside labelRef
    // For this example, we assume the button will be outside or handled by CSS (no-print)
    // If button were inside labelRef and not no-print, we'd hide it here and show after.

    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 2, // Increase scale for better image quality
        useCORS: true, // If there are external images/fonts
        backgroundColor: '#ffffff', // Explicitly set background for transparency issues
         // Apply print styles during capture. This is experimental and might need careful testing.
        onclone: (documentClone) => {
            const labelElement = documentClone.getElementById(labelRef.current?.id || '');
            if (labelElement) {
                // Add a class that forces print styles or manually apply them.
                // Forcing print styles might be complex. It's often better to style the
                // component itself for capture if specific dimensions are needed.
                // For now, we capture as-is on screen.
            }
        }
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `label-${shipment.trailerId}-${shipment.stsJob}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
      // Potentially show a toast message to the user
    }
  };

  return (
    <div className="flex flex-col items-center group">
      <div 
        ref={labelRef}
        id={`shipment-label-${shipment.id}`} // Unique ID for potential targeting
        className="p-1.5 border border-foreground rounded-md shadow-sm w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] bg-background text-foreground print:shadow-none print:border-black print:w-[108mm] print:h-[150mm] print:p-1.5 print:break-words label-item flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-center mb-1 print:mb-1">
              <h3 className="text-xs print:text-[22pt] font-bold text-primary print:text-black">Shipment Label</h3>
              <Package className="h-4 w-4 text-primary print:hidden" />
          </div>
          
          <div className="space-y-0.5 print:my-px print:leading-normal print:space-y-1"> 
            <p className="flex items-center print:text-[18pt] print:mb-1"><CalendarDays className="h-3 w-3 mr-1 print:hidden"/><strong>Date:</strong> <span className="ml-1">{labelDate}</span></p>
            
            <p className="flex items-center print:text-[36pt] print:font-semibold print:mb-2"><Briefcase className="h-3 w-3 mr-1 print:hidden"/><strong>Agent:</strong> <span className="ml-1" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span></p>
            
            <p className="flex items-center print:text-[36pt] print:font-semibold print:mb-2"><Users className="h-3 w-3 mr-1 print:hidden"/><strong>Importer:</strong> <span className="ml-1" title={shipment.importer}>{shipment.importer}</span></p>
            
            <p className="flex items-center print:text-[48pt] print:font-bold print:mb-3"><Tag className="h-3 w-3 mr-1 print:hidden"/><strong>Pieces:</strong> <span className="ml-1">{shipment.quantity}</span></p>
            
            <p className="flex items-center print:text-[40pt] print:font-bold print:mb-3">
              <strong>Ref:</strong> 
              <span className="ml-1" title={`Trailer ${trailer.id} / Job ${shipment.stsJob}`}>
                  Tr: {trailer.id} / Job: {shipment.stsJob}
              </span>
            </p>
            {shipment.customerJobNumber && (
              <p className="flex items-center print:text-[28pt] print:font-semibold print:mb-2"> 
                  <strong>Cust. Job:</strong> 
                  <span className="ml-1" title={shipment.customerJobNumber}>
                      {shipment.customerJobNumber}
                  </span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-dashed border-muted-foreground print:border-black print:mt-auto print:pt-2 print:mb-1"> 
          <p className="text-[0.6rem] print:text-[16pt] font-semibold text-center print:mb-0.5">QR CODE</p>
          <div className="flex justify-center items-center mt-1 print:mt-1 print:mb-1" aria-label="QR Code Placeholder">
            <div className="grid grid-cols-10 gap-px w-16 h-16 print:w-32 print:h-32 bg-background print:bg-white p-0.5 border border-foreground print:border-black">
              {qrPlaceholderGrid.flat().map((isBlack, i) => (
                <div key={i} className={`w-full h-full ${isBlack ? 'bg-foreground print:bg-black' : 'bg-background print:bg-white'}`}></div>
              ))}
            </div>
          </div>
          <p className="text-center font-mono text-[0.55rem] print:text-[22pt] print:font-bold break-all mt-1 print:mt-1 leading-tight tracking-tighter" title={barcodeValue}>
            {barcodeValue}
          </p>
        </div>
      </div>
      <Button
        onClick={handleDownloadImage}
        variant="outline"
        size="sm"
        className="mt-2 no-print group-hover:opacity-100 md:opacity-0 transition-opacity duration-150"
        aria-label={`Download label for shipment ${shipment.stsJob} as image`}
      >
        <Download className="mr-2 h-4 w-4" />
        Download Image
      </Button>
    </div>
  );
}

