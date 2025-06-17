import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

// Define the site data structure
export interface Site {
  id: string;
  name: string;
  address: string;
  logo?: string;
  timezone: string;
  isActive?: boolean;
  email?: string;
}

// Mock data for sites - we'll store this in localStorage to persist changes
export const MOCK_SITES: Site[] = [
  {
    id: "hq",
    name: "Headquarters",
    address: "123 Main St, San Francisco, CA",
    timezone: "America/Los_Angeles",
    isActive: true,
  },
  {
    id: "nyc",
    name: "New York Office",
    address: "456 Park Ave, New York, NY",
    timezone: "America/New_York",
    isActive: true,
  },
  {
    id: "london",
    name: "London Office",
    address: "10 Downing St, London, UK",
    timezone: "Europe/London",
    isActive: true,
  },
  {
    id: "tokyo",
    name: "Tokyo Office",
    address: "1-1 Chiyoda, Tokyo, Japan",
    timezone: "Asia/Tokyo",
    isActive: true,
  },
];

// Define user site access types
export interface UserSiteAccess {
  userId: string;
  siteIds: string[];
  role: "admin" | "manager" | "receptionist" | "superadmin";
}

// Mock user site access (in a real app, this would come from an API)
export const MOCK_USER_SITE_ACCESS: UserSiteAccess[] = [
  {
    userId: "user1",
    siteIds: ["hq", "nyc"],
    role: "admin",
  },
  {
    userId: "user2",
    siteIds: ["london"],
    role: "manager",
  },
  {
    userId: "superadmin",
    siteIds: ["hq", "nyc", "london", "tokyo"],
    role: "superadmin",
  },
];

// Create the context
interface SiteContextType {
  sites: Site[];
  currentSite: Site | null;
  setCurrentSite: (site: Site) => void;
  userSites: Site[];
  isSuperAdmin: boolean;
  loading: boolean;
  refreshData: () => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  // New methods for site management
  addSite: (site: Omit<Site, "id">) => Site;
  updateSite: (id: string, updates: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  toggleSiteStatus: (id: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Helper to initialize sites from localStorage or default to MOCK_SITES
const initializeSites = (): Site[] => {
  if (typeof window === "undefined") return MOCK_SITES;

  try {
    const storedSites = localStorage.getItem("sites");
    if (storedSites) {
      return JSON.parse(storedSites);
    }
  } catch (error) {
    console.error("Error loading sites from localStorage:", error);
  }

  // Initialize localStorage with default sites if not present
  localStorage.setItem("sites", JSON.stringify(MOCK_SITES));
  return MOCK_SITES;
};

// Helper to get user role from localStorage
const getUserRole = (): string => {
  if (typeof window === "undefined") return "";

  try {
    const userData = localStorage.getItem("admin-user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.role || "";
    }
  } catch (error) {
    console.error("Error getting user role:", error);
  }

  return "";
};

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [userSites, setUserSites] = useState<Site[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");

  // Function to refresh data when site changes
  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Function to save sites to localStorage
  const saveSites = (updatedSites: Site[]) => {
    try {
      localStorage.setItem("sites", JSON.stringify(updatedSites));
      // Dispatch a custom event to notify other components about the site changes
      window.dispatchEvent(new Event("sitesUpdated"));
    } catch (error) {
      console.error("Error saving sites to localStorage:", error);
    }
  };

  // Add a new site
  const addSite = (siteData: Omit<Site, "id">): Site => {
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      isActive: true,
    };

    const updatedSites = [...sites, newSite];
    setSites(updatedSites);
    saveSites(updatedSites);

    // Update user sites if super admin
    if (isSuperAdmin) {
      setUserSites(updatedSites.filter((site) => site.isActive));
    }

    return newSite;
  };

  // Update an existing site
  const updateSite = (id: string, updates: Partial<Site>) => {
    const updatedSites = sites.map((site) =>
      site.id === id ? { ...site, ...updates } : site
    );

    setSites(updatedSites);
    saveSites(updatedSites);

    // Update current site if it's the one being updated
    if (currentSite?.id === id) {
      setCurrentSite({ ...currentSite, ...updates });
    }

    // Update user sites
    setUserSites((prev) =>
      prev.map((site) => (site.id === id ? { ...site, ...updates } : site))
    );
  };

  // Delete a site
  const deleteSite = (id: string) => {
    const updatedSites = sites.filter((site) => site.id !== id);
    setSites(updatedSites);
    saveSites(updatedSites);

    // Update user sites
    setUserSites((prev) => prev.filter((site) => site.id !== id));

    // If current site is deleted, select another one
    if (currentSite?.id === id) {
      const availableSites = updatedSites.filter((site) => site.isActive);
      if (availableSites.length > 0) {
        setCurrentSite(availableSites[0]);
        localStorage.setItem("last-selected-site", availableSites[0].id);
      } else {
        setCurrentSite(null);
        localStorage.removeItem("last-selected-site");
      }
    }
  };
  // Add a default site if all sites are deleted

  // Toggle site active status
  const toggleSiteStatus = (id: string) => {
    const updatedSites = sites.map((site) =>
      site.id === id ? { ...site, isActive: !site.isActive } : site
    );

    setSites(updatedSites);
    saveSites(updatedSites);

    // Update user sites
    const activeSites = updatedSites.filter((site) => site.isActive);
    setUserSites(activeSites);

    // If current site is deactivated, select another one
    if (
      currentSite?.id === id &&
      !updatedSites.find((s) => s.id === id)?.isActive
    ) {
      if (activeSites.length > 0) {
        setCurrentSite(activeSites[0]);
        localStorage.setItem("last-selected-site", activeSites[0].id);
      } else {
        setCurrentSite(null);
        localStorage.removeItem("last-selected-site");
      }
    }
  };

  // Initialize sites and user role
  useEffect(() => {
    const fetchSites = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Load sites from localStorage
        const allSites = initializeSites();
        setSites(allSites);

        // Get user role from localStorage
        const userRole = getUserRole();
        const userIsSuperAdmin = userRole === "superadmin";
        setIsSuperAdmin(userIsSuperAdmin);

        // Get user ID from localStorage (in a real app, this would come from auth)
        const userId = localStorage.getItem("admin-user-id") || "superadmin";

        // Check if this is a site-specific admin
        const isSiteAdmin = userId.startsWith("site-admin-");
        let siteSpecificId = "";

        if (isSiteAdmin) {
          siteSpecificId = userId.replace("site-admin-", "");
        }

        // Get user access
        let userAccess = MOCK_USER_SITE_ACCESS.find(
          (access) => access.userId === userId
        );

        // If site-specific admin, create custom access
        if (isSiteAdmin) {
          userAccess = {
            userId: userId,
            siteIds: [siteSpecificId],
            role: "admin",
          };
        }

        if (userAccess) {
          // Filter sites based on user access and active status
          let accessibleSites;
          if (userIsSuperAdmin) {
            accessibleSites = allSites.filter((site) => site.isActive);
          } else {
            accessibleSites = allSites.filter(
              (site) => userAccess.siteIds.includes(site.id) && site.isActive
            );
          }

          setUserSites(accessibleSites);

          // Set initial site
          if (accessibleSites.length > 0) {
            // Try to get last selected site from localStorage
            const lastSiteId = localStorage.getItem("last-selected-site");

            // For site-specific admin, always use their site
            const siteToSelect = isSiteAdmin
              ? accessibleSites.find((site) => site.id === siteSpecificId)
              : lastSiteId
              ? accessibleSites.find((site) => site.id === lastSiteId)
              : null;

            setCurrentSite(siteToSelect || accessibleSites[0]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sites:", error);
        setLoading(false);
      }
    };

    fetchSites();

    // Listen for site updates from other components
    const handleSitesUpdated = () => {
      try {
        const storedSites = localStorage.getItem("sites");
        if (storedSites) {
          const parsedSites = JSON.parse(storedSites);
          setSites(parsedSites);

          // Update user sites based on role
          if (isSuperAdmin) {
            setUserSites(parsedSites.filter((site: any) => site.isActive));
          } else {
            // Get user ID from localStorage
            const userId =
              localStorage.getItem("admin-user-id") || "superadmin";

            // Get user access
            const userAccess = MOCK_USER_SITE_ACCESS.find(
              (access) => access.userId === userId
            );

            if (userAccess) {
              const accessibleSites = parsedSites.filter(
                (site: any) =>
                  userAccess.siteIds.includes(site.id) && site.isActive
              );
              setUserSites(accessibleSites);
            }
          }
        }
      } catch (error) {
        console.error("Error handling sites update:", error);
      }
    };

    window.addEventListener("sitesUpdated", handleSitesUpdated);
    return () => {
      window.removeEventListener("sitesUpdated", handleSitesUpdated);
    };
  }, []);

  // Update localStorage when site changes
  const handleSetCurrentSite = (site: Site) => {
    setCurrentSite(site);
    localStorage.setItem("last-selected-site", site.id);
    refreshData(); // Refresh data when site changes
  };

  return (
    <SiteContext.Provider
      value={{
        sites,
        currentSite,
        setCurrentSite: handleSetCurrentSite,
        userSites,
        isSuperAdmin,
        loading,
        refreshData,
        timeFilter,
        setTimeFilter,
        // New site management methods
        addSite,
        updateSite,
        deleteSite,
        toggleSiteStatus,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

// Also provide the new name for future use
export function SiteContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteProvider>{children}</SiteProvider>;
}

// Create a hook to use the site context - keeping the original name for compatibility
export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}

// Also provide the new name for future use
export function useSiteContext() {
  return useSite();
}
