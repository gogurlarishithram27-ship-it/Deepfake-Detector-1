import { Link, useLocation } from "wouter";
import { Shield, Info } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold font-mono tracking-tight hidden md:inline-block">Deepfake Detector PRO</span>
          </Link>
          <div className="hidden md:flex items-center text-xs text-muted-foreground mr-6 space-x-2 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            <span className="font-mono">AMD ROCm · Hugging Face · Multimodal</span>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-4">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Workspace
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors hover:text-primary ${location === "/about" ? "text-foreground" : "text-muted-foreground"}`}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col w-full max-w-screen-2xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
