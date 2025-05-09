
import { useState } from 'react';
import type { Shipment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Edit3, Trash2, MoreVertical, FileText, CheckCircle2, CircleOff, Weight, Box, Pencil, FileUp, UserCircle, Users, Hash } from 'lucide-react'; // Added Hash, UserCircle, Users
import AssignLocationDialog from './AssignLocationDialog';
import EditShipmentDialog from './EditShipmentDialog';
import AttachDocumentDialog from './AttachDocumentDialog'; 
import { useWarehouse } from '@/contexts/WarehouseContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

interface ShipmentCardProps {
  shipment: Shipment;
  onDelete: () => void; 
  onUpdateLocation: (newLocation: string) => void; 
}

export default function ShipmentCard({ shipment, onDelete, onUpdateLocation }: ShipmentCardProps) {
  const { updateShipment } = useWarehouse();
  const { toast } = useToast();

  const [isAssignLocationOpen, setIsAssignLocationOpen] = useState(false);
  const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false);
  const [isAttachDocumentOpen, setIsAttachDocumentOpen] = useState(false);
  const [attachDocumentType, setAttachDocumentType] = useState<'release' | 'clearance' | null>(null);

  const shipmentIdentifier = `STS Job: ${shipment.stsJob}`;

  const handleMarkAsPermitted = () => {
    if (!shipment.released) { 
      setAttachDocumentType('release');
      setIsAttachDocumentOpen(true);
    } else { 
      updateShipment(shipment.id, { released: false });
      toast({ title: "Shipment Updated", description: `${shipmentIdentifier} marked as not permitted to be released.` });
    }
  };

  const handleMarkAsCleared = () => {
    if (!shipment.cleared) { 
      setAttachDocumentType('clearance');
      setIsAttachDocumentOpen(true);
    } else { 
      updateShipment(shipment.id, { cleared: false });
      toast({ title: "Shipment Updated", description: `${shipmentIdentifier} marked as not cleared.` });
    }
  };

  const handleDocumentAttached = (
    attachedShipmentId: string, 
    docType: 'release' | 'clearance', 
    documentName: string
  ) => {
    if (docType === 'release') {
      updateShipment(attachedShipmentId, { releaseDocumentName: documentName, released: true });
    } else if (docType === 'clearance') {
      updateShipment(attachedShipmentId, { clearanceDocumentName: documentName, cleared: true });
    }
    setIsAttachDocumentOpen(false); 
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              STS Job: {shipment.stsJob}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditShipmentOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Shipment Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAssignLocationOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Assign/Edit Location
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAsPermitted}>
                  {shipment.released ? <CircleOff className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.released ? 'Mark as Not Permitted' : 'Mark as Permitted (Attach Doc)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAsCleared}>
                   {shipment.cleared ? <CircleOff className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.cleared ? 'Mark as Not Cleared' : 'Mark as Cleared (Attach Doc)'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Shipment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>ID: {shipment.id.substring(0,8)}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm flex-grow">
          <p><span className="font-medium text-muted-foreground">Quantity:</span> {shipment.quantity}</p>
          
          <div className="flex items-center">
            <UserCircle className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Exporter:</span>
            <span className="ml-1.5">{shipment.exporter}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Importer:</span>
            <span className="ml-1.5">{shipment.importer}</span>
          </div>
          
          {shipment.weight !== undefined && shipment.weight !== null && (
            <div className="flex items-center">
              <Weight className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Weight:</span>
              <span className="ml-1.5">{shipment.weight} kg</span>
            </div>
          )}

          {shipment.palletSpace !== undefined && shipment.palletSpace !== null && (
            <div className="flex items-center">
              <Box className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Pallet Spaces:</span>
              <span className="ml-1.5">{shipment.palletSpace}</span>
            </div>
          )}

          <div className="flex items-center pt-1">
            <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Location:</span>
            <Badge variant={shipment.locationName === "Pending Assignment" ? "outline" : "secondary"} className="ml-2">
              {shipment.locationName}
            </Badge>
          </div>

          <div className="flex items-center pt-1">
            {shipment.released ? <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-600" /> : <CircleOff className="mr-1.5 h-4 w-4 text-muted-foreground" />}
            <span className="font-medium text-muted-foreground">Permitted to be Released:</span>
            <span className="ml-1.5 font-semibold">{shipment.released ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center">
            {shipment.cleared ? <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-600" /> : <CircleOff className="mr-1.5 h-4 w-4 text-muted-foreground" />}
            <span className="font-medium text-muted-foreground">Cleared:</span>
            <span className="ml-1.5 font-semibold">{shipment.cleared ? 'Yes' : 'No'}</span>
          </div>

          {shipment.releaseDocumentName && (
            <div className="flex items-center pt-1">
              <FileText className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Release Doc:</span>
              <span className="ml-1.5 text-foreground truncate" title={shipment.releaseDocumentName}>{shipment.releaseDocumentName}</span>
            </div>
          )}
          {shipment.clearanceDocumentName && (
             <div className="flex items-center">
              <FileText className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Clearance Doc:</span>
              <span className="ml-1.5 text-foreground truncate" title={shipment.clearanceDocumentName}>{shipment.clearanceDocumentName}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3">
          <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAssignLocationOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Assign/Update Location
          </Button>
        </CardFooter>
      </Card>

      <AssignLocationDialog
        isOpen={isAssignLocationOpen}
        setIsOpen={setIsAssignLocationOpen}
        currentLocation={shipment.locationName}
        onSubmit={onUpdateLocation}
        shipmentIdentifier={shipmentIdentifier}
      />

      {isEditShipmentOpen && (
        <EditShipmentDialog
          isOpen={isEditShipmentOpen}
          setIsOpen={setIsEditShipmentOpen}
          shipmentToEdit={shipment}
        />
      )}

      {isAttachDocumentOpen && attachDocumentType && (
        <AttachDocumentDialog
          isOpen={isAttachDocumentOpen}
          setIsOpen={setIsAttachDocumentOpen}
          shipmentId={shipment.id}
          shipmentIdentifier={shipmentIdentifier}
          documentType={attachDocumentType}
          onDocumentAttached={handleDocumentAttached}
        />
      )}
    </>
  );
}
