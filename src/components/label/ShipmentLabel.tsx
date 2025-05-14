
import type { Shipment, Trailer } from '@/types';
import { Package, CalendarDays, Users, Briefcase, Tag } from 'lucide-react'; // Using lucide for icons

interface ShipmentLabelProps {
  shipment: Shipment;
  trailer: Trailer;
  labelDate: string;
}

export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; // Using full shipment ID for barcode value

  // QR Code Placeholder data (simple 10x10 grid)
  const qrPlaceholderGrid = Array(10).fill(0).map(() => 
    Array(10).fill(0).map(() => Math.random() > 0.5)
  );

  return (
    <div className="p-3 border border-foreground rounded-md shadow-sm w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] bg-background text-foreground print:shadow-none print:border-black print:w-[108mm] print:h-[150mm] print:p-3 print:text-[10pt] print:break-words label-item flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-1 print:mb-3">
            <h3 className="text-xs print:text-[22pt] font-bold text-primary print:text-black">Shipment Label</h3>
            <Package className="h-4 w-4 text-primary print:hidden" />
        </div>
        
        <div className="space-y-1 print:space-y-1 print:my-px text-[0.65rem] print:text-[10pt] leading-normal print:leading-normal">
          <p className="flex items-center print:text-[18pt] print:mb-2"><CalendarDays className="h-3 w-3 mr-1 print:hidden"/><strong>Date:</strong> <span className="ml-1">{labelDate}</span></p>
          <p className="flex items-center print:text-[22pt] print:font-semibold print:mb-2"><Briefcase className="h-3 w-3 mr-1 print:hidden"/><strong>Agent:</strong> <span className="ml-1" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span></p>
          <p className="flex items-center print:text-[22pt] print:mb-2"><Users className="h-3 w-3 mr-1 print:hidden"/><strong>Importer:</strong> <span className="ml-1" title={shipment.importer}>{shipment.importer}</span></p>
          <p className="flex items-center print:text-[28pt] print:font-bold print:mb-3"><Tag className="h-3 w-3 mr-1 print:hidden"/><strong>Pieces:</strong> <span className="ml-1">{shipment.quantity}</span></p>
          
          <p className="flex items-center print:text-[22pt] print:font-bold print:mb-2">
            <strong>Ref:</strong> 
            <span className="ml-1" title={`Trailer ${trailer.id} / Job ${shipment.stsJob}`}>
                Tr: {trailer.id} / Job: {shipment.stsJob}
            </span>
          </p>
          {shipment.customerJobNumber && (
            <p className="flex items-center print:text-[22pt] print:mb-2">
                <strong>Cust. Job:</strong> 
                <span className="ml-1" title={shipment.customerJobNumber}>
                    {shipment.customerJobNumber}
                </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-dashed border-muted-foreground print:border-black print:mt-3 print:pt-3 print:mb-1">
        <p className="text-[0.6rem] print:text-[16pt] font-semibold text-center print:mb-2">QR CODE</p>
        {/* QR Code visual placeholder - improved for square look */}
        <div className="flex justify-center items-center mt-1 print:mt-2 print:mb-2" aria-label="QR Code Placeholder">
          <div className="grid grid-cols-10 gap-px w-16 h-16 print:w-32 print:h-32 bg-background print:bg-white p-0.5 border border-foreground print:border-black">
            {qrPlaceholderGrid.flat().map((isBlack, i) => (
              <div key={i} className={`w-full h-full ${isBlack ? 'bg-foreground print:bg-black' : 'bg-background print:bg-white'}`}></div>
            ))}
          </div>
        </div>
        <p className="text-center font-mono text-[0.55rem] print:text-[18pt] print:font-bold break-all mt-1 print:mt-2 leading-tight tracking-tighter" title={barcodeValue}>
          {barcodeValue}
        </p>
      </div>
    </div>
  );
}
