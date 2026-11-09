// ZAŚLEPKA porcji B: wspólna powłoka tymczasowych ekranów minigier M4, żeby przepływ misji działał w przeglądarce
// przed porcjami C–G. Każda porcja zastępuje swój plik prawdziwą minigrą; po porcji H plik stub.tsx jest usuwany.
// Zaślepka zgłasza idealne decyzje z danych (jak ścieżka 100%) i kończy etap.

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';

export interface StubAction {
  label: string;
  run: () => void;
}

export const StubShell: React.FC<{
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle: string;
  actions: StubAction[];
}> = ({ icon, accent, title, subtitle, actions }) => {
  const [done, setDone] = React.useState<Set<number>>(new Set());
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader icon={icon} accent={accent} title={title} subtitle={subtitle} task="ZAŚLEPKA: WYKONAJ KROKI PO KOLEI." />
      <div className="flex flex-col gap-2">
        {actions.map((a, i) => (
          <ConfirmButton
            key={a.label}
            accent={accent}
            label={a.label}
            enabled={!done.has(i)}
            onClick={() => {
              a.run();
              setDone((prev) => new Set(prev).add(i));
            }}
          />
        ))}
      </div>
    </div>
  );
};
