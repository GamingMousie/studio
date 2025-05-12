
import { useState } from 'react';
import Link from 'next/link';
import type { Shipment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Edit3, Trash2, MoreVertical, FileText, CheckCircle2, CircleOff, Weight, Box, Pencil, FileUp, Users, Hash, Send, Briefcase } from 'lucide-react';
import ManageLocationsDialog from './ManageLocationsDialog';
import EditShipmentDialog from './EditShipmentDialog';
import AttachDocumentDialog from './AttachDocumentDialog';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
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
}

export default function ShipmentCard({ shipment, onDelete }: ShipmentCardProps) {
  const { updateShipment } = useWarehouse();
  const { toast } = useToast();

  const [isManageLocationsOpen, setIsManageLocationsOpen] = useState(false);
  const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false);
  const [isAttachDocumentOpen, setIsAttachDocumentOpen] = useState(false);
  const [attachDocumentType, setAttachDocumentType] = useState<'release' | 'clearance' | null>(null);
  const [isShipmentDeleteDialogOpen, setIsShipmentDeleteDialogOpen] = useState(false);

  const shipmentIdentifier = `STS Job: ${shipment.stsJob}`;

  const handleMarkAsPermitted = () => {
    if (!shipment.released) {
      setAttachDocumentType('release');
      setIsAttachDocumentOpen(true);
    } else {
      updateShipment(shipment.id, { released: false, releaseDocumentName: undefined });
      toast({ title: "Shipment Updated", description: `${shipmentIdentifier} marked as not permitted. Release document removed.` });
    }
  };

  const handleMarkAsCleared = () => {
    if (!shipment.cleared) {
      setAttachDocumentType('clearance');
      setIsAttachDocumentOpen(true);
    } else {
      updateShipment(shipment.id, { cleared: false, clearanceDocumentName: undefined });
      toast({ title: "Shipment Updated", description: `${shipmentIdentifier} marked as not cleared. Clearance document removed.` });
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

  const locations = shipment.locationNames;
  const isPendingAssignment = !locations || locations.length === 0 || (locations.length === 1 && locations[0] === 'Pending Assignment');


  return (
    <>
      <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              <Link href={`/shipments/${shipment.id}`} className="hover:underline text-primary flex items-center group">
                <Package className="mr-2 h-5 w-5 text-primary group-hover:animate-pulse" />
                STS Job: {shipment.stsJob}
              </Link>
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                   <Link href={`/shipments/${shipment.id}`} className="flex items-center w-full">
                     <Package className="mr-2 h-4 w-4" /> View Details
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditShipmentOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Shipment Details
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setIsManageLocationsOpen(true)}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Manage Locations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAsPermitted}>
                  {shipment.released ? <CircleOff className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.released ? 'Mark as Not Permitted' : 'Permit (Attach Doc)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAsCleared}>
                   {shipment.cleared ? <CircleOff className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.cleared ? 'Mark as Not Cleared' : 'Clear (Attach Doc)'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsShipmentDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Shipment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>ID: {shipment.id.substring(0,8)}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm flex-grow">
          {shipment.customerJobNumber && (
            <div className="flex items-center">
              <Briefcase className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Cust. Job No:</span>
              <span className="ml-1.5">{shipment.customerJobNumber}</span>
            </div>
          )}
          <p><span className="font-medium text-muted-foreground">Quantity:</span> {shipment.quantity}</p>

          <div className="flex items-center">
            <Send className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Exporter (Consignor):</span>
            <span className="ml-1.5">{shipment.exporter}</span>
          </div>

          <div className="flex items-center">
            <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Importer (Consignee):</span>
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

          <div className="flex items-start pt-1">
            <MapPin className="mr-1 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="font-medium text-muted-foreground mr-1">Locations:</span>
            <div className="flex flex-wrap gap-1">
              {isPendingAssignment ? (
                <Badge variant="outline" className="text-xs">Pending Assignment</Badge>
              ) : (
                locations.map((loc, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {loc} ({index + 1} of {locations.length})
                  </Badge>
                ))
              )}
            </div>
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
          <Button variant="outline" size="sm" className="w-full" onClick={() => setIsManageLocationsOpen(true)}>
            <MapPin className="mr-2 h-4 w-4" /> Manage Locations
          </Button>
        </CardFooter>
      </Card>

      {isManageLocationsOpen && (
        <ManageLocationsDialog
          isOpen={isManageLocationsOpen}
          setIsOpen={setIsManageLocationsOpen}
          shipmentToManage={shipment}
        />
      )}

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

      {isShipmentDeleteDialogOpen && (
        <ConfirmationDialog
          isOpen={isShipmentDeleteDialogOpen}
          setIsOpen={setIsShipmentDeleteDialogOpen}
          onConfirm={onDelete}
          title="Delete Shipment?"
          description={`Are you sure you want to delete shipment STS Job: ${shipment.stsJob} (ID: ${shipment.id.substring(0,8)}...)? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonVariant="destructive"
        />
      )}
    </>
  );
}
