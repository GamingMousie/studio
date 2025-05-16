
import { useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Weight, Tag, FileText, UploadCloud } from "lucide-react"; // Added FileText, UploadCloud
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

// Internal form data type to handle Date objects from picker and new custom fields
type EditTrailerFormDataInternal = {
  name: string;
  company?: string;
  status: TrailerStatus;
  arrivalDate?: Date | null;
  storageExpiryDate?: Date | null;
  weight?: number | null;
  customField1?: string;
  customField2?: string;
  outturnReportDocument?: FileList | File | null; // For new file uploads
};

const allStatuses: TrailerStatus[] = ['Scheduled', 'Arrived', 'Loading', 'Offloading', 'Devanned'];

const editTrailerSchema = z.object({
  name: z.string().min(1, 'Trailer Name is required').max(50, 'Trailer Name too long'),
  company: z.string().max(50, 'Company name too long').optional(),
  status: z.enum(allStatuses as [TrailerStatus, ...TrailerStatus[]]),
  arrivalDate: z.date().nullable().optional(),
  storageExpiryDate: z.date().nullable().optional(),
  weight: z.coerce.number().positive('Weight must be a positive number').optional().nullable(),
  customField1: z.string().max(50, 'T1.1 value too long').optional(),
  customField2: z.string().max(50, 'T1.2 value too long').optional(),
  outturnReportDocument: z.any().optional(), // For new file uploads
}).refine(data => {
  if (data.arrivalDate && data.storageExpiryDate && data.storageExpiryDate < data.arrivalDate) {
    return false;
  }
  return true;
}, {
  message: "Storage expiry date cannot be before arrival date.",
  path: ["storageExpiryDate"],
});


interface EditTrailerDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  trailerToEdit: Trailer;
}


export default function EditTrailerDialog({ isOpen, setIsOpen, trailerToEdit }: EditTrailerDialogProps) {
  const { updateTrailer } = useWarehouse();
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<EditTrailerFormDataInternal>({
    resolver: zodResolver(editTrailerSchema),
  });

  useEffect(() => {
    if (trailerToEdit && isOpen) {
      reset({
        name: trailerToEdit.name,
        company: trailerToEdit.company || '',
        status: trailerToEdit.status,
        arrivalDate: trailerToEdit.arrivalDate ? parseISO(trailerToEdit.arrivalDate) : null,
        storageExpiryDate: trailerToEdit.storageExpiryDate ? parseISO(trailerToEdit.storageExpiryDate) : null,
        weight: trailerToEdit.weight ?? null,
        customField1: trailerToEdit.customField1 || '',
        customField2: trailerToEdit.customField2 || '',
        outturnReportDocument: null, // Reset file input
      });
    }
  }, [trailerToEdit, isOpen, reset]);

   useEffect(() => {
    register('status');
  }, [register]);

  const selectedStatus = watch('status');
  const currentOutturnReportDocumentName = trailerToEdit?.outturnReportDocumentName;
  const newOutturnDocumentFile = watch('outturnReportDocument');


  const onSubmit: SubmitHandler<EditTrailerFormDataInternal> = (data) => {
    let outturnDocName: string | null | undefined = trailerToEdit.outturnReportDocumentName;

    if (data.outturnReportDocument && data.outturnReportDocument.length > 0) {
      outturnDocName = data.outturnReportDocument[0].name;
    } else if (data.outturnReportDocument === null) { // Explicitly cleared
        outturnDocName = null;
    }


    const updateData: TrailerUpdateData = {
      name: data.name,
      company: data.company || undefined,
      status: data.status,
      arrivalDate: data.arrivalDate ? data.arrivalDate.toISOString() : null,
      storageExpiryDate: data.storageExpiryDate ? data.storageExpiryDate.toISOString() : null,
      weight: data.weight ?? undefined,
      customField1: data.customField1 || undefined,
      customField2: data.customField2 || undefined,
      outturnReportDocumentName: outturnDocName,
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
     if (trailerToEdit) {
      reset({
        name: trailerToEdit.name,
        company: trailerToEdit.company || '',
        status: trailerToEdit.status,
        arrivalDate: trailerToEdit.arrivalDate ? parseISO(trailerToEdit.arrivalDate) : null,
        storageExpiryDate: trailerToEdit.storageExpiryDate ? parseISO(trailerToEdit.storageExpiryDate) : null,
        weight: trailerToEdit.weight ?? null,
        customField1: trailerToEdit.customField1 || '',
        customField2: trailerToEdit.customField2 || '',
        outturnReportDocument: null,
      });
    }
  }

  if (!trailerToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Edit className="mr-2 h-5 w-5" /> Edit Trailer</DialogTitle>
          <DialogDescription>
            Modify the details for trailer ID: {trailerToEdit.id}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
            <Label htmlFor="weight" className="flex items-center">
              <Weight className="mr-2 h-4 w-4 text-muted-foreground" /> Weight (kg) (Optional)
            </Label>
            <Input id="weight" type="number" step="any" {...register('weight')} placeholder="e.g., 3500" />
            {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>}
          </div>
          <div>
            <Label htmlFor="customField1" className="flex items-center">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" /> T1.1 (Optional)
            </Label>
            <Input id="customField1" {...register('customField1')} placeholder="Value for T1.1" />
            {errors.customField1 && <p className="text-sm text-destructive mt-1">{errors.customField1.message}</p>}
          </div>
          <div>
            <Label htmlFor="customField2" className="flex items-center">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" /> T1.2 (Optional)
            </Label>
            <Input id="customField2" {...register('customField2')} placeholder="Value for T1.2" />
            {errors.customField2 && <p className="text-sm text-destructive mt-1">{errors.customField2.message}</p>}
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

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrivalDate">Arrival Date (Optional)</Label>
              <Controller
                name="arrivalDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => field.onChange(date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.arrivalDate && <p className="text-sm text-destructive mt-1">{errors.arrivalDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="storageExpiryDate">Storage Expiry Date (Optional)</Label>
               <Controller
                name="storageExpiryDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => field.onChange(date || null)}
                         disabled={(date) =>
                          watch("arrivalDate") ? date < watch("arrivalDate")! : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.storageExpiryDate && <p className="text-sm text-destructive mt-1">{errors.storageExpiryDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outturnReportDocument" className="flex items-center">
              <UploadCloud className="mr-2 h-4 w-4 text-muted-foreground" /> Out-turn Report PDF (Optional)
            </Label>
            {currentOutturnReportDocumentName && !newOutturnDocumentFile?.[0] && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <FileText className="mr-1 h-3.5 w-3.5" /> Current: {currentOutturnReportDocumentName}
                </p>
            )}
            <Input id="outturnReportDocument" type="file" {...register('outturnReportDocument')} accept=".pdf" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {errors.outturnReportDocument && <p className="text-sm text-destructive mt-1">{(errors.outturnReportDocument as any)?.message}</p>}
            <p className="text-xs text-muted-foreground">Upload a new PDF to replace the current one. Max 5MB.</p>
             {currentOutturnReportDocumentName && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-xs text-destructive p-0 h-auto"
                onClick={() => {
                  setValue('outturnReportDocument', null); // This should signal to clear
                  // We might need a more explicit way if null isn't enough,
                  // e.g., a hidden field or separate state, but let's try this.
                  // The onSubmit logic will check if data.outturnReportDocument is explicitly null
                  // and then set trailer.outturnReportDocumentName to null.
                  toast({ title: "Out-turn Report Cleared", description: "The out-turn report association will be removed upon saving."});
                }}
              >
                Clear Current Out-turn Report
              </Button>
            )}
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
