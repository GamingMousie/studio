// @ts-nocheck
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import type { Trailer, Shipment, TrailerStatus } from '@/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique shipment IDs

interface WarehouseContextType {
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'status'> & { status?: TrailerStatus; company?: string }) => void;
  updateTrailerStatus: (trailerId: string, status: TrailerStatus) => void;
  deleteTrailer: (trailerId: string) => void;
  shipments: Shipment[];
  getShipmentsByTrailerId: (trailerId: string) => Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'locationName' | 'released' | 'cleared'> & { locationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?: boolean, cleared?: boolean }) => void;
  updateShipmentLocation: (shipmentId: string, locationName: string) => void;
  deleteShipment: (shipmentId: string) => void;
  getTrailerById: (trailerId: string) => Trailer | undefined;
  updateShipmentReleasedStatus: (shipmentId: string, released: boolean) => void;
  updateShipmentClearedStatus: (shipmentId: string, cleared: boolean) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialTrailers: Trailer[] = [
  { id: 'T-001', name: 'Alpha Transporter', status: 'Docked', company: 'Logistics Inc.' },
  { id: 'T-002', name: 'Beta Hauler', status: 'In-Transit', company: 'QuickShip Co.' },
  { id: 'T-003', name: 'Gamma Carrier', status: 'Empty' }, // Example without company
];

const initialShipments: Shipment[] = [
  { id: uuidv4(), trailerId: 'T-001', contentDescription: 'Electronics Batch #123', quantity: 50, destination: 'City Retail Hub', locationName: 'Bay A1', releaseDocumentName: 'release_electronics_123.pdf', clearanceDocumentName: 'clearance_electronics_123.pdf', released: true, cleared: true },
  { id: uuidv4(), trailerId: 'T-001', contentDescription: 'Apparel Stock Lot', quantity: 200, destination: 'Regional Outlet', locationName: 'Shelf B7', released: false, cleared: false },
  { id: uuidv4(), trailerId: 'T-002', contentDescription: 'Industrial Parts', quantity: 10, destination: 'Factory Zone', locationName: 'Dock 3', releaseDocumentName: 'industrial_release.docx', released: true, cleared: false },
];


export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [trailers, setTrailers] = useLocalStorageState<Trailer[]>('trailers', initialTrailers);
  const [shipments, setShipments] = useLocalStorageState<Shipment[]>('shipments', initialShipments);

  const addTrailer = useCallback((trailerData: Omit<Trailer, 'status'> & { status?: TrailerStatus; company?: string }) => {
    const newTrailer: Trailer = {
      ...trailerData,
      status: trailerData.status || 'Empty',
      company: trailerData.company || undefined // Ensure company is handled, defaults to undefined if not provided
    };
    setTrailers((prev) => [...prev, newTrailer]);
  }, [setTrailers]);

  const updateTrailerStatus = useCallback((trailerId: string, status: TrailerStatus) => {
    setTrailers((prev) =>
      prev.map((t) => (t.id === trailerId ? { ...t, status } : t))
    );
  }, [setTrailers]);

  const deleteTrailer = useCallback((trailerId: string) => {
    setTrailers(prev => prev.filter(t => t.id !== trailerId));
    setShipments(prev => prev.filter(s => s.trailerId !== trailerId)); // Also delete associated shipments
  }, [setTrailers, setShipments]);

  const getShipmentsByTrailerId = useCallback((trailerId: string) => {
    return shipments.filter((s) => s.trailerId === trailerId);
  }, [shipments]);

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'locationName' | 'released' | 'cleared'> & { locationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?:boolean, cleared?: boolean }) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      locationName: shipmentData.locationName || 'Pending Assignment',
      releaseDocumentName: shipmentData.releaseDocumentName,
      clearanceDocumentName: shipmentData.clearanceDocumentName,
      released: shipmentData.released ?? false,
      cleared: shipmentData.cleared ?? false,
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
      prev.map((s) => (s.id === shipmentId ? { ...s, released } : s)) // Fixed: changed 't' to 's'
    );
  }, [setShipments]);

  const updateShipmentClearedStatus = useCallback((shipmentId: string, cleared: boolean) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, cleared } : s)) // Fixed: changed 't' to 's'
    );
  }, [setShipments]);

  const deleteShipment = useCallback((shipmentId: string) => {
    setShipments(prev => prev.filter(s => s.id !== shipmentId));
  }, [setShipments]);

  const getTrailerById = useCallback((trailerId: string) => {
    return trailers.find(t => t.id === trailerId);
  }, [trailers]);

  return (
    <WarehouseContext.Provider
      value={{
        trailers,
        addTrailer,
        updateTrailerStatus,
        deleteTrailer,
        shipments,
        getShipmentsByTrailerId,
        addShipment,
        updateShipmentLocation,
        deleteShipment,
        getTrailerById,
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

