import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Building2, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface KioskHeaderProps {
  siteName: string;
}

export function KioskHeader({ siteName }: KioskHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-lg font-bold">VisitTrack Kiosk</h1>
          <p className="text-xs text-muted-foreground">{siteName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <Home className="h-5 w-5" />
            <span className="sr-only">Return to Home</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
