
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, PackageSearch, Printer, Info, Truck, CalendarDays, Users, Send, Hash, Briefcase, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';

interface WeeklyReleasedReportItem {
  shipmentId: string;
  stsJob: number;
  customerJobNumber?: string;
  trailerId: string;
  trailerName?: string;
  trailerCompany?: string;
  releasedAt: string; // ISO string
  releasedAtFormatted: string;
  importer: string;
  exporter: string;
}

export default function WeeklyReleasedReportPage() {
  const { shipments, getTrailerById } = useWarehouse();
  const [isClient, setIsClient] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday
  const currentDate = useMemo(() => new Date(), []); // Only calculate once
  
  const currentPeriodStart = useMemo(() => {
    if (reportPeriod === 'week') {
      return startOfWeek(currentDate, { weekStartsOn });
    }
    return startOfMonth(currentDate);
  }, [currentDate, weekStartsOn, reportPeriod]);

  const currentPeriodEnd = useMemo(() => {
    if (reportPeriod === 'week') {
      return endOfWeek(currentDate, { weekStartsOn });
    }
    return endOfMonth(currentDate);
  }, [currentDate, weekStartsOn, reportPeriod]);

  const formatDateSafe = (dateString?: string, dateFormat = 'PPpp') => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), dateFormat);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const reportData = useMemo((): WeeklyReleasedReportItem[] => {
    if (!isClient) return [];

    return shipments
      .filter(shipment => {
        if (!shipment.releasedAt) return false;
        try {
          const releasedDate = parseISO(shipment.releasedAt);
          return isWithinInterval(releasedDate, { start: currentPeriodStart, end: currentPeriodEnd });
        } catch (error) {
          return false;
        }
      })
      .map(shipment => {
        const trailer = getTrailerById(shipment.trailerId);
        return {
          shipmentId: shipment.id,
          stsJob: shipment.stsJob,
          customerJobNumber: shipment.customerJobNumber,
          trailerId: shipment.trailerId,
          trailerName: trailer?.name,
          trailerCompany: trailer?.company,
          releasedAt: shipment.releasedAt!,
          releasedAtFormatted: formatDateSafe(shipment.releasedAt),
          importer: shipment.importer,
          exporter: shipment.exporter,
        };
      })
      .sort((a, b) => parseISO(b.releasedAt).getTime() - parseISO(a.releasedAt).getTime()); // Sort by most recent first
  }, [shipments, getTrailerById, isClient, currentPeriodStart, currentPeriodEnd]);

  const handlePrintReport = () => {
    window.print();
  };

  const toggleReportPeriod = () => {
    setReportPeriod(prev => prev === 'week' ? 'month' : 'week');
  }

  const periodRangeFormatted = reportPeriod === 'week' 
    ? `${format(currentPeriodStart, 'MMM d')} - ${format(currentPeriodEnd, 'MMM d, yyyy')}`
    : `${format(currentPeriodStart, 'MMMM yyyy')}`;

  const pageTitle = reportPeriod === 'week' ? 'Weekly Released Shipments' : 'Monthly Released Shipments';
  const cardTitleText = reportPeriod === 'week' ? 'Released This Week' : `Released in ${format(currentDate, 'MMMM')}`;
  const cardDescriptionText = reportPeriod === 'week' 
    ? `Shipments released from ${format(currentPeriodStart, 'PP')} to ${format(currentPeriodEnd, 'PP')}.`
    : `Shipments released during ${format(currentPeriodStart, 'MMMM yyyy')}.`;
  const printTitleText = reportPeriod === 'week' ? 'Weekly Released Shipments Report' : 'Monthly Released Shipments Report';
  const printPeriodText = reportPeriod === 'week' ? `For week: ${periodRangeFormatted}` : `For month: ${periodRangeFormatted}`;


  const ReportSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trailer ID</TableHead>
          <TableHead>STS Job</TableHead>
          <TableHead>Trailer Name</TableHead>
          <TableHead>Customer Job No.</TableHead>
          <TableHead>Importer</TableHead>
          <TableHead>Exporter</TableHead>
          <TableHead className="text-right">Released At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[150px] ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow no-print">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Clock className="mr-3 h-8 w-8 text-primary" />
          {pageTitle}
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={toggleReportPeriod} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View {reportPeriod === 'week' ? 'This Month' : 'This Week'}
          </Button>
          <Button onClick={handlePrintReport} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
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
                No shipments were released {reportPeriod === 'week' ? 'this week' : `in ${format(currentDate, 'MMMM')}`}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later or view previous reports if available.
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
                    <TableHead className="whitespace-nowrap"><Users className="inline-block mr-1 h-4 w-4 print:hidden"/>Importer</TableHead>
                    <TableHead className="whitespace-nowrap"><Send className="inline-block mr-1 h-4 w-4 print:hidden"/>Exporter</TableHead>
                    <TableHead className="text-right whitespace-nowrap"><CalendarDays className="inline-block mr-1 h-4 w-4 print:hidden"/>Released At</TableHead>
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
                      <TableCell>{item.importer}</TableCell>
                      <TableCell>{item.exporter}</TableCell>
                      <TableCell className="text-right">{item.releasedAtFormatted}</TableCell>
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
                Displaying {reportData.length} shipment(s) released {reportPeriod === 'week' ? 'this week' : `in ${format(currentDate, 'MMMM')}`}.
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

