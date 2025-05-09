import Link from 'next/link';
import { ShipShapeLogo } from '@/components/icons/ShipShapeLogo';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ShipShapeLogo className="h-8 w-8" />
          <span>ShipShape</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/shipments" className="text-foreground hover:text-primary transition-colors">
              <Package className="mr-2 h-5 w-5" />
              All Shipments
            </Link>
          </Button>
          {/* Add more navigation links here if needed in the future */}
        </nav>
      </div>
    </header>
  );
};

export default Header;

