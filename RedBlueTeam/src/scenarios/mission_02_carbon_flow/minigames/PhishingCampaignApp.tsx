import React, { useState } from 'react';
import { Mail, CheckCircle2, Users, ShieldAlert } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { PhishingCampaignConfig } from './types';
import { ConfirmButton, InfoCard, OptionCards, SidePanel } from './ui';

type Screen =
  | 'action'
  | 'load_template'
  | 'template'
  | 'load_topic'
  | 'topic'
  | 'import_list';

export const PhishingCampaignApp: React.FC<BlockProps<PhishingCampaignConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  // Akcent = kolor kafelka //PHISHING na pulpicie (jak w Misji 1).
  const accent = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('action');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isImported, setIsImported] = useState(false);

  // Opcje w losowej kolejności (raz przy zamontowaniu aplikacji; od nowa przy powtórce misji).
  const actionOptions = useShuffled(config.action.options);
  const templateOptions = useShuffled(config.template.options);
  const topicOptions = useShuffled(config.topic.options);

  const selectedAction = config.action.options.find((o) => o.id === selectedActionId);
  const selectedTemplate = config.template.options.find((o) => o.id === selectedTemplateId);
  const selectedTopic = config.topic.options.find((o) => o.id === selectedTopicId);

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
    onConfirm: () => void
  ) => (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
      {header(subtitle, task, step)}
      <OptionCards accent={accent} options={options} selectedId={selectedId} onSelect={onSelect} />
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

  const handleActionConfirm = () => {
    if (!selectedAction) return;
    sounds.playSuccess();
    onDecision({
      num: config.action.decisionNum,
      question: config.action.question,
      answer: selectedAction.label,
      tier: selectedAction.tier,
      feedback: selectedAction.feedback
    });
    if (selectedAction.tier !== 'critical') {
      setScreen('load_template');
    }
  };

  const handleTemplateConfirm = () => {
    if (!selectedTemplate) return;
    sounds.playSuccess();
    onDecision({
      num: config.template.decisionNum,
      question: config.template.question,
      answer: selectedTemplate.label,
      tier: selectedTemplate.tier,
      feedback: selectedTemplate.feedback
    });
    if (selectedTemplate.tier !== 'critical') {
      setScreen('load_topic');
    }
  };

  const handleTopicConfirm = () => {
    if (!selectedTopic) return;
    sounds.playSuccess();
    onDecision({
      num: config.topic.decisionNum,
      question: config.topic.question,
      answer: selectedTopic.label,
      tier: selectedTopic.tier,
      feedback: selectedTopic.feedback
    });
    if (selectedTopic.tier !== 'critical') {
      setScreen('import_list');
    }
  };

  const handleImport = () => {
    sounds.playSuccess();
    setIsImported(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {screen === 'action' &&
        choiceScreen(
          'KONFIGURACJA KAMPANII: RODZAJ AKCJI',
          'Wybierz rodzaj akcji, którą przeprowadzisz przeciwko CarbonFlow Inc.',
          'KROK 1/4',
          actionOptions,
          selectedActionId,
          setSelectedActionId,
          'ZATWIERDŹ RODZAJ AKCJI',
          !!selectedAction,
          handleActionConfirm
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
          'KROK 2/4',
          templateOptions,
          selectedTemplateId,
          setSelectedTemplateId,
          'ZATWIERDŹ SZABLON',
          !!selectedTemplate,
          handleTemplateConfirm
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
          'KROK 3/4',
          topicOptions,
          selectedTopicId,
          setSelectedTopicId,
          'ZATWIERDŹ TEMAT ANKIETY',
          !!selectedTopic,
          handleTopicConfirm
        )}

      {screen === 'import_list' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'KONFIGURACJA KAMPANII: ODBIORCY',
            isImported
              ? 'Baza jest załadowana. Zapisz kampanię.'
              : 'Zaimportuj bazę adresatów, aby zaadresować kampanię.',
            'KROK 4/4'
          )}

          {!isImported ? (
            <InfoCard accent={accent} className="text-center my-auto">
              <Users size={32} className="mx-auto" style={{ color: accent }} />
              <h3 className="text-sm font-bold text-white">LISTA PRACOWNIKÓW CARBONFLOW INC.</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                Lista mailingowa zawiera {config.mailingList.employeesCount} zweryfikowanych adresów pracowników w
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
                    ZAŁADOWANO BAZĘ: {config.mailingList.targetDomain} ({config.mailingList.employeesCount} REKORDÓW)
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
            sub={`Baza mailingowa pracowników CarbonFlow Inc. (${config.mailingList.employeesCount} adresów)`}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[0.6875rem] font-bold text-gray-300 uppercase tracking-wide">
                  Przykładowi odbiorcy z bazy kontaktów:
                </div>
                <div className="flex flex-col gap-2 text-[0.6875rem] font-mono">
                  {config.mailingList.sampleRecipients.map((r) => (
                    <div key={r.email} className="p-2.5 rounded bg-[#09111c] border border-gray-800 space-y-0.5">
                      <div className="text-gray-200">
                        {r.name} ({r.role})
                      </div>
                      <div style={{ color: accent }}>{r.email}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-gray-800 bg-black/30 text-[0.6875rem] space-y-2">
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
