// Etap 2 — //TOR: PRZEGLĄDARKA (D2 cel, D3 przynęta). Kolejność ekranów: strona firmy (rekonesans) → wybór celu → wybór
// przynęty. Najpierw gracz przewija obie zakładki strony do końca, potem tylko odpowiada na pytania.
// Ekran celu nie powtarza informacji o osobach (same imiona i nazwiska), a powrotu do strony nie ma (do czasu
// ukończenia etapu; po nim strona jest dostępna w trybie do odczytu). Dane i teksty: stages.ts (osintBrowserConfig).
// Interfejs nie ujawnia oceny: poziom i feedback trafiają do raportu przez onDecision. Prawy monitor to czat z mentorem.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_LONG_MS, LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { ChoiceCardGrid, ChoiceTile, ChoiceZone } from '../../../engine/components/ChoiceZone';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { PLAN_STATE_KEY, type OsintBrowserConfig, type ReportableOption } from './types';
import { buildReport } from '../../../engine/core/report';
import { SiteView } from './SiteView';
import {
  INITIAL_READ_STATE,
  SITE_TABS,
  afterDecision,
  canProceedToTarget,
  markTabRead,
  type ReadState,
  type SiteTab
} from './osintLogic';

type Screen = 'site' | 'load_target' | 'target' | 'save_target' | 'vector' | 'save_vector';

/** Akcent aplikacji = kolor kafelka //TOR na pulpicie (mission3.json). */
const ACCENT = '#3b82f6';

/** Po ilu ms bez postępu na stronie firmy pokazujemy podpowiedź przy przycisku „dalej”. */
const IDLE_HINT_MS = 10_000;

export const OsintBrowserApp: React.FC<BlockProps<OsintBrowserConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const [screen, setScreen] = useState<Screen>('site');
  const [tab, setTab] = useState<SiteTab>('home');
  const [read, setRead] = useState<ReadState>(INITIAL_READ_STATE);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [vectorId, setVectorId] = useState<string | null>(null);
  // Po zgłoszeniu decyzji `critical` silnik pokazuje ekran wykrycia; do powtórki wybór jest zablokowany.
  const [locked, setLocked] = useState(false);
  // Etap ukończony: ponowne otwarcie pokazuje stronę w trybie do odczytu (nie zamrożony ekran ładowania).
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);
  // Pozycje przewinięcia zakładek (okno zamknięte krzyżykiem traci przewinięcie, wracamy do zapamiętanego).
  const scrollMemory = useRef<Record<SiteTab, number>>({ home: 0, events: 0 });

  // Podpowiedź przy przycisku „dalej”: po 10 s bez postępu w czytaniu strony (każde przewinięcie zakładki zeruje licznik).
  const [idleHint, setIdleHint] = useState(false);
  useEffect(() => {
    setIdleHint(false);
    if (screen !== 'site' || done || canProceedToTarget(read)) return;
    const id = setTimeout(() => setIdleHint(true), IDLE_HINT_MS);
    return () => clearTimeout(id);
  }, [screen, done, read]);

  const targetOptions = useShuffled(config.target.options);
  const vectorOptions = useShuffled(config.vector.options);

  const getScroll = useCallback((t: SiteTab) => scrollMemory.current[t], []);
  const setScroll = useCallback((t: SiteTab, y: number) => {
    scrollMemory.current[t] = y;
  }, []);
  const handleTabRead = useCallback((t: SiteTab) => setRead((r) => markTabRead(r, t, true)), []);

  const target = config.target.options.find((o) => o.id === targetId);
  const vector = config.vector.options.find((o) => o.id === vectorId);

  const handleTargetConfirm = () => {
    if (!target || locked) return;
    sounds.playSuccess();
    onDecision(buildReport(config.target, target));
    if (afterDecision(target.tier) === 'stop') {
      setLocked(true);
      return;
    }
    setScreen('save_target');
  };

  const handleVectorConfirm = () => {
    if (!vector || locked) return;
    sounds.playSuccess();
    // Plan z D3 we wspólnym stanie: //DYSK E dobiera po nim pliki pasujące do planu.
    setCustomState(PLAN_STATE_KEY, vector.id);
    onDecision(buildReport(config.vector, vector));
    if (afterDecision(vector.tier) === 'stop') {
      setLocked(true);
      return;
    }
    setScreen('save_vector');
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Najpierw stan trybu do odczytu, potem sygnał do silnika: ponowne otwarcie okna nie zastanie ekranu ładowania.
    setDone(true);
    setScreen('site');
    onComplete();
  };

  const header = (task: string | undefined, step: string | undefined) => (
    <AppHeader icon={Globe} accent={ACCENT} title={config.title} subtitle={config.subtitle} task={task} step={step} />
  );

  // Ekran ładowania z nagłówkiem aplikacji nad paskiem (gracz zawsze wie, w której aplikacji jest).
  const loader = (label: string, durationMs: number, onDone: () => void, step: string) => (
    <>
      {header(undefined, step)}
      <div className="flex-1 min-h-0">
        <ModuleLoader label={label} durationMs={durationMs} accent={ACCENT} onDone={onDone} />
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      {screen === 'site' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          {header(done ? undefined : config.siteTexts.task, done ? undefined : config.steps[0])}
          <SiteView
            site={config.site}
            accent={ACCENT}
            tab={tab}
            onTabChange={setTab}
            read={read}
            onTabRead={handleTabRead}
            getScroll={getScroll}
            setScroll={setScroll}
            toolbar={
              !done && (
                <>
                  <div className="flex items-center gap-3 text-xs font-bold tracking-wider">
                    <span className="text-gray-400">{config.siteTexts.readLabel}</span>
                    {SITE_TABS.map((t) => (
                      <span key={t} className={read[t] ? 'text-[#00ff66]' : 'text-gray-500'}>
                        {read[t] ? '✓' : '○'} {t === 'home' ? config.site.tabs.home : config.site.tabs.events}
                      </span>
                    ))}
                  </div>
                  <div className="relative shrink-0">
                    <ConfirmButton
                      accent={ACCENT}
                      label={config.siteTexts.continueLabel}
                      enabled={canProceedToTarget(read)}
                      onClick={() => {
                        sounds.playClick();
                        setScreen('load_target');
                      }}
                      className="w-auto !px-4 !py-1.5"
                    />
                    {idleHint && !canProceedToTarget(read) && (
                      <div
                        role="status"
                        className="absolute right-0 top-full mt-2 z-30 w-72 px-3 py-2 rounded-lg border-2 text-xs font-bold leading-snug text-white animate-in fade-in zoom-in-95 duration-200"
                        style={{ borderColor: ACCENT, backgroundColor: '#0b1624', boxShadow: `0 0 18px ${ACCENT}66` }}
                      >
                        {config.siteTexts.idleHint}
                      </div>
                    )}
                  </div>
                </>
              )
            }
          />
        </div>
      )}

      {screen === 'load_target' && loader(config.loaders.target, LOADER_MS, () => setScreen('target'), config.steps[1])}

      {screen === 'target' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          {header(config.targetTexts.task, config.steps[1])}
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            <ChoiceCardGrid
              accent={ACCENT}
              options={targetOptions}
              selectedId={targetId}
              onSelect={(id) => {
                if (locked) return;
                sounds.playClick();
                setTargetId(id);
              }}
              label={config.target.question}
              columns={3}
            />
          </div>
          <div className="shrink-0 flex justify-end">
            <ConfirmButton
              accent={ACCENT}
              label={config.targetTexts.confirmLabel}
              enabled={!!target && !locked}
              onClick={handleTargetConfirm}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'save_target' && loader(config.loaders.targetSave, LOADER_LONG_MS, () => setScreen('vector'), config.steps[1])}

      {screen === 'vector' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          {header(config.vectorTexts.task, config.steps[2])}
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            <VectorRows
              options={vectorOptions}
              selectedId={vectorId}
              label={config.vector.question}
              onSelect={(id) => {
                if (locked) return;
                sounds.playClick();
                setVectorId(id);
              }}
            />
          </div>
          <div className="shrink-0 flex justify-end">
            <ConfirmButton
              accent={ACCENT}
              label={config.vectorTexts.confirmLabel}
              enabled={!!vector && !locked}
              onClick={handleVectorConfirm}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'save_vector' && loader(config.loaders.vectorSave, LOADER_LONG_MS, finish, config.steps[2])}
    </div>
  );
};

/** Przynęta D3: trzy zdania w wierszach (rozmowa = wiersze), tekst czytelny na dużym ekranie. */
const VectorRows: React.FC<{
  options: ReportableOption[];
  selectedId: string | null;
  label: string;
  onSelect: (id: string) => void;
}> = ({ options, selectedId, label, onSelect }) => (
  <ChoiceZone accent={ACCENT} label={label}>
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <ChoiceTile
          key={o.id}
          accent={ACCENT}
          state={selectedId === o.id ? 'selected' : 'idle'}
          markerPosition="left"
          onClick={() => onSelect(o.id)}
          className="px-4 py-3.5 items-center"
        >
          <span className="block text-sm lg:text-base font-bold text-white leading-snug">{o.label}</span>
        </ChoiceTile>
      ))}
    </div>
  </ChoiceZone>
);
