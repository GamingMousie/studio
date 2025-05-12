
// @ts-nocheck
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import type { Trailer, Shipment, TrailerStatus, ShipmentUpdateData, TrailerUpdateData } from '@/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique shipment IDs

interface WarehouseContextType {
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate' | 'weight' | 'company' | 'customField1' | 'customField2'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string; weight?: number; customField1?: string; customField2?: string; }) => void;
  updateTrailerStatus: (trailerId: string, status: TrailerStatus) => void;
  updateTrailer: (trailerId: string, data: TrailerUpdateData) => void;
  deleteTrailer: (trailerId: string) => void;
  shipments: Shipment[];
  getShipmentsByTrailerId: (trailerId: string) => Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'locationNames' | 'released' | 'cleared' | 'importer' | 'exporter' | 'stsJob' | 'customerJobNumber'> & { stsJob: number; customerJobNumber?: string; importer: string; exporter: string; initialLocationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?: boolean, cleared?: boolean, weight?: number, palletSpace?: number }) => void;
  deleteShipment: (shipmentId: string) => void;
  getTrailerById: (trailerId: string) => Trailer | undefined;
  getShipmentById: (shipmentId: string) => Shipment | undefined;
  updateShipmentReleasedStatus: (shipmentId: string, released: boolean) => void;
  updateShipmentClearedStatus: (shipmentId: string, cleared: boolean) => void;
  updateShipment: (shipmentId: string, data: ShipmentUpdateData) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialTrailers: Trailer[] = [
  { id: 'T-001', name: 'Alpha Transporter', status: 'Arrived', company: 'Logistics Inc.', arrivalDate: new Date('2024-07-20T10:00:00Z').toISOString(), storageExpiryDate: new Date('2024-08-20T10:00:00Z').toISOString(), weight: 3500, customField1: 'CF1-Alpha', customField2: 'CF2-Alpha' },
  { id: 'T-002', name: 'Beta Hauler', status: 'Scheduled', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-22T14:30:00Z').toISOString(), weight: 3200 },
  { id: 'T-003', name: 'Gamma Carrier', status: 'Empty', company: 'Cargo Movers', weight: 3000, customField1: 'CF1-Gamma' },
  { id: 'T-004', name: 'Delta Freighter', status: 'Loading', company: 'Logistics Inc.', weight: 4000 },
  { id: 'T-005', name: 'Epsilon Mover', status: 'Offloading', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-25T09:00:00Z').toISOString(), weight: 3300},
  { id: 'T-006', name: 'Zeta Voyager', status: 'Scheduled', company: 'Cargo Movers', arrivalDate: new Date('2024-07-28T16:00:00Z').toISOString(), weight: 3700},
];

const initialShipments: Shipment[] = [
  { id: uuidv4(), trailerId: 'T-001', stsJob: 12345, customerJobNumber: 'CUST-001', quantity: 50, importer: 'National Importers Ltd.', exporter: 'Global Exporters Inc.', locationNames: ['Bay A', 'Section 1-A', 'Rack 3, Shelf B', 'Pallet Spot 101', 'Aisle 5, Position 2', 'Zone Blue-7', 'Overflow Area 1', 'QC Hold Area', 'Staging Lane 4', 'Dock Door 12'], releaseDocumentName: 'release_electronics_123.pdf', clearanceDocumentName: 'clearance_electronics_123.pdf', released: true, cleared: true, weight: 1200, palletSpace: 4 },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 67890, customerJobNumber: 'CUST-002', quantity: 200, importer: 'Global Goods Inc.', exporter: 'Domestic Suppliers LLC', locationNames: ['Bay B'], released: false, cleared: false, weight: 800, palletSpace: 6 },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 11223, quantity: 10, importer: 'Cross-Border Traders', exporter: 'International Exports Co.', locationNames: ['Bay C', 'Section 2-A'], releaseDocumentName: 'industrial_release.docx', released: true, cleared: false, weight: 2500, palletSpace: 2 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 22334, customerJobNumber: 'CUST-003', quantity: 75, importer: 'FoodStuffs Co.', exporter: 'Farm Fresh Exports', locationNames: ['Shelf C-2', 'Cold Storage 1'], released: true, cleared: true, weight: 1500, palletSpace: 10 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 33445, quantity: 120, importer: 'Fashion Forward', exporter: 'Textile Mills Global', locationNames: ['Hanging Rack 5'], released: false, cleared: true, weight: 600, palletSpace: 8 },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 44556, customerJobNumber: 'CUST-004', quantity: 30, importer: 'BuildIt Supplies', exporter: 'Hardware Exports Ltd.', locationNames: ['Bulk Area 3'], released: true, cleared: false, weight: 5000, palletSpace: 5 },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 55667, quantity: 90, importer: 'HealthCorp', exporter: 'Pharma Exports Int.', locationNames: ['Pharma Vault 1'], released: true, cleared: true, weight: 300, palletSpace: 3 },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 66778, customerJobNumber: 'CUST-005', quantity: 150, importer: 'Mechanics United', exporter: 'Auto Parts Global', locationNames: ['Parts Aisle M-10'], released: false, cleared: false, weight: 1800, palletSpace: 12 },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 77889, quantity: 25, importer: 'Luxury Imports', exporter: 'Fine Goods Exporters', locationNames: ['High Value Cage 2'], released: true, cleared: true, weight: 400, palletSpace: 2 },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 88990, quantity: 500, importer: 'Warehouse Direct', exporter: 'Bulk Exporters Co.', locationNames: ['Section D', 'Overflow Area 2'], released: false, cleared: false, weight: 2200, palletSpace: 15 },
  { id: uuidv4(), trailerId: 'T-005', stsJob: 99001, customerJobNumber: 'CUST-006', quantity: 60, importer: 'Gourmet Foods', exporter: 'Specialty Exports Ltd.', locationNames: ['Pending Assignment'], released: true, cleared: true, weight: 700, palletSpace: 5 },
  { id: uuidv4(), trailerId: 'T-006', stsJob: 10101, quantity: 200, importer: 'Constructors Choice', exporter: 'Building Material Exports', locationNames: ['Pending Assignment'], released: false, cleared: false, weight: 3000, palletSpace: 20 },
];


export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [trailers, setTrailers] = useLocalStorageState<Trailer[]>('trailers', initialTrailers);
  const [shipments, setShipments] = useLocalStorageState<Shipment[]>('shipments', initialShipments);

  const addTrailer = useCallback((trailerData: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate' | 'weight' | 'company' | 'customField1' | 'customField2'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string; weight?: number; customField1?: string; customField2?: string; }) => {
    const newTrailer: Trailer = {
      id: trailerData.id, // id and name come from trailerData directly
      name: trailerData.name,
      status: trailerData.status || 'Scheduled',
      company: trailerData.company || undefined,
      arrivalDate: trailerData.arrivalDate || undefined,
      storageExpiryDate: trailerData.storageExpiryDate || undefined,
      weight: trailerData.weight || undefined,
      customField1: trailerData.customField1 || undefined,
      customField2: trailerData.customField2 || undefined,
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
    setShipments(prev => prev.filter(s => s.trailerId !== trailerId));
  }, [setTrailers, setShipments]);

  const getShipmentsByTrailerId = useCallback((trailerId: string) => {
    return shipments.filter((s) => s.trailerId === trailerId);
  }, [shipments]);

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'locationNames' | 'released' | 'cleared' | 'importer' | 'exporter' | 'stsJob' | 'customerJobNumber'> & { stsJob: number; customerJobNumber?: string; importer: string; exporter: string; initialLocationName?: string, releaseDocumentName?: string, clearanceDocumentName?: string, released?:boolean, cleared?: boolean, weight?: number, palletSpace?: number }) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      stsJob: shipmentData.stsJob,
      customerJobNumber: shipmentData.customerJobNumber || undefined,
      importer: shipmentData.importer,
      exporter: shipmentData.exporter,
      locationNames: shipmentData.initialLocationName ? [shipmentData.initialLocationName] : ['Pending Assignment'],
      releaseDocumentName: shipmentData.releaseDocumentName,
      clearanceDocumentName: shipmentData.clearanceDocumentName,
      released: shipmentData.released ?? false,
      cleared: shipmentData.cleared ?? false,
      weight: shipmentData.weight,
      palletSpace: shipmentData.palletSpace,
    };
    setShipments((prev) => [...prev, newShipment]);
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
              ...s,
              ...data,
              customerJobNumber: data.customerJobNumber !== undefined ? data.customerJobNumber : s.customerJobNumber,
              locationNames: (data.locationNames && data.locationNames.length > 0 && !(data.locationNames.length === 1 && data.locationNames[0] === 'Pending Assignment'))
                                ? data.locationNames
                                : (s.locationNames && s.locationNames.length > 0 && !(s.locationNames.length === 1 && s.locationNames[0] === 'Pending Assignment')
                                    ? s.locationNames
                                    : ['Pending Assignment']),
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

  const getShipmentById = useCallback((shipmentId: string) => {
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
        updateShipment,
        deleteShipment,
        getTrailerById,
        getShipmentById,
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
