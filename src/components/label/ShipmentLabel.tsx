
'use client';

import type { Shipment, Trailer } from '@/types';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';

interface ShipmentLabelProps {
  shipment: Shipment;
  trailer: Trailer;
  labelDate: string; // Expecting DD/MM/YYYY format
}

// Helper function to parse print classes and apply them as inline styles
const applyCaptureStyles = (clonedElement: HTMLElement, originalElement: HTMLElement) => {
  const printClasses = Array.from(originalElement.classList).filter(cls => cls.startsWith('print:'));
  
  const screenTextSizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'];
  screenTextSizeClasses.forEach(cls => clonedElement.classList.remove(cls));

  clonedElement.style.color = 'black'; // Ensure text is black for capture

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
        clonedElement.style.marginBottom = `${parseFloat(mbMatch[1]) * 4}px`; 
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
    }  else if (pClass.startsWith('print:pt-')) {
        const ptMatch = pClass.match(/print:pt-(\d+(\.\d+)?)/);
        if (ptMatch && ptMatch[1]) {
            clonedElement.style.paddingTop = `${parseFloat(ptMatch[1]) * 4}px`;
        }
    } else if (pClass.startsWith('print:pb-')) {
        const pbMatch = pClass.match(/print:pb-(\d+(\.\d+)?)/);
        if (pbMatch && pbMatch[1]) {
            clonedElement.style.paddingBottom = `${parseFloat(pbMatch[1]) * 4}px`;
        }
    } else if (pClass.startsWith('print:px-')) {
        const pxMatch = pClass.match(/print:px-(\d+(\.\d+)?)/);
        if (pxMatch && pxMatch[1]) {
            const paddingValue = `${parseFloat(pxMatch[1]) * 4}px`;
            clonedElement.style.paddingLeft = paddingValue;
            clonedElement.style.paddingRight = paddingValue;
        }
    } else if (pClass.startsWith('print:py-')) {
        const pyMatch = pClass.match(/print:py-(\d+(\.\d+)?)/);
        if (pyMatch && pyMatch[1]) {
            const paddingValue = `${parseFloat(pyMatch[1]) * 4}px`;
            clonedElement.style.paddingTop = paddingValue;
            clonedElement.style.paddingBottom = paddingValue;
        }
    } else if (pClass === 'print:leading-normal') {
      clonedElement.style.lineHeight = 'normal';
    } else if (pClass === 'print:leading-relaxed') {
        clonedElement.style.lineHeight = '1.625'; // Tailwind's relaxed
    } else if (pClass.startsWith('print:w-')) {
        const wMatch = pClass.match(/print:w-\[(.*?)\]/);
        if (wMatch && wMatch[1]) {
            clonedElement.style.width = wMatch[1];
        } else {
           const wNumMatch = pClass.match(/print:w-(\d+)/);
           if (wNumMatch && wNumMatch[1]) {
             clonedElement.style.width = `${parseFloat(wNumMatch[1]) * 0.25}rem`;
           }
        }
    } else if (pClass.startsWith('print:h-')) {
        const hMatch = pClass.match(/print:h-\[(.*?)\]/);
        if (hMatch && hMatch[1]) {
            clonedElement.style.height = hMatch[1];
        } else {
          const hNumMatch = pClass.match(/print:h-(\d+)/);
           if (hNumMatch && hNumMatch[1]) {
             clonedElement.style.height = `${parseFloat(hNumMatch[1]) * 0.25}rem`;
           }
        }
    }
  });
};


export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; 
  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!labelRef.current) return;
    
    const targetWidthPx = Math.round((15 / 2.54) * 150); // approx 886px for 15cm width
    const targetHeightPx = Math.round((10.8 / 2.54) * 150);  // approx 638px for 10.8cm height

    try {
      const canvas = await html2canvas(labelRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        width: targetWidthPx, 
        height: targetHeightPx,
        scale: 2, 
        logging: false, 
        onclone: (documentClone) => {
          const clonedLabelRoot = documentClone.getElementById(labelRef.current?.id || '');
          if (clonedLabelRoot && labelRef.current) {
            clonedLabelRoot.style.width = `${targetWidthPx}px`;
            clonedLabelRoot.style.height = `${targetHeightPx}px`;
            clonedLabelRoot.style.padding = `${0.375 * 16}px`; 
            clonedLabelRoot.style.border = '1px solid black';
            clonedLabelRoot.style.display = 'flex';
            clonedLabelRoot.style.flexDirection = 'column';
            clonedLabelRoot.style.justifyContent = 'space-between';
            clonedLabelRoot.style.backgroundColor = '#ffffff'; 
            clonedLabelRoot.style.color = '#000000'; 
            clonedLabelRoot.style.boxSizing = 'border-box';
            clonedLabelRoot.style.lineHeight = 'normal';

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
            
            const originalDirectChildren = Array.from(labelRef.current.children) as HTMLElement[];
            const clonedDirectChildren = Array.from(clonedLabelRoot.children) as HTMLElement[];

            originalDirectChildren.forEach((origChild, index) => {
                if(clonedDirectChildren[index]) {
                    applyCaptureStyles(clonedDirectChildren[index], origChild); 
                    applyStylesToChildren(origChild, clonedDirectChildren[index]); 
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
  
  return (
    <div className="flex flex-col items-center group">
      <div 
        ref={labelRef}
        id={`shipment-label-${shipment.id}`}
        className="border border-foreground rounded-md shadow-sm w-full bg-background text-foreground print:shadow-none print:border-black print:w-[150mm] print:h-[108mm] print:p-1.5 print:break-words label-item flex flex-col justify-between print:leading-normal print-page-break-after-always"
      >
        {/* Main content section */}
        <div className="flex-grow flex flex-col justify-between space-y-1 print:space-y-0 print:leading-normal">
          {/* Date row */}
          <div className="flex justify-between items-baseline print:mb-0.5">
            <span className="text-sm print:text-[22pt] print:font-semibold">Date:</span>
            <span className="text-sm print:text-[22pt] print:font-semibold text-right">{labelDate}</span>
          </div>

          {/* Agent row */}
          <div className="flex justify-between items-baseline print:mb-0.5">
            <span className="text-sm print:text-[22pt] print:font-semibold">Agent:</span>
            <span className="text-sm print:text-[40pt] print:font-semibold text-right" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span>
          </div>

          {/* Importer row */}
          <div className="flex justify-between items-baseline print:mb-0.5">
            <span className="text-sm print:text-[18pt] print:font-semibold">Importer:</span>
            <span className="text-sm print:text-[28pt] print:font-semibold text-right" title={shipment.importer}>{shipment.importer}</span>
          </div>
          
          {/* Pieces row */}
          <div className="flex justify-between items-baseline print:mb-1">
            <span className="text-sm print:text-[18pt] print:font-semibold">Pieces:</span>
            <span className="text-lg print:text-[36pt] print:font-bold text-right">{shipment.quantity}</span>
          </div>

          {/* Ref and Job row - centered */}
          <div className="text-center print:my-0.5">
            <p className="text-lg print:text-[44pt] print:font-bold" title={`Tr: ${trailer.id} / Job: ${shipment.stsJob}`}>
              Ref: {trailer.id} / Job: {shipment.stsJob}
            </p>
          </div>
        </div>

        {/* Barcode Section - Bottom part of the label */}
        <div className="mt-auto pt-1 border-t border-dashed border-muted-foreground print:border-black print:mt-0.5 print:pt-0.5 print:mb-0"> 
          <p className="text-xs print:text-[20pt] print:font-semibold print:mb-0.5 text-center">BARCODE</p>
          <div className="flex justify-center items-center mt-0.5 print:mt-0 print:mb-0.5 print:h-[50px] bg-background print:bg-white border-transparent print:border-transparent print:p-0.5 max-h-12">
             <Barcode 
                value={barcodeValue} 
                format="CODE128" 
                width={1.5} 
                height={40} 
                displayValue={false} 
                background="transparent"
                lineColor="black"
             />
          </div>
          <p className="text-center font-mono text-xs print:text-[28pt] print:font-bold break-all mt-0.5 print:mt-0.5 leading-tight tracking-tighter" title={barcodeValue}>
            {barcodeValue === '5372ae1e-9f0c-4b39-a467-d4c61a9fda97' ? '[ID HIDDEN]' : barcodeValue}
          </p>
        </div>
      </div>
      <Button
        onClick={handleDownloadImage}
        variant="outline"
        size="sm"
        className="mt-2 no-print transition-opacity duration-150"
        aria-label={`Download label for shipment ${shipment.stsJob} as image`}
      >
        <Download className="mr-2 h-4 w-4" />
        Download Image
      </Button>
    </div>
  );
}

