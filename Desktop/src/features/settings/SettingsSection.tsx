import React from "react";

import SettingsPage from "@/components/settings/SettingsPage";

import { RightPanelProvider } from "@contexts/RightPanelProvider";

const SettingsSection: React.FC = () => {
  return (
    <RightPanelProvider>
      <SettingsPage />
    </RightPanelProvider>
  );
};

export default SettingsSection;