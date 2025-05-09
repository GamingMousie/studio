
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import ShipmentCard from '@/components/shipment/ShipmentCard';
import AddShipmentDialog from '@/components/shipment/AddShipmentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Package, Truck, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function TrailerShipmentsPage() {
  const router = useRouter();
  const params = useParams();
  const trailerId = params.trailerId as string;

  const {
    getTrailerById,
    getShipmentsByTrailerId,
    deleteShipment,
    updateShipmentLocation,
    updateShipmentReleasedStatus,
    updateShipmentClearedStatus,
  } = useWarehouse();

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [isAddShipmentDialogOpen, setIsAddShipmentDialogOpen] = useState(false);
  const [isTrailerFound, setIsTrailerFound] = useState<boolean | null>(null);


  useEffect(() => {
    if (trailerId) {
      const currentTrailer = getTrailerById(trailerId);
      if (currentTrailer) {
        setTrailer(currentTrailer);
        setIsTrailerFound(true);
      } else {
        setIsTrailerFound(false);
        // Optionally, you could redirect here or show a more prominent "not found" message earlier.
        // For now, the main render logic will handle showing "not found".
        console.error("Trailer not found during effect execution");
      }
    }
  }, [trailerId, getTrailerById]); // Removed router from deps as it's stable, add it back if navigation logic depends on it changing.

  const shipmentsForCurrentTrailer = useMemo(() => {
    if (!trailerId || !isTrailerFound) return []; // Ensure trailer is found before getting shipments
    return getShipmentsByTrailerId(trailerId);
  }, [trailerId, isTrailerFound, getShipmentsByTrailerId]);


  if (isTrailerFound === null) { // Initial loading state for trailer check
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-xl text-muted-foreground">Loading trailer details...</p>
      </div>
    );
  }

  if (isTrailerFound === false) { // Trailer explicitly not found
     return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
          <p className="text-2xl font-semibold text-destructive">Trailer Not Found</p>
          <p className="text-xl text-muted-foreground">Could not find trailer with ID: {trailerId}</p>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
     );
  }
  
  if (!trailer) { // Should be covered by isTrailerFound logic, but as a fallback
     return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-xl text-muted-foreground">Loading trailer data...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Truck className="h-12 w-12 text-primary mt-1" />
            <div>
              <CardTitle className="text-3xl">{trailer.name}</CardTitle>
              <CardDescription>
                ID: {trailer.id} | Status: <span className="font-semibold">{trailer.status}</span>
              </CardDescription>
              {trailer.company && (
                <CardDescription className="mt-1 flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  Company: <span className="font-semibold ml-1">{trailer.company}</span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6 pt-4 border-t">
            <h2 className="text-2xl font-semibold flex items-center">
              <Package className="mr-3 h-7 w-7 text-primary" />
              Shipments ({shipmentsForCurrentTrailer.length})
            </h2>
            <Button onClick={() => setIsAddShipmentDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Shipment
            </Button>
          </div>

          {shipmentsForCurrentTrailer.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/20">
              <p className="text-xl text-muted-foreground">No shipments for this trailer yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Shipment" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipmentsForCurrentTrailer.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onDelete={() => deleteShipment(shipment.id)}
                  onUpdateLocation={(newLocation) => updateShipmentLocation(shipment.id, newLocation)}
                  onToggleReleased={() => updateShipmentReleasedStatus(shipment.id, !shipment.released)}
                  onToggleCleared={() => updateShipmentClearedStatus(shipment.id, !shipment.cleared)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddShipmentDialog
        isOpen={isAddShipmentDialogOpen}
        setIsOpen={setIsAddShipmentDialogOpen}
        trailerId={trailer.id}
      />
    </div>
  );
}

