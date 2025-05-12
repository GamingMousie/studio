
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, Truck, Briefcase, CalendarDays, Weight, Tag, Package, Boxes, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function PrintTrailerPage() {
  const router = useRouter();
  const params = useParams();
  const trailerId = params.trailerId as string;

  const { getTrailerById, getShipmentsByTrailerId } = useWarehouse();

  const [trailer, setTrailer] = useState<Trailer | null | undefined>(undefined);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [generatedDate, setGeneratedDate] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (trailerId && getTrailerById) {
      const currentTrailer = getTrailerById(trailerId);
      setTrailer(currentTrailer);
      if (currentTrailer) {
        const currentShipments = getShipmentsByTrailerId(trailerId);
        setShipments(currentShipments);
      }
    }
    setGeneratedDate(new Date().toLocaleString());
  }, [trailerId, getTrailerById, getShipmentsByTrailerId]);

  const totalPieces = useMemo(() => {
    return shipments.reduce((acc, shipment) => acc + shipment.quantity, 0);
  }, [shipments]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (!isClient || trailer === undefined) {
    return (
      <div className="space-y-6 p-4">
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
            {[...Array(8)].map((_, i) => (
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

  if (trailer === null) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4 p-4">
        <Truck className="h-16 w-16 text-muted-foreground" />
        <p className="text-2xl font-semibold text-destructive">Trailer Not Found</p>
        <p className="text-xl text-muted-foreground">Could not find trailer with ID: {trailerId}</p>
        <Button variant="outline" onClick={() => router.push('/trailers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Trailers
        </Button>
      </div>
    );
  }

  if (!trailer) return null;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trailer Details
        </Button>
        <Button onClick={handlePrint} size="sm">
          <Printer className="mr-2 h-4 w-4" /> Print Trailer Manifest
        </Button>
      </div>

      <Card className="printable-area shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
                <FileText className="mr-3 h-8 w-8" />
                Trailer Manifest
              </CardTitle>
              <CardDescription className="mt-1">
                Trailer ID: <span className="font-semibold text-foreground">{trailer.id}</span>
                {trailer.name && ` | Name: ${trailer.name}`}
              </CardDescription>
            </div>
             {generatedDate && (
                 <p className="text-xs text-muted-foreground mt-1">Generated: {generatedDate}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          
          <div className="font-semibold text-lg text-foreground md:col-span-2 mb-2 border-b pb-2">Trailer Information</div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Truck className="mr-2 h-4 w-4" />Trailer ID</h3>
            <p className="text-base font-medium">{trailer.id}</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Truck className="mr-2 h-4 w-4" />Trailer Name</h3>
            <p className="text-base font-medium">{trailer.name || 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Briefcase className="mr-2 h-4 w-4" />Company</h3>
            <p>{trailer.company || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground">Status</h3>
            <p>{trailer.status}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Arrival Date</h3>
            <p>{formatDate(trailer.arrivalDate)}</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Storage Expiry Date</h3>
            <p>{formatDate(trailer.storageExpiryDate)}</p>
          </div>

          {trailer.weight !== undefined && trailer.weight !== null && (
             <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Weight className="mr-2 h-4 w-4" />Weight</h3>
              <p>{trailer.weight} kg</p>
            </div>
          )}
           <div className="space-y-1"> {/* Placeholder for alignment if weight is missing */}
           </div>


          {trailer.customField1 && (
            <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Tag className="mr-2 h-4 w-4" />T1.1</h3>
              <p>{trailer.customField1}</p>
            </div>
          )}

          {trailer.customField2 && (
            <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center"><Tag className="mr-2 h-4 w-4" />T1.2</h3>
              <p>{trailer.customField2}</p>
            </div>
          )}
          
          <div className="font-semibold text-lg text-foreground md:col-span-2 mt-4 mb-2 border-b pb-2 pt-2">Shipments Summary</div>

           <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Package className="mr-2 h-4 w-4" />Total Shipments</h3>
            <p className="text-base font-medium">{shipments.length}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground flex items-center"><Boxes className="mr-2 h-4 w-4" />Total Pieces</h3>
            <p className="text-base font-medium">{totalPieces}</p>
          </div>

        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          <p>This document summarizes the details for Trailer ID: {trailer.id}.</p>
        </CardFooter>

        {/* Signature Block - Print Only */}
        <div className="print-only-block px-6 pb-6 pt-8 mt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-8 text-center text-foreground">Acknowledgment of Trailer Manifest</h3>
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
              <label className="block text-sm font-medium text-muted-foreground">Company (If Applicable)</label>
              <div className="h-12 border-b border-foreground"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

