import Link from 'next/link';
import { Button } from './Button';

export function Navigation() {
  return (
    <nav className="w-full border-b-2 border-black bg-card p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold font-sans tracking-tight hover:text-primary transition-colors">
          Weather One
        </Link>
        
        <div className="flex items-center gap-3">
          <Button asChild variant="link" size="sm">
            <Link href="/weather">Weather</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link href="/community">Community</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}