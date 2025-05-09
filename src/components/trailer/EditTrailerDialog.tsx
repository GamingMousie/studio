
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, TrailerStatus, TrailerUpdateData } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

const editTrailerSchema = z.object({
  name: z.string().min(1, 'Trailer Name is required').max(50, 'Trailer Name too long'),
  company: z.string().max(50, 'Company name too long').optional(),
  status: z.enum(['Docked', 'In-Transit', 'Empty', 'Loading', 'Unloading']),
});

type EditTrailerFormData = z.infer<typeof editTrailerSchema>;

interface EditTrailerDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  trailerToEdit: Trailer;
}

const allStatuses: TrailerStatus[] = ['Docked', 'In-Transit', 'Empty', 'Loading', 'Unloading'];

export default function EditTrailerDialog({ isOpen, setIsOpen, trailerToEdit }: EditTrailerDialogProps) {
  const { updateTrailer } = useWarehouse();
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditTrailerFormData>({
    resolver: zodResolver(editTrailerSchema),
  });

  // Populate form with trailerToEdit data when dialog opens or trailerToEdit changes
  useEffect(() => {
    if (trailerToEdit && isOpen) {
      reset({
        name: trailerToEdit.name,
        company: trailerToEdit.company || '',
        status: trailerToEdit.status,
      });
    }
  }, [trailerToEdit, isOpen, reset]);

  // Ensure status is registered for react-hook-form with Select
   useEffect(() => {
    register('status');
  }, [register]);

  const selectedStatus = watch('status');

  const onSubmit: SubmitHandler<EditTrailerFormData> = (data) => {
    const updateData: TrailerUpdateData = {
      name: data.name,
      company: data.company || undefined, // Send undefined if empty string, so it can be cleared
      status: data.status,
    };

    updateTrailer(trailerToEdit.id, updateData);
    toast({
      title: "Success!",
      description: `Trailer "${data.name}" (ID: ${trailerToEdit.id}) updated.`,
    });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form to initial state of the trailer when dialog is closed without saving
     if (trailerToEdit) {
      reset({
        name: trailerToEdit.name,
        company: trailerToEdit.company || '',
        status: trailerToEdit.status,
      });
    }
  }

  if (!trailerToEdit) return null; // Should not happen if managed correctly by parent

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Edit className="mr-2 h-5 w-5" /> Edit Trailer</DialogTitle>
          <DialogDescription>
            Modify the details for trailer ID: {trailerToEdit.id}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="trailerIdDisplay">Trailer ID (Read-only)</Label>
            <Input id="trailerIdDisplay" value={trailerToEdit.id} readOnly className="bg-muted/50 cursor-not-allowed" />
          </div>
          <div>
            <Label htmlFor="name">Trailer Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Main Hauler" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input id="company" {...register('company')} placeholder="e.g., Logistics Inc." />
            {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
          </div>
           <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={selectedStatus || trailerToEdit.status} 
              onValueChange={(value) => setValue('status', value as TrailerStatus, { shouldValidate: true })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {allStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
          </div>
          <DialogFooter>
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
