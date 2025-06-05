class LocationInfo {
  final String name;
  final int? pallets;

  const LocationInfo({required this.name, this.pallets});
}

enum TrailerStatus { scheduled, arrived, loading, offloading, devanned }

class Trailer {
  final String id;
  final String name;
  final TrailerStatus status;
  final String? company;
  final String? arrivalDate;
  final String? storageExpiryDate;
  final double? weight;
  final String? customField1;
  final String? customField2;

  const Trailer({
    required this.id,
    required this.name,
    required this.status,
    this.company,
    this.arrivalDate,
    this.storageExpiryDate,
    this.weight,
    this.customField1,
    this.customField2,
  });
}

class Shipment {
  final String id;
  final String trailerId;
  final int stsJob;
  final String? customerJobNumber;
  final int quantity;
  final String importer;
  final String exporter;
  final List<LocationInfo> locations;
  final bool released;
  final bool cleared;
  final double? weight;
  final double? palletSpace;

  const Shipment({
    required this.id,
    required this.trailerId,
    required this.stsJob,
    this.customerJobNumber,
    required this.quantity,
    required this.importer,
    required this.exporter,
    required this.locations,
    required this.released,
    required this.cleared,
    this.weight,
    this.palletSpace,
  });
}
