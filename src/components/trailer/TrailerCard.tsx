
import { useState } from 'react';
import Link from 'next/link';
import type { Trailer, TrailerStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Edit, Trash2, MoreVertical, ChevronRight, Briefcase, CalendarDays } from 'lucide-react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditTrailerDialog from './EditTrailerDialog'; 
import ConfirmationDialog from '@/components/shared/ConfirmationDialog'; // Import ConfirmationDialog
import { format, parseISO } from 'date-fns';


interface TrailerCardProps {
  trailer: Trailer;
  viewMode: 'grid' | 'list';
  onDelete: () => void;
  onStatusChange: (newStatus: TrailerStatus) => void;
}

const statusColors: Record<TrailerStatus, string> = {
  Docked: 'bg-blue-500',
  'In-Transit': 'bg-yellow-500',
  Empty: 'bg-gray-500',
  Loading: 'bg-green-500',
  Unloading: 'bg-purple-500',
};
const allStatuses: TrailerStatus[] = ['Docked', 'In-Transit', 'Empty', 'Loading', 'Unloading'];


export default function TrailerCard({ trailer, viewMode, onDelete, onStatusChange }: TrailerCardProps) {
  const { getShipmentsByTrailerId } = useWarehouse();
  const shipments = getShipmentsByTrailerId(trailer.id);
  const shipmentCount = shipments.length;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const DateDisplay = ({ label, dateString, icon: Icon }: { label: string, dateString?: string, icon: React.ElementType }) => {
    if (!dateString) return null;
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        <span>{label}: {formatDate(dateString)}</span>
      </div>
    );
  }

  const GridViewContent = () => (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl group-hover:text-primary transition-colors">{trailer.name}</CardTitle>
        <Truck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <CardDescription>ID: {trailer.id}</CardDescription>
      {trailer.company && (
        <div className="mt-1 flex items-center text-xs text-muted-foreground">
          <Briefcase className="mr-1.5 h-3.5 w-3.5" /> 
          <span>{trailer.company}</span>
        </div>
      )}
      <DateDisplay label="Arrived" dateString={trailer.arrivalDate} icon={CalendarDays} />
      <DateDisplay label="Storage Exp" dateString={trailer.storageExpiryDate} icon={CalendarDays} />
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status:</span>
           <Select value={trailer.status} onValueChange={(newStatus) => onStatusChange(newStatus as TrailerStatus)}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {allStatuses.map(status => (
                <SelectItem key={status} value={status} className="text-xs">
                  <Badge className={`${statusColors[status]} text-white mr-2 w-3 h-3 p-0 inline-block rounded-full`} />
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipments:</span>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{shipmentCount}</span>
          </div>
        </div>
      </div>
    </>
  );


  const cardActions = (
    <div className="flex items-center justify-between w-full">
       <Link href={`/trailers/${trailer.id}`} legacyBehavior>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
          Manage Shipments <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Trailer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Trailer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        <Card className="group transition-all hover:shadow-lg w-full">
          <div className="p-4 flex items-center justify-between">
            <div className="flex-grow">
              <Link href={`/trailers/${trailer.id}`} className="block">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{trailer.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {trailer.id}</p>
                {trailer.company && (
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Briefcase className="mr-1.5 h-3 w-3" />
                    <span>{trailer.company}</span>
                  </div>
                )}
                <DateDisplay label="Arrived" dateString={trailer.arrivalDate} icon={CalendarDays} />
                <DateDisplay label="Storage Exp" dateString={trailer.storageExpiryDate} icon={CalendarDays} />
              </Link>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Badge className={`${statusColors[trailer.status]} text-white text-xs px-1.5 py-0.5`}>{trailer.status}</Badge>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{shipmentCount} Shipments</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={trailer.status} onValueChange={(newStatus) => onStatusChange(newStatus as TrailerStatus)}>
                <SelectTrigger className="h-9 text-xs w-[130px] hidden sm:flex">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map(status => (
                    <SelectItem key={status} value={status} className="text-xs">
                      <Badge className={`${statusColors[status]} text-white mr-2 w-3 h-3 p-0 inline-block rounded-full`} />
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cardActions}
            </div>
          </div>
        </Card>
        {isEditDialogOpen && (
          <EditTrailerDialog 
            isOpen={isEditDialogOpen} 
            setIsOpen={setIsEditDialogOpen} 
            trailerToEdit={trailer} 
          />
        )}
        {isDeleteDialogOpen && (
          <ConfirmationDialog
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onConfirm={onDelete}
            title="Delete Trailer?"
            description={`Are you sure you want to delete trailer "${trailer.name}" (ID: ${trailer.id})? This will also delete all its ${shipmentCount} associated shipments. This action cannot be undone.`}
            confirmText="Delete"
            confirmButtonVariant="destructive"
          />
        )}
      </>
    );
  }

  // Grid View
  return (
    <>
      <Card className="group transition-all hover:shadow-lg flex flex-col h-full">
        <Link href={`/trailers/${trailer.id}`} className="block flex-grow flex flex-col">
          <CardHeader className="pb-2">
            <Badge className={`${statusColors[trailer.status]} text-white text-xs px-1.5 py-0.5 self-start`}>{trailer.status}</Badge>
          </CardHeader>
          <CardContent className="flex-grow">
            <GridViewContent />
          </CardContent>
        </Link>
        <CardFooter className="pt-4">
          {cardActions}
        </CardFooter>
      </Card>
      {isEditDialogOpen && (
        <EditTrailerDialog 
          isOpen={isEditDialogOpen} 
          setIsOpen={setIsEditDialogOpen} 
          trailerToEdit={trailer} 
        />
      )}
      {isDeleteDialogOpen && (
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onConfirm={onDelete}
          title="Delete Trailer?"
          description={`Are you sure you want to delete trailer "${trailer.name}" (ID: ${trailer.id})? This will also delete all its ${shipmentCount} associated shipments. This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonVariant="destructive"
        />
      )}
    </>
  );
}
