import Link from 'next/link';
import { ShipShapeLogo } from '@/components/icons/ShipShapeLogo';

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ShipShapeLogo className="h-8 w-8" />
          <span>ShipShape</span>
        </Link>
        <nav>
          {/* Add navigation links here if needed in the future */}
          {/* Example: <Link href="/locations" className="text-foreground hover:text-primary transition-colors">Locations</Link> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
