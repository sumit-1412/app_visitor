import { useState, useEffect } from "react";
import { KioskHeader } from "@/components/kiosk/kiosk-header";
import { KioskSiteSelector } from "@/components/kiosk/kiosk-site-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewVisitorCheckIn } from "@/components/kiosk/new-visitor-check-in";
import { PreRegisteredVisitor } from "@/components/kiosk/pre-registered-visitor";
import type { Site } from "@/components/site-context-provider";
import { SecuritySettingsProvider } from "@/components/security-settings-provider";
import { MOCK_SITES } from "@/components/site-context-provider";

export default function KioskPage() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [securitySettings, setSecuritySettings] = useState({
    requirePhoto: true,
    requireNDA: false,
    enableOtpVerification: false,
    hostApproval: false,
    guardApproval: true,
  });

  // Load security settings from localStorage
  useEffect(() => {
    setSelectedSite(MOCK_SITES[0]); //to be removed when real site selection is implemented

    const loadSecuritySettings = () => {
      try {
        const savedSettings = localStorage.getItem("security-settings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          console.log("Loaded security settings:", parsedSettings);
          setSecuritySettings(parsedSettings);
        }
      } catch (error) {
        console.error("Error loading security settings:", error);
      }
    };

    loadSecuritySettings();

    // Set up event listener for security settings changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "security-settings") {
        try {
          if (event.newValue) {
            const parsedSettings = JSON.parse(event.newValue);
            console.log("Security settings updated:", parsedSettings);
            setSecuritySettings(parsedSettings);
          }
        } catch (error) {
          console.error("Error parsing updated security settings:", error);
        }
      }
    };

    // Also listen for the custom event
    const handleSecuritySettingsUpdate = () => {
      loadSecuritySettings();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "securitySettingsUpdated",
      handleSecuritySettingsUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "securitySettingsUpdated",
        handleSecuritySettingsUpdate
      );
    };
  }, []);

  const handleSiteSelect = (site: Site) => {
    console.log("Site selected in KioskPage:", site);
    setSelectedSite(site);
  };

  const handleCompleteCheckIn = () => {
    // Reset to site selection
    setSelectedSite(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <KioskHeader
        siteName={selectedSite ? selectedSite.name : "Select a Site"}
      />
      <main className="flex-1 container mx-auto py-8 px-4">
        {!selectedSite ? (
          <KioskSiteSelector onSiteSelect={handleSiteSelect} />
        ) : (
          <SecuritySettingsProvider initialSiteId={selectedSite.id}>
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="new" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="new">New Visitor</TabsTrigger>
                  <TabsTrigger value="pre-registered">
                    Pre-registered
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="mt-6">
                  <NewVisitorCheckIn
                    onComplete={handleCompleteCheckIn}
                    securitySettings={securitySettings}
                  />
                </TabsContent>
                <TabsContent value="pre-registered" className="mt-6">
                  <PreRegisteredVisitor
                    onComplete={handleCompleteCheckIn}
                    securitySettings={securitySettings}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </SecuritySettingsProvider>
        )}
      </main>
    </div>
  );
}
