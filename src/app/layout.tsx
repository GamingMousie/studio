import type { Metadata } from 'next';
// Correctly import Geist fonts from the 'geist' package
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import { WarehouseProvider } from '@/contexts/WarehouseContext';

// Instantiate Geist fonts correctly
const geistSans = GeistSans({
  variable: '--font-geist-sans',
  // subsets are not typically specified this way for Geist/font, it handles Latin characters by default
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
});

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
    // Apply font variable classes to the <html> tag
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* 'antialiased' class remains on the body, font-family will be applied via CSS variables in globals.css */}
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
