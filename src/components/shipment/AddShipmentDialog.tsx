
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { FileText, Weight, Box, Users, MapPin } from 'lucide-react'; 

const shipmentSchema = z.object({
  stsJob: z.coerce.number().positive('STS Job must be a positive number'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  importer: z.string().min(1, 'Importer is required').max(50, 'Importer name too long'),
  locationNameInput: z.string().optional(), // Changed from locationName to locationNameInput
  releaseDocument: z.any().optional(), 
  clearanceDocument: z.any().optional(), 
  released: z.boolean().optional(),
  cleared: z.boolean().optional(),
  weight: z.coerce.number().positive('Weight must be positive').optional().nullable(),
  palletSpace: z.coerce.number().int('Pallet space must be an integer').positive('Pallet space must be positive').optional().nullable(),
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
      weight: null,
      palletSpace: null,
      locationNameInput: '',
    }
  });

  const onSubmit: SubmitHandler<ShipmentFormData> = (data) => {
    const releaseDocumentName = data.releaseDocument && data.releaseDocument.length > 0 ? data.releaseDocument[0]?.name : undefined;
    const clearanceDocumentName = data.clearanceDocument && data.clearanceDocument.length > 0 ? data.clearanceDocument[0]?.name : undefined;

    addShipment({ 
      trailerId,
      stsJob: data.stsJob,
      quantity: data.quantity,
      importer: data.importer,
      initialLocationName: data.locationNameInput || undefined, // Pass as initialLocationName
      releaseDocumentName,
      clearanceDocumentName,
      released: data.released,
      cleared: data.cleared,
      weight: data.weight ?? undefined,
      palletSpace: data.palletSpace ?? undefined,
    });
    toast({
      title: "Success!",
      description: `Shipment with STS Job "${data.stsJob}" added to trailer ${trailerId}.`,
    });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Shipment</DialogTitle>
          <DialogDescription>
            Enter details for the new shipment to be added to trailer ID: {trailerId}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="stsJob">STS Job Number</Label>
            <Input id="stsJob" type="number" {...register('stsJob')} placeholder="e.g., 12345" />
            {errors.stsJob && <p className="text-sm text-destructive mt-1">{errors.stsJob.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g., 100" />
            {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <Label htmlFor="importer" className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Importer
            </Label>
            <Input id="importer" {...register('importer')} placeholder="e.g., Global Importers LLC" />
            {errors.importer && <p className="text-sm text-destructive mt-1">{errors.importer.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="flex items-center">
                <Weight className="mr-2 h-4 w-4 text-muted-foreground" /> Weight (kg) (Optional)
              </Label>
              <Input id="weight" type="number" step="0.1" {...register('weight')} placeholder="e.g., 1250.5" />
              {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>}
            </div>
            <div>
              <Label htmlFor="palletSpace" className="flex items-center">
                <Box className="mr-2 h-4 w-4 text-muted-foreground" /> Pallet Spaces (Optional)
              </Label>
              <Input id="palletSpace" type="number" {...register('palletSpace')} placeholder="e.g., 4" />
              {errors.palletSpace && <p className="text-sm text-destructive mt-1">{errors.palletSpace.message}</p>}
            </div>
          </div>

           <div>
            <Label htmlFor="locationNameInput" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Initial Location (Optional)
            </Label>
            <Input id="locationNameInput" {...register('locationNameInput')} placeholder="e.g., Bay C2" />
            {errors.locationNameInput && <p className="text-sm text-destructive mt-1">{errors.locationNameInput.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Release Document (Optional)
            </Label>
            <Input id="releaseDocument" type="file" {...register('releaseDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.releaseDocument && <p className="text-sm text-destructive mt-1">{(errors.releaseDocument as any)?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearanceDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Clearance Document (Optional)
            </Label>
            <Input id="clearanceDocument" type="file" {...register('clearanceDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.clearanceDocument && <p className="text-sm text-destructive mt-1">{(errors.clearanceDocument as any)?.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="released" {...register('released')} />
              <Label htmlFor="released" className="font-normal">Permitted to be Released</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cleared" {...register('cleared')} />
              <Label htmlFor="cleared" className="font-normal">Mark as Cleared</Label>
            </div>
          </div>


          <DialogFooter className="pt-4">
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
