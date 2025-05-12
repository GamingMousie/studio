
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment, Trailer } from '@/types'; // Assuming Trailer type is also needed
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertOctagon, PackageSearch, Printer, Info, Truck, CalendarDays, Hash, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';

interface OverdueReleasedReportItem {
  shipmentId: string;
  stsJob: number;
  customerJobNumber?: string;
  trailerId: string;
  trailerName?: string;
  storageExpiryDate: string; // ISO from trailer
  storageExpiryDateFormatted: string;
  releasedAt: string; // ISO from shipment
  releasedAtFormatted: string;
  daysOverdue: number;
}

export default function MonthlyOverdueReleasedReportPage() {
  const { shipments, getTrailerById } = useWarehouse();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentDate = useMemo(() => new Date(), []);
  
  const currentMonthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const formatDateSafe = (dateString?: string, dateFormat = 'PP') => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), dateFormat);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const reportData = useMemo((): OverdueReleasedReportItem[] => {
    if (!isClient) return [];

    return shipments
      .filter(shipment => {
        if (!shipment.releasedAt) return false;
        try {
          const releasedDate = parseISO(shipment.releasedAt);
          return isWithinInterval(releasedDate, { start: currentMonthStart, end: currentMonthEnd });
        } catch (error) {
          return false;
        }
      })
      .map(shipment => {
        const trailer = getTrailerById(shipment.trailerId);
        if (!trailer || !trailer.storageExpiryDate || !shipment.releasedAt) {
          return null; 
        }

        try {
          const releasedDate = parseISO(shipment.releasedAt);
          const expiryDate = parseISO(trailer.storageExpiryDate);

          if (releasedDate > expiryDate) {
            const daysOverdue = differenceInDays(releasedDate, expiryDate);
            return {
              shipmentId: shipment.id,
              stsJob: shipment.stsJob,
              customerJobNumber: shipment.customerJobNumber,
              trailerId: shipment.trailerId,
              trailerName: trailer.name,
              storageExpiryDate: trailer.storageExpiryDate,
              storageExpiryDateFormatted: formatDateSafe(trailer.storageExpiryDate),
              releasedAt: shipment.releasedAt,
              releasedAtFormatted: formatDateSafe(shipment.releasedAt, 'PPpp'),
              daysOverdue,
            };
          }
        } catch (error) {
          console.error("Error processing shipment for overdue report:", shipment.id, error);
          return null;
        }
        return null;
      })
      .filter((item): item is OverdueReleasedReportItem => item !== null) // Type guard to remove nulls
      .sort((a, b) => b.daysOverdue - a.daysOverdue); // Sort by most overdue first
  }, [shipments, getTrailerById, isClient, currentMonthStart, currentMonthEnd]);

  const handlePrintReport = () => {
    window.print();
  };

  const periodRangeFormatted = `${format(currentMonthStart, 'MMMM yyyy')}`;
  const pageTitle = 'Monthly Overdue Released Shipments';
  const cardTitleText = `Overdue Shipments Released in ${format(currentDate, 'MMMM')}`;
  const cardDescriptionText = `Shipments released in ${periodRangeFormatted} after their trailer's storage expiry date.`;
  const printTitleText = 'Monthly Overdue Released Shipments Report';
  const printPeriodText = `For month: ${periodRangeFormatted}`;


  const ReportSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trailer ID</TableHead>
          <TableHead>STS Job</TableHead>
          <TableHead>Trailer Name</TableHead>
          <TableHead>Storage Expiry</TableHead>
          <TableHead>Released At</TableHead>
          <TableHead className="text-right">Days Overdue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow no-print">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <AlertOctagon className="mr-3 h-8 w-8 text-primary" />
          {pageTitle}
        </h1>
        <Button onClick={handlePrintReport} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <Card className="shadow-lg printable-area">
        <CardHeader className="no-print">
          <CardTitle className="text-xl sm:text-2xl text-primary">{cardTitleText}</CardTitle>
          <CardDescription>
            {cardDescriptionText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="print-only-block mb-4">
            <h2 className="text-xl font-semibold text-foreground">{printTitleText}</h2>
            <p className="text-sm text-muted-foreground">
              {printPeriodText}
            </p>
             <p className="text-xs text-muted-foreground">Date Generated: {new Date().toLocaleDateString()}</p>
          </div>

          {!isClient ? (
            <ReportSkeleton />
          ) : reportData.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-md p-8">
              <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No overdue shipments found released in {format(currentDate, 'MMMM')}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This means all shipments released this month were done so before their storage expiry date, or no shipments met the criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap"><Truck className="inline-block mr-1 h-4 w-4 print:hidden"/>Trailer ID</TableHead>
                    <TableHead className="whitespace-nowrap"><Hash className="inline-block mr-1 h-4 w-4 print:hidden"/>STS Job</TableHead>
                    <TableHead className="whitespace-nowrap">Trailer Name</TableHead>
                    <TableHead className="whitespace-nowrap"><Briefcase className="inline-block mr-1 h-4 w-4 print:hidden"/>Cust. Job No.</TableHead>
                    <TableHead className="whitespace-nowrap"><CalendarDays className="inline-block mr-1 h-4 w-4 print:hidden"/>Storage Expiry</TableHead>
                    <TableHead className="whitespace-nowrap"><CalendarDays className="inline-block mr-1 h-4 w-4 print:hidden"/>Released At</TableHead>
                    <TableHead className="text-right whitespace-nowrap"><TrendingUp className="inline-block mr-1 h-4 w-4 print:hidden"/>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item) => (
                    <TableRow key={item.shipmentId}>
                       <TableCell>
                        <Link href={`/trailers/${item.trailerId}`} className="text-primary hover:underline print:text-foreground print:no-underline">
                          {item.trailerId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/shipments/${item.shipmentId}`} className="text-primary hover:underline print:text-foreground print:no-underline">
                          {item.stsJob}
                        </Link>
                      </TableCell>
                      <TableCell>{item.trailerName || 'N/A'}</TableCell>
                      <TableCell>{item.customerJobNumber || 'N/A'}</TableCell>
                      <TableCell className="text-destructive font-medium">{item.storageExpiryDateFormatted}</TableCell>
                      <TableCell>{item.releasedAtFormatted}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">{item.daysOverdue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         {isClient && reportData.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground border-t pt-4 no-print">
                <Info className="h-4 w-4 mr-2 text-primary" />
                Displaying {reportData.length} overdue shipment(s) released in {format(currentDate, 'MMMM')}.
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
