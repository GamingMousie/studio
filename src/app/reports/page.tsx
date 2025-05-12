
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment, Trailer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, PackageSearch, Info } from 'lucide-react';
import Link from 'next/link';

interface BondCheckReportItem {
  trailerId: string;
  trailerName?: string;
  stsJob: number;
  shipmentId: string;
  customerJobNumber?: string;
  locationsDisplay: string;
}

export default function ReportsPage() {
  const { shipments, getTrailerById } = useWarehouse();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bondCheckReportData = useMemo((): BondCheckReportItem[] => {
    if (!isClient) return [];

    return shipments
      .filter(shipment => !shipment.releasedAt) // Filter for shipments that are not released
      .map(shipment => {
        const trailer = getTrailerById(shipment.trailerId);
        const locations = shipment.locations || [{ name: 'Pending Assignment' }];
        const isPendingAssignment = locations.length === 1 && locations[0].name === 'Pending Assignment';
        
        let locationsDisplay = 'Pending Assignment';
        if (!isPendingAssignment) {
            locationsDisplay = locations.map(loc => 
                `${loc.name}${loc.pallets !== undefined ? ` (${loc.pallets} plts)` : ''}`
            ).join(', ');
        }
        
        return {
          trailerId: shipment.trailerId,
          trailerName: trailer?.name,
          stsJob: shipment.stsJob,
          shipmentId: shipment.id,
          customerJobNumber: shipment.customerJobNumber,
          locationsDisplay: locationsDisplay,
        };
      })
      .sort((a, b) => { // Sort by Trailer ID, then by STS Job
        if (a.trailerId < b.trailerId) return -1;
        if (a.trailerId > b.trailerId) return 1;
        if (a.stsJob < b.stsJob) return -1;
        if (a.stsJob > b.stsJob) return 1;
        return 0;
      });
  }, [shipments, getTrailerById, isClient]);

  const ReportSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trailer ID</TableHead>
          <TableHead>Trailer Name</TableHead>
          <TableHead>STS Job</TableHead>
          <TableHead>Customer Job No.</TableHead>
          <TableHead>Locations</TableHead>
          <TableHead className="text-right">Shipment ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[70px] ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <ClipboardList className="mr-3 h-8 w-8 text-primary" />
          Bond Check Report
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-primary">Current Warehouse Stock (Unreleased)</CardTitle>
          <CardDescription>
            This report lists all shipments currently in the warehouse that have not been marked as "Released".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isClient ? (
            <ReportSkeleton />
          ) : bondCheckReportData.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-md p-8">
              <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No unreleased shipments found in the warehouse.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                All shipments have been released, or there are no shipments currently tracked.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Trailer ID</TableHead>
                    <TableHead className="whitespace-nowrap">Trailer Name</TableHead>
                    <TableHead className="whitespace-nowrap">STS Job</TableHead>
                    <TableHead className="whitespace-nowrap">Customer Job No.</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Shipment ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bondCheckReportData.map((item) => (
                    <TableRow key={item.shipmentId}>
                      <TableCell className="font-medium">
                        <Link href={`/trailers/${item.trailerId}`} className="text-primary hover:underline">
                          {item.trailerId}
                        </Link>
                      </TableCell>
                      <TableCell>{item.trailerName || 'N/A'}</TableCell>
                      <TableCell>{item.stsJob}</TableCell>
                      <TableCell>{item.customerJobNumber || 'N/A'}</TableCell>
                      <TableCell>{item.locationsDisplay}</TableCell>
                      <TableCell className="text-right">
                         <Link href={`/shipments/${item.shipmentId}`} className="text-primary hover:underline">
                           {item.shipmentId.substring(0, 8)}...
                         </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         {isClient && bondCheckReportData.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                <Info className="h-4 w-4 mr-2 text-primary" />
                Displaying {bondCheckReportData.length} unreleased shipment(s).
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
