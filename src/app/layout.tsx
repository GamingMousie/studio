
import type { Metadata } from 'next';
// Import Geist fonts using named import syntax
// These imports provide font objects directly, not loader functions.
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import { WarehouseProvider } from '@/contexts/WarehouseContext';

// The imported GeistSans and GeistMono are already font objects.
// Their .variable property provides the class name to apply the font and CSS variables.
// No need to call them as functions like GeistSans(...)

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
    // Apply font variable classes directly to the <html> tag.
    // GeistSans.variable and GeistMono.variable are class names that set up
    // CSS custom properties (e.g., --font-geist-sans, --font-geist-mono).
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* 
        The 'antialiased' class remains on the body.
        The font-family is applied via CSS variables in globals.css, for example:
        body { font-family: var(--font-geist-sans); }
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

