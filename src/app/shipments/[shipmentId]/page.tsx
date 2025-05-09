
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, Package, MapPin, CheckCircle2, CircleOff, FileText, UserCircle, Users, Weight, Box, Truck, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function SingleShipmentPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.shipmentId as string;

  const { getShipmentById, getTrailerById } = useWarehouse(); 

  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (shipmentId && getShipmentById) {
      const currentShipment = getShipmentById(shipmentId);
      setShipment(currentShipment);
    }
  }, [shipmentId, getShipmentById]);

  const trailer = shipment?.trailerId ? getTrailerById(shipment.trailerId) : null;

  const canPrint = shipment?.cleared && shipment?.released;

  const handlePrint = () => {
    if (canPrint) {
      window.print();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPpp'); 
    } catch (error) {
      return "Invalid Date";
    }
  };


  if (!isClient || shipment === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (shipment === null) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-2xl font-semibold text-destructive">Shipment Not Found</p>
        <p className="text-xl text-muted-foreground">Could not find shipment with ID: {shipmentId}</p>
        <Button variant="outline" onClick={() => router.push('/shipments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Shipments
        </Button>
      </div>
    );
  }
  
  if (!shipment) return null;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handlePrint} disabled={!canPrint} size="sm">
          <Printer className="mr-2 h-4 w-4" /> Print Shipment
          {!canPrint && <span className="ml-2 text-xs">(Requires Cleared & Permitted)</span>}
        </Button>
      </div>

      <Card className="printable-area shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
                <Package className="mr-3 h-8 w-8" />
                Shipment Details
              </CardTitle>
              <CardDescription className="mt-1">
                STS Job: <span className="font-semibold text-foreground">{shipment.stsJob}</span> | Shipment ID: <span className="font-semibold text-foreground">{shipment.id.substring(0,8)}...</span>
              </CardDescription>
            </div>
             {trailer && (
              <Link href={`/trailers/${trailer.id}`} className="no-print-in-area">
                <Badge variant="secondary" className="whitespace-nowrap hover:bg-primary/10">
                  <Truck className="mr-1.5 h-4 w-4"/>
                  Trailer: {trailer.name} ({trailer.id})
                </Badge>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm card-content-print">
          
          {trailer && (
            <div className="space-y-1 md:col-span-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Truck className="mr-2 h-4 w-4" />Associated Trailer ID</h3>
              <p className="text-2xl font-bold text-foreground">
                <Link href={`/trailers/${trailer.id}`} className="hover:underline">
                  {trailer.id}
                </Link>
                 {trailer.name && <span className="text-base font-medium text-muted-foreground ml-2">({trailer.name})</span>}
              </p>
            </div>
          )}

          <div className="space-y-1 md:col-span-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Hash className="mr-2 h-4 w-4" />STS Job Number</h3>
            <p className="text-2xl font-bold text-foreground">{shipment.stsJob}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Package className="mr-2 h-4 w-4" />Quantity</h3>
            <p className="text-base font-medium">{shipment.quantity} pieces</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><UserCircle className="mr-2 h-4 w-4" />Exporter</h3>
            <p>{shipment.exporter}</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4" />Importer</h3>
            <p>{shipment.importer}</p>
          </div>
          
          {shipment.weight !== undefined && shipment.weight !== null && (
             <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Weight className="mr-2 h-4 w-4" />Weight</h3>
              <p>{shipment.weight} kg</p>
            </div>
          )}

          {shipment.palletSpace !== undefined && shipment.palletSpace !== null && (
            <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Box className="mr-2 h-4 w-4" />Pallet Spaces</h3>
              <p>{shipment.palletSpace}</p>
            </div>
          )}
          
          <div className="space-y-1 col-span-1 md:col-span-2">
            <h3 className="font-semibold text-muted-foreground flex items-center"><MapPin className="mr-2 h-4 w-4" />Warehouse Location</h3>
            <Badge variant={shipment.locationName === "Pending Assignment" ? "outline" : "secondary"} className="text-base">
              {shipment.locationName}
            </Badge>
          </div>

          <div className="space-y-1 col-span-1 md:col-span-2 border-t pt-4 mt-2">
            <h3 className="font-semibold text-muted-foreground mb-2">Status & Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <div className="flex items-center mb-1">
                      {shipment.released ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" /> : <CircleOff className="mr-2 h-5 w-5 text-red-500" />}
                      <span className="font-medium">Permitted to be Released:</span>
                      <span className={`ml-2 font-bold ${shipment.released ? 'text-green-600' : 'text-red-500'}`}>
                        {shipment.released ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {shipment.releaseDocumentName && (
                      <div className="flex items-center text-xs text-muted-foreground ml-7">
                        <FileText className="mr-1 h-3.5 w-3.5" /> Doc: {shipment.releaseDocumentName}
                      </div>
                    )}
                 </div>
                 <div>
                    <div className="flex items-center mb-1">
                      {shipment.cleared ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" /> : <CircleOff className="mr-2 h-5 w-5 text-red-500" />}
                      <span className="font-medium">Cleared:</span>
                       <span className={`ml-2 font-bold ${shipment.cleared ? 'text-green-600' : 'text-red-500'}`}>
                        {shipment.cleared ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {shipment.clearanceDocumentName && (
                      <div className="flex items-center text-xs text-muted-foreground ml-7">
                        <FileText className="mr-1 h-3.5 w-3.5" /> Doc: {shipment.clearanceDocumentName}
                      </div>
                    )}
                 </div>
            </div>
          </div>
        </CardContent>
        {trailer && trailer.arrivalDate && (
          <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
              <p>Associated with Trailer <Link href={`/trailers/${trailer.id}`} className="text-primary hover:underline font-semibold">{trailer.name} (ID: {trailer.id})</Link>, arrived on {formatDate(trailer.arrivalDate)}.</p>
          </CardFooter>
        )}
        
        {/* Signature Block - Print Only */}
        <div className="print-only-block px-6 pb-6 pt-8 mt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-8 text-center text-foreground">Driver's Acknowledgment of Receipt</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted-foreground">Signature</label>
              <div className="h-12 border-b border-foreground"></div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted-foreground">Printed Name</label>
              <div className="h-12 border-b border-foreground"></div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted-foreground">Date</label>
              <div className="h-12 border-b border-foreground"></div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted-foreground">Time</label>
              <div className="h-12 border-b border-foreground"></div>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
}

