
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { QuizReport, AnsweredQuizItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, User, Calendar as CalendarIcon, PackageSearch, Check, X, Truck, Box as BoxIcon, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export default function QuizReportDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { quizReports } = useWarehouse();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const report = useMemo(() => {
    if (!isClient || !reportId) return undefined;
    return quizReports.find(r => r.id === reportId);
  }, [quizReports, reportId, isClient]);

  const formatDate = (dateString: string, dateFormat = 'PPpp') => {
    try {
      return format(parseISO(dateString), dateFormat);
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  const pageTitle = "Quiz Report Details";

  if (!isClient || report === undefined && isClient) { // Show skeleton if loading or report becomes undefined after client mount
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" /> {/* For table skeleton */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report && isClient) { // Report truly not found after client check
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4 p-4">
        <PackageSearch className="h-16 w-16 text-muted-foreground" />
        <p className="text-2xl font-semibold text-destructive">Quiz Report Not Found</p>
        <p className="text-xl text-muted-foreground">Could not find report with ID: {reportId}</p>
        <Button variant="outline" onClick={() => router.push('/quiz/reports')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports List
        </Button>
      </div>
    );
  }
  
  // If report is null or undefined at this point, it implies it's not found (handled above)
  // So, `report!` can be used below if TS complains, or we can re-check.
  // For safety, let's check again, though the above logic should cover it.
  if (!report) return null;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          {pageTitle}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/quiz/reports">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports List
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-2xl text-primary">Report ID: ...{report.id.slice(-6)}</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Completed By:</strong>
              <span className="ml-1.5">{report.completedBy}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Completed At:</strong>
              <span className="ml-1.5">{formatDate(report.completedAt)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Answered Items ({report.items.length}):</h3>
          {report.items.length === 0 ? (
            <p className="text-muted-foreground">No items were recorded in this report.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap"><MapPin className="inline-block mr-1 h-4 w-4"/>Location</TableHead>
                    <TableHead className="whitespace-nowrap"><Truck className="inline-block mr-1 h-4 w-4"/>Identifier (Tr / Job)</TableHead>
                    <TableHead className="whitespace-nowrap"><Briefcase className="inline-block mr-1 h-4 w-4"/>Company</TableHead>
                    <TableHead className="whitespace-nowrap"><CalendarIcon className="inline-block mr-1 h-4 w-4"/>Trailer Arrival</TableHead>
                    <TableHead className="text-right whitespace-nowrap"><BoxIcon className="inline-block mr-1 h-4 w-4"/>Pieces</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Answer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.map((item) => (
                    <TableRow key={item.id} className={item.userAnswer === 'no' ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                      <TableCell className="font-semibold">
                        {item.locationName}
                        {item.locationPallets !== undefined ? ` (${item.locationPallets} plts)` : ''}
                      </TableCell>
                      <TableCell>
                        <Link href={`/trailers/${item.trailerId}`} className="text-primary hover:underline">{item.trailerId}</Link>
                        {' / '}
                        <Link href={`/shipments/${item.shipmentId}`} className="text-primary hover:underline">{item.stsJob}</Link>
                      </TableCell>
                      <TableCell>{item.trailerCompany || 'N/A'}</TableCell>
                      <TableCell>{item.trailerArrivalDateFormatted}</TableCell>
                      <TableCell className="text-right font-semibold">{item.shipmentQuantity}</TableCell>
                      <TableCell className="text-center">
                        {item.userAnswer === 'yes' ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

