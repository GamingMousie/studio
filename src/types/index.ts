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
  destination: string;
  locationName: string; // Warehouse location name, e.g., "Bay A1", "Shelf 3-C"
  releaseDocumentName?: string; // Optional: Name of the release document
  clearanceDocumentName?: string; // Optional: Name of the clearance document
}

