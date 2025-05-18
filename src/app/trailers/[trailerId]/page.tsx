
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer, Shipment } from '@/types';
import ShipmentCard from '@/components/shipment/ShipmentCard';
import AddShipmentDialog from '@/components/shipment/AddShipmentDialog';
import EditTrailerDialog from '@/components/trailer/EditTrailerDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Package, Truck, Briefcase, CalendarDays, Weight, Tag, Printer, FileText, Eye, Edit, UploadCloud, BookOpen, FileBadge } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export default function TrailerShipmentsPage() {
  const router = useRouter();
  const params = useParams();
  const trailerId = params.trailerId as string;

  const {
    getShipmentsByTrailerId,
    deleteShipment,
    trailers: trailersFromContext, 
  } = useWarehouse();

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [isAddShipmentDialogOpen, setIsAddShipmentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrailerFound, setIsTrailerFound] = useState<boolean | null>(null); 


  useEffect(() => {
    if (typeof trailerId === 'string' && trailerId.trim() !== '') {
      const currentTrailer = trailersFromContext.find(t => t.id === trailerId);
      if (currentTrailer) {
        setTrailer(currentTrailer);
        setIsTrailerFound(true);
      } else {
        setIsTrailerFound(false);
        setTrailer(null);
      }
    } else {
      setIsTrailerFound(false);
      setTrailer(null);
    }
  }, [trailerId, trailersFromContext]); 

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

  const handleViewDocument = (documentName?: string) => {
    if (documentName) {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Viewing Document: ${documentName}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
                .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #333; }
                p { color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Viewing Document: ${documentName}</h1>
                <p>(This is a placeholder. In a real application, the document content for "${documentName}" would be displayed here.)</p>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        alert(`Could not open new window to view document: ${documentName}. Please check your popup blocker settings.`);
      }
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

  const DocumentSection = ({ title, documentName, icon: Icon, editAction }: { title: string, documentName?: string, icon: React.ElementType, editAction: () => void }) => (
    <div className="py-4 border-t">
      <h3 className="text-lg font-semibold flex items-center mb-2">
        <Icon className="mr-2 h-5 w-5 text-primary" />
        {title}
      </h3>
      {documentName ? (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md mb-2">
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{documentName}</span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleViewDocument(documentName)}
            aria-label={`View ${title.toLowerCase()} ${documentName}`}
          >
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-2">No {title.toLowerCase()} attached.</p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={editAction}
      >
        {documentName ? <Edit className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
        {documentName ? `Change/Remove ${title}` : `Add ${title}`}
      </Button>
      <p className="text-xs text-muted-foreground mt-1">Edit trailer details to attach, change, or remove the {title.toLowerCase()} PDF.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Trailer Details
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/trailers/${trailer.id}/print`}>
              <Printer className="mr-2 h-4 w-4" /> Print Trailer ACP Form
            </Link>
          </Button>
        </div>
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
          <DocumentSection 
            title="Out-turn Report" 
            documentName={trailer.outturnReportDocumentName} 
            icon={FileText}
            editAction={() => setIsEditDialogOpen(true)}
          />
          <DocumentSection 
            title="T1 Summary" 
            documentName={trailer.t1SummaryDocumentName} 
            icon={FileBadge}
            editAction={() => setIsEditDialogOpen(true)}
          />
          <DocumentSection 
            title="Manifest" 
            documentName={trailer.manifestDocumentName} 
            icon={BookOpen}
            editAction={() => setIsEditDialogOpen(true)}
          />

          <div className="flex justify-between items-center mb-6 pt-4 border-t mt-4">
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
      
      {isEditDialogOpen && trailer && (
        <EditTrailerDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          trailerToEdit={trailer}
        />
      )}
    </div>
  );
}
