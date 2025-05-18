
// @ts-nocheck
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import type { Trailer, Shipment, TrailerStatus, ShipmentUpdateData, TrailerUpdateData, LocationInfo } from '@/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique shipment IDs

interface WarehouseContextType {
  trailers: Trailer[];
  addTrailer: (trailer: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate' | 'weight' | 'company' | 'customField1' | 'customField2' | 'outturnReportDocumentName' | 't1SummaryDocumentName' | 'manifestDocumentName' | 'acpDocumentName'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string; weight?: number; customField1?: string; customField2?: string; }) => void;
  updateTrailerStatus: (trailerId: string, status: TrailerStatus) => void;
  updateTrailer: (trailerId: string, data: TrailerUpdateData) => void;
  deleteTrailer: (trailerId: string) => void;
  shipments: Shipment[];
  getShipmentsByTrailerId: (trailerId: string) => Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'locations' | 'released' | 'cleared' | 'importer' | 'exporter' | 'stsJob' | 'customerJobNumber' | 'releasedAt' | 'emptyPalletRequired' | 'mrn' | 'clearanceDate'> & { stsJob: number; customerJobNumber?: string; importer: string; exporter: string; initialLocationName?: string, initialLocationPallets?: number, releaseDocumentName?: string, clearanceDocumentName?: string, released?: boolean, cleared?: boolean, weight?: number, palletSpace?: number, emptyPalletRequired?: number, mrn?: string }) => void;
  deleteShipment: (shipmentId: string) => void;
  getTrailerById: (trailerId: string) => Trailer | undefined;
  getShipmentById: (shipmentId: string) => Shipment | undefined;
  updateShipmentReleasedStatus: (shipmentId: string, released: boolean) => void; // Potentially could be merged into updateShipment
  updateShipmentClearedStatus: (shipmentId: string, cleared: boolean) => void; // Potentially could be merged into updateShipment
  updateShipment: (shipmentId: string, data: ShipmentUpdateData) => void;
  markShipmentAsPrinted: (shipmentId: string) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialTrailers: Trailer[] = [
  { id: 'T-001', name: 'Alpha Transporter', status: 'Arrived', company: 'Logistics Inc.', arrivalDate: new Date('2024-07-20T10:00:00Z').toISOString(), storageExpiryDate: new Date('2024-08-20T10:00:00Z').toISOString(), weight: 3500, customField1: 'CF1-Alpha', customField2: 'CF2-Alpha', outturnReportDocumentName: 'T-001_outturn_report.pdf', t1SummaryDocumentName: 'T-001_T1_summary.pdf', manifestDocumentName: 'T-001_manifest.pdf', acpDocumentName: 'ACP_Form_T-001.pdf' },
  { id: 'T-002', name: 'Beta Hauler', status: 'Scheduled', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-22T14:30:00Z').toISOString(), weight: 3200 },
  { id: 'T-003', name: 'Gamma Carrier', status: 'Devanned', company: 'Cargo Movers', weight: 3000, customField1: 'CF1-Gamma', t1SummaryDocumentName: 'Gamma_T1_summary.pdf' },
  { id: 'T-004', name: 'Delta Freighter', status: 'Loading', company: 'Logistics Inc.', weight: 4000, outturnReportDocumentName: 'Delta_damage_report.pdf', manifestDocumentName: 'Delta_manifest.pdf' },
  { id: 'T-005', name: 'Epsilon Mover', status: 'Offloading', company: 'QuickShip Co.', arrivalDate: new Date('2024-07-25T09:00:00Z').toISOString(), weight: 3300},
  { id: 'T-006', name: 'Zeta Voyager', status: 'Scheduled', company: 'Cargo Movers', arrivalDate: new Date('2024-07-28T16:00:00Z').toISOString(), weight: 3700},
];

const initialShipments: Shipment[] = [
  { id: uuidv4(), trailerId: 'T-001', stsJob: 12345, customerJobNumber: 'CUST-001', quantity: 50, importer: 'National Importers Ltd.', exporter: 'Global Exporters Inc.', locations: [{name: 'Bay A', pallets: 10}, {name: 'Section 1-A', pallets: 5}, {name: 'Rack 3, Shelf B', pallets: 10}, {name: 'Pallet Spot 101', pallets:2}, {name: 'Aisle 5, Position 2', pallets:3}, {name: 'Zone Blue-7', pallets:8}, {name: 'Overflow Area 1', pallets:7}, {name: 'QC Hold Area', pallets:1}, {name: 'Staging Lane 4', pallets:3}, {name: 'Dock Door 12', pallets:1}], releaseDocumentName: 'release_electronics_123.pdf', clearanceDocumentName: 'clearance_electronics_123.pdf', released: true, cleared: true, weight: 1200, palletSpace: 42, releasedAt: new Date('2024-07-21T10:00:00Z').toISOString(), emptyPalletRequired: 1, mrn: '24GB000000000000A1', clearanceDate: new Date('2024-07-20T15:30:00Z').toISOString() },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 67890, customerJobNumber: 'CUST-002', quantity: 200, importer: 'Global Goods Inc.', exporter: 'Domestic Suppliers LLC', locations: [{name: 'Bay B', pallets: 15}], released: false, cleared: false, weight: 800, palletSpace: 15, releasedAt: undefined, emptyPalletRequired: 0, mrn: '24GB000000000000A2', clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 11223, quantity: 10, importer: 'Cross-Border Traders', exporter: 'International Exports Co.', locations: [{name: 'Bay C', pallets: 1}, {name: 'Section 2-A', pallets:1}], releaseDocumentName: 'industrial_release.docx', released: true, cleared: false, weight: 2500, palletSpace: 2, releasedAt: undefined, emptyPalletRequired: 0, clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 22334, customerJobNumber: 'CUST-003', quantity: 75, importer: 'FoodStuffs Co.', exporter: 'Farm Fresh Exports', locations: [{name: 'Shelf C-2', pallets: 5}, {name: 'Cold Storage 1', pallets:5}], released: true, cleared: true, weight: 1500, palletSpace: 10, releasedAt: new Date('2024-07-23T11:00:00Z').toISOString(), emptyPalletRequired: 2, mrn: '24GB000000000000A3', clearanceDate: new Date('2024-07-23T09:00:00Z').toISOString() },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 33445, quantity: 120, importer: 'Fashion Forward', exporter: 'Textile Mills Global', locations: [{name: 'Hanging Rack 5', pallets:8}], released: false, cleared: true, weight: 600, palletSpace: 8, releasedAt: undefined, emptyPalletRequired: 0, clearanceDate: new Date('2024-07-22T10:15:00Z').toISOString() },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 44556, customerJobNumber: 'CUST-004', quantity: 30, importer: 'BuildIt Supplies', exporter: 'Hardware Exports Ltd.', locations: [{name: 'Bulk Area 3', pallets:5}], released: true, cleared: false, weight: 5000, palletSpace: 5, releasedAt: undefined, emptyPalletRequired: 1, mrn: '24IE000000000000X1', clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-001', stsJob: 55667, quantity: 90, importer: 'HealthCorp', exporter: 'Pharma Exports Int.', locations: [{name: 'Pharma Vault 1', pallets:3}], released: true, cleared: true, weight: 300, palletSpace: 3, releasedAt: new Date('2024-07-24T12:30:00Z').toISOString(), emptyPalletRequired: 0, clearanceDate: new Date('2024-07-24T08:00:00Z').toISOString() },
  { id: uuidv4(), trailerId: 'T-002', stsJob: 66778, customerJobNumber: 'CUST-005', quantity: 150, importer: 'Mechanics United', exporter: 'Auto Parts Global', locations: [{name: 'Parts Aisle M-10', pallets:12}], released: false, cleared: false, weight: 1800, palletSpace: 12, releasedAt: undefined, emptyPalletRequired: 3, clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-004', stsJob: 77889, quantity: 25, importer: 'Luxury Imports', exporter: 'Fine Goods Exporters', locations: [{name: 'High Value Cage 2', pallets:2}], released: true, cleared: true, weight: 400, palletSpace: 2, releasedAt: new Date('2024-07-25T15:00:00Z').toISOString(), emptyPalletRequired: 0, clearanceDate: new Date('2024-07-25T11:00:00Z').toISOString() },
  { id: uuidv4(), trailerId: 'T-003', stsJob: 88990, quantity: 500, importer: 'Warehouse Direct', exporter: 'Bulk Exporters Co.', locations: [{name: 'Section D', pallets:10}, {name: 'Overflow Area 2', pallets:5}], released: false, cleared: false, weight: 2200, palletSpace: 15, releasedAt: undefined, emptyPalletRequired: 0, mrn: '24GB000000000000A4', clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-005', stsJob: 99001, customerJobNumber: 'CUST-006', quantity: 60, importer: 'Gourmet Foods', exporter: 'Specialty Exports Ltd.', locations: [{name: 'Pending Assignment'}], released: true, cleared: true, weight: 700, palletSpace: 5, releasedAt: undefined, emptyPalletRequired: 1, clearanceDate: null },
  { id: uuidv4(), trailerId: 'T-006', stsJob: 10101, quantity: 200, importer: 'Constructors Choice', exporter: 'Building Material Exports', locations: [{name: 'Pending Assignment'}], released: false, cleared: false, weight: 3000, palletSpace: 20, releasedAt: undefined, emptyPalletRequired: 0, clearanceDate: null },
];


export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [trailers, setTrailers] = useLocalStorageState<Trailer[]>('trailers', initialTrailers);
  const [shipments, setShipments] = useLocalStorageState<Shipment[]>('shipments', initialShipments);

  const addTrailer = useCallback((trailerData: Omit<Trailer, 'status' | 'arrivalDate' | 'storageExpiryDate' | 'weight' | 'company' | 'customField1' | 'customField2' | 'outturnReportDocumentName' | 't1SummaryDocumentName' | 'manifestDocumentName' | 'acpDocumentName'> & { status?: TrailerStatus; company?: string; arrivalDate?: string; storageExpiryDate?: string; weight?: number; customField1?: string; customField2?: string; }) => {
    const newTrailer: Trailer = {
      id: trailerData.id,
      name: trailerData.name,
      status: trailerData.status || 'Scheduled',
      company: trailerData.company || undefined,
      arrivalDate: trailerData.arrivalDate || undefined,
      storageExpiryDate: trailerData.storageExpiryDate || undefined,
      weight: trailerData.weight || undefined,
      customField1: trailerData.customField1 || undefined,
      customField2: trailerData.customField2 || undefined,
      outturnReportDocumentName: undefined,
      t1SummaryDocumentName: undefined,
      manifestDocumentName: undefined,
      acpDocumentName: undefined,
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

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'locations' | 'released' | 'cleared' | 'importer' | 'exporter' | 'stsJob' | 'customerJobNumber' | 'releasedAt' | 'emptyPalletRequired' | 'mrn' | 'clearanceDate'> & { stsJob: number; customerJobNumber?: string; importer: string; exporter: string; initialLocationName?: string, initialLocationPallets?: number, releaseDocumentName?: string, clearanceDocumentName?: string, released?:boolean, cleared?: boolean, weight?: number, palletSpace?: number, emptyPalletRequired?: number, mrn?: string }) => {

    let initialLocations: LocationInfo[];
    if (shipmentData.initialLocationName) {
      initialLocations = [{ name: shipmentData.initialLocationName, pallets: shipmentData.initialLocationPallets }];
    } else {
      initialLocations = [{ name: 'Pending Assignment' }];
    }

    const newShipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      stsJob: shipmentData.stsJob,
      customerJobNumber: shipmentData.customerJobNumber || undefined,
      importer: shipmentData.importer,
      exporter: shipmentData.exporter,
      locations: initialLocations,
      releaseDocumentName: shipmentData.releaseDocumentName,
      clearanceDocumentName: shipmentData.clearanceDocumentName,
      released: shipmentData.released ?? false,
      cleared: shipmentData.cleared ?? false,
      weight: shipmentData.weight,
      palletSpace: shipmentData.palletSpace,
      releasedAt: undefined,
      emptyPalletRequired: shipmentData.emptyPalletRequired ?? 0,
      mrn: shipmentData.mrn || undefined,
      clearanceDate: (shipmentData.cleared || shipmentData.clearanceDocumentName) ? new Date().toISOString() : null,
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
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            cleared,
            clearanceDate: cleared ? (s.clearanceDate || new Date().toISOString()) : null,
          };
        }
        return s;
      })
    );
  }, [setShipments]);

  const updateShipment = useCallback((shipmentId: string, data: ShipmentUpdateData) => {
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          const updatedShipment = { ...s, ...data };

          updatedShipment.customerJobNumber = data.customerJobNumber !== undefined ? data.customerJobNumber : s.customerJobNumber;
          updatedShipment.mrn = data.mrn !== undefined ? data.mrn : s.mrn;


          if (data.locations && data.locations.length > 0 && !(data.locations.length === 1 && data.locations[0].name === 'Pending Assignment')) {
            updatedShipment.locations = data.locations;
          } else if (!data.locations) {
             updatedShipment.locations = s.locations && s.locations.length > 0 && !(s.locations.length ===1 && s.locations[0].name === 'Pending Assignment')
                                      ? s.locations
                                      : [{name: 'Pending Assignment'}];
          } else {
            updatedShipment.locations = [{name: 'Pending Assignment'}];
          }

          if (data.releasedAt !== undefined) {
            updatedShipment.releasedAt = data.releasedAt;
          }

          updatedShipment.emptyPalletRequired = data.emptyPalletRequired ?? s.emptyPalletRequired ?? 0;

          // Handle clearanceDate
          let newClearanceDate = s.clearanceDate;

          if (Object.prototype.hasOwnProperty.call(data, 'clearanceDate')) {
            newClearanceDate = data.clearanceDate;
          } else {
            if (data.cleared === true) {
              if (!s.clearanceDate) {
                newClearanceDate = new Date().toISOString();
              }
            } else if (data.cleared === false) {
              newClearanceDate = null;
            }
          }

          if ((data.cleared === true || (data.cleared === undefined && updatedShipment.cleared)) &&
              data.clearanceDocumentName && !s.clearanceDocumentName && newClearanceDate === null) {
            newClearanceDate = new Date().toISOString();
          }


          updatedShipment.clearanceDate = newClearanceDate;

          return updatedShipment;
        }
        return s;
      })
    );
  }, [setShipments]);

  const markShipmentAsPrinted = useCallback((shipmentId: string) => {
    const nowISO = new Date().toISOString();
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId ? { ...s, releasedAt: nowISO } : s
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
        markShipmentAsPrinted,
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
