
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Shipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Check, X, PackageSearch, HelpCircle, Truck, CalendarDays, Box as BoxIcon, Briefcase, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface QuizItem {
  id: string; // Combination of shipmentId and locationName for uniqueness
  shipmentId: string;
  stsJob: number;
  trailerId: string;
  trailerCompany?: string;
  trailerArrivalDateFormatted: string;
  shipmentQuantity: number;
  locationName: string;
  locationPallets?: number;
}

export default function StockCheckQuizPage() {
  const { shipments, getTrailerById } = useWarehouse();
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [itemId: string]: 'yes' | 'no' }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDateSafe = (dateString?: string, dateFormat = 'PP') => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), dateFormat);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const quizItems = useMemo((): QuizItem[] => {
    if (!isClient) return [];
    const items: QuizItem[] = [];
    shipments
      .filter(shipment => !shipment.releasedAt)
      .forEach(shipment => {
        const trailer = getTrailerById(shipment.trailerId);
        const shipmentLocations = shipment.locations && shipment.locations.length > 0
          ? shipment.locations
          : [{ name: 'Pending Assignment', pallets: undefined }];

        shipmentLocations.forEach((loc, index) => {
          items.push({
            id: `${shipment.id}-${loc.name}-${index}`,
            shipmentId: shipment.id,
            stsJob: shipment.stsJob,
            trailerId: shipment.trailerId,
            trailerCompany: trailer?.company,
            trailerArrivalDateFormatted: formatDateSafe(trailer?.arrivalDate),
            shipmentQuantity: shipment.quantity,
            locationName: loc.name,
            locationPallets: loc.pallets,
          });
        });
      });

    return items.sort((a, b) => {
      if (a.locationName === 'Pending Assignment' && b.locationName !== 'Pending Assignment') return 1;
      if (a.locationName !== 'Pending Assignment' && b.locationName === 'Pending Assignment') return -1;
      if (a.locationName.toLowerCase() < b.locationName.toLowerCase()) return -1;
      if (a.locationName.toLowerCase() > b.locationName.toLowerCase()) return 1;
      const dateA = a.trailerArrivalDateFormatted !== 'N/A' && a.trailerArrivalDateFormatted !== 'Invalid Date' ? parseISO(formatDateSafe(a.trailerArrivalDateFormatted, 'yyyy-MM-dd')).getTime() : 0;
      const dateB = b.trailerArrivalDateFormatted !== 'N/A' && b.trailerArrivalDateFormatted !== 'Invalid Date' ? parseISO(formatDateSafe(b.trailerArrivalDateFormatted, 'yyyy-MM-dd')).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      if (a.trailerId.toLowerCase() < b.trailerId.toLowerCase()) return -1;
      if (a.trailerId.toLowerCase() > b.trailerId.toLowerCase()) return 1;
      return a.stsJob - b.stsJob;
    });
  }, [shipments, getTrailerById, isClient]);

  const currentItem = quizItems[currentIndex];
  const totalItems = quizItems.length;
  const progressPercentage = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!currentItem) return;
    setUserAnswers(prev => ({ ...prev, [currentItem.id]: answer }));
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quiz finished, could show summary or something
      console.log("Quiz finished", userAnswers);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const pageTitle = "Stock Check Quiz";

  if (!isClient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <HelpCircle className="mr-3 h-8 w-8 text-primary" />
            {pageTitle}
          </h1>
        </div>
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-md p-8 bg-card shadow">
          <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No unreleased stock items found to quiz.</p>
          <p className="text-sm text-muted-foreground mt-2">Perhaps all stock is released, or there are no items in the warehouse.</p>
           <Button asChild variant="outline" className="mt-6">
            <Link href="/reports/unreleased-stock-locations">View Unreleased Stock Report</Link>
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <HelpCircle className="mr-3 h-8 w-8 text-primary" />
          {pageTitle}
        </h1>
        <div className="text-sm text-muted-foreground font-medium">
          Item {currentIndex + 1} of {totalItems}
        </div>
      </div>

      <Progress value={progressPercentage} className="w-full h-2" />
      
      {currentItem && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Verify Stock Item:</CardTitle>
            <CardDescription>Please confirm if the following details match the physical stock.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-base">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              <strong className="mr-2">Location:</strong>
              <span className="font-semibold text-lg">
                {currentItem.locationName}
                {currentItem.locationPallets !== undefined ? ` (${currentItem.locationPallets} plts)` : ''}
              </span>
            </div>
            <div className="flex items-center">
              <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
              <strong className="mr-2">Identifier:</strong>
              <span>Trailer <Link href={`/trailers/${currentItem.trailerId}`} className="text-primary hover:underline">{currentItem.trailerId}</Link> / Job <Link href={`/shipments/${currentItem.shipmentId}`} className="text-primary hover:underline">{currentItem.stsJob}</Link></span>
            </div>
             {currentItem.trailerCompany && (
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />
                <strong className="mr-2">Company:</strong>
                <span>{currentItem.trailerCompany}</span>
              </div>
            )}
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
              <strong className="mr-2">Trailer Arrival:</strong>
              <span>{currentItem.trailerArrivalDateFormatted}</span>
            </div>
            <div className="flex items-center">
              <BoxIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <strong className="mr-2">Pieces:</strong>
              <span className="font-semibold text-lg">{currentItem.shipmentQuantity}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t">
            <Button 
              onClick={() => handleAnswer('yes')} 
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-lg px-8 py-6"
              disabled={currentIndex >= totalItems -1 && !!userAnswers[currentItem.id]}
            >
              <Check className="mr-2 h-6 w-6" /> YES
            </Button>
            <Button 
              onClick={() => handleAnswer('no')} 
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-lg px-8 py-6"
              disabled={currentIndex >= totalItems -1 && !!userAnswers[currentItem.id]}
            >
              <X className="mr-2 h-6 w-6" /> NO
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentIndex === totalItems -1 && totalItems > 0 && !!userAnswers[currentItem?.id] && (
        <Card className="shadow-lg text-center p-8 bg-secondary">
          <CardTitle className="text-2xl text-primary mb-4">Quiz Complete!</CardTitle>
          <CardDescription className="text-base mb-6">You have reviewed all unreleased stock items.</CardDescription>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => { setCurrentIndex(0); setUserAnswers({}); }}>
              Restart Quiz
            </Button>
            <Button asChild>
              <Link href="/reports/unreleased-stock-locations">View Full Report</Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center mt-6">
        <Button onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous Item
        </Button>
        <Button onClick={handleNext} disabled={currentIndex >= totalItems - 1 || (!!userAnswers[currentItem?.id] && currentIndex === totalItems - 1)}>
          Next Item <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
