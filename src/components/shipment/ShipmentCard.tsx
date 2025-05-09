import { useState } from 'react';
import type { Shipment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Edit3, Trash2, MoreVertical } from 'lucide-react';
import AssignLocationDialog from './AssignLocationDialog';
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
}

export default function ShipmentCard({ shipment, onDelete, onUpdateLocation }: ShipmentCardProps) {
  const [isAssignLocationOpen, setIsAssignLocationOpen] = useState(false);

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
                <DropdownMenuItem onClick={() => setIsAssignLocationOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Assign/Edit Location
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Shipment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>ID: {shipment.id.substring(0,8)}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm flex-grow">
          <p><span className="font-medium text-muted-foreground">Quantity:</span> {shipment.quantity}</p>
          <p><span className="font-medium text-muted-foreground">Destination:</span> {shipment.destination}</p>
          <div className="flex items-center">
            <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Location:</span>
            <Badge variant={shipment.locationName === "Pending Assignment" ? "outline" : "secondary"} className="ml-2">
              {shipment.locationName}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="pt-3">
          <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAssignLocationOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Assign Location
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
    </>
  );
}
