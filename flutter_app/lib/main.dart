import 'package:flutter/material.dart';
import 'models/trailer.dart';
import 'data/initial_data.dart';

void main() {
  runApp(const ShipShapeApp());
}

class ShipShapeApp extends StatelessWidget {
  const ShipShapeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ShipShape',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const TrailerListPage(),
    );
  }
}

class TrailerListPage extends StatelessWidget {
  const TrailerListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trailers')),
      body: ListView.builder(
        itemCount: initialTrailers.length,
        itemBuilder: (context, index) {
          final trailer = initialTrailers[index];
          return ListTile(
            title: Text(trailer.name),
            subtitle: Text('Status: ${trailer.status}'),
          );
        },
      ),
    );
  }
}
