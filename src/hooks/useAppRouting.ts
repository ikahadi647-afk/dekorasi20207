import React, { useState, useEffect, useCallback } from "react";
import { ViewType } from "../types";
import { LAST_ROUTE_STORAGE_KEY } from "../routes/routesConfig";

export interface UseAppRoutingProps {
  isAuthenticated: boolean;
  profile: any;
  teamPaymentsLoaded: boolean;
  setTeamProjectPayments: React.Dispatch<React.SetStateAction<any[]>>;
  setTeamPaymentsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  onMarkNotificationRead: (id: string) => void;
  appDataLoader: {
    loadTotals: () => Promise<void>;
    loadClientFeedback: () => Promise<void>;
  };
}

export interface UseAppRoutingReturn {
  route: string;
  activeView: ViewType;
  setActiveView: React.Dispatch<React.SetStateAction<ViewType>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  initialAction: string | null;
  setInitialAction: React.Dispatch<React.SetStateAction<string | null>>;
  handleNavigation: (view: ViewType) => void;
}

export function useAppRouting({
  isAuthenticated,
  profile,
  teamPaymentsLoaded,
  setTeamProjectPayments,
  setTeamPaymentsLoaded,
  onMarkNotificationRead,
  appDataLoader,
}: UseAppRoutingProps): UseAppRoutingReturn {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialAction, setInitialAction] = useState<string | null>(null);
  // Route sebagai reactive state agar App re-render saat hash berubah
  const [route, setRoute] = useState<string>(
    () => window.location.hash.slice(1) || "/"
  );

  // Sync route hash with active view
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      // Update reactive route state
      setRoute(hash || "/");
      if (hash) {
        const view = hash.startsWith("/") ? hash.slice(1) : hash;
        // Only set activeView for known ViewType routes, ignore query strings
        const viewWithoutQuery = view.split("?")[0];
        if (Object.values(ViewType).includes(viewWithoutQuery as ViewType)) {
          setActiveView(viewWithoutQuery as ViewType);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Persist last route for post-login redirect
  useEffect(() => {
    if (isAuthenticated && activeView !== ViewType.DASHBOARD) {
      try {
        window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, `#/${activeView}`);
      } catch (e) {
        console.warn("[Routing] Failed to persist last route:", e);
      }
    }
  }, [isAuthenticated, activeView]);

  // Handle navigation
  const handleNavigation = useCallback(
    (view: ViewType) => {
      setActiveView(view);
      window.location.hash = `/${view}`;
      setIsSidebarOpen(false);
      setIsSearchOpen(false);
    },
    [],
  );

  return {
    route,
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    initialAction,
    setInitialAction,
    handleNavigation,
  };
}

export default useAppRouting;
