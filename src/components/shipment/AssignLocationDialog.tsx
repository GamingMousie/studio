import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const locationSchema = z.object({
  locationName: z.string().min(1, 'Location name is required').max(30, 'Location name too long'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface AssignLocationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentLocation: string;
  onSubmit: (newLocation: string) => void;
  shipmentContent: string;
}

export default function AssignLocationDialog({
  isOpen,
  setIsOpen,
  currentLocation,
  onSubmit,
  shipmentContent,
}: AssignLocationDialogProps) {
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locationName: currentLocation === "Pending Assignment" ? "" : currentLocation,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValue('locationName', currentLocation === "Pending Assignment" ? "" : currentLocation);
    }
  }, [isOpen, currentLocation, setValue]);

  const handleFormSubmit: SubmitHandler<LocationFormData> = (data) => {
    onSubmit(data.locationName);
    toast({
      title: "Location Updated!",
      description: `Location for "${shipmentContent}" set to ${data.locationName}.`,
    });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Warehouse Location</DialogTitle>
          <DialogDescription>
            Update the location for shipment: <span className="font-semibold">{shipmentContent}</span>.
            Current location: <span className="font-semibold">{currentLocation}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="locationName">New Location Name</Label>
            <Input
              id="locationName"
              {...register('locationName')}
              placeholder="e.g., Shelf A1, Bay 5"
            />
            {errors.locationName && <p className="text-sm text-destructive mt-1">{errors.locationName.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
