import { useEffect, useRef, useState } from 'react';
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
import { Camera, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('locationName', currentLocation === "Pending Assignment" ? "" : currentLocation);
    } else {
      // Reset scanning state when dialog is closed
      setIsScanning(false);
      setHasCameraPermission(null);
    }
  }, [isOpen, currentLocation, setValue]);

  useEffect(() => {
    if (isScanning) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('getUserMedia not supported');
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Your browser does not support camera access. Please ensure you are using a secure (HTTPS) connection.',
          });
          setHasCameraPermission(false);
          setIsScanning(false);
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setActiveStream(stream);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
          // Keep isScanning true to show the error message, user can cancel.
        }
      };
      getCameraPermission();
    } else {
      // Cleanup: Stop video stream if active
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        setActiveStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
      // Optionally reset camera permission status for next attempt
      // setHasCameraPermission(null); 
    }

    // Cleanup function for when the component unmounts or isScanning dependency changes
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        // No need to set activeStream to null here as it's managed by state and effect re-runs
      }
    };
  }, [isScanning, toast]); // removed activeStream from deps

  const handleSimulateScan = () => {
    const scannedValue = `SCANNED-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setValue('locationName', scannedValue, { shouldValidate: true });
    toast({
      title: "Barcode Scanned (Simulated)",
      description: `Location set to ${scannedValue}. You can now save.`,
    });
    setIsScanning(false); // Stop scanning and return to form
  };

  const handleFormSubmit: SubmitHandler<LocationFormData> = (data) => {
    onSubmit(data.locationName);
    toast({
      title: "Location Updated!",
      description: `Location for "${shipmentContent}" set to ${data.locationName}.`,
    });
    closeDialogCleanup();
  };
  
  const closeDialogCleanup = () => {
    setIsOpen(false);
    setIsScanning(false);
    reset({ locationName: currentLocation === "Pending Assignment" ? "" : currentLocation });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeDialogCleanup(); else setIsOpen(true); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isScanning ? 'Scan Location Barcode' : 'Assign Warehouse Location'}</DialogTitle>
          {!isScanning && (
            <DialogDescription>
              Update the location for shipment: <span className="font-semibold">{shipmentContent}</span>.
              Current location: <span className="font-semibold">{currentLocation}</span>.
            </DialogDescription>
          )}
        </DialogHeader>

        {isScanning ? (
          <div className="space-y-4 py-4">
            {hasCameraPermission === null && <p className="text-muted-foreground text-center">Requesting camera access...</p>}
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Camera access was denied or is unavailable. Please check your browser permissions. You can cancel scanning and enter manually.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {hasCameraPermission && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3/4 h-1/3 border-2 border-dashed border-background/70 rounded-lg opacity-75"></div>
                    </div>
                )}
            </div>


            <Button onClick={handleSimulateScan} className="w-full" disabled={hasCameraPermission !== true}>
              Simulate Successful Scan
            </Button>
            <Button variant="outline" onClick={() => setIsScanning(false)} className="w-full">
              Cancel Scan & Enter Manually
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="locationName">New Location Name</Label>
              <Input
                id="locationName"
                {...register('locationName')}
                placeholder="e.g., Shelf A1, Bay 5, or scan barcode"
              />
              {errors.locationName && <p className="text-sm text-destructive mt-1">{errors.locationName.message}</p>}
            </div>
            <Button type="button" variant="outline" onClick={() => setIsScanning(true)} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Scan Barcode for Location
            </Button>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeDialogCleanup}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Location'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
