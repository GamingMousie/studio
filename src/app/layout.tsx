
import type { Metadata } from 'next';
// Import Geist fonts using named import syntax
// These imports provide font objects directly, not loader functions.
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
// Removed cn import as it's no longer used here
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import { WarehouseProvider } from '@/contexts/WarehouseContext';

// The imported GeistSans and GeistMono are already font objects.
// Their .variable property provides the class name to apply the font and CSS variables.

export const metadata: Metadata = {
  title: 'ShipShape - Warehouse Management',
  description: 'Efficiently manage trailers, shipments, and locations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/*
        Font variable classes are applied to <html>.
        The 'antialiased' class is applied to <body>.
        The font-family is applied via CSS variables in globals.css.
      */}
      <body className="antialiased">
        <WarehouseProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </WarehouseProvider>
      </body>
    </html>
  );
}
