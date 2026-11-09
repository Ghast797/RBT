// Etap 3 — //DYSK E: PENDRIVE. D4 załącznik -> flavor (podpięcie RAT do ZIP)
// -> D5 wolumin -> D6 koperta -> onComplete. Wzorzec wyglądu: M2 (AppHeader,
// karty na dużym ekranie, prawy monitor jako SidePanel). UI nie podpowiada oceny.
// Spec: docs/migration-spec.md, sekcja 3.

import React, { useEffect, useState } from 'react';
import { HardDrive, Usb, Archive, FileText, CheckCircle2, Mail } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { SidePanel } from '../../../engine/components/SidePanel';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { GradedDecision, PendriveConfig } from './types';

type Screen =
  | 'attach'
  | 'bind'
  | 'load_volume'
  | 'volume'
  | 'load_envelope'
  | 'envelope'
  | 'eject'
  | 'done';

const BIND_DURATION_MS = 1600;
/** Jak długo gracz widzi komunikat „RAT ukryty w archiwum”, zanim krok przejdzie sam. */
const BOUND_MS = 1300;
const ACCENT = '#f59e0b'; // kolor kafelka //DYSK E na pulpicie

/** Nazwa archiwum wynikająca z wgranego pliku (neutralna, nie zdradza oceny). */
const archiveName = (opt: ChoiceOption): string => {
  if (opt.id === 'party_photos') return 'FOTKI_AFTERPARTY.ZIP';
  const base = opt.label.replace(/\.[A-Za-z0-9]+$/, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `${base.toUpperCase()}.ZIP`;
};

export const PendriveApp: React.FC<BlockProps<PendriveConfig>> = ({ config, onDecision, onComplete }) => {
  const [screen, setScreen] = useState<Screen>('attach');
  const [attachId, setAttachId] = useState<string | null>(null);
  const [volumeId, setVolumeId] = useState<string | null>(null);
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  // Zatwierdzone (zgłoszone) opcje — panel boczny pokazuje tylko to, co już zapisano na nośniku.
  const [uploaded, setUploaded] = useState<ChoiceOption | null>(null);
  const [volumeSet, setVolumeSet] = useState<ChoiceOption | null>(null);
  const [envelopeSet, setEnvelopeSet] = useState<ChoiceOption | null>(null);
  const [isBinding, setIsBinding] = useState(false);
  const [isBound, setIsBound] = useState(false);
  // Po decyzji krytycznej silnik pokazuje wykrycie; do czasu powtórki nic już nie klikamy.
  const [locked, setLocked] = useState(false);

  // Opcje w losowej kolejności (raz przy zamontowaniu; od nowa przy powtórce misji).
  const attachOptions = useShuffled(config.attachments.options);
  const volumeOptions = useShuffled(config.volume.options);
  const envelopeOptions = useShuffled(config.envelope.options);

  const find = (d: GradedDecision, id: string | null) => d.options.find((o) => o.id === id);

  /** Zgłasza decyzję; zwraca true, gdy gra trwa (nie-critical). */
  const report = (d: GradedDecision, o: ChoiceOption): boolean => {
    sounds.playSuccess();
    onDecision({ num: d.decisionNum, question: d.question, answer: o.label, tier: o.tier, feedback: o.feedback });
    if (o.tier === 'critical') {
      setLocked(true);
      return false;
    }
    return true;
  };

  const confirmAttach = () => {
    const o = find(config.attachments, attachId);
    if (!o || locked) return;
    setUploaded(o);
    if (report(config.attachments, o)) setScreen('bind');
  };

  const startBind = () => {
    if (isBinding || isBound) return;
    sounds.playClick();
    setIsBinding(true);
  };

  // Podpięcie RAT do archiwum: pakowanie, komunikat sukcesu, potem krok sam przechodzi dalej.
  // Timery czyszczą się przy odmontowaniu; zaliczony krok nie uruchamia się drugi raz (isBound zostaje).
  useEffect(() => {
    if (!isBinding) return;
    const id = setTimeout(() => {
      sounds.playSuccess();
      setIsBinding(false);
      setIsBound(true);
    }, BIND_DURATION_MS);
    return () => clearTimeout(id);
  }, [isBinding]);

  useEffect(() => {
    if (!isBound || screen !== 'bind') return;
    const id = setTimeout(() => setScreen('load_volume'), BOUND_MS);
    return () => clearTimeout(id);
  }, [isBound, screen]);

  const confirmVolume = () => {
    const o = find(config.volume, volumeId);
    if (!o || locked) return;
    setVolumeSet(o);
    if (report(config.volume, o)) setScreen('load_envelope');
  };

  const confirmEnvelope = () => {
    const o = find(config.envelope, envelopeId);
    if (!o || locked) return;
    setEnvelopeSet(o);
    if (report(config.envelope, o)) setScreen('eject');
  };

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={HardDrive} accent={ACCENT} title="//DYSK E: PENDRIVE" subtitle={subtitle} task={task} step={step} />
  );

  const zip = uploaded ? archiveName(uploaded) : null;

  const row = (label: string, value: React.ReactNode) => (
    <div className="p-2.5 rounded bg-[#09111c] border border-gray-800 space-y-0.5">
      <div className="text-[0.6875rem] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-bold text-gray-100 break-words">{value}</div>
    </div>
  );
  const empty = <span className="text-gray-500 font-normal">— jeszcze nie ustawiono</span>;

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-hidden p-4 space-y-4">
      {screen === 'attach' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('PRZYGOTOWANIE NOŚNIKA: ZAWARTOŚĆ', config.attachments.question, 'KROK 1/4')}
          <ChoiceCardGrid
            accent={ACCENT}
            options={attachOptions}
            selectedId={uploaded ? uploaded.id : attachId}
            onSelect={(id) => {
              if (uploaded || locked) return; // wgrywamy dokładnie jeden plik
              sounds.playClick();
              setAttachId(id);
            }}
            mono
            label="WYBIERZ JEDEN PLIK"
          />
          <div className="flex justify-end mt-auto">
            <ConfirmButton
              accent={ACCENT}
              label="WGRAJ NA PENDRIVE'A"
              enabled={!!attachId && !uploaded && !locked}
              onClick={confirmAttach}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'bind' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'PRZYGOTOWANIE NOŚNIKA: ŁADUNEK',
            isBound ? 'Archiwum jest gotowe. Za chwilę przejdziesz do nazwy nośnika.' : config.bindPrompt,
            'KROK 2/4'
          )}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div
              className="w-full max-w-xl p-6 rounded-xl border space-y-4 text-center"
              style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}12` }}
            >
              <Archive size={36} className="mx-auto" style={{ color: ACCENT }} />
              <div className="text-sm font-bold text-white">{zip}</div>
              {isBinding ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold tracking-widest animate-pulse" style={{ color: ACCENT }}>
                    PAKOWANIE //WIRUS: RAT DO ARCHIWUM…
                  </div>
                  <div className="h-3 rounded bg-black/60 border overflow-hidden" style={{ borderColor: `${ACCENT}55` }}>
                    <div
                      className="h-full w-full origin-left animate-pulse"
                      style={{ backgroundColor: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }}
                    />
                  </div>
                </div>
              ) : isBound ? (
                <div className="flex items-center justify-center space-x-2" style={{ color: ACCENT }}>
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">//WIRUS: RAT UKRYTY W ARCHIWUM</span>
                </div>
              ) : (
                <ConfirmButton
                  accent={ACCENT}
                  label="PODEPNIJ //WIRUS: RAT W ARCHIWUM ZIP"
                  onClick={startBind}
                  icon={<Archive size={15} />}
                  className="w-auto mx-auto px-6"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {screen === 'load_volume' && (
        <ModuleLoader
          label="Formatowanie nośnika USB..."
          durationMs={900}
          accent={ACCENT}
          onDone={() => setScreen('volume')}
        />
      )}

      {screen === 'volume' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('PRZYGOTOWANIE NOŚNIKA: WOLUMIN', config.volume.question, 'KROK 3/4')}
          <ChoiceCardGrid
            accent={ACCENT}
            options={volumeOptions}
            selectedId={volumeSet ? volumeSet.id : volumeId}
            onSelect={(id) => {
              if (locked) return;
              sounds.playClick();
              setVolumeId(id);
            }}
            columns={2}
            label="WYBIERZ NAZWĘ"
          />
          <div className="flex justify-end mt-auto">
            <ConfirmButton
              accent={ACCENT}
              label="ZATWIERDŹ NAZWĘ"
              enabled={!!volumeId && !locked}
              onClick={confirmVolume}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'load_envelope' && (
        <ModuleLoader
          label="Przygotowywanie koperty..."
          durationMs={900}
          accent={ACCENT}
          onDone={() => setScreen('envelope')}
        />
      )}

      {screen === 'envelope' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('PRZYGOTOWANIE NOŚNIKA: KOPERTA', config.envelope.question, 'KROK 4/4')}
          <ChoiceCardGrid
            accent={ACCENT}
            options={envelopeOptions}
            selectedId={envelopeSet ? envelopeSet.id : envelopeId}
            onSelect={(id) => {
              if (locked) return;
              sounds.playClick();
              setEnvelopeId(id);
            }}
            columns={2}
            label="WYBIERZ PODPIS"
          />
          <div className="flex justify-end mt-auto">
            <ConfirmButton
              accent={ACCENT}
              label="ZATWIERDŹ PODPIS"
              enabled={!!envelopeId && !locked}
              onClick={confirmEnvelope}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'eject' && (
        <ModuleLoader
          label="Bezpieczne wysuwanie pamięci USB..."
          durationMs={1200}
          accent={ACCENT}
          onDone={() => {
            setScreen('done');
            onComplete();
          }}
        />
      )}

      {screen === 'done' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('NOŚNIK GOTOWY', 'Pendrive jest gotowy. Wróć do rozmowy z BYTE_MASTEREM.', 'GOTOWE')}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-full max-w-xl p-6 rounded-xl border text-center space-y-3"
              style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}12` }}
            >
              <CheckCircle2 size={36} className="mx-auto" style={{ color: ACCENT }} />
              <div className="text-sm font-bold text-white">{config.successMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Prawy monitor: stan nośnika (tylko to, co już zapisano) i instrukcja. */}
      <SideMonitor>
        <SidePanel
          accent={ACCENT}
          heading="//DYSK E: NOŚNIK USB"
          sub="Notatnik przygotowania pendrive'a. Wpisy pojawiają się po zatwierdzeniu kolejnych kroków."
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold" style={{ color: ACCENT }}>
              <Usb size={16} />
              <span>DYSK E: PODŁĄCZONY</span>
            </div>
            {row(
              'Zawartość',
              uploaded ? (
                <span className="flex items-start space-x-1.5">
                  <FileText size={14} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <span className="font-mono">{uploaded.label}</span>
                </span>
              ) : (
                empty
              )
            )}
            {row('Archiwum', isBound && zip ? `${zip} (z //WIRUS: RAT)` : empty)}
            {row('Nazwa woluminu', volumeSet ? volumeSet.label : empty)}
            {row(
              'Podpis na kopercie',
              envelopeSet ? (
                <span className="flex items-start space-x-1.5">
                  <Mail size={14} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <span>{envelopeSet.label}</span>
                </span>
              ) : (
                empty
              )
            )}
          </div>
        </SidePanel>
      </SideMonitor>
    </div>
  );
};
