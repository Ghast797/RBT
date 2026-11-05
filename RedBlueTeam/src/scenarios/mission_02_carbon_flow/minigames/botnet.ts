import type { BotnetMonitorConfig } from './types';

/** Węzeł sieci ofiary na topologii monitora botnetu. */
export interface BotnetNode {
  id: string;
  name: string;
  role: string;
  infected: boolean;
  /** Stopień penetracji sieci (%), od którego węzeł zaczyna świecić jako zainfekowany. */
  litAt: number;
}

export interface BotnetSummary {
  /** Liczba zainfekowanych stacji = zaokrąglenie `targetPercentage × totalWorkstations`. */
  infectedCount: number;
  secureCount: number;
  nodes: BotnetNode[];
}

/** Nazwy i role stacji CarbonFlow; zainfekowane są pierwsze, zabezpieczone (SOC, backup) na końcu. */
const NODE_TEMPLATES: Array<{ name: string; role: string }> = [
  { name: 'CF-WRK-HR01', role: 'Kadry (Ofiara 0)' },
  { name: 'CF-WRK-HR02', role: 'Kadry' },
  { name: 'CF-WRK-ACC01', role: 'Księgowość' },
  { name: 'CF-WRK-LOG01', role: 'Dyspozytornia' },
  { name: 'CF-SRV-MAIL', role: 'Serwer Pocztowy' },
  { name: 'CF-SRV-APP01', role: 'Baza Danych' },
  { name: 'CF-WRK-ENG01', role: 'Inżynieria Rurociągów' },
  { name: 'CF-WRK-ENG02', role: 'Inżynieria Przesyłu' },
  { name: 'CF-GW-MAIN', role: 'Brama Główna' },
  { name: 'CF-SCADA-CTRL', role: 'Kontroler SCADA' },
  { name: 'CF-SEC-SOC', role: 'Stacja Bezpieczeństwa' },
  { name: 'CF-SRV-BACKUP', role: 'Izolowany Backup' }
];

/** Liczby i węzły monitora botnetu wyliczone wyłącznie z konfiguracji (`botnetMonitorConfig`). */
export function summarizeBotnet(config: Pick<BotnetMonitorConfig, 'targetPercentage' | 'totalWorkstations'>): BotnetSummary {
  const total = Math.max(0, Math.round(config.totalWorkstations));
  const infectedCount = Math.min(total, Math.round((config.targetPercentage / 100) * total));

  const nodes: BotnetNode[] = Array.from({ length: total }, (_, i) => {
    const tpl = NODE_TEMPLATES[i];
    const infected = i < infectedCount;
    return {
      id: String(i + 1),
      name: tpl?.name ?? `CF-WRK-${String(i + 1).padStart(2, '0')}`,
      role: tpl?.role ?? 'Stacja robocza',
      infected,
      litAt: infected ? Math.ceil(((i + 1) * config.targetPercentage) / total) : Infinity
    };
  });

  return { infectedCount, secureCount: total - infectedCount, nodes };
}
