import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Campaign } from "@shared/schema";

interface CampaignContextType {
  currentCampaign: Campaign | null;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  isLoading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
}

const CAMPAIGN_STORAGE_KEY = "aetherquill_current_campaign";

export function CampaignProvider({ children }: CampaignProviderProps) {
  const [currentCampaign, setCurrentCampaignState] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load campaign from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      if (stored) {
        const campaign = JSON.parse(stored);
        setCurrentCampaignState(campaign);
      }
    } catch (error) {
      console.warn("Failed to load campaign from localStorage:", error);
      localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentCampaign = (campaign: Campaign | null) => {
    setCurrentCampaignState(campaign);

    if (campaign) {
      try {
        localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
      } catch (error) {
        console.warn("Failed to save campaign to localStorage:", error);
      }
    } else {
      localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    }
  };

  const value: CampaignContextType = {
    currentCampaign,
    setCurrentCampaign,
    isLoading,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaignContext must be used within a CampaignProvider");
  }
  return context;
}
