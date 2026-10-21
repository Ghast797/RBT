import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosDir = path.resolve(__dirname, 'src', 'scenarios');

interface ScenarioEntry {
  dirName: string;
  num: string;
  id: string;
  indexPath: string;
}

function getAvailableScenarios(): ScenarioEntry[] {
  if (!fs.existsSync(scenariosDir)) return [];
  const entries = fs.readdirSync(scenariosDir, { withFileTypes: true });
  const scenarios: ScenarioEntry[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('mission_')) {
      const fullPath = path.resolve(scenariosDir, entry.name);
      const indexPath = path.resolve(fullPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const dataDir = path.resolve(fullPath, 'data');
        let missionId = entry.name;
        const numMatch = entry.name.match(/mission_0?(\d+)/);
        const num = numMatch ? numMatch[1] : '';

        if (fs.existsSync(dataDir)) {
          const jsonFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
          if (jsonFiles.length > 0) {
            try {
              const raw = JSON.parse(fs.readFileSync(path.resolve(dataDir, jsonFiles[0]), 'utf-8'));
              if (raw.mission?.id) missionId = raw.mission.id;
            } catch (e) {}
          }
        }

        scenarios.push({
          dirName: entry.name,
          num,
          id: missionId,
          indexPath: `/src/scenarios/${entry.name}/index.ts`
        });
      }
    }
  }

  // Sort by scenario number
  scenarios.sort((a, b) => Number(a.num || 0) - Number(b.num || 0));
  return scenarios;
}

function scenarioIsolationPlugin(): Plugin {
  const virtualModuleId = 'virtual:active-scenario';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-scenario-isolation',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const scenarios = getAvailableScenarios();
        const targetMission = process.env.VITE_MISSION_ID?.trim();

        // 1. ISOLATED BUILD: when VITE_MISSION_ID is provided and not "all"
        if (targetMission && targetMission.toLowerCase() !== 'all') {
          const clean = targetMission.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = scenarios.find((s) => {
            const sIdClean = s.id.toLowerCase().replace(/[^a-z0-9]/g, '');
            const sDirClean = s.dirName.toLowerCase().replace(/[^a-z0-9]/g, '');
            return (
              sIdClean === clean ||
              s.num === clean ||
              sDirClean.includes(clean) ||
              clean.includes(sDirClean) ||
              (clean.includes(s.num) && (clean.startsWith('mission') || clean.length <= 2))
            );
          });

          if (matched) {
            console.log(`\n[Vite SCORM Build] Compiling ISOLATED scenario package: "${matched.id}" (${matched.dirName})`);
            return `
import * as scenario from '${matched.indexPath}';

const def = scenario.scenarioDefinition;
const apps = scenario.scenarioApps || {};

export const isIsolated = true;
export const activeMissionId = ${JSON.stringify(matched.id)};
export const activeMission = def;
export const activeApps = apps;
export const missionList = [{ num: ${JSON.stringify(matched.num)}, id: ${JSON.stringify(matched.id)}, definition: def }];
export const allMissions = {
  [${JSON.stringify(matched.id)}]: def,
  [${JSON.stringify(matched.num)}]: def,
  ['mission-' + ${JSON.stringify(matched.num)}]: def,
  ['mission' + ${JSON.stringify(matched.num)}]: def,
};
`;
          } else {
            console.warn(`\n[Vite SCORM Build] Warning: Target mission "${targetMission}" not matched. Available: ${scenarios.map(s => s.id).join(', ')}`);
          }
        }

        // 2. MULTI-SCENARIO MODE: dev server, test runs, or when building all together
        const imports = scenarios
          .map((s, idx) => `import * as s_${idx} from '${s.indexPath}';`)
          .join('\n');

        const mapEntries = scenarios
          .map((s, idx) => {
            const slug = s.dirName.replace(/^mission_0?\d+_/, '').replace(/_/g, '-');
            const slugNoDash = slug.replace(/-/g, '');
            return `
  ...(() => {
    const d = s_${idx}.scenarioDefinition;
    return [
      [${JSON.stringify(s.id)}, d],
      [${JSON.stringify(s.num)}, d],
      ['mission-' + ${JSON.stringify(s.num)}, d],
      ['mission' + ${JSON.stringify(s.num)}, d],
      [${JSON.stringify(slug)}, d],
      [${JSON.stringify(slugNoDash)}, d],
      [${JSON.stringify(s.dirName)}, d]
    ];
  })(),`;
          })
          .join('\n');

        return `
${imports}

const scenarioEntries = [
${mapEntries}
];

export const isIsolated = false;
export const activeMissionId = '';
export const activeMission = undefined;
export const activeApps = {};
export const allMissions = Object.fromEntries(scenarioEntries);
export const missionList = [
${scenarios.map((s, idx) => `  { num: ${JSON.stringify(s.num)}, id: ${JSON.stringify(s.id)}, definition: s_${idx}.scenarioDefinition },`).join('\n')}
];
`;
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    scenarioIsolationPlugin(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
