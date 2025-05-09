
import { useState } from 'react';
import type { Shipment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Edit3, Trash2, MoreVertical, FileText, CheckCircle2, CircleOff, Weight, Box, Pencil } from 'lucide-react';
import AssignLocationDialog from './AssignLocationDialog';
import EditShipmentDialog from './EditShipmentDialog'; // Import the new dialog
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShipmentCardProps {
  shipment: Shipment;
  onDelete: () => void;
  onUpdateLocation: (newLocation: string) => void;
  onToggleReleased: () => void;
  onToggleCleared: () => void;
}

export default function ShipmentCard({ shipment, onDelete, onUpdateLocation, onToggleReleased, onToggleCleared }: ShipmentCardProps) {
  const [isAssignLocationOpen, setIsAssignLocationOpen] = useState(false);
  const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false); // State for edit dialog

  const handleToggleReleased = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onToggleReleased();
  };

  const handleToggleCleared = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCleared();
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
              {shipment.contentDescription}
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
                <DropdownMenuItem onClick={handleToggleReleased}>
                  {shipment.released ? <CircleOff className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.released ? 'Mark as Not Permitted' : 'Mark as Permitted to be Released'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleCleared}>
                  {shipment.cleared ? <CircleOff className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />}
                  {shipment.cleared ? 'Mark as Not Cleared' : 'Mark as Cleared'}
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
          <p><span className="font-medium text-muted-foreground">Exporter:</span> {shipment.exporter}</p>
          
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
        shipmentContent={shipment.contentDescription}
      />

      {/* Conditionally render EditShipmentDialog */}
      {isEditShipmentOpen && (
        <EditShipmentDialog
          isOpen={isEditShipmentOpen}
          setIsOpen={setIsEditShipmentOpen}
          shipmentToEdit={shipment}
        />
      )}
    </>
  );
}
