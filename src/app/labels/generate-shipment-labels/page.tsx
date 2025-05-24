'use client';

import React, { useState, useEffect } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import ShipmentLabel from '@/components/label/ShipmentLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  FileText,
  Search,
  Printer,
  AlertTriangle,
  PackageSearch,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function GenerateShipmentLabelsPage() {
  const [trailerIdInput, setTrailerIdInput] = useState('');
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [shipmentsToLabel, setShipmentsToLabel] = useState<Shipment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getTrailerById, getShipmentsByTrailerId } = useWarehouse();

  useEffect(() => {
    document.getElementById('trailerId')?.focus();
  }, []);

  const resetState = () => {
    setErrorMessage(null);
    setSelectedTrailer(null);
    setShipmentsToLabel([]);
  };

  const handleGenerateLabels = async () => {
    resetState();

    if (!trailerIdInput.trim()) {
      setErrorMessage('Please enter a Trailer ID.');
      return;
    }

    setIsLoading(true);

    try {
      const trailer = await getTrailerById(trailerIdInput.trim());

      if (!trailer) {
        setErrorMessage(`Trailer "${trailerIdInput}" not found.`);
        return;
      }

      const shipments = await getShipmentsByTrailerId(trailer.id);

      setSelectedTrailer(trailer);
      setShipmentsToLabel(shipments);

      if (shipments.length === 0) {
        setErrorMessage(`No shipments found for Trailer ID "${trailer.id}".`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error loading trailer or shipments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintLabels = () => {
    try {
      if (shipmentsToLabel.length > 0 && selectedTrailer) {
        window.print();
      }
    } catch (err) {
      console.error('Print failed:', err);
    }
  };

  const getLabelDate = (trailer: Trailer | null): string => {
    try {
      const date = trailer?.arrivalDate ? new Date(trailer.arrivalDate) : new Date();
      return format(date, 'dd/MM/yyyy');
    } catch {
      return format(new Date(), 'dd/MM/yyyy');
    }
  };

  const labelDateForShipments = getLabelDate(selectedTrailer);

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            Generate Shipment Labels
          </CardTitle>
          <CardDescription>
            Enter a Trailer ID to generate labels for all its shipments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-grow">
              <label htmlFor="trailerId" className="block text-sm font-medium text-muted-foreground mb-1">
                Trailer ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="trailerId"
                  aria-label="Trailer ID"
                  value={trailerIdInput}
                  onChange={(e) => setTrailerIdInput(e.target.value)}
                  placeholder="Enter Trailer ID (e.g., T-001)"
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateLabels();
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateLabels}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Generating...' : 'Generate Labels'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 no-print">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg shadow-sm bg-background h-[200px] flex flex-col justify-between">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="no-print">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Shipment Labels */}
      {selectedTrailer && shipmentsToLabel.length > 0 && (
        <>
          <div className="no-print flex justify-end">
            <Button onClick={handlePrintLabels} variant="outline" className="mb-4">
              <Printer className="h-4 w-4 mr-2" />
              Print Labels
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shipmentsToLabel.map((shipment) => (
              <ShipmentLabel
                key={shipment.id}
                shipment={shipment}
                trailerId={selectedTrailer.id}
                date={labelDateForShipments}
              />
            ))}
          </div>
        </>
      )}

      {/* No labels found */}
      {selectedTrailer && shipmentsToLabel.length === 0 && !isLoading && !errorMessage && (
        <Alert className="no-print">
          <PackageSearch className="h-5 w-5" />
          <AlertTitle>No Shipments Found</AlertTitle>
          <AlertDescription>
            This trailer has no shipments for labeling.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
