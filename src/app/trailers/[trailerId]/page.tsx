'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import ShipmentCard from '@/components/shipment/ShipmentCard';
import AddShipmentDialog from '@/components/shipment/AddShipmentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Package, Truck } from 'lucide-react';
import Link from 'next/link';

export default function TrailerShipmentsPage() {
  const router = useRouter();
  const params = useParams();
  const trailerId = params.trailerId as string;

  const { getTrailerById, getShipmentsByTrailerId, deleteShipment, updateShipmentLocation } = useWarehouse();
  
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isAddShipmentDialogOpen, setIsAddShipmentDialogOpen] = useState(false);

  useEffect(() => {
    if (trailerId) {
      const currentTrailer = getTrailerById(trailerId);
      if (currentTrailer) {
        setTrailer(currentTrailer);
        setShipments(getShipmentsByTrailerId(trailerId));
      } else {
        // Handle trailer not found, e.g., redirect or show error
        // For now, just log and potentially redirect
        console.error("Trailer not found");
        router.push('/'); // Redirect to home if trailer not found
      }
    }
  }, [trailerId, getTrailerById, getShipmentsByTrailerId, router]);


  if (!trailer) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-xl text-muted-foreground">Loading trailer details or trailer not found...</p>
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
          <div className="flex items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">{trailer.name}</CardTitle>
              <CardDescription>ID: {trailer.id} | Status: <span className="font-semibold">{trailer.status}</span></CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6 pt-4 border-t">
            <h2 className="text-2xl font-semibold flex items-center">
              <Package className="mr-3 h-7 w-7 text-primary" />
              Shipments ({shipments.length})
            </h2>
            <Button onClick={() => setIsAddShipmentDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Shipment
            </Button>
          </div>

          {shipments.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/20">
              <p className="text-xl text-muted-foreground">No shipments for this trailer yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Shipment" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onDelete={() => deleteShipment(shipment.id)}
                  onUpdateLocation={(newLocation) => updateShipmentLocation(shipment.id, newLocation)}
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
