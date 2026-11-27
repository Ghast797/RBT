import mission5Data from './data/mission5.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission5Stages, mission5Blocks } from './stages';
import {
  IntelPdfApp,
  PageClonerApp,
  VishingApp
} from './minigames';

const base = mission5Data as unknown as MissionDefinition;

// Definicja misji wzbogacona o etapy i dane klocków (wzorzec B).
// Kafelki //VPN, //PRZYGOTOWANIE_DOMENY i //PRZYGOTOWANIE_NUMERU używają klocków katalogu silnika
// (`vpn_router`, `choice_cards` z data/mission5.json).
export const mission5Definition: MissionDefinition = {
  ...base,
  stages: mission5Stages,
  blocks: mission5Blocks
};

// Minigry misji rejestrowane w silniku pod swoimi componentId (prefiks `bc_`).
export const mission5Apps: Record<string, React.ComponentType<any>> = {
  bc_intel_pdf: IntelPdfApp,
  bc_page_cloner: PageClonerApp,
  bc_vishing_call: VishingApp
};

// Rejestracja per-scenariusz oraz globalna.
registerScenarioApps('mission-5-bank-bcorp', mission5Apps);
registerScenarioApps('5', mission5Apps);
Object.entries(mission5Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  IntelPdfApp,
  PageClonerApp,
  VishingApp
};

export const scenarioDefinition = mission5Definition;
export const scenarioApps = mission5Apps;
