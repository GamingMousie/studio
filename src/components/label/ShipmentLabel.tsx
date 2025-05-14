
'use client';

import type { Shipment, Trailer } from '@/types';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ShipmentLabelProps {
  shipment: Shipment;
  trailer: Trailer;
  labelDate: string; // Expecting DD/MM/YYYY format
}

// Helper function to parse print classes and apply them as inline styles
const applyCaptureStyles = (clonedElement: HTMLElement, originalElement: HTMLElement) => {
  const printClasses = Array.from(originalElement.classList).filter(cls => cls.startsWith('print:'));
  
  // Remove common screen text size classes to avoid conflict
  const screenTextSizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'];
  screenTextSizeClasses.forEach(cls => clonedElement.classList.remove(cls));

  printClasses.forEach(pClass => {
    if (pClass.startsWith('print:text-[')) {
      const sizeMatch = pClass.match(/print:text-\[(.*?)]/);
      if (sizeMatch && sizeMatch[1]) {
        clonedElement.style.fontSize = sizeMatch[1];
      }
    } else if (pClass === 'print:font-bold') {
      clonedElement.style.fontWeight = 'bold';
    } else if (pClass === 'print:font-semibold') {
      clonedElement.style.fontWeight = '600';
    } else if (pClass.startsWith('print:mb-')) {
      const mbMatch = pClass.match(/print:mb-(\d+(\.\d+)?)/);
      if (mbMatch && mbMatch[1]) {
        clonedElement.style.marginBottom = `${parseFloat(mbMatch[1]) * 4}px`; // Assuming 1rem = 16px, Tailwind unit = 0.25rem
      }
    } else if (pClass.startsWith('print:mt-')) {
      const mtMatch = pClass.match(/print:mt-(\d+(\.\d+)?)/);
      if (mtMatch && mtMatch[1]) {
        clonedElement.style.marginTop = `${parseFloat(mtMatch[1]) * 4}px`;
      }
    } else if (pClass.startsWith('print:p-')) {
        const pMatch = pClass.match(/print:p-(\d+(\.\d+)?)/);
        if (pMatch && pMatch[1]) {
            clonedElement.style.padding = `${parseFloat(pMatch[1]) * 4}px`;
        }
    } else if (pClass === 'print:leading-normal') {
      clonedElement.style.lineHeight = 'normal';
    } else if (pClass === 'print:leading-relaxed') {
        clonedElement.style.lineHeight = '1.625'; // Tailwind's relaxed line-height
    }
  });
};


export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; 

  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!labelRef.current) return;

    const targetWidthPx = Math.round((10.8 / 2.54) * 150); // Approx 638px for 10.8cm at 150 DPI
    const targetHeightPx = Math.round((15 / 2.54) * 150);  // Approx 887px for 15cm at 150 DPI

    try {
      const canvas = await html2canvas(labelRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        width: targetWidthPx, 
        height: targetHeightPx,
        logging: true, 
        onclone: (documentClone) => {
          const clonedLabelRoot = documentClone.getElementById(labelRef.current?.id || '');
          if (clonedLabelRoot && labelRef.current) {
            // Apply target dimensions and base styles to the cloned root for capture
            clonedLabelRoot.style.width = `${targetWidthPx}px`;
            clonedLabelRoot.style.height = `${targetHeightPx}px`;
            clonedLabelRoot.style.padding = '6px'; // Approx print:p-1.5
            clonedLabelRoot.style.border = '1px solid black';
            clonedLabelRoot.style.display = 'flex';
            clonedLabelRoot.style.flexDirection = 'column';
            clonedLabelRoot.style.justifyContent = 'space-between';
            clonedLabelRoot.style.backgroundColor = '#ffffff'; 
            clonedLabelRoot.style.color = '#000000'; 
            clonedLabelRoot.style.boxSizing = 'border-box';


            // Recursive function to apply styles to children
            const applyStylesToChildren = (originalNode: HTMLElement, clonedNode: HTMLElement) => {
              const originalChildren = Array.from(originalNode.children) as HTMLElement[];
              const clonedChildren = Array.from(clonedNode.children) as HTMLElement[];

              originalChildren.forEach((origChild, index) => {
                if (clonedChildren[index]) {
                  applyCaptureStyles(clonedChildren[index], origChild);
                  // Also apply to grandchildren, etc.
                  if (origChild.children.length > 0) {
                    applyStylesToChildren(origChild, clonedChildren[index]);
                  }
                }
              });
            };
            
            // Apply styles to direct children first, then recurse
            const originalDirectChildren = Array.from(labelRef.current.children) as HTMLElement[];
            const clonedDirectChildren = Array.from(clonedLabelRoot.children) as HTMLElement[];

            originalDirectChildren.forEach((origChild, index) => {
                if(clonedDirectChildren[index]) {
                    applyCaptureStyles(clonedDirectChildren[index], origChild); // Apply to direct child
                    applyStylesToChildren(origChild, clonedDirectChildren[index]); // Recurse for grandchildren
                }
            });
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
    }
  };

  // Simplified barcode visual: a few variable-width bars
  const barcodeBars = [
    { width: '10%', height: '100%' }, { width: '5%', height: '100%' }, { width: '15%', height: '100%' },
    { width: '8%', height: '100%' }, { width: '12%', height: '100%' }, { width: '5%', height: '100%' },
    { width: '10%', height: '100%' }, { width: '15%', height: '100%' }, { width: '10%', height: '100%' },
    { width: '10%', height: '100%' }
  ];

  return (
    <div className="flex flex-col items-center group">
      <div 
        ref={labelRef}
        id={`shipment-label-${shipment.id}`}
        className="border border-foreground rounded-md shadow-sm w-full bg-background text-foreground print:shadow-none print:border-black print:w-[108mm] print:h-[150mm] print:p-1.5 print:break-words label-item flex flex-col justify-between"
      >
        {/* Top part of the label */}
        <div className="print:leading-normal print:mb-1">
          {/* Date Row */}
          <div className="flex justify-between items-baseline print:mb-3">
            <span className="text-sm print:text-[32pt] print:font-bold">Date:</span>
            <span className="text-sm print:text-[32pt] print:font-bold">{labelDate}</span>
          </div>
          
          {/* Agent Row */}
          <div className="flex justify-between items-baseline print:mb-3">
            <span className="text-sm print:text-[36pt] print:font-semibold">Agent:</span>
            <span className="text-sm print:text-[36pt] print:font-semibold text-right" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span>
          </div>

          {/* Importer Row */}
          <div className="flex justify-between items-baseline print:mb-1">
            <span className="text-xs print:text-[18pt] print:font-semibold">Importer:</span>
            <span className="text-xs print:text-[28pt] print:font-semibold text-right" title={shipment.importer}>{shipment.importer}</span>
          </div>
          
          {/* Pieces Row */}
          <div className="flex justify-between items-baseline print:mb-3">
            <span className="text-xs print:text-[18pt]">Pieces:</span>
            <span className="text-sm print:text-[36pt] print:font-bold">{shipment.quantity}</span>
          </div>

          {/* Ref & Job Row */}
          <div className="flex justify-between items-baseline print:mb-3">
            <span className="text-base print:text-[40pt] print:font-bold" title={`Trailer ${trailer.id}`}>Ref: {trailer.id}</span>
            <span className="text-base print:text-[40pt] print:font-bold" title={`Job ${shipment.stsJob}`}>Job: {shipment.stsJob}</span>
          </div>
        </div>

        {/* Barcode Section - Bottom part of the label */}
        <div className="mt-auto pt-2 border-t border-dashed border-muted-foreground print:border-black print:mt-3 print:pt-2 print:mb-1"> 
          <p className="text-xs print:text-[16pt] print:font-semibold print:mb-1">BARCODE</p>
          <div className="flex justify-center items-center mt-1 print:mt-1 print:mb-1 h-16 print:h-24 bg-background print:bg-white border border-foreground print:border-black p-0.5" aria-label="Barcode Placeholder">
            <div className="flex w-full h-full items-stretch">
              {barcodeBars.map((bar, i) => (
                <div key={i} className="bg-foreground print:bg-black" style={{ width: bar.width, height: bar.height, marginRight: i < barcodeBars.length -1 ? '1px' : '0' }}></div>
              ))}
            </div>
          </div>
          <p className="text-center font-mono text-xs print:text-[22pt] print:font-bold break-all mt-1 print:mt-1 leading-tight tracking-tighter" title={barcodeValue}>
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
