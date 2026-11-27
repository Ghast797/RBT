// Etap 4 — //PRZYGOTOWANIE_STRONY: klonowanie panelu logowania Banku Bcorp (nieoceniane).
// Przebieg 1:1 wg scenario.md:
// 1. Pusty podgląd fałszywej strony (adres zależny od D1 przez useDecisionChoice(1)) obok oryginalnej strony -> ZAPROJEKTUJ
// 2. Szkielet 4 pustych slotów -> SKOPIUJ GRAFIKI (4 elementy z oryginału na pasujące sloty: drag lub klik-klik, zły slot = błąd bez kary)
// 3. USTAW TRYB PRZECHWYTYWANIA DANYCH -> krótkie ładowanie -> ŚWIETNIE! -> automatyczne onComplete()

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, Globe, Lock, Sparkles } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { useDecisionChoice } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import type { PageClonerConfig, PageClonerElement, PageClonerElementId } from './types';
import { ImageSlot } from './ui';

const ACCENT = '#00ff66';
const SKELETON_LOADER_MS = 1700;
const CAPTURE_LOADER_MS = 1500;
const SUCCESS_MS = 1200;

type Screen = 'intro_empty' | 'load_skeleton' | 'clone_elements' | 'load_capture' | 'done';

const FALLBACK_CONFIG: PageClonerConfig = {
  title: '//PRZYGOTOWANIE_STRONY',
  subtitle: 'KLONOWANIE PANELU LOGOWANIA BANKU BCORP',
  task: 'ZAPROJEKTUJ FAŁSZYWĄ STRONĘ LOGOWANIA NA WZÓR ORYGINALNEGO SERWISU.',
  originalUrl: '//MAIL.BCORP.BIZ/LOGIN',
  fakeUrlIdeal: '//MAIL.ARCHIWUMBCORP.BIZ/LOGIN',
  fakeUrlSuboptimal: '//MAIL.BCORP.PL/LOGIN',
  footerText: 'BCORP BANK © 2024',
  brandTitle: 'BCORP SYSTEM POCZTY',
  logoAsset: { group: 'site', name: 'bcorp_logo' },
  elements: [
    { id: 'logo', label: 'BCORP SYSTEM POCZTY', slotLabel: 'MIEJSCE NA NAGŁÓWEK Z LOGO' },
    { id: 'login', label: 'LOGIN', slotLabel: 'MIEJSCE NA POLE LOGIN' },
    { id: 'password', label: 'HASŁO', slotLabel: 'MIEJSCE NA POLE HASŁO' },
    { id: 'submit', label: 'ZALOGUJ', slotLabel: 'MIEJSCE NA PRZYCISK ZALOGUJ' }
  ]
};

export const PageClonerApp: React.FC<BlockProps<PageClonerConfig>> = ({ config, onComplete }) => {
  const cfg: PageClonerConfig = {
    ...FALLBACK_CONFIG,
    ...config,
    elements: config?.elements?.length === 4 ? config.elements : FALLBACK_CONFIG.elements,
    logoAsset: config?.logoAsset ?? FALLBACK_CONFIG.logoAsset
  };

  const d1Choice = useDecisionChoice(1);
  const fakeUrl = d1Choice?.optionId === 'bcorp_pl' ? cfg.fakeUrlSuboptimal : cfg.fakeUrlIdeal;

  const [screen, setScreen] = useState<Screen>('intro_empty');
  const [placed, setPlaced] = useState<Record<PageClonerElementId, boolean>>({
    logo: false,
    login: false,
    password: false,
    submit: false
  });
  const [selectedElementId, setSelectedElementId] = useState<PageClonerElementId | null>(null);
  const [bounceSlotId, setBounceSlotId] = useState<PageClonerElementId | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'done') return;
    sounds.playSuccess();
    const timer = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, SUCCESS_MS);
    return () => clearTimeout(timer);
  }, [screen]);

  const placedCount = cfg.elements.filter((el) => placed[el.id]).length;
  const allPlaced = placedCount === cfg.elements.length;

  const triggerMismatch = (slotId: PageClonerElementId, message: string) => {
    sounds.playError();
    setBounceSlotId(slotId);
    setWarning(message);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = setTimeout(() => {
      setBounceSlotId(null);
      setWarning(null);
    }, 1100);
  };

  const tryPlace = (elementId: PageClonerElementId, slotId: PageClonerElementId) => {
    if (screen !== 'clone_elements' || placed[slotId]) return;
    if (elementId !== slotId) {
      triggerMismatch(slotId, 'TEN ELEMENT NIE PASUJE DO TEGO SLOTU — WYBIERZ ODPOWIADAJĄCE MIEJSCE.');
      return;
    }
    const nextCount = placedCount + 1;
    if (nextCount === cfg.elements.length) sounds.playSuccess();
    else sounds.playClick();

    setPlaced((prev) => ({ ...prev, [slotId]: true }));
    setSelectedElementId(null);
    setWarning(null);
    setBounceSlotId(null);
  };

  const drag = usePointerDrag<PageClonerElementId>({
    onDrop: ({ itemId, zoneId }) => tryPlace(itemId, zoneId as PageClonerElementId),
    onTap: (itemId) => {
      if (screen !== 'clone_elements' || placed[itemId]) return;
      sounds.playClick();
      setWarning(null);
      setSelectedElementId((prev) => (prev === itemId ? null : itemId));
    },
    canDrag: (itemId) => screen === 'clone_elements' && !placed[itemId]
  });

  const handleSlotClick = (slotId: PageClonerElementId) => {
    if (screen !== 'clone_elements' || placed[slotId]) return;
    if (!selectedElementId) {
      sounds.playClick();
      setWarning('NAJPIERW KLIKNIJ ELEMENT NA ORYGINALNEJ STRONIE (LUB PRZECIĄGNIJ GO TUTAJ).');
      return;
    }
    tryPlace(selectedElementId, slotId);
  };

  const draggedElement = cfg.elements.find((el) => el.id === drag.draggedId);
  const logoLabel = cfg.brandTitle;

  const renderBankComponent = (el: PageClonerElement, variant: 'original' | 'cloned') => {
    const isCloned = variant === 'cloned';
    switch (el.id) {
      case 'logo':
        return (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0d192b] border border-sky-500/30">
            <div className="w-28 h-14 rounded bg-black/50 border border-sky-400/40 overflow-hidden shrink-0">
              <ImageSlot asset={cfg.logoAsset} label={logoLabel} fit="contain" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black tracking-wider text-white block truncate">{el.label}</span>
              <span className="text-xs text-sky-300/80 block">PORTAL LOGOWANIA</span>
            </div>
            {isCloned && <Check size={16} className="text-[#00ff66] ml-auto shrink-0" />}
          </div>
        );
      case 'login':
        return (
          <div className="px-3 py-2 rounded-lg bg-[#060c14] border border-gray-600 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-gray-300">{el.label}</span>
            <span className="text-xs text-gray-500 font-mono">wpisz login…</span>
          </div>
        );
      case 'password':
        return (
          <div className="px-3 py-2 rounded-lg bg-[#060c14] border border-gray-600 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-gray-300">{el.label}</span>
            <span className="text-xs text-gray-500 font-mono">••••••••</span>
          </div>
        );
      case 'submit':
        return (
          <div className="px-4 py-2 rounded-lg bg-sky-500 text-[#05090f] font-black text-xs tracking-widest text-center uppercase">
            {el.label}
          </div>
        );
    }
  };

  const stepBadge =
    screen === 'intro_empty' || screen === 'load_skeleton'
      ? 'KROK 1/3'
      : screen === 'clone_elements' && !allPlaced
        ? 'KROK 2/3'
        : 'KROK 3/3';

  const currentTask =
    screen === 'intro_empty'
      ? cfg.task
      : screen === 'load_skeleton'
        ? 'TWORZENIE SZKIELETU FAŁSZYWEJ STRONY…'
        : screen === 'clone_elements'
          ? allPlaced
            ? 'WSZYSTKIE 4 ELEMENTY SKOPIOWANE. AKTYWUJ TRYB PRZECHWYTYWANIA DANYCH.'
            : `SKOPIUJ GRAFIKI (${placedCount}/4): PRZECIĄGNIJ LUB KLIKNIJ ELEMENT Z ORYGINALNEJ STRONY I WSTAW W PASUJĄCY SLOT.`
          : screen === 'load_capture'
            ? 'USTAWIANIE TRYBU PRZECHWYTYWANIA DANYCH…'
            : 'STRONA PHISHINGOWA GOTOWA DO PRZECHWYTYWANIA POŚWIADCZEŃ.';

  const wrapHeader = (
    <AppHeader
      icon={Globe}
      accent={ACCENT}
      title={cfg.title}
      subtitle={cfg.subtitle ?? FALLBACK_CONFIG.subtitle}
      step={stepBadge}
      task={currentTask}
    />
  );

  if (screen === 'load_skeleton') {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
        {wrapHeader}
        <div className="flex-1 min-h-0">
          <ModuleLoader
            accent={ACCENT}
            label="BUDOWANIE SZKIELETU FAŁSZYWEJ STRONY…"
            durationMs={SKELETON_LOADER_MS}
            onDone={() => setScreen('clone_elements')}
          />
        </div>
      </div>
    );
  }

  if (screen === 'load_capture') {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
        {wrapHeader}
        <div className="flex-1 min-h-0">
          <ModuleLoader
            accent={ACCENT}
            label="AKTYWOWANIE TRYBU PRZECHWYTYWANIA DANYCH…"
            durationMs={CAPTURE_LOADER_MS}
            onDone={() => setScreen('done')}
          />
        </div>
      </div>
    );
  }

  const showCaptureArrows = screen === 'done';

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      {wrapHeader}

      {/* Dwa okna przeglądarki obok siebie: fałszywa strona (lewa) i oryginalna strona (prawa) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEWY PANEL: PODGLĄD FAŁSZYWEJ STRONY */}
        <div
          className="flex flex-col min-h-0 rounded-xl border bg-[#08101a] overflow-hidden shadow-xl"
          style={{ borderColor: screen === 'done' ? ACCENT : `${ACCENT}55` }}
        >
          <div className="px-3 py-1.5 bg-[#0d1624] border-b border-gray-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-black tracking-wider text-amber-300">PODGLĄD FAŁSZYWEJ STRONY</span>
            {screen === 'clone_elements' && (
              <span className="text-xs font-bold text-[#00ff66]">{`${placedCount}/4`}</span>
            )}
          </div>

          <div className="px-3 py-1.5 bg-[#060c14] border-b border-gray-800 flex items-center gap-2 shrink-0">
            <Lock size={13} className="text-amber-400 shrink-0" />
            <span data-testid="fake-url-bar" className="text-xs font-bold text-white truncate">
              {fakeUrl}
            </span>
          </div>

          <div className="flex-1 min-h-0 p-3 flex flex-col justify-center gap-2">
            {screen === 'intro_empty' ? (
              <div className="flex-1 rounded-lg border border-gray-800 bg-[#05090f] flex flex-col items-center justify-center text-center p-4 gap-2">
                <Globe size={28} className="text-gray-600" />
                <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider">
                  PUSTY SZABLON STRONY
                </span>
                <span className="text-xs text-gray-500">
                  KLIKNIJ „ZAPROJEKTUJ”, ABY UTWORZYĆ SZKIELET UKŁADU.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cfg.elements.map((el) => {
                  const isPlaced = placed[el.id];
                  const isBouncing = bounceSlotId === el.id;
                  const isHovered = drag.isOver(el.id);
                  const isTarget = drag.isDropTarget(el.id);

                  return (
                    <React.Fragment key={el.id}>
                      {showCaptureArrows && el.id === 'password' && (
                        <div
                          data-testid="capture-arrows"
                          className="flex items-center justify-center gap-3 text-red-400 text-xs font-black tracking-widest animate-pulse"
                        >
                          <ArrowDown size={14} />
                          <span>PRZECHWYTYWANIE DANYCH AKTYWNE</span>
                          <ArrowDown size={14} />
                        </div>
                      )}

                      {isPlaced ? (
                        <div data-testid={`fake-slot-${el.id}`} className="rounded-lg border border-[#00ff66]/50 bg-[#00ff66]/5 p-1">
                          {renderBankComponent(el, 'cloned')}
                        </div>
                      ) : (
                        <div
                          ref={drag.zoneRef(el.id)}
                          data-testid={`fake-slot-${el.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSlotClick(el.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSlotClick(el.id);
                            }
                          }}
                          className={`min-h-[42px] px-3 py-2 rounded-lg border-2 border-dashed flex items-center justify-center text-center text-xs font-bold tracking-wider transition-all cursor-pointer ${
                            isBouncing
                              ? 'border-red-500 bg-red-500/20 text-red-200 animate-pulse'
                              : isHovered
                                ? 'border-[#00ff66] bg-[#00ff66]/20 text-white'
                                : selectedElementId || isTarget
                                  ? 'border-sky-400/80 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20'
                                  : 'border-gray-600 bg-gray-900/60 text-gray-400'
                          }`}
                        >
                          {el.slotLabel}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-[#060c14] border-t border-gray-800 text-center text-xs font-bold text-gray-400 shrink-0">
            {cfg.footerText}
          </div>
        </div>

        {/* PRAWY PANEL: ORYGINALNA STRONA */}
        <div className="flex flex-col min-h-0 rounded-xl border border-sky-500/40 bg-[#08101a] overflow-hidden shadow-xl">
          <div className="px-3 py-1.5 bg-[#0d1624] border-b border-gray-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-black tracking-wider text-sky-300">ORYGINALNA STRONA</span>
            {screen === 'clone_elements' && !allPlaced && (
              <span className="text-xs font-black tracking-wider text-sky-200">SKOPIUJ GRAFIKI</span>
            )}
          </div>

          <div className="px-3 py-1.5 bg-[#060c14] border-b border-gray-800 flex items-center gap-2 shrink-0">
            <Lock size={13} className="text-sky-400 shrink-0" />
            <span data-testid="original-url-bar" className="text-xs font-bold text-white truncate">
              {cfg.originalUrl}
            </span>
          </div>

          <div className="flex-1 min-h-0 p-3 flex flex-col justify-center gap-2">
            {cfg.elements.map((el) => {
              const isPlaced = placed[el.id];
              const isSelected = selectedElementId === el.id;
              const isInteractive = screen === 'clone_elements' && !isPlaced;
              const dragProps = drag.getDragProps(el.id);

              return (
                <div
                  key={el.id}
                  data-testid={`orig-element-${el.id}`}
                  role={isInteractive ? 'button' : undefined}
                  aria-label={isInteractive ? `Skopiuj: ${el.slotLabel}` : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                  onKeyDown={
                    isInteractive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            sounds.playClick();
                            setWarning(null);
                            setSelectedElementId((prev) => (prev === el.id ? null : el.id));
                          }
                        }
                      : undefined
                  }
                  {...(isInteractive ? dragProps : {})}
                  style={isInteractive ? dragProps.style : undefined}
                  className={`rounded-lg border-2 p-1 transition-all ${
                    isPlaced
                      ? 'border-[#00ff66]/40 bg-[#00ff66]/5 opacity-45 cursor-default'
                      : isInteractive
                        ? isSelected
                          ? 'border-[#00ff66] bg-[#00ff66]/15 shadow-[0_0_14px_rgba(0,255,102,0.3)] cursor-grab'
                          : 'border-sky-500/40 bg-[#0b1522] hover:border-sky-400 cursor-grab'
                        : 'border-gray-800 bg-[#0b1522]'
                  } ${drag.draggedId === el.id ? 'opacity-40' : ''}`}
                >
                  {renderBankComponent(el, 'original')}
                </div>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-[#060c14] border-t border-gray-800 text-center text-xs font-bold text-gray-400 shrink-0">
            {cfg.footerText}
          </div>
        </div>
      </div>

      {/* Pasek statusu / akcji na dole */}
      <div className="shrink-0 flex flex-col gap-2">
        {warning && (
          <div className="px-3 py-1.5 rounded-lg border border-red-500/60 bg-red-950/40 text-xs font-bold text-red-200 text-center">
            {warning}
          </div>
        )}

        {screen === 'intro_empty' && (
          <div className="flex justify-center">
            <ConfirmButton
              accent={ACCENT}
              label="ZAPROJEKTUJ"
              onClick={() => {
                sounds.playClick();
                setScreen('load_skeleton');
              }}
              className="w-auto px-10 py-3 text-sm"
            />
          </div>
        )}

        {screen === 'clone_elements' && (
          <div className="flex justify-end">
            <ConfirmButton
              accent={ACCENT}
              label="USTAW TRYB PRZECHWYTYWANIA DANYCH"
              enabled={allPlaced}
              onClick={() => {
                if (!allPlaced) return;
                sounds.playClick();
                setScreen('load_capture');
              }}
              className="w-auto px-6"
            />
          </div>
        )}

        {screen === 'done' && (
          <div className="px-4 py-2.5 rounded-lg border-2 border-[#00ff66] bg-[#00ff66]/15 flex items-center justify-center gap-2 text-[#00ff66] font-black text-base tracking-widest animate-in fade-in duration-200">
            <Sparkles size={20} />
            <span>ŚWIETNIE!</span>
          </div>
        )}
      </div>

      <DragGhost dragging={drag.dragging}>
        {draggedElement ? draggedElement.label : null}
      </DragGhost>
    </div>
  );
};
