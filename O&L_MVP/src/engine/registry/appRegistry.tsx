import React from 'react';
import {
  Terminal,
  MessageSquareCode,
  Globe,
  HardDrive,
  Crosshair,
  Radio,
  Award,
  Mail,
  ShieldAlert,
  Bug,
  Lock,
  Cpu,
  FileArchive,
  Send,
  Wifi,
  Server,
  Key,
  FolderOpen,
  HelpCircle
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { ChatApp } from '../apps/ChatApp';
import { DebriefApp } from '../apps/DebriefApp';
import { mission3Apps } from '../../scenarios/mission_03_ol_company';
import { mission4Apps } from '../../scenarios/mission_04_energy_rock';

// Base Application Registry for Generic / Shared Apps
export const appComponentRegistry: Record<string, React.ComponentType<any>> = {
  chat: ChatApp,
  debrief_app: DebriefApp,
  // Include Mission 3 apps in global map for backwards compatibility
  ...mission3Apps
};

/**
 * Register a custom app component dynamically
 */
export function registerApp(componentId: string, component: React.ComponentType<any>): void {
  appComponentRegistry[componentId] = component;
}

/**
 * Render application by component ID and active mission context
 */
export const AppRenderer: React.FC<{ componentId: string; onClose?: () => void }> = ({ componentId }) => {
  const activeMission = useMissionStore(s => s.activeMission);
  const missionId = activeMission?.mission?.id || '';

  // Determine component based on scenario context
  let Component: React.ComponentType<any> | undefined;

  if (missionId.includes('4') || missionId.includes('energy-rock')) {
    Component = mission4Apps[componentId] || appComponentRegistry[componentId];
  } else if (missionId.includes('3') || missionId.includes('ol-company')) {
    Component = mission3Apps[componentId] || appComponentRegistry[componentId];
  } else {
    Component = appComponentRegistry[componentId];
  }

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center font-mono select-none">
        <div className="w-16 h-16 rounded-full bg-[#ff3366]/20 border-2 border-[#ff3366] flex items-center justify-center text-[#ff3366] mb-4">
          <HelpCircle size={32} />
        </div>
        <h3 className="text-sm font-bold text-[#ff3366] tracking-wider mb-2">
          //BRAK MODUŁU: {componentId.toUpperCase()}
        </h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Aplikacja nie została zarejestrowana w appRegistry dla scenariusza {activeMission?.mission?.title || missionId}.
        </p>
      </div>
    );
  }

  return <Component />;
};

/**
 * Icon Map for dynamic icon rendering from JSON
 */
export function renderAppIcon(iconName: string, size = 26): React.ReactNode {
  switch (iconName) {
    case 'Terminal':
      return <Terminal size={size} />;
    case 'MessageSquareCode':
      return <MessageSquareCode size={size} />;
    case 'Globe':
      return <Globe size={size} />;
    case 'HardDrive':
      return <HardDrive size={size} />;
    case 'Crosshair':
      return <Crosshair size={size} />;
    case 'Radio':
      return <Radio size={size} />;
    case 'Award':
      return <Award size={size} />;
    case 'Mail':
      return <Mail size={size} />;
    case 'ShieldAlert':
      return <ShieldAlert size={size} />;
    case 'Bug':
      return <Bug size={size} />;
    case 'Lock':
      return <Lock size={size} />;
    case 'Cpu':
      return <Cpu size={size} />;
    case 'FileArchive':
      return <FileArchive size={size} />;
    case 'Send':
      return <Send size={size} />;
    case 'Wifi':
      return <Wifi size={size} />;
    case 'Server':
      return <Server size={size} />;
    case 'Key':
      return <Key size={size} />;
    case 'FolderOpen':
      return <FolderOpen size={size} />;
    default:
      return <Terminal size={size} />;
  }
}
