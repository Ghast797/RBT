import React, { useMemo, useState } from 'react';
import {
  Globe,
  ArrowRight,
  Bug,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { PhishingBuilderConfig } from './types';
import { WebsitePreview } from './WebsitePreview';

type BuilderScreen =
  | 'domain'
  | 'load_payload'
  | 'payload'
  | 'load_injection'
  | 'injection'
  | 'summary';

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const PhishingBuilderApp: React.FC<BlockProps<PhishingBuilderConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const pink = '#ec4899';

  const [screen, setScreen] = useState<BuilderScreen>('domain');
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedPayloadId, setSelectedPayloadId] = useState<string | null>(null);
  const [isPayloadInjected, setIsPayloadInjected] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const domainOptions = useMemo(() => shuffled(config.domain.options), [config.domain.options]);

  const currentPayloadConfig = useMemo(() => {
    if (selectedDomainId && config.payloadByDomain?.[selectedDomainId]) {
      return config.payloadByDomain[selectedDomainId];
    }
    if (
      selectedDomainId &&
      (selectedDomainId.includes('muf') || selectedDomainId.includes('muff'))
    ) {
      return config.payloadByDomain?.['mufina_org_pl'] || config.payload;
    }
    return config.payload;
  }, [config, selectedDomainId]);

  const payloadOptions = useMemo(
    () => shuffled(currentPayloadConfig.options),
    [currentPayloadConfig]
  );

  const selectedDomain = config.domain.options.find((o) => o.id === selectedDomainId);
  const selectedPayload = currentPayloadConfig.options.find((o) => o.id === selectedPayloadId);

  const header = (title: string, subtitle: string, task: string, step: string) => (
    <AppHeader icon={Globe} accent={pink} title={title} subtitle={subtitle} task={task} step={step} />
  );

  const renderOptionCards = (
    options: ChoiceOption[],
    selectedId: string | null,
    onSelect: (id: string) => void
  ) => (
    <ChoiceZone accent={pink} label="WYBIERZ JEDNO">
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <ChoiceTile
            key={opt.id}
            accent={pink}
            state={selectedId === opt.id ? 'selected' : 'idle'}
            markerPosition="corner"
            onClick={() => {
              sounds.playClick();
              onSelect(opt.id);
            }}
            className="p-3.5 h-full"
          >
            <div className="space-y-2 pr-7">
              <h3 className="text-xs font-bold text-white leading-snug">{opt.label}</h3>
              {opt.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed">{opt.desc}</p>}
              {opt.tags && opt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ChoiceTile>
        ))}
      </div>
    </ChoiceZone>
  );

  // Prawy monitor jest zajęty przez kreator przez cały etap (także w trakcie ładowania), żeby
  // nie migał czat. Wybory, moduł do przeciągnięcia i przyciski żyją tam, a lewy ekran w całości
  // pokazuje budowaną stronę.
  const confirmButton = (label: string, enabled: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="w-full shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
      style={{
        backgroundColor: pink,
        color: '#05090f',
        boxShadow: enabled ? `0 0 15px ${pink}66` : undefined
      }}
    >
      <span>{label}</span>
      <ArrowRight size={15} />
    </button>
  );

  const sidePanel = (heading: string, sub: React.ReactNode, body: React.ReactNode, footer?: React.ReactNode) => (
    <div
      className="flex flex-col h-full bg-[#060c14] border-2 rounded-xl p-4 space-y-3 font-mono text-gray-200 select-none"
      style={{ borderColor: `${pink}66` }}
    >
      <div className="border-b pb-2 shrink-0 space-y-1" style={{ borderColor: `${pink}40` }}>
        <span className="text-xs font-black tracking-widest block" style={{ color: pink }}>
          {heading}
        </span>
        <p className="text-[0.6875rem] text-gray-300 leading-snug">{sub}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-3">{body}</div>
      {footer}
    </div>
  );

  const choicePanel = (
    question: string,
    options: ChoiceOption[],
    selectedId: string | null,
    onSelect: (id: string) => void,
    confirmLabel: string,
    onConfirm: () => void
  ) =>
    sidePanel(
      '//KREATOR_STRONY: WYBÓR',
      question,
      renderOptionCards(options, selectedId, onSelect),
      confirmButton(confirmLabel, !!selectedId, onConfirm)
    );

  // Lista kroków konfiguracji — pokazywana w trakcie ładowania i w podsumowaniu.
  const progressPanel = (heading: string, sub: string, footer?: React.ReactNode) => {
    const steps = [
      { label: 'DOMENA', value: selectedDomain?.label, done: screen !== 'domain' },
      {
        label: 'PRZYNĘTA',
        value: selectedPayload?.label,
        done: screen === 'load_injection' || screen === 'injection' || screen === 'summary'
      },
      { label: 'WIRUS W PRZYCISKU', value: isPayloadInjected ? 'AKTYWNY' : undefined, done: isPayloadInjected }
    ];
    return sidePanel(
      heading,
      sub,
      <div className="flex flex-col gap-2">
        {steps.map((s, idx) => (
          <div
            key={s.label}
            className={`p-3 rounded-lg border text-xs flex items-center space-x-2.5 ${
              s.done ? 'border-[#00ff66]/70 bg-[#00ff66]/10' : 'border-gray-800 bg-black/20 text-gray-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.625rem] shrink-0 font-bold ${
                s.done ? 'bg-[#00ff66] text-[#05090f]' : 'bg-gray-800 text-gray-500'
              }`}
            >
              {s.done ? '✓' : idx + 1}
            </span>
            <div className="min-w-0">
              <span className="text-[0.625rem] text-gray-400 block tracking-wider">{s.label}</span>
              <span className={`font-bold truncate block ${s.done ? 'text-emerald-200' : ''}`}>
                {s.done ? s.value : '…'}
              </span>
            </div>
          </div>
        ))}
      </div>,
      footer
    );
  };

  const injectionPanel = sidePanel(
    '//KREATOR_STRONY: WIRUS',
    'Przeciągnij moduł malware na lewy ekran i upuść go na przycisk pobierania na stronie.',
    <div className="space-y-3">
      <span className="text-[0.625rem] text-gray-400 font-bold tracking-widest uppercase block">
        DOSTĘPNY MODUŁ MALWARE:
      </span>
      <div
        draggable={!isPayloadInjected}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', 'malware-payload');
          e.dataTransfer.effectAllowed = 'copyMove';
        }}
        className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
          isPayloadInjected
            ? 'border-gray-700 bg-gray-900/60 opacity-60 cursor-default'
            : 'border-[#00ff66] bg-[#00ff66]/15 hover:bg-[#00ff66]/25 shadow-[0_0_20px_rgba(0,255,102,0.3)] animate-pulse cursor-grab active:cursor-grabbing'
        }`}
      >
        <div className="p-2 rounded bg-[#00ff66]/20 text-[#00ff66]">
          <Bug size={24} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">//PRZEKIEROWANIE</h4>
          <p className="text-[0.625rem] text-emerald-300">
            {isPayloadInjected ? 'ZAINSTALOWANO WIRUSA ✓' : 'PRZECIĄGNIJ NA PRZYCISK STRONY ←'}
          </p>
        </div>
      </div>
    </div>,
    confirmButton('ZAPISZ STRONĘ I PRZEJDŹ DALEJ', isPayloadInjected, () => {
      sounds.playSuccess();
      setScreen('summary');
    })
  );

  const handleDomainConfirm = () => {
    if (!selectedDomain) return;
    sounds.playSuccess();
    onDecision({
      num: config.domain.decisionNum,
      question: config.domain.question,
      answer: selectedDomain.label,
      tier: selectedDomain.tier,
      feedback: selectedDomain.feedback
    });
    if (selectedDomain.tier !== 'critical') {
      setScreen('load_payload');
    }
  };

  const handlePayloadConfirm = () => {
    if (!selectedPayload) return;
    sounds.playSuccess();
    onDecision({
      num: currentPayloadConfig.decisionNum,
      question: currentPayloadConfig.question,
      answer: selectedPayload.label,
      tier: selectedPayload.tier,
      feedback: selectedPayload.feedback
    });
    if (selectedPayload.tier !== 'critical') {
      setScreen('load_injection');
    }
  };

  const handleInjectPayload = () => {
    sounds.playSuccess();
    setIsPayloadInjected(true);
  };

  const sideContent =
    screen === 'domain'
      ? choicePanel(
          config.domain.question,
          domainOptions,
          selectedDomainId,
          setSelectedDomainId,
          'ZATWIERDŹ DOMENĘ',
          handleDomainConfirm
        )
      : screen === 'payload'
      ? choicePanel(
          currentPayloadConfig.question,
          payloadOptions,
          selectedPayloadId,
          setSelectedPayloadId,
          'ZATWIERDŹ PLIK PRZYNĘTĘ',
          handlePayloadConfirm
        )
      : screen === 'injection'
      ? injectionPanel
      : screen === 'summary'
      ? progressPanel(
          '//KREATOR_STRONY: GOTOWE',
          'Strona czeka na ofiarę. Zakończ ten etap i przejdź do przygotowania wiadomości e-mail.',
          <button
            onClick={() => {
              sounds.playSuccess();
              onComplete();
            }}
            className="w-full shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-pink-500 text-[#05090f] hover:bg-pink-400 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(236,72,153,0.4)] active:scale-95"
          >
            <CheckCircle2 size={15} />
            <span>PRZEJDŹ DO KAMPANII E-MAIL</span>
          </button>
        )
      : // Ładowanie między ekranami: prawy monitor zostaje zajęty (bez czatu), ale pusty.
        <div className="h-full" />;

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <SideMonitor>{sideContent}</SideMonitor>

      {/* 1. DOMAIN SCREEN (D1) */}
      {screen === 'domain' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_STRONY', 'WYBÓR DOMENY STRONY-PUŁAPKI', config.domain.question, 'KROK 1/3 (D1)')}

          {/* Website Preview: appears when selectedDomainId is clicked */}
          {selectedDomainId ? (
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <WebsitePreview
                domainId={selectedDomainId}
                domainLabel={selectedDomain?.label}
                payloadId={null}
              />
            </div>
          ) : (
            <div className="flex-1 p-6 rounded-xl border border-gray-800 bg-[#060c14]/70 text-center flex flex-col items-center justify-center space-y-2.5 animate-in fade-in duration-200">
              <div className="p-3 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <Globe size={26} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-200 tracking-wider uppercase font-mono">
                  KLIKNIJ JEDEN Z ADRESÓW STRONY NA PRAWYM MONITORZE, ABY ZOBACZYĆ PODGLĄD NA ŻYWO
                </h4>
                <p className="text-[0.6875rem] text-gray-400 max-w-lg mx-auto font-mono mt-1">
                  Po kliknięciu kafelka natychmiast wygeneruje się podgląd witryny w oknie przeglądarki, dzięki czemu zobaczysz, jak Twoją stronę-pułapkę zobaczy ofiara (Anita Klimek).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOADER TO PAYLOAD */}
      {screen === 'load_payload' && (
        <ModuleLoader
          label="REZERWOWANIE DOMENY I KONFIGURACJA STRONY INTERNETOWEJ..."
          accent={pink}
          onComplete={() => setScreen('payload')}
        />
      )}

      {/* 2. PAYLOAD SCREEN (D2) */}
      {screen === 'payload' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_STRONY', 'WYBÓR PRZYNĘTY (PAYLOAD)', currentPayloadConfig.question, 'KROK 2/3 (D2)')}

          {/* Website Preview with dynamic payload update */}
          <div className="flex-1 animate-in fade-in duration-300">
            <WebsitePreview
              domainId={selectedDomainId}
              domainLabel={selectedDomain?.label}
              payloadId={selectedPayloadId}
              payloadLabel={selectedPayload?.label}
            />
          </div>
        </div>
      )}

      {/* LOADER TO INJECTION */}
      {screen === 'load_injection' && (
        <ModuleLoader
          label="KOMPILOWANIE MODUŁU ROZPRZESTRZENIANIA WIRUSA..."
          accent={pink}
          onComplete={() => setScreen('injection')}
        />
      )}

      {/* 3. INJECTION SCREEN: moduł przeciągany z prawego monitora na przycisk strony */}
      {screen === 'injection' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_STRONY', 'WSTRZYKNIĘCIE WIRUSA', 'ZAWIRUSUJ PLIK – PRZECIĄGNIJ WIRUSA Z PRAWEGO MONITORA NA PRZYCISK STRONY.', 'KROK 3/3')}

          <div className="flex-1">
            <WebsitePreview
              domainId={selectedDomainId}
              domainLabel={selectedDomain?.label}
              payloadId={selectedPayloadId}
              payloadLabel={selectedPayload?.label}
              isPayloadInjected={isPayloadInjected}
              isInteractiveTarget={true}
              isDragOver={isDragOver}
              onDragOver={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={() => {
                setIsDragOver(false);
                handleInjectPayload();
              }}
            />
          </div>
        </div>
      )}

      {/* 4. SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in">
          {header('//KREATOR_STRONY', 'PODSUMOWANIE WITRYNY', 'STRONA-PUŁAPKA JEST GOTOWA. ZAPISZ JĄ I PRZEJDŹ DO KAMPANII E-MAIL.', 'FINALIZACJA ETAPU')}

          <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-3 shadow-xl">
            <div className="flex items-center space-x-2.5 text-pink-400">
              <Sparkles size={20} />
              <h3 className="text-sm font-bold tracking-wider">
                DOSKONALE! STRONA-PUŁAPKA ZOSTAŁA SKONFIGUROWANA I ZAINFEKOWANA
              </h3>
            </div>

            {/* Compact website review preview */}
            <WebsitePreview
              domainId={selectedDomainId}
              domainLabel={selectedDomain?.label}
              payloadId={selectedPayloadId}
              payloadLabel={selectedPayload?.label}
              isPayloadInjected={true}
              isInteractiveTarget={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
