import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2, Users, ShieldAlert } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { submitDecision } from '../../../engine/core/report';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { PhishingCampaignConfig } from './types';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SidePanel } from '../../../engine/components/SidePanel';
import { InfoCard, OptionCards, ImageOptionCards } from './ui';

type Screen =
  | 'start'
  | 'load_template'
  | 'template'
  | 'load_topic'
  | 'topic'
  | 'import_list';

const IMPORT_DURATION_MS = 2000;
/** Ilu odbiorców pokazuje podgląd na prawym monitorze (reszta jako „i N kolejnych”). */
const SAMPLE_COUNT = 5;

export const PhishingCampaignApp: React.FC<BlockProps<PhishingCampaignConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  // Akcent = kolor kafelka //PHISHING na pulpicie (jak w Misji 1).
  const accent = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('start');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isImported, setIsImported] = useState(false);
  // Import trwa chwilę: pasek i licznik wczytanych adresów (stan żyje w aplikacji, więc wraca po ponownym otwarciu).
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const listSize = config.mailingList.recipients.length;

  // Opcje w losowej kolejności (raz przy zamontowaniu aplikacji; od nowa przy powtórce misji).
  const templateOptions = useShuffled(config.template.options);
  const topicOptions = useShuffled(config.topic.options);

  const selectedTemplate = config.template.options.find((o) => o.id === selectedTemplateId);
  const selectedTopic = config.topic.options.find((o) => o.id === selectedTopicId);

  // B2: mentor może odrzucić wybór (blokada opcji + komunikat); wspólny helper `submitDecision`.
  const rejectDecision = useMissionStore((s) => s.rejectDecision);

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={Mail} accent={accent} title="//PHISHING" subtitle={subtitle} task={task} step={step} />
  );

  // Ekran z jednym wyborem. Nie ma tu podglądu, który wymagałby prawego monitora, więc wybór stoi na lewym ekranie.
  const choiceScreen = (
    subtitle: string,
    task: string,
    step: string,
    options: ChoiceOption[],
    selectedId: string | null,
    onSelect: (id: string) => void,
    confirmLabel: string,
    enabled: boolean,
    onConfirm: () => void,
    decisionNum?: number,
    withImages = false
  ) => (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
      {header(subtitle, task, step)}
      {withImages ? (
        <ImageOptionCards accent={accent} options={options} selectedId={selectedId} onSelect={onSelect} decisionNum={decisionNum} />
      ) : (
        <OptionCards accent={accent} options={options} selectedId={selectedId} onSelect={onSelect} decisionNum={decisionNum} />
      )}
      <div className="flex justify-end">
        <ConfirmButton
          accent={accent}
          label={confirmLabel}
          enabled={enabled}
          onClick={onConfirm}
          className="w-auto px-6"
        />
      </div>
    </div>
  );

  const handleTemplateConfirm = () => {
    if (!selectedTemplate) return;
    if (submitDecision({ decisionNum: config.template.decisionNum, question: config.template.question }, selectedTemplate, { onDecision, rejectDecision }) === 'rejected') {
      setSelectedTemplateId(null);
      return;
    }
    sounds.playSuccess();
    if (selectedTemplate.tier !== 'critical') {
      setScreen('load_topic');
    }
  };

  const handleTopicConfirm = () => {
    if (!selectedTopic) return;
    if (submitDecision({ decisionNum: config.topic.decisionNum, question: config.topic.question }, selectedTopic, { onDecision, rejectDecision }) === 'rejected') {
      setSelectedTopicId(null);
      return;
    }
    sounds.playSuccess();
    if (selectedTopic.tier !== 'critical') {
      setScreen('import_list');
    }
  };

  const handleImport = () => {
    sounds.playClick();
    setImportedCount(0);
    setIsImporting(true);
  };

  useEffect(() => {
    if (!isImporting) return;
    const step = Math.floor(IMPORT_DURATION_MS / Math.max(1, listSize));
    const id = setInterval(() => {
      setImportedCount((n) => {
        const next = n + 1;
        if (next >= listSize) clearInterval(id);
        return Math.min(next, listSize);
      });
      sounds.playKeypress();
    }, step);
    return () => clearInterval(id);
  }, [isImporting, listSize]);

  useEffect(() => {
    if (!isImporting || importedCount < listSize) return;
    const id = setTimeout(() => {
      sounds.playSuccess();
      setIsImporting(false);
      setIsImported(true);
    }, 400);
    return () => clearTimeout(id);
  }, [isImporting, importedCount, listSize]);

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {screen === 'start' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'KONFIGURACJA KAMPANII',
            'Kliknij NOWA KAMPANIA PHISHINGOWA, aby rozpocząć konfigurację kampanii przeciwko CarbonFlow Inc.',
            'START'
          )}
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setScreen('load_template');
              }}
              className="w-full max-w-md p-8 rounded-2xl border-2 text-center space-y-3 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              style={{
                borderColor: accent,
                backgroundColor: `${accent}1a`,
                boxShadow: `0 0 24px ${accent}40`
              }}
            >
              <Mail size={40} className="mx-auto" style={{ color: accent }} />
              <span className="block text-base font-black text-white uppercase tracking-wider">
                NOWA KAMPANIA PHISHINGOWA
              </span>
            </button>
          </div>
        </div>
      )}

      {screen === 'load_template' && (
        <ModuleLoader
          label="Pobieranie bazy szablonów formularzy..."
          durationMs={900}
          accent={accent}
          onDone={() => setScreen('template')}
        />
      )}

      {screen === 'template' &&
        choiceScreen(
          'KONFIGURACJA KAMPANII: SZABLON FORMULARZA',
          'Wybierz szablon formularza, w którym ofiary otrzymają link.',
          'KROK 1/3',
          templateOptions,
          selectedTemplateId,
          setSelectedTemplateId,
          'ZATWIERDŹ SZABLON',
          !!selectedTemplate,
          handleTemplateConfirm,
          config.template.decisionNum,
          true
        )}

      {screen === 'load_topic' && (
        <ModuleLoader
          label="Konfigurowanie przynęty socjotechnicznej..."
          durationMs={900}
          accent={accent}
          onDone={() => setScreen('topic')}
        />
      )}

      {screen === 'topic' &&
        choiceScreen(
          'KONFIGURACJA KAMPANII: TEMAT I PRZYNĘTA',
          'Wybierz temat ankiety, który ma zainteresować pracowników.',
          'KROK 2/3',
          topicOptions,
          selectedTopicId,
          setSelectedTopicId,
          'ZATWIERDŹ TEMAT ANKIETY',
          !!selectedTopic,
          handleTopicConfirm,
          config.topic.decisionNum
        )}

      {screen === 'import_list' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'KONFIGURACJA KAMPANII: ODBIORCY',
            isImported
              ? 'Baza jest załadowana. Zapisz kampanię.'
              : 'Zaimportuj bazę adresatów, aby zaadresować kampanię.',
            'KROK 3/3'
          )}

          {isImporting ? (
            <InfoCard accent={accent} className="my-auto space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div className="text-xs font-bold tracking-widest animate-pulse" style={{ color: accent }}>
                  IMPORTOWANIE BAZY ADRESATÓW…
                </div>
                <div className="text-3xl font-black font-mono text-white leading-none">
                  <span style={{ color: accent }}>{importedCount}</span>
                  <span className="text-gray-500"> / {listSize}</span>
                </div>
              </div>
              <div className="h-3 rounded bg-black/60 border overflow-hidden" style={{ borderColor: `${accent}55` }}>
                <div
                  className="h-full transition-all duration-150"
                  style={{
                    width: `${Math.round((importedCount / listSize) * 100)}%`,
                    backgroundColor: accent,
                    boxShadow: `0 0 12px ${accent}`
                  }}
                />
              </div>
              <div className="text-sm font-mono text-gray-300 truncate h-5">
                {importedCount > 0 ? `wczytano: ${config.mailingList.recipients[importedCount - 1].email}` : 'łączenie z bazą…'}
              </div>
            </InfoCard>
          ) : !isImported ? (
            <InfoCard accent={accent} className="text-center my-auto">
              <Users size={32} className="mx-auto" style={{ color: accent }} />
              <h3 className="text-sm font-bold text-white">LISTA PRACOWNIKÓW CARBONFLOW INC.</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                Lista mailingowa zawiera {config.mailingList.recipients.length} zweryfikowanych adresów pracowników w
                domenie {config.mailingList.targetDomain}.
              </p>
              <ConfirmButton
                accent={accent}
                label="IMPORTUJ LISTĘ ADRESATÓW"
                onClick={handleImport}
                icon={<Users size={15} />}
                className="w-auto mx-auto px-6"
              />
            </InfoCard>
          ) : (
            <InfoCard accent={accent} className="my-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2" style={{ color: accent }}>
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">
                    ZAŁADOWANO BAZĘ: {config.mailingList.targetDomain} ({config.mailingList.recipients.length} REKORDÓW)
                  </span>
                </div>
                <span className="text-xs text-gray-300 font-mono shrink-0">STATUS: UZBROJONE</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Lista adresatów i allowlista nadawców CarbonFlow są na prawym monitorze.
              </p>
            </InfoCard>
          )}

          <div className="flex justify-end">
            <ConfirmButton
              accent={accent}
              label="ZAPISZ KAMPANIĘ"
              enabled={isImported}
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {/* Prawy monitor: lista adresatów i allowlista (treść pomocnicza, żeby ekran się nie przewijał). */}
      {screen === 'import_list' && isImported && (
        <SideMonitor>
          <SidePanel
            accent={accent}
            heading="//PHISHING: ADRESACI"
            sub={`Baza mailingowa pracowników CarbonFlow Inc. (${config.mailingList.recipients.length} adresów)`}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                  Przykładowi odbiorcy z bazy kontaktów:
                </div>
                <div className="flex flex-col gap-2 text-xs font-mono">
                  {config.mailingList.recipients.slice(0, SAMPLE_COUNT).map((r) => (
                    <div key={r.email} className="p-2.5 rounded bg-[#09111c] border border-gray-800 space-y-0.5">
                      <div className="text-gray-200">
                        {r.name} ({r.role})
                      </div>
                      <div style={{ color: accent }}>{r.email}</div>
                    </div>
                  ))}
                  {listSize > SAMPLE_COUNT && (
                    <div className="text-gray-400 px-1">… i {listSize - SAMPLE_COUNT} kolejnych adresów</div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-gray-800 bg-black/30 text-xs space-y-2">
                <div className="font-bold text-gray-200 flex items-center space-x-1.5">
                  <ShieldAlert size={14} style={{ color: accent }} />
                  <span>BIAŁA LISTA NADAWCÓW (ALLOWLISTA IP CARBONFLOW):</span>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-gray-200">
                  {config.mailingList.whitelistedIps.map((ip) => (
                    <span key={ip} className="px-2 py-0.5 rounded bg-black/50 border border-gray-700">
                      {ip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SidePanel>
        </SideMonitor>
      )}
    </div>
  );
};
