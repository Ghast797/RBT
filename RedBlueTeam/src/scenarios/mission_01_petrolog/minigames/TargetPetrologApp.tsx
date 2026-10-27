import React, { useState } from 'react';
import {
  Crosshair,
  ArrowRight,
  FolderGit2,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  CreditCard,
  Network
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { TargetPetrologConfig, DossierTab, AttackVectorOption } from './types';

export const TargetPetrologApp: React.FC<BlockProps<TargetPetrologConfig>> = ({
  config,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission?.mission?.accentColor) || '#00ff66';
  const companyName = config?.companyName || 'PetroLog';
  const targetObjective = config?.targetObjective || 'PROFILOWANIE ORGANIZACJI I WYTYPOWANIE WEKTORA ATAKU';
  const vectorTitle = config?.vectorPrompt?.title || 'WYTYPUJ NAJBARDZIEJ PODATNY WEKTOR WEJŚCIA';
  const vectorDesc = config?.vectorPrompt?.description || 'Wybierz optymalną drogę przełamania zabezpieczeń PetroLog na podstawie zebranych akt:';

  // Tabs fallback if only slides provided or config is empty
  const tabs: DossierTab[] = config?.tabs && config.tabs.length > 0
    ? config.tabs
    : [
        {
          id: 'tab_org',
          badge: '01. STRUKTURA I ZARZĄD',
          tabLabel: '01. STRUKTURA',
          title: 'STRUKTURA ORGANIZACYJNA I ZARZĄD',
          lead: 'PetroLog to przedsiębiorstwo logistyczne zarządzane przez prezesa Romana Buczka.',
          bullets: ['150 pracowników w strukturze', 'Silna hierarchia decyzyjna', 'Zaufanie do autorytetu zarządu'],
          intelNotes: 'Prezes Buczek podejmuje decyzje, lecz nie uczestniczy w codziennej korespondencji.'
        },
        {
          id: 'tab_sales',
          badge: '02. SPRZEDAŻ I B2B',
          tabLabel: '02. SPRZEDAŻ',
          title: 'DZIAŁ SPRZEDAŻY I B2B',
          lead: 'Dział sprzedaży realizuje kontrakty paliwowe i weryfikuje nowych kontrahentów.',
          bullets: ['Marcelina Sojka ma profil prywatny', 'Weryfikacja kontrahentów przed ofertą', 'Brak specyfikacji Freevolt na stacjach'],
          intelNotes: 'Prywatny profil handlowców uniemożliwia profilowanie OSINT.'
        },
        {
          id: 'tab_finance',
          badge: '03. FINANSE I KSIĘGOWOŚĆ',
          tabLabel: '03. FINANSE',
          title: 'DZIAŁ FINANSOWO-KSIĘGOWY',
          lead: '3-osobowy zespół księgowy pod presją terminów rozliczeń faktur.',
          bullets: ['Anita Klimek i Jakub Kwiatkowski', 'Otwieranie dziesiątek załączników dziennie', 'Aktywny profil publiczny Anity Klimek w social media'],
          intelNotes: 'Rutyna obiegu faktur i publiczny ślad cyfrowy Anity czynią księgowość idealnym celem.'
        },
        {
          id: 'tab_it',
          badge: '04. BEZPIECZEŃSTWO IT',
          tabLabel: '04. BEZPIECZEŃSTWO',
          title: 'POLITYKA BEZPIECZEŃSTWA IT',
          lead: 'Brama sieciowa monitorowana przez SOC, serwer pocztowy słabo skonfigurowany.',
          bullets: ['Zewnętrzny SOC reaguje na DDoS i skan portów', 'Brak filtracji tożsamości nadawcy na serwerze pocztowym', 'Brak szkoleń Security Awareness'],
          intelNotes: 'Atak sieciowy zostanie odcięty przez SOC. Podatność serwera pocztowego pozwala podszyć się pod pracownika.'
        }
      ];

  const vectorOptions: AttackVectorOption[] = config?.vectorPrompt?.options && config.vectorPrompt.options.length > 0
    ? config.vectorPrompt.options
    : [
        {
          id: 'vector_ddos',
          letter: 'A',
          label: 'Bezpośredni atak DDoS na bramę sieciową firmy',
          description: 'Próba przeciążenia routerów i firewalli brzegowych PetroLog.',
          isCorrect: false,
          feedback: 'BŁĄD WEKTORA! Brama sieciowa PetroLog jest monitorowana przez zewnętrzny SOC. Taki atak uruchomi natychmiastowy alarm i spali naszą operację. Przeanalizuj ponownie zakładki teczki.'
        },
        {
          id: 'vector_spear_phishing',
          letter: 'B',
          label: 'Celowany atak socjotechniczny (spear-phishing) na pracownika działu księgowego z dostępem do faktur',
          description: 'Wykorzystanie publicznego profilu Anity Klimek, luki w serwerze pocztowym oraz rutyny rozliczania faktur.',
          isCorrect: true,
          feedback: 'WEKTOR ZATWIERDZONY! Połączenie publicznego śladu cyfrowego Anity Klimek, braku filtracji tożsamości na serwerze pocztowym i rutyny obiegu faktur to optymalny wektor wejścia bez alarmowania SOC.'
        },
        {
          id: 'vector_physical',
          letter: 'C',
          label: 'Fizyczne włamanie do serwerowni w centrali',
          description: 'Próba sforsowania zamków w budynku centrali i podłączenia urządzenia do przełącznika sieciowego.',
          isCorrect: false,
          feedback: 'BŁĄD WEKTORA! Centrala posiada dozór fizyczny i kamery CCTV. Ryzyko wpadki operatora na miejscu jest niedopuszczalne. Działamy w cyberprzestrzeni. Przeanalizuj ponownie zakładki teczki.'
        }
      ];

  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  const [vectorFeedback, setVectorFeedback] = useState<{
    type: 'success' | 'error';
    feedback: string;
  } | null>(null);

  const currentTab = tabs[activeTabIdx] || tabs[0];
  const selectedVector = vectorOptions.find((v) => v.id === selectedVectorId);
  const isVectorConfirmed = selectedVector?.isCorrect === true;

  const handleSelectTab = (idx: number) => {
    sounds.playClick();
    setActiveTabIdx(idx);
  };

  const handleSelectVector = (option: AttackVectorOption) => {
    sounds.playClick();
    setSelectedVectorId(option.id);

    if (option.isCorrect) {
      sounds.playSuccess();
      setVectorFeedback({
        type: 'success',
        feedback: option.feedback
      });
    } else {
      sounds.playNotification();
      setVectorFeedback({
        type: 'error',
        feedback: option.feedback
      });
    }
  };

  const handleConfirmAndComplete = () => {
    if (!isVectorConfirmed) return;
    sounds.playSuccess();
    onComplete();
  };

  const tabIcons = [Building, Users, CreditCard, Network];

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Dossier Header */}
      <div
        className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        style={{ borderColor: `${accent}4d` }}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-2 rounded border"
            style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent }}
          >
            <FolderGit2 size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black text-white tracking-widest">
                {`//DOSSIER_WYWIADOWCZE: ${companyName.toUpperCase()}`}
              </h2>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/70 text-red-400 border border-red-500/50 font-black tracking-wider">
                ŚCIŚLE TAJNE // OPSEC LEVEL 4
              </span>
            </div>
            <p className="text-[11px]" style={{ color: accent }}>
              {targetObjective}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider font-bold"
            style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
          >
            ZAKŁADKA {activeTabIdx + 1}/{tabs.length}
          </span>
        </div>
      </div>

      {/* 4 Interactive Folder Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tabs.map((tab, idx) => {
          const TabIcon = tabIcons[idx % tabIcons.length] || FileText;
          const isActive = idx === activeTabIdx;
          return (
            <button
              key={tab.id || idx}
              onClick={() => handleSelectTab(idx)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                isActive
                  ? 'bg-[#081824] shadow-lg scale-[1.01]'
                  : 'bg-black/40 border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
              style={{
                borderColor: isActive ? accent : undefined,
                boxShadow: isActive ? `0 0 15px ${accent}33` : undefined
              }}
            >
              <div
                className={`p-1.5 rounded border ${
                  isActive ? 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/50' : 'bg-gray-900 border-gray-800 text-gray-500'
                }`}
              >
                <TabIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider block truncate text-gray-400">
                  {tab.badge}
                </span>
                <span className={`text-xs font-bold truncate block ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {tab.tabLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Dossier Content Card */}
      <div className="p-5 rounded-xl border bg-[#08101a]/95 border-gray-800 shadow-xl relative overflow-hidden space-y-4">
        {/* Glow accent */}
        <div
          className="absolute -right-20 -top-20 w-56 h-56 rounded-full pointer-events-none opacity-15 blur-3xl"
          style={{ backgroundColor: accent }}
        />

        {/* Tab Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest text-[#05090f]"
                style={{ backgroundColor: accent }}
              >
                {currentTab.badge}
              </span>
              <span className="text-xs text-gray-500 font-bold">
                ID_REKORDU: #PL-DOSSIER-0{activeTabIdx + 1}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
              {currentTab.title}
            </h1>
          </div>

          <span className="text-[10px] text-gray-400 font-mono self-start sm:self-auto px-2 py-1 rounded bg-black/40 border border-gray-800">
            KLASYFIKACJA: DARKSUN_INTEL
          </span>
        </div>

        {/* Lead Summary */}
        <div
          className="p-3.5 rounded-lg border text-xs sm:text-sm font-medium text-emerald-100 leading-relaxed bg-[#00ff66]/5"
          style={{ borderColor: `${accent}40` }}
        >
          {currentTab.lead}
        </div>

        {/* Bullet Points */}
        {currentTab.bullets && currentTab.bullets.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
              {currentTab.bulletHeader || 'OBSERWACJE I PODATNOŚCI SYSTEMOWE:'}
            </span>
            <ul className="space-y-2 text-xs text-gray-300">
              {currentTab.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start space-x-2 bg-black/30 p-2 rounded border border-gray-800/80">
                  <span className="font-bold text-sm leading-none mt-0.5" style={{ color: accent }}>
                    ▸
                  </span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Operational conclusion */}
        {currentTab.intelNotes && (
          <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 text-xs flex items-start space-x-2">
            <span className="text-cyan-400 font-bold mt-0.5">ℹ</span>
            <span className="leading-relaxed font-sans">{currentTab.intelNotes}</span>
          </div>
        )}
      </div>

      {/* Analytical Panel: Wytypuj Podatny Wektor Wejścia */}
      <div className="p-5 rounded-xl border border-gray-800 bg-[#08121d]/95 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-gray-800 pb-2.5">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Crosshair size={18} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">
              //PANEL_ANALITYCZNY: {vectorTitle}
            </h3>
            <p className="text-[11px] text-gray-400">
              {vectorDesc}
            </p>
          </div>
        </div>

        {/* 3 Vector Choice Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {vectorOptions.map((opt) => {
            const isSelected = selectedVectorId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectVector(opt)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                  isSelected
                    ? opt.isCorrect
                      ? 'border-[#00ff66] bg-[#00ff66]/10 shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                      : 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : 'border-gray-800 bg-black/40 hover:border-gray-700 hover:bg-white/5'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-[#00ff66] text-[#05090f] border-[#00ff66]'
                            : 'bg-red-500 text-white border-red-500'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}
                    >
                      {`OPCJA ${opt.letter}`}
                    </span>

                    {isSelected && (
                      <span className="text-xs">
                        {opt.isCorrect ? (
                          <CheckCircle2 size={16} className="text-[#00ff66]" />
                        ) : (
                          <AlertTriangle size={16} className="text-red-400" />
                        )}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {opt.label}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-500">
                  <span>{`WEKTOR #${opt.letter}`}</span>
                  <span className={isSelected && opt.isCorrect ? 'text-[#00ff66] font-bold' : ''}>
                    {isSelected ? (opt.isCorrect ? 'ZATWIERDZONY' : 'ODRZUCONY') : 'KLIKNIJ, ABY WYBRAĆ'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback Banner */}
        {vectorFeedback && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
              vectorFeedback.type === 'success'
                ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66]'
                : 'border-amber-500/50 bg-amber-950/30 text-amber-200'
            }`}
          >
            {vectorFeedback.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-[#00ff66] mt-0.5" />
            ) : (
              <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block">
                {vectorFeedback.type === 'success'
                  ? 'DECYZJA TAKTYCZNA ZAAKCEPTOWANA'
                  : 'OSTRZEŻENIE DARK_SUN // BŁĄD WEKTORA'}
              </span>
              <p className="text-[11px] leading-relaxed font-sans text-gray-200">
                {vectorFeedback.feedback}
              </p>
            </div>
          </div>
        )}

        {/* Unlock / Confirmation button */}
        {isVectorConfirmed && (
          <div className="pt-2 flex justify-end animate-in fade-in">
            <button
              onClick={handleConfirmAndComplete}
              className="px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95 bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 shadow-[0_0_25px_rgba(0,255,102,0.4)]"
            >
              <span>ZATWIERDŹ WEKTOR // PRZEJDŹ DO WYSZUKIWARKI OSINT</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
