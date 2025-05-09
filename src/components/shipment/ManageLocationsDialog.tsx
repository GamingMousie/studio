
import { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, AlertTriangle, MapPin, XIcon, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Shipment } from '@/types';
import { useWarehouse } from '@/contexts/WarehouseContext';

const newLocationSchema = z.object({
  newLocationName: z.string().min(1, 'Location name cannot be empty').max(30, 'Location name too long'),
});
type NewLocationFormData = z.infer<typeof newLocationSchema>;

interface ManageLocationsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  shipmentToManage: Shipment;
}

export default function ManageLocationsDialog({
  isOpen,
  setIsOpen,
  shipmentToManage,
}: ManageLocationsDialogProps) {
  const { updateShipment } = useWarehouse();
  const { toast } = useToast();
  
  const { register, handleSubmit: handleNewLocationSubmit, reset: resetNewLocationForm, setValue: setNewLocationValue, formState: { errors: newLocationErrors } } = useForm<NewLocationFormData>({
    resolver: zodResolver(newLocationSchema),
  });

  const [currentEditedLocations, setCurrentEditedLocations] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && shipmentToManage) {
      // Initialize with current locations, filtering out "Pending Assignment" if other locations exist
      const initialLocations = shipmentToManage.locationNames || [];
      if (initialLocations.length > 1 && initialLocations.includes('Pending Assignment')) {
        setCurrentEditedLocations(initialLocations.filter(loc => loc !== 'Pending Assignment'));
      } else {
        setCurrentEditedLocations(initialLocations);
      }
      resetNewLocationForm({ newLocationName: "" });
    } else {
      setIsScanning(false); // Turn off scanner when dialog closes
      setHasCameraPermission(null); // Reset camera permission state
    }
  }, [isOpen, shipmentToManage, resetNewLocationForm]);

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
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        setActiveStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }
    return () => { // Cleanup on unmount or when isScanning changes
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, toast, activeStream]); // Added activeStream to dependency array

  const handleAddLocationToList = (data: NewLocationFormData) => {
    const nameToAdd = data.newLocationName.trim();
    if (nameToAdd && !currentEditedLocations.includes(nameToAdd)) {
      let newLocations = [...currentEditedLocations];
      // Remove "Pending Assignment" if it's the only item and a real location is being added
      if (newLocations.length === 1 && newLocations[0] === 'Pending Assignment') {
        newLocations = [];
      }
      newLocations.push(nameToAdd);
      setCurrentEditedLocations(newLocations);
    }
    resetNewLocationForm({ newLocationName: "" });
  };

  const handleRemoveLocationFromList = (locationToRemove: string) => {
    setCurrentEditedLocations(currentEditedLocations.filter(loc => loc !== locationToRemove));
  };

  const handleSimulateScan = () => {
    const scannedValue = `SCANNED-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setNewLocationValue('newLocationName', scannedValue, { shouldValidate: true });
    toast({
      title: "Barcode Scanned (Simulated)",
      description: `Location "${scannedValue}" ready to be added.`,
    });
    setIsScanning(false); 
  };

  const handleSaveChanges = () => {
    const finalLocations = currentEditedLocations.length > 0 ? currentEditedLocations : ['Pending Assignment'];
    updateShipment(shipmentToManage.id, { locationNames: finalLocations });
    toast({
      title: "Locations Updated!",
      description: `Locations for shipment STS Job: ${shipmentToManage.stsJob} have been saved.`,
    });
    closeDialogCleanup();
  };
  
  const closeDialogCleanup = () => {
    setIsOpen(false);
    setIsScanning(false);
    resetNewLocationForm({ newLocationName: "" });
    // currentEditedLocations will reset on next open via useEffect
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeDialogCleanup(); else setIsOpen(true); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" /> 
            {isScanning ? 'Scan Location Barcode' : 'Manage Shipment Locations'}
          </DialogTitle>
          {!isScanning && (
            <DialogDescription>
              For Shipment STS Job: <span className="font-semibold">{shipmentToManage.stsJob}</span>. Add or remove locations.
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
                  Camera access denied or unavailable. Check browser permissions or enter manually.
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
          <div className="py-4 space-y-6">
            <div>
              <Label className="text-sm font-medium">Current Locations:</Label>
              <div className="mt-2 flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-muted/50">
                {currentEditedLocations.length === 0 || (currentEditedLocations.length === 1 && currentEditedLocations[0] === 'Pending Assignment') ? (
                  <Badge variant="outline">Pending Assignment</Badge>
                ) : (
                  currentEditedLocations.filter(loc => loc !== 'Pending Assignment').map((loc, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {loc}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-destructive/20"
                        onClick={() => handleRemoveLocationFromList(loc)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleNewLocationSubmit(handleAddLocationToList)} className="space-y-3">
              <div>
                <Label htmlFor="newLocationName">Add New Location</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="newLocationName"
                    {...register('newLocationName')}
                    placeholder="e.g., Shelf A1 or scan"
                    className="flex-grow"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                {newLocationErrors.newLocationName && <p className="text-sm text-destructive mt-1">{newLocationErrors.newLocationName.message}</p>}
              </div>
              <Button type="button" variant="outline" onClick={() => setIsScanning(true)} className="w-full">
                <Camera className="mr-2 h-4 w-4" /> Scan Barcode for Location
              </Button>
            </form>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeDialogCleanup}>Cancel</Button>
              <Button onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
