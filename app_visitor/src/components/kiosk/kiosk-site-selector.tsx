"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
import type { Site } from "@/components/site-context-provider";

interface KioskSiteSelectorProps {
  onSiteSelect: (site: Site) => void;
}

export function KioskSiteSelector({ onSiteSelect }: KioskSiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sites from localStorage (which is now our source of truth)
    const fetchSites = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get sites from localStorage
        const storedSites = localStorage.getItem("sites");
        if (storedSites) {
          // Filter active sites
          const allSites = JSON.parse(storedSites);
          const activeSites = allSites.filter((site: Site) => site.isActive);
          setSites(activeSites);
        } else {
          setSites([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sites:", error);
        setLoading(false);
      }
    };

    fetchSites();

    // Listen for site updates
    const handleSitesUpdated = () => {
      try {
        const storedSites = localStorage.getItem("sites");
        if (storedSites) {
          const allSites = JSON.parse(storedSites);
          const activeSites = allSites.filter((site: Site) => site.isActive);
          setSites(activeSites);
        } else {
          setSites([]);
        }
      } catch (error) {
        console.error("Error handling sites update in kiosk:", error);
      }
    };

    window.addEventListener("sitesUpdated", handleSitesUpdated);
    return () => {
      window.removeEventListener("sitesUpdated", handleSitesUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading available sites...
          </p>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">No Sites Available</CardTitle>
            <CardDescription>
              There are currently no active sites available. Please contact an
              administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSiteClick = (site: Site) => {
    console.log("Site clicked:", site);
    onSiteSelect(site);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Your Location</CardTitle>
          <CardDescription>Choose a site to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sites.map((site) => (
              <Button
                key={site.id}
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 p-6 text-center"
                onClick={(e) => {
                  e.preventDefault();
                  handleSiteClick(site);
                }}
              >
                <Building2 className="h-8 w-8" />
                <div>
                  <p className="font-medium">{site.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {site.address}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
