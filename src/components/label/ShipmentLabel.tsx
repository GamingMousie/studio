
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

// Helper function to parse print classes and apply them as inline styles
const applyCaptureStyles = (clonedElement: HTMLElement, originalElement: HTMLElement) => {
  const printClasses = Array.from(originalElement.classList).filter(cls => cls.startsWith('print:'));
  
  // Remove screen-specific text size classes from the clone
  const screenTextSizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];
  screenTextSizeClasses.forEach(cls => clonedElement.classList.remove(cls));

  printClasses.forEach(pClass => {
    if (pClass.startsWith('print:text-[')) { // e.g., print:text-[36pt]
      const sizeMatch = pClass.match(/print:text-\[(.*?)]/);
      if (sizeMatch && sizeMatch[1]) {
        clonedElement.style.fontSize = sizeMatch[1];
      }
    } else if (pClass === 'print:font-bold') {
      clonedElement.style.fontWeight = 'bold';
    } else if (pClass === 'print:font-semibold') {
      clonedElement.style.fontWeight = 'semibold';
    } else if (pClass.startsWith('print:mb-')) {
      // Simplified mapping for margins. More complex mapping might be needed for exactness.
      // Tailwind mb-1 = 0.25rem, mb-2 = 0.5rem, mb-3 = 0.75rem. Assuming 1rem = 16px for capture.
      const mbMatch = pClass.match(/print:mb-(\d+(\.\d+)?)/);
      if (mbMatch && mbMatch[1]) {
        clonedElement.style.marginBottom = `${parseFloat(mbMatch[1]) * 0.25 * 16}px`; // Convert rem to px for canvas
      }
    } else if (pClass === 'print:leading-normal') {
      clonedElement.style.lineHeight = 'normal';
    }
    // Add other style translations if needed
  });
};


export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; 

  const qrPlaceholderGrid = Array(10).fill(0).map(() => 
    Array(10).fill(0).map(() => Math.random() > 0.5)
  );

  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!labelRef.current) return;

    // Target dimensions for 10.8cm x 15cm at 150 DPI
    const targetWidthPx = Math.round((10.8 / 2.54) * 150); // Approx 638px
    const targetHeightPx = Math.round((15 / 2.54) * 150);  // Approx 887px

    try {
      const canvas = await html2canvas(labelRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        width: targetWidthPx,
        height: targetHeightPx,
        onclone: (documentClone) => {
          const clonedLabelRoot = documentClone.getElementById(labelRef.current?.id || '');
          if (clonedLabelRoot && labelRef.current) {
            // Apply styles to the root itself if it has print directives
            applyCaptureStyles(clonedLabelRoot, labelRef.current);

            // Recursively apply styles to children
            const applyStylesToChildren = (originalNode: HTMLElement, clonedNode: HTMLElement) => {
              const originalChildren = Array.from(originalNode.children) as HTMLElement[];
              const clonedChildren = Array.from(clonedNode.children) as HTMLElement[];

              originalChildren.forEach((origChild, index) => {
                if (clonedChildren[index]) {
                  applyCaptureStyles(clonedChildren[index], origChild);
                  if (origChild.children.length > 0) {
                    applyStylesToChildren(origChild, clonedChildren[index]);
                  }
                }
              });
            };
            applyStylesToChildren(labelRef.current, clonedLabelRoot);
          }
        },
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
        id={`shipment-label-${shipment.id}`}
        className="p-1.5 border border-foreground rounded-md shadow-sm w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] bg-background text-foreground print:shadow-none print:border-black print:w-[108mm] print:h-[150mm] print:p-1.5 print:break-words label-item flex flex-col justify-between"
      >
        <div className="print:leading-normal"> {/* Added print:leading-normal here for better control */}
          <div className="flex justify-between items-center mb-1 print:mb-1">
              <h3 className="text-xs print:text-[22pt] font-bold text-primary print:text-black">Shipment Label</h3>
              <Package className="h-4 w-4 text-primary print:hidden" />
          </div>
          
          <div className="space-y-0.5 print:my-px print:space-y-1"> 
            <p className="flex items-center text-xs print:text-[18pt] print:mb-1"><CalendarDays className="h-3 w-3 mr-1 print:hidden"/><strong>Date:</strong> <span className="ml-1">{labelDate}</span></p>
            
            <p className="flex items-center text-xs print:text-[36pt] print:font-semibold print:mb-2"><Briefcase className="h-3 w-3 mr-1 print:hidden"/><strong>Agent:</strong> <span className="ml-1" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span></p>
            
            <p className="flex items-center text-xs print:text-[36pt] print:font-semibold print:mb-2"><Users className="h-3 w-3 mr-1 print:hidden"/><strong>Importer:</strong> <span className="ml-1" title={shipment.importer}>{shipment.importer}</span></p>
            
            <p className="flex items-center text-xs print:text-[48pt] print:font-bold print:mb-3"><Tag className="h-3 w-3 mr-1 print:hidden"/><strong>Pieces:</strong> <span className="ml-1">{shipment.quantity}</span></p>
            
            <p className="flex items-center text-xs print:text-[40pt] print:font-bold print:mb-3">
              <strong>Ref:</strong> 
              <span className="ml-1" title={`Trailer ${trailer.id} / Job ${shipment.stsJob}`}>
                  Tr: {trailer.id} / Job: {shipment.stsJob}
              </span>
            </p>
            {shipment.customerJobNumber && (
              <p className="flex items-center text-xs print:text-[28pt] print:font-semibold print:mb-2"> 
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
