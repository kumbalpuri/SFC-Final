import React from 'react';
import RedFlagSystem from '../components/RedFlagSystem';
import { RedFlag, UserPersona } from '../types';

interface RedFlagModuleProps {
  redFlags: RedFlag[];
  onAddRedFlag: (flagData: Partial<RedFlag>) => void;
  onUpdateRedFlag: (id: string, updatedFields: Partial<RedFlag>) => void;
  onDeleteRedFlag?: (id: string) => void;
  onEscalateToPpsr?: (id: string) => Promise<void>;
  onConvertToKaizen?: (id: string) => Promise<void>;
  onLinkToFiveS?: (id: string) => Promise<void>;
  currentPersona: UserPersona;
  initialAction?: string | null;
  onClearInitialAction?: () => void;
  onNavigateToModule?: (moduleKey: string) => void;
  isSidebarHidden?: boolean;
  onToggleSidebar?: () => void;
}

export default function RedFlagModule({
  redFlags,
  onAddRedFlag,
  onUpdateRedFlag,
  onDeleteRedFlag,
  onEscalateToPpsr,
  onConvertToKaizen,
  onLinkToFiveS,
  currentPersona,
  initialAction,
  onClearInitialAction,
  onNavigateToModule,
  isSidebarHidden,
  onToggleSidebar
}: RedFlagModuleProps) {
  return (
    <RedFlagSystem
      redFlags={redFlags}
      onAddRedFlag={onAddRedFlag}
      onUpdateRedFlag={onUpdateRedFlag}
      onDeleteRedFlag={onDeleteRedFlag}
      onEscalateToPpsr={onEscalateToPpsr}
      onConvertToKaizen={onConvertToKaizen}
      onLinkToFiveS={onLinkToFiveS}
      currentPersona={currentPersona}
      initialAction={initialAction}
      onClearInitialAction={onClearInitialAction}
      onNavigateToModule={onNavigateToModule}
      isSidebarHidden={isSidebarHidden}
      onToggleSidebar={onToggleSidebar}
    />
  );
}
