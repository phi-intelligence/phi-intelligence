import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center max-w-md px-6 space-y-8">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Error</p>
        <h1 className="text-8xl font-bold tracking-tighter text-white/10">404</h1>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight uppercase">Page Not Found</h2>
          <p className="text-white/50 font-light">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 font-bold">
              Back to Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
