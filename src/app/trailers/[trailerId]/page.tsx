'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import ShipmentCard from '@/components/shipment/ShipmentCard';
import AddShipmentDialog from '@/components/shipment/AddShipmentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Package, Truck, Briefcase, CalendarDays, Weight, Tag, Printer } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export default function TrailerShipmentsPage() {
  const router = useRouter();
  const params = useParams();
  const trailerId = params.trailerId as string;

  const {
    getShipmentsByTrailerId,
    deleteShipment,
    trailers: trailersFromContext, // Get the full list of trailers from context
  } = useWarehouse();

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [isAddShipmentDialogOpen, setIsAddShipmentDialogOpen] = useState(false);
  const [isTrailerFound, setIsTrailerFound] = useState<boolean | null>(null); // null: loading, true: found, false: not found


  useEffect(() => {
    // Ensure trailerId is a non-empty string before proceeding
    if (typeof trailerId === 'string' && trailerId.trim() !== '') {
      const currentTrailer = trailersFromContext.find(t => t.id === trailerId);
      if (currentTrailer) {
        setTrailer(currentTrailer);
        setIsTrailerFound(true);
      } else {
        // If trailersFromContext is populated (guaranteed by initialTrailers or localStorage data)
        // and the trailer is not found, then it's genuinely not in the current dataset.
        setIsTrailerFound(false);
        setTrailer(null);
      }
    } else {
      // trailerId is invalid or not yet available
      setIsTrailerFound(false);
      setTrailer(null);
    }
  }, [trailerId, trailersFromContext]); // Depend on trailerId and the raw trailers array from context

  const shipmentsForCurrentTrailer = useMemo(() => {
    if (!trailerId || !isTrailerFound || !trailer) return [];
    return getShipmentsByTrailerId(trailerId);
  }, [trailerId, isTrailerFound, trailer, getShipmentsByTrailerId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPpp'); 
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };


  if (isTrailerFound === null) { 
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-xl text-muted-foreground">Loading trailer details...</p>
      </div>
    );
  }

  if (isTrailerFound === false || !trailer) { 
     return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
          <Truck className="h-16 w-16 text-muted-foreground" />
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/trailers/${trailer.id}/print`}>
            <Printer className="mr-2 h-4 w-4" /> Print Trailer ACP Form
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
              {trailer.weight !== undefined && trailer.weight !== null && (
                <CardDescription className="mt-1 flex items-center">
                  <Weight className="mr-2 h-4 w-4 text-muted-foreground" />
                  Weight: <span className="font-semibold ml-1">{trailer.weight} kg</span>
                </CardDescription>
              )}
               {trailer.arrivalDate && (
                <CardDescription className="mt-1 flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  Arrival: <span className="font-semibold ml-1">{formatDate(trailer.arrivalDate)}</span>
                </CardDescription>
              )}
              {trailer.storageExpiryDate && (
                <CardDescription className="mt-1 flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  Storage Expiry: <span className="font-semibold ml-1">{formatDate(trailer.storageExpiryDate)}</span>
                </CardDescription>
              )}
              {trailer.customField1 && (
                <CardDescription className="mt-1 flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  T1.1: <span className="font-semibold ml-1">{trailer.customField1}</span>
                </CardDescription>
              )}
              {trailer.customField2 && (
                <CardDescription className="mt-1 flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  T1.2: <span className="font-semibold ml-1">{trailer.customField2}</span>
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
