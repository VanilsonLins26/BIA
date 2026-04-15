import { useEffect } from "react";
import { trackEvent } from "@/lib/metrics";
import BIAChat from "@/components/BIAChat";
import { InstallPrompt } from "@/components/InstallPrompt";

const Index = () => {
  useEffect(() => {
    trackEvent("pageViews");
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <BIAChat />
      <InstallPrompt />
    </div>
  );
};

export default Index;
