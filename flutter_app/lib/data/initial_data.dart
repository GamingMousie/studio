import '../models/trailer.dart';

const initialTrailers = [
  Trailer(
    id: 'T-001',
    name: 'Alpha Transporter',
    status: TrailerStatus.arrived,
    company: 'Logistics Inc.',
  ),
  Trailer(
    id: 'T-002',
    name: 'Beta Hauler',
    status: TrailerStatus.scheduled,
    company: 'QuickShip Co.',
  ),
];

const initialShipments = [
  Shipment(
    id: 'S1',
    trailerId: 'T-001',
    stsJob: 67890,
    quantity: 200,
    importer: 'Global Goods Inc.',
    exporter: 'Domestic Suppliers LLC',
    locations: [LocationInfo(name: 'Bay B', pallets: 15)],
    released: false,
    cleared: false,
  ),
  Shipment(
    id: 'S2',
    trailerId: 'T-002',
    stsJob: 11223,
    quantity: 10,
    importer: 'Cross-Border Traders',
    exporter: 'International Exports Co.',
    locations: [LocationInfo(name: 'Bay C', pallets: 1)],
    released: true,
    cleared: false,
  ),
];
