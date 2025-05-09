'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import type { Trailer, Shipment, TrailerStatus } from '@/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique shipment IDs

interface WarehouseContextType {
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'status'> & { status?: TrailerStatus }) => void;
  updateTrailerStatus: (trailerId: string, status: TrailerStatus) => void;
  deleteTrailer: (trailerId: string) => void;
  shipments: Shipment[];
  getShipmentsByTrailerId: (trailerId: string) => Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'locationName'> & { locationName?: string }) => void;
  updateShipmentLocation: (shipmentId: string, locationName: string) => void;
  deleteShipment: (shipmentId: string) => void;
  getTrailerById: (trailerId: string) => Trailer | undefined;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialTrailers: Trailer[] = [
  { id: 'T-001', name: 'Alpha Transporter', status: 'Docked' },
  { id: 'T-002', name: 'Beta Hauler', status: 'In-Transit' },
];

const initialShipments: Shipment[] = [
  { id: uuidv4(), trailerId: 'T-001', contentDescription: 'Electronics Batch #123', quantity: 50, destination: 'City Retail Hub', locationName: 'Bay A1' },
  { id: uuidv4(), trailerId: 'T-001', contentDescription: 'Apparel Stock Lot', quantity: 200, destination: 'Regional Outlet', locationName: 'Shelf B7' },
];


export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [trailers, setTrailers] = useLocalStorageState<Trailer[]>('trailers', initialTrailers);
  const [shipments, setShipments] = useLocalStorageState<Shipment[]>('shipments', initialShipments);

  const addTrailer = useCallback((trailerData: Omit<Trailer, 'status'> & { status?: TrailerStatus }) => {
    const newTrailer: Trailer = { ...trailerData, status: trailerData.status || 'Empty' };
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

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'locationName'> & { locationName?: string }) => {
    const newShipment: Shipment = { 
      ...shipmentData, 
      id: uuidv4(),
      locationName: shipmentData.locationName || 'Pending Assignment'
    };
    setShipments((prev) => [...prev, newShipment]);
  }, [setShipments]);

  const updateShipmentLocation = useCallback((shipmentId: string, locationName: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, locationName } : s))
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
        getTrailerById
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
