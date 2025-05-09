
// @ts-nocheck
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import type { Trailer, Shipment, TrailerStatus, ShipmentUpdateData, TrailerUpdateData } from '@/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique shipment IDs

interface WarehouseContextType {
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string }) => void;
  updateTrailerStatus: (trailerId: string, status: TrailerStatus) => void;
  updateTrailer: (trailerId: string, data: TrailerUpdateData) => void;
  deleteTrailer: (trailerId: string) => void;
  shipments: Shipment[];
  getShipmentsByTrailerId: (trailerId: string) => Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'locationName' | 'released' | 'cleared' | 'importer' | 'stsJob'> & { stsJob: number; importer: string; locationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?: boolean, cleared?: boolean, weight?: number, palletSpace?: number }) => void;
  updateShipmentLocation: (shipmentId: string, locationName: string) => void;
  deleteShipment: (shipmentId: string) => void;
  getTrailerById: (trailerId: string) => Trailer | undefined;
  getShipmentById: (shipmentId: string) => Shipment | undefined; // Added this
  updateShipmentReleasedStatus: (shipmentId: string, released: boolean) => void;
  updateShipmentClearedStatus: (shipmentId: string, cleared: boolean) => void;
  updateShipment: (shipmentId: string, data: ShipmentUpdateData) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialTrailers: Trailer[] = [
  { id: 'T-001', name: 'Alpha Transporter', status: 'Arrived', company: 'Logistics Inc.', arrivalDate: new Date('2024-07-20T10:00:00Z').toISOString(), storageExpiryDate: new Date('2024-08-20T10:00:00Z').toISOString() },
  { id: 'T-002', name: 'Beta Hauler', status: 'Scheduled', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-22T14:30:00Z').toISOString() },
  { id: 'T-003', name: 'Gamma Carrier', status: 'Empty', company: 'Cargo Movers' },
  { id: 'T-004', name: 'Delta Freighter', status: 'Loading', company: 'Logistics Inc.' },
  { id: 'T-005', name: 'Epsilon Mover', status: 'Offloading', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-25T09:00:00Z').toISOString()},
  { id: 'T-006', name: 'Zeta Voyager', status: 'Scheduled', company: 'Cargo Movers', arrivalDate: new Date('2024-07-28T16:00:00Z').toISOString()},
];

const initialShipments: Shipment[] = [
  { id: uuidv4(), trailerId: 'T-001', stsJob: 12345, quantity: 50, importer: 'National Importers Ltd.', locationName: 'Location 1', releaseDocumentName: 'release_electronics_123.pdf', clearanceDocumentName: 'clearance_electronics_123.pdf', released: true, cleared: true, weight: 1200, palletSpace: 4 },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 67890, quantity: 200, importer: 'Global Goods Inc.', locationName: 'Location 2', released: false, cleared: false, weight: 800, palletSpace: 6 },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 11223, quantity: 10, importer: 'Cross-Border Traders', locationName: 'Location 3', releaseDocumentName: 'industrial_release.docx', released: true, cleared: false, weight: 2500, palletSpace: 2 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 22334, quantity: 75, importer: 'FoodStuffs Co.', locationName: 'Location 4', released: true, cleared: true, weight: 1500, palletSpace: 10 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 33445, quantity: 120, importer: 'Fashion Forward', locationName: 'Location 5', released: false, cleared: true, weight: 600, palletSpace: 8 },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 44556, quantity: 30, importer: 'BuildIt Supplies', locationName: 'Location 6', released: true, cleared: false, weight: 5000, palletSpace: 5 },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 55667, quantity: 90, importer: 'HealthCorp', locationName: 'Location 7', released: true, cleared: true, weight: 300, palletSpace: 3 },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 66778, quantity: 150, importer: 'Mechanics United', locationName: 'Location 8', released: false, cleared: false, weight: 1800, palletSpace: 12 },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 77889, quantity: 25, importer: 'Luxury Imports', locationName: 'Location 9', released: true, cleared: true, weight: 400, palletSpace: 2 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 88990, quantity: 500, importer: 'Warehouse Direct', locationName: 'Location 10', released: false, cleared: false, weight: 2200, palletSpace: 15 },
  { id: uuidv4(), trailerId: 'T-005', stsJob: 99001, quantity: 60, importer: 'Gourmet Foods', locationName: 'Location 1', released: true, cleared: true, weight: 700, palletSpace: 5 },
  { id: uuidv4(), trailerId: 'T-006', stsJob: 10101, quantity: 200, importer: 'Constructors Choice', locationName: 'Location 2', released: false, cleared: false, weight: 3000, palletSpace: 20 },
];


export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [trailers, setTrailers] = useLocalStorageState<Trailer[]>('trailers', initialTrailers);
  const [shipments, setShipments] = useLocalStorageState<Shipment[]>('shipments', initialShipments);

  const addTrailer = useCallback((trailerData: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string }) => {
    const newTrailer: Trailer = {
      ...trailerData,
      status: trailerData.status || 'Scheduled', // Default to 'Scheduled'
      company: trailerData.company || undefined,
      arrivalDate: trailerData.arrivalDate || undefined,
      storageExpiryDate: trailerData.storageExpiryDate || undefined,
    };
    setTrailers((prev) => [...prev, newTrailer]);
  }, [setTrailers]);

  const updateTrailerStatus = useCallback((trailerId: string, status: TrailerStatus) => {
    setTrailers((prev) =>
      prev.map((t) => (t.id === trailerId ? { ...t, status } : t))
    );
  }, [setTrailers]);

  const updateTrailer = useCallback((trailerId: string, data: TrailerUpdateData) => {
    setTrailers(prev => 
      prev.map(t => 
        t.id === trailerId ? { ...t, ...data } : t
      )
    );
  }, [setTrailers]);

  const deleteTrailer = useCallback((trailerId: string) => {
    setTrailers(prev => prev.filter(t => t.id !== trailerId));
    setShipments(prev => prev.filter(s => s.trailerId !== trailerId)); // Also delete associated shipments
  }, [setTrailers, setShipments]);

  const getShipmentsByTrailerId = useCallback((trailerId: string) => {
    return shipments.filter((s) => s.trailerId === trailerId);
  }, [shipments]);

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'locationName' | 'released' | 'cleared' | 'importer' | 'stsJob'> & { stsJob: number; importer: string; locationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?:boolean, cleared?: boolean, weight?: number, palletSpace?: number }) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      stsJob: shipmentData.stsJob,
      importer: shipmentData.importer,
      locationName: shipmentData.locationName || 'Pending Assignment',
      releaseDocumentName: shipmentData.releaseDocumentName,
      clearanceDocumentName: shipmentData.clearanceDocumentName,
      released: shipmentData.released ?? false,
      cleared: shipmentData.cleared ?? false,
      weight: shipmentData.weight,
      palletSpace: shipmentData.palletSpace,
    };
    setShipments((prev) => [...prev, newShipment]);
  }, [setShipments]);

  const updateShipmentLocation = useCallback((shipmentId: string, locationName: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, locationName } : s))
    );
  }, [setShipments]);

  const updateShipmentReleasedStatus = useCallback((shipmentId: string, released: boolean) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, released } : s)) 
    );
  }, [setShipments]);

  const updateShipmentClearedStatus = useCallback((shipmentId: string, cleared: boolean) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, cleared } : s)) 
    );
  }, [setShipments]);

  const updateShipment = useCallback((shipmentId: string, data: ShipmentUpdateData) => {
    setShipments(prev =>
      prev.map(s =>
        s.id === shipmentId
          ? {
              ...s, // keep existing fields like trailerId, id
              ...data, // apply all updated data
            }
          : s
      )
    );
  }, [setShipments]);

  const deleteShipment = useCallback((shipmentId: string) => {
    setShipments(prev => prev.filter(s => s.id !== shipmentId));
  }, [setShipments]);

  const getTrailerById = useCallback((trailerId: string) => {
    return trailers.find(t => t.id === trailerId);
  }, [trailers]);

  const getShipmentById = useCallback((shipmentId: string) => { // Added this function
    return shipments.find(s => s.id === shipmentId);
  }, [shipments]);

  return (
    <WarehouseContext.Provider
      value={{
        trailers,
        addTrailer,
        updateTrailerStatus,
        updateTrailer,
        deleteTrailer,
        shipments,
        getShipmentsByTrailerId,
        addShipment,
        updateShipmentLocation,
        updateShipment,
        deleteShipment,
        getTrailerById,
        getShipmentById, // Exported here
        updateShipmentReleasedStatus,
        updateShipmentClearedStatus,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = (): WarehouseContextType => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

