import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Monitor, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">VisitTrack</h1>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Visitor Management System
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Welcome to VisitTrack, your comprehensive visitor management
              solution
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Admin Portal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Admin Portal
                </CardTitle>
                <CardDescription>
                  Secure access for administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access the admin portal to manage visitors, view logs,
                  schedule appointments, and configure system settings.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/admin/login">Admin Login</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Kiosk Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Kiosk Mode
                </CardTitle>
                <CardDescription>Self-service visitor check-in</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access the kiosk interface for visitor self-check-in, designed
                  for tablets and touch screens at your reception area.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/kiosk">Launch Kiosk</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentation
                </CardTitle>
                <CardDescription>System guides and help</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access user guides, administrator documentation, and help
                  resources for the visitor management system.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/documents">View Documentation</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>© 2025 VisitTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
