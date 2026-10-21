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
  Search,
  Users,
  Monitor,
  HelpCircle
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { ChatApp } from '../apps/ChatApp';
import { DebriefApp } from '../apps/DebriefApp';
import {
  VirusDatabaseApp,
  TorBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
} from '../widgets';
import { ChoiceCards, DialogueTree, VpnRouter } from '../blocks';

// Minigry misji (np. Energy Rock) rejestrują się same przez registerApp przy
// załadowaniu swojego modułu scenariusza — nie importujemy ich tutaj.

// Base Application Registry for Generic / Shared Apps
export const appComponentRegistry: Record<string, React.ComponentType<any>> = {
  chat: ChatApp,
  debrief_app: DebriefApp,

  // Katalog klocków (docs/scenario-engine.md, sekcja 6)
  choice_cards: ChoiceCards,
  dialogue_tree: DialogueTree,
  vpn_router: VpnRouter,
  vpn_app: VpnRouter,

  virus_database: VirusDatabaseApp,
  browser: TorBrowserApp,
  pendrive_app: PendriveApp,
  drone_app: DroneApp,
  rat_session: RatSessionApp,
};

/**
 * Rejestr minigier per scenariusz (zapobiega kolizjom componentId między misjami w trybie dev)
 */
export const scenarioAppRegistry: Record<string, Record<string, React.ComponentType<any>>> = {};

/**
 * Rejestruje zestaw minigier dedykowanych dla danego scenariusza
 */
export function registerScenarioApps(missionId: string, apps: Record<string, React.ComponentType<any>>): void {
  scenarioAppRegistry[missionId] = {
    ...(scenarioAppRegistry[missionId] || {}),
    ...apps
  };
}

/**
 * Register a custom app component dynamically
 */
export function registerApp(componentId: string, component: React.ComponentType<any>): void {
  appComponentRegistry[componentId] = component;
}

/**
 * Renderuje aplikację otwartą na pulpicie i dostarcza jej kontrakt klocka.
 *
 * `appKey` to identyfikator kafelka z `desktopApps` (ze zgodnością wstecz dla
 * samego `componentId`). Każdy komponent dostaje `config`, `onDecision` i
 * `onComplete` — starsze widgety te propsy ignorują.
 * Zob. docs/scenario-engine.md, sekcja 5.
 */
export const AppRenderer: React.FC<{ componentId: string; onClose?: () => void }> = ({ componentId: appKey }) => {
  const activeMission = useMissionStore(s => s.activeMission);
  const reportDecision = useMissionStore(s => s.reportDecision);
  const completeStage = useMissionStore(s => s.completeStage);

  const tiles = activeMission?.desktopApps || [];
  const tile = tiles.find(t => t.id === appKey) || tiles.find(t => t.componentId === appKey);

  const componentId = tile?.componentId || appKey;
  const tileId = tile?.id || appKey;

  const missionId = activeMission?.mission?.id;
  const Component = (missionId && scenarioAppRegistry[missionId]?.[componentId]) || appComponentRegistry[componentId];

  const config = (activeMission?.blocks as Record<string, unknown> | undefined)?.[tileId];
  const stage = (activeMission?.stages || []).find(s => s.appId === tileId);

  const handleComplete = React.useCallback(() => {
    if (stage) completeStage(stage.id);
  }, [stage, completeStage]);

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
          Aplikacja nie została zarejestrowana w appRegistry dla scenariusza{' '}
          {activeMission?.mission?.title || activeMission?.mission?.id}.
        </p>
      </div>
    );
  }

  return <Component config={config} onDecision={reportDecision} onComplete={handleComplete} />;
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
    case 'Search':
      return <Search size={size} />;
    case 'Users':
      return <Users size={size} />;
    case 'Monitor':
      return <Monitor size={size} />;
    default:
      return <Terminal size={size} />;
  }
}
