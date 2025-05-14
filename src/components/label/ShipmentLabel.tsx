
import type { Shipment, Trailer } from '@/types';
import { Package, CalendarDays, Users, Briefcase, Tag } from 'lucide-react'; // Using lucide for icons

interface ShipmentLabelProps {
  shipment: Shipment;
  trailer: Trailer;
  labelDate: string;
}

export default function ShipmentLabel({ shipment, trailer, labelDate }: ShipmentLabelProps) {
  const barcodeValue = shipment.id; // Using full shipment ID for barcode value

  return (
    <div className="p-3 border border-foreground rounded-md shadow-sm w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] bg-background text-foreground print:shadow-none print:border-black print:w-[108mm] print:h-[150mm] print:p-1.5 print:text-[6pt] print:break-words label-item flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-1 print:mb-0.5">
            <h3 className="text-xs print:text-[7pt] font-bold text-primary print:text-black">Shipment Label</h3>
            <Package className="h-4 w-4 text-primary print:hidden" />
        </div>
        
        <div className="space-y-0.5 print:space-y-px text-[0.65rem] print:text-[5.5pt] leading-tight">
          <p className="flex items-center"><CalendarDays className="h-3 w-3 mr-1 print:hidden"/><strong>Date:</strong> <span className="ml-1">{labelDate}</span></p>
          <p className="flex items-center"><Briefcase className="h-3 w-3 mr-1 print:hidden"/><strong>Agent:</strong> <span className="ml-1 truncate" title={trailer.company || 'N/A'}>{trailer.company || 'N/A'}</span></p>
          <p className="flex items-center"><Users className="h-3 w-3 mr-1 print:hidden"/><strong>Importer:</strong> <span className="ml-1 truncate" title={shipment.importer}>{shipment.importer}</span></p>
          <p className="flex items-center"><Tag className="h-3 w-3 mr-1 print:hidden"/><strong>Pieces:</strong> <span className="ml-1">{shipment.quantity}</span></p>
          <p className="flex items-center print:text-[5pt]">
            <strong>Ref:</strong> 
            <span className="ml-1 truncate" title={`Trailer ${trailer.id} / Job ${shipment.stsJob}`}>
                Tr: {trailer.id} / Job: {shipment.stsJob}
            </span>
          </p>
          {shipment.customerJobNumber && (
            <p className="flex items-center print:text-[5pt]">
                <strong>Cust. Job:</strong> 
                <span className="ml-1 truncate" title={shipment.customerJobNumber}>
                    {shipment.customerJobNumber}
                </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-1 pt-1 border-t border-dashed border-muted-foreground print:border-black print:mt-0.5 print:pt-0.5">
        <p className="text-[0.6rem] print:text-[5pt] font-semibold text-center">BARCODE</p>
        {/* Basic barcode visual placeholder */}
        <div className="flex justify-center items-end h-6 print:h-5 mt-0.5 space-x-px overflow-hidden print:my-px">
          {[2,1,3,1,2,3,1,1,2,3,2,1,3,1,2,1,3,2,1,2,3,1,1,2,3,2,1,3,1,2,2,1,3,2,1,1,3,2].map((h, i) => (
            <div key={i} className="bg-foreground print:bg-black" style={{ height: `${h*4+6}px`, width: '1px' }}></div>
          ))}
        </div>
        <p className="text-center font-mono text-[0.55rem] print:text-[4.5pt] break-all mt-0.5 leading-tight tracking-tighter" title={barcodeValue}>
          {barcodeValue}
        </p>
      </div>
    </div>
  );
}
