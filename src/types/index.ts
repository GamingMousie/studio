export type TrailerStatus = 'Docked' | 'In-Transit' | 'Empty' | 'Loading' | 'Unloading';

export interface Trailer {
  id: string; // User-defined unique ID
  name: string; // Optional descriptive name
  status: TrailerStatus;
  company?: string; // Optional: Company associated with the trailer
}

export interface Shipment {
  id: string; // Auto-generated unique ID
  trailerId: string;
  contentDescription: string;
  quantity: number;
  exporter: string; // Changed from destination
  locationName: string; // Warehouse location name, e.g., "Bay A1", "Shelf 3-C"
  releaseDocumentName?: string; // Optional: Name of the release document
  clearanceDocumentName?: string; // Optional: Name of the clearance document
  released: boolean; // Indicates if the shipment has permission to be released
  cleared: boolean; // Indicates if the shipment is cleared
  weight?: number; // Optional: Weight of the shipment in kg
  palletSpace?: number; // Optional: Pallet spaces occupied by the shipment
}

// Used for the form data when creating or updating a shipment
export interface ShipmentFormData {
  contentDescription: string;
  quantity: number;
  exporter: string;
  locationName?: string;
  // FileList for new files, string for existing file names (when editing and not changing)
  // However, for context update, we'll pass resolved file names.
  releaseDocument?: FileList | File | null; 
  clearanceDocument?: FileList | File | null;
  released?: boolean;
  cleared?: boolean;
  weight?: number | null;
  palletSpace?: number | null;
}

// Specifically for updating an existing shipment via context
// Made all fields optional to support partial updates (e.g. just status and document name)
export interface ShipmentUpdateData {
  contentDescription?: string;
  quantity?: number;
  exporter?: string;
  locationName?: string;
  releaseDocumentName?: string;
  clearanceDocumentName?: string;
  released?: boolean;
  cleared?: boolean;
  weight?: number;
  palletSpace?: number;
}

