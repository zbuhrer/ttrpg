import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useCampaignContext } from "@/contexts/campaign-context";

const MapCreate: React.FC = () => {
  const [, setLocation] = useLocation();
  const { currentCampaign, isLoading } = useCampaignContext();

  useEffect(() => {
    if (!isLoading && currentCampaign) {
      // Redirect to the editor with create mode
      setLocation("/maps/create/new");
    } else if (!isLoading && !currentCampaign) {
      // Redirect to maps list if no campaign selected
      setLocation("/maps");
    }
  }, [currentCampaign, isLoading, setLocation]);

  return (
    <div className="p-6">
      <div className="text-center">
        {isLoading ? "Loading..." : "Redirecting to map creator..."}
      </div>
    </div>
  );
};

export default MapCreate;
