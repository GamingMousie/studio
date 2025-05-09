export type TrailerStatus = 'Scheduled' | 'Arrived' | 'Loading' | 'Offloading' | 'Empty';

export interface Trailer {
  id: string; // User-defined unique ID
  name: string; // Optional descriptive name
  status: TrailerStatus;
  company?: string; // Optional: Company associated with the trailer
  arrivalDate?: string; // Optional: Date of arrival, ISO string format
  storageExpiryDate?: string; // Optional: Date when storage expires, ISO string format
}

export interface Shipment {
  id: string; // Auto-generated unique ID
  trailerId: string;
  stsJob: number; // STS job number
  quantity: number;
  importer: string; // Added Importer
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
  stsJob: number;
  quantity: number;
  importer: string; // Added Importer
  locationName?: string;
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
  stsJob?: number;
  quantity?: number;
  importer?: string; // Added Importer
  locationName?: string;
  releaseDocumentName?: string;
  clearanceDocumentName?: string;
  released?: boolean;
  cleared?: boolean;
  weight?: number;
  palletSpace?: number;
}

// Specifically for updating an existing trailer via context
export interface TrailerUpdateData {
  name?: string;
  company?: string;
  status?: TrailerStatus;
  arrivalDate?: string | null; // Allow null to clear the date
  storageExpiryDate?: string | null; // Allow null to clear the date
}

// For AddTrailerDialog form
export interface TrailerFormData {
  id: string;
  name: string;
  company?: string;
  status: TrailerStatus; // Default to 'Scheduled' now
  arrivalDate?: Date | null; // Use Date for picker, convert to string on submit
  storageExpiryDate?: Date | null; // Use Date for picker, convert to string on submit
}
