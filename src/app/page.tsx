import Link from 'next/link';
import { Button } from '@/components/retroui/Button';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold font-sans tracking-tight mb-4">
          Welcome to Weather One
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your comprehensive weather companion featuring forecast analysis, comfort assessment, 
          and a vibrant community of weather enthusiasts.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/weather">Check Weather</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/community">Join Community</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mt-8">
        <div className="rounded-lg border-2 border-black p-6 shadow bg-card">
          <h2 className="text-xl font-semibold mb-3">Weather Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Get detailed weather forecasts with comfort assessments powered by OpenWeather 
            and NASA POWER data. Perfect for planning your activities.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/weather">Try Now</Link>
          </Button>
        </div>
        
        <div className="rounded-lg border-2 border-black p-6 shadow bg-card">
          <h2 className="text-xl font-semibold mb-3">Community Posts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share your weather experiences, tips, and connect with fellow weather enthusiasts 
            in our moderated community space.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/community">Explore</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
