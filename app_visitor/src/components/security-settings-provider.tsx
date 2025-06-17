"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface SecuritySettings {
  requirePhoto: boolean;
  enableOtpVerification: boolean;
  requireNDA: boolean;
  hostApproval: boolean;
  guardApproval: boolean;
}

interface SecuritySettingsContextType {
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: SecuritySettings) => Promise<void>;
  isLoading: boolean;
  currentSiteId: string;
}

const SecuritySettingsContext = createContext<
  SecuritySettingsContextType | undefined
>(undefined);

export function SecuritySettingsProvider({
  children,
  initialSiteId,
}: {
  children: ReactNode;
  initialSiteId: string;
}) {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requirePhoto: true,
    enableOtpVerification: false,
    requireNDA: false,
    hostApproval: false,
    guardApproval: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load security settings from localStorage
  useEffect(() => {
    const loadSecuritySettings = () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        const savedSettings = localStorage.getItem(
          `security-settings-${initialSiteId}`
        );
        if (savedSettings) {
          setSecuritySettings(JSON.parse(savedSettings));
        } else {
          // Set default settings if none exist
          const defaultSettings: SecuritySettings = {
            requirePhoto: true,
            enableOtpVerification: false,
            requireNDA: false,
            hostApproval: false,
            guardApproval: true,
          };
          setSecuritySettings(defaultSettings);
          localStorage.setItem(
            `security-settings-${initialSiteId}`,
            JSON.stringify(defaultSettings)
          );
        }
      } catch (error) {
        console.error("Error loading security settings:", error);
        toast("Error-Failed to load security settings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSecuritySettings();
  }, [initialSiteId, toast]);

  // Update security settings
  const updateSecuritySettings = async (settings: SecuritySettings) => {
    try {
      // In a real app, this would be an API call
      localStorage.setItem(
        `security-settings-${initialSiteId}`,
        JSON.stringify(settings)
      );
      setSecuritySettings(settings);

      // Also update the global security settings for the kiosk
      localStorage.setItem("security-settings", JSON.stringify(settings));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("securitySettingsUpdated"));

      return Promise.resolve();
    } catch (error) {
      console.error("Error updating security settings:", error);
      return Promise.reject(error);
    }
  };

  return (
    <SecuritySettingsContext.Provider
      value={{
        securitySettings,
        updateSecuritySettings,
        isLoading,
        currentSiteId: initialSiteId,
      }}
    >
      {children}
    </SecuritySettingsContext.Provider>
  );
}

export function useSecuritySettings() {
  const context = useContext(SecuritySettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSecuritySettings must be used within a SecuritySettingsProvider"
    );
  }
  return context;
}
