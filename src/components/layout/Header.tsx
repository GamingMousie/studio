
import Link from 'next/link';
import { ShipShapeLogo } from '@/components/icons/ShipShapeLogo';
import { Button } from '@/components/ui/button';
import { Package, CalendarDays } from 'lucide-react'; // Added CalendarDays

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ShipShapeLogo className="h-8 w-8" />
          <span>ShipShape</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" asChild className="px-2 sm:px-3">
            <Link href="/shipments" className="text-foreground hover:text-primary transition-colors text-xs sm:text-sm">
              <Package className="mr-1 sm:mr-2 h-4 w-4" />
              All Shipments
            </Link>
          </Button>
          <Button variant="ghost" asChild className="px-2 sm:px-3">
            <Link href="/calendar" className="text-foreground hover:text-primary transition-colors text-xs sm:text-sm">
              <CalendarDays className="mr-1 sm:mr-2 h-4 w-4" />
              Calendar
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
