import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

const shipmentSchema = z.object({
  contentDescription: z.string().min(1, 'Content description is required').max(100, 'Description too long'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  destination: z.string().min(1, 'Destination is required').max(50, 'Destination too long'),
  locationName: z.string().optional(),
  releaseDocument: z.instanceof(FileList).optional(),
  clearanceDocument: z.instanceof(FileList).optional(),
  released: z.boolean().optional(),
  cleared: z.boolean().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface AddShipmentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  trailerId: string;
}

export default function AddShipmentDialog({ isOpen, setIsOpen, trailerId }: AddShipmentDialogProps) {
  const { addShipment } = useWarehouse();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      released: false,
      cleared: false,
    }
  });

  const onSubmit: SubmitHandler<ShipmentFormData> = (data) => {
    const releaseDocumentName = data.releaseDocument?.[0]?.name;
    const clearanceDocumentName = data.clearanceDocument?.[0]?.name;

    addShipment({ 
      trailerId,
      contentDescription: data.contentDescription,
      quantity: data.quantity,
      destination: data.destination,
      locationName: data.locationName,
      releaseDocumentName,
      clearanceDocumentName,
      released: data.released,
      cleared: data.cleared,
    });
    toast({
      title: "Success!",
      description: `Shipment "${data.contentDescription}" added to trailer ${trailerId}.`,
    });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Shipment</DialogTitle>
          <DialogDescription>
            Enter details for the new shipment to be added to trailer ID: {trailerId}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="contentDescription">Content Description</Label>
            <Textarea id="contentDescription" {...register('contentDescription')} placeholder="e.g., Pallet of Widgets" />
            {errors.contentDescription && <p className="text-sm text-destructive mt-1">{errors.contentDescription.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g., 100" />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" {...register('destination')} placeholder="e.g., Main Warehouse" />
              {errors.destination && <p className="text-sm text-destructive mt-1">{errors.destination.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="locationName">Initial Location (Optional)</Label>
            <Input id="locationName" {...register('locationName')} placeholder="e.g., Bay C2" />
            {errors.locationName && <p className="text-sm text-destructive mt-1">{errors.locationName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Release Document (Optional)
            </Label>
            <Input id="releaseDocument" type="file" {...register('releaseDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.releaseDocument && <p className="text-sm text-destructive mt-1">{errors.releaseDocument.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearanceDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Clearance Document (Optional)
            </Label>
            <Input id="clearanceDocument" type="file" {...register('clearanceDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.clearanceDocument && <p className="text-sm text-destructive mt-1">{errors.clearanceDocument.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="released" {...register('released')} />
              <Label htmlFor="released" className="font-normal">Mark as Released</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cleared" {...register('cleared')} />
              <Label htmlFor="cleared" className="font-normal">Mark as Cleared</Label>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Shipment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

