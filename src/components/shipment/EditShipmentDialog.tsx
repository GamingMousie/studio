
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment, ShipmentUpdateData } from '@/types';
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
import { FileText, Weight, Box, Edit, Users, MapPin, Send } from 'lucide-react';

const editShipmentSchema = z.object({
  stsJob: z.coerce.number().positive('STS Job must be a positive number'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  importer: z.string().min(1, 'Importer is required').max(50, 'Importer name too long'),
  exporter: z.string().min(1, 'Exporter is required').max(50, 'Exporter name too long'),
  locationNamesInput: z.string().optional(), // For comma-separated input
  releaseDocument: z.any().optional(),
  clearanceDocument: z.any().optional(),
  released: z.boolean().optional(),
  cleared: z.boolean().optional(),
  weight: z.coerce.number().positive('Weight must be positive').optional().nullable(),
  palletSpace: z.coerce.number().int('Pallet space must be an integer').positive('Pallet space must be positive').optional().nullable(),
});

type EditShipmentFormDataType = z.infer<typeof editShipmentSchema>;

interface EditShipmentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  shipmentToEdit: Shipment;
}

export default function EditShipmentDialog({ isOpen, setIsOpen, shipmentToEdit }: EditShipmentDialogProps) {
  const { updateShipment } = useWarehouse();
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting }, watch, setValue } = useForm<EditShipmentFormDataType>({
    resolver: zodResolver(editShipmentSchema),
    defaultValues: {
      stsJob: shipmentToEdit.stsJob,
      quantity: shipmentToEdit.quantity,
      importer: shipmentToEdit.importer,
      exporter: shipmentToEdit.exporter,
      locationNamesInput: (shipmentToEdit.locationNames || []).join(', '),
      released: shipmentToEdit.released,
      cleared: shipmentToEdit.cleared,
      weight: shipmentToEdit.weight ?? null,
      palletSpace: shipmentToEdit.palletSpace ?? null,
      releaseDocument: null,
      clearanceDocument: null,
    }
  });

  useEffect(() => {
    if (shipmentToEdit && isOpen) {
      reset({
        stsJob: shipmentToEdit.stsJob,
        quantity: shipmentToEdit.quantity,
        importer: shipmentToEdit.importer,
        exporter: shipmentToEdit.exporter,
        locationNamesInput: (shipmentToEdit.locationNames || []).join(', '),
        released: shipmentToEdit.released,
        cleared: shipmentToEdit.cleared,
        weight: shipmentToEdit.weight ?? null,
        palletSpace: shipmentToEdit.palletSpace ?? null,
      });
    }
  }, [shipmentToEdit, isOpen, reset]);


  const onSubmit: SubmitHandler<EditShipmentFormDataType> = (data) => {
    const newReleaseDocumentFile = data.releaseDocument && data.releaseDocument.length > 0 ? data.releaseDocument[0] : null;
    const newClearanceDocumentFile = data.clearanceDocument && data.clearanceDocument.length > 0 ? data.clearanceDocument[0] : null;

    const locationNamesArray = data.locationNamesInput
      ? data.locationNamesInput.split(',').map(name => name.trim()).filter(Boolean)
      : [];

    const updatedData: ShipmentUpdateData = {
      stsJob: data.stsJob,
      quantity: data.quantity,
      importer: data.importer,
      exporter: data.exporter,
      locationNames: locationNamesArray.length > 0 ? locationNamesArray : ['Pending Assignment'],
      releaseDocumentName: newReleaseDocumentFile ? newReleaseDocumentFile.name : shipmentToEdit.releaseDocumentName,
      clearanceDocumentName: newClearanceDocumentFile ? newClearanceDocumentFile.name : shipmentToEdit.clearanceDocumentName,
      released: data.released ?? false,
      cleared: data.cleared ?? false,
      weight: data.weight ?? undefined,
      palletSpace: data.palletSpace ?? undefined,
    };

    updateShipment(shipmentToEdit.id, updatedData);
    toast({
      title: "Success!",
      description: `Shipment STS Job "${data.stsJob}" updated.`,
    });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (shipmentToEdit) {
      reset({
          stsJob: shipmentToEdit.stsJob,
          quantity: shipmentToEdit.quantity,
          importer: shipmentToEdit.importer,
          exporter: shipmentToEdit.exporter,
          locationNamesInput: (shipmentToEdit.locationNames || []).join(', '),
          released: shipmentToEdit.released,
          cleared: shipmentToEdit.cleared,
          weight: shipmentToEdit.weight ?? null,
          palletSpace: shipmentToEdit.palletSpace ?? null,
          releaseDocument: null,
          clearanceDocument: null,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Edit className="mr-2 h-5 w-5" /> Edit Shipment</DialogTitle>
          <DialogDescription>
            Modify the details for shipment ID: {shipmentToEdit.id.substring(0,8)}...
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="stsJob">STS Job Number</Label>
            <Input id="stsJob" type="number" {...register('stsJob')} />
            {errors.stsJob && <p className="text-sm text-destructive mt-1">{errors.stsJob.message}</p>}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...register('quantity')} />
            {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <Label htmlFor="exporter" className="flex items-center">
              <Send className="mr-2 h-4 w-4 text-muted-foreground" /> Exporter (Consignor)
            </Label>
            <Input id="exporter" {...register('exporter')} />
            {errors.exporter && <p className="text-sm text-destructive mt-1">{errors.exporter.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="importer" className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Importer (Consignee)
            </Label>
            <Input id="importer" {...register('importer')} />
            {errors.importer && <p className="text-sm text-destructive mt-1">{errors.importer.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="flex items-center">
                <Weight className="mr-2 h-4 w-4 text-muted-foreground" /> Weight (kg)
              </Label>
              <Input id="weight" type="number" step="0.1" {...register('weight')} />
              {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>}
            </div>
            <div>
              <Label htmlFor="palletSpace" className="flex items-center">
                <Box className="mr-2 h-4 w-4 text-muted-foreground" /> Pallet Spaces
              </Label>
              <Input id="palletSpace" type="number" {...register('palletSpace')} />
              {errors.palletSpace && <p className="text-sm text-destructive mt-1">{errors.palletSpace.message}</p>}
            </div>
          </div>

           <div>
            <Label htmlFor="locationNamesInput" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Location Names (comma-separated)
            </Label>
            <Input id="locationNamesInput" {...register('locationNamesInput')} placeholder="e.g., Bay A1, Shelf C2, Zone 3" />
            {errors.locationNamesInput && <p className="text-sm text-destructive mt-1">{errors.locationNamesInput.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Release Document
            </Label>
            {shipmentToEdit.releaseDocumentName && !watch('releaseDocument') && (
                <p className="text-xs text-muted-foreground">Current: {shipmentToEdit.releaseDocumentName} (upload new to replace)</p>
            )}
            <Input id="releaseDocument" type="file" {...register('releaseDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.releaseDocument && <p className="text-sm text-destructive mt-1">{(errors.releaseDocument as any)?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearanceDocument" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Clearance Document
            </Label>
             {shipmentToEdit.clearanceDocumentName && !watch('clearanceDocument') && (
                <p className="text-xs text-muted-foreground">Current: {shipmentToEdit.clearanceDocumentName} (upload new to replace)</p>
            )}
            <Input id="clearanceDocument" type="file" {...register('clearanceDocument')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.clearanceDocument && <p className="text-sm text-destructive mt-1">{(errors.clearanceDocument as any)?.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="released" {...register('released')} defaultChecked={shipmentToEdit.released} onCheckedChange={(checked) => setValue('released', !!checked)} />
              <Label htmlFor="released" className="font-normal">Permitted to be Released</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cleared" {...register('cleared')} defaultChecked={shipmentToEdit.cleared} onCheckedChange={(checked) => setValue('cleared', !!checked)} />
              <Label htmlFor="cleared" className="font-normal">Mark as Cleared</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
