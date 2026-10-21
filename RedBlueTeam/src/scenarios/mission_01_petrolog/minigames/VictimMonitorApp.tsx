import React, { useState } from 'react';
import {
  Monitor,
  Mail,
  Globe,
  Download,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Server,
  Terminal,
  Activity,
  Cpu,
  Lock,
  Unlock,
  Sparkles,
  Wifi
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { VictimMonitorConfig } from './types';

type MonitorStep = 'email_inbox' | 'browser_page' | 'infection' | 'network_takeover';

export const VictimMonitorApp: React.FC<BlockProps<VictimMonitorConfig>> = ({
  config,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const blue = '#3b82f6';

  const [step, setStep] = useState<MonitorStep>('email_inbox');
  const [infectionProgress, setInfectionProgress] = useState<number>(0);

  const senderName = config?.senderName || 'Jakub Kwiatkowski';
  const senderEmail = config?.senderEmail || 'k.kwiatkowski@petrolog.com';
  const targetDomain = config?.targetDomain || 'dalekbieg.info';
  const payloadTitle =
    config?.payloadFileName ||
    'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK';

  const handleOpenLink = () => {
    sounds.playClick();
    setStep('browser_page');
  };

  const handleVictimDownload = () => {
    sounds.playClick();
    setStep('infection');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setInfectionProgress(current);
      sounds.playClick(1400, 0.02);

      if (current >= 100) {
        clearInterval(interval);
        sounds.playSuccess();
        setTimeout(() => {
          setStep('network_takeover');
        }, 500);
      }
    }, 250);
  };

  const handleFinishMission = () => {
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div
        className="border-b pb-3 flex items-center justify-between"
        style={{ borderColor: `${blue}4d` }}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${blue}26`, borderColor: blue, color: blue }}
          >
            <Monitor size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//MONITOR_OFIARY</h2>
            <p className="text-[11px]" style={{ color: blue }}>
              TELEMETRIA STACJI ROBOCZEJ: ANITA KLIMEK (PETROLOG LOGISTICS)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider font-bold flex items-center space-x-1"
            style={{ backgroundColor: `${blue}1a`, borderColor: `${blue}66`, color: blue }}
          >
            <Activity size={12} className="animate-pulse" />
            <span>SESJA PODSŁUCHOWA NA ŻYWO</span>
          </span>
        </div>
      </div>

      {/* STEP 1: VICTIM WEBMAIL INBOX */}
      {step === 'email_inbox' && (
        <div className="flex-1 flex flex-col justify-between p-5 rounded-xl border border-gray-800 bg-[#08101a] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-xs">
            <div className="flex items-center space-x-2 text-sky-400">
              <Mail size={16} />
              <span className="font-bold tracking-wider">
                PETROLOG WEBMAIL // SKRZYNKA ODBIORCZA (ANITA KLIMEK)
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
              ● NOWA WIADOMOŚĆ PRZYCHODZĄCA
            </span>
          </div>

          {/* Email Client Preview */}
          <div className="p-4 rounded-lg bg-black/60 border border-gray-800 space-y-3 font-sans">
            <div className="border-b border-gray-800 pb-2 text-xs text-gray-300 space-y-1">
              <div>
                <strong>OD:</strong> {senderName}{' '}
                <span className="text-sky-400 font-mono text-[11px]">&lt;{senderEmail}&gt;</span>
              </div>
              <div>
                <strong>DO:</strong> Anita Klimek{' '}
                <span className="text-gray-400 font-mono text-[11px]">&lt;a.klimek@petrolog.com&gt;</span>
              </div>
              <div>
                <strong>TEMAT:</strong> Zobacz to!
              </div>
            </div>

            {/* Email Body with click link */}
            <div className="text-sm text-gray-100 leading-relaxed pt-2 space-y-2">
              <p>Koniecznie musisz zobaczyć tę stronę:</p>
              <div
                onClick={handleOpenLink}
                className="inline-block p-2 rounded bg-sky-950/40 border border-sky-500/50 text-sky-300 font-mono text-xs font-bold hover:bg-sky-900/50 cursor-pointer transition-all shadow-[0_0_10px_rgba(56,189,248,0.3)] animate-pulse"
              >
                🔗 https://{targetDomain} (KLIKNIJ ABY OTWORZYĆ)
              </div>
              <p>Mają super poradnik dla biegaczy długodystansowych!</p>
              <p>Coś, czego szukałaś!</p>
              <p className="text-gray-400 pt-2 font-mono text-xs">{senderName}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Anita właśnie otrzymała maila i widzi rekomendację od zaufanego współpracownika.
            </span>
            <button
              onClick={handleOpenLink}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-sky-500 text-[#05090f] hover:bg-sky-400 transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
            >
              <span>OFIARA KLIKA LINK W MAILU</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VICTIM BROWSER PAGE */}
      {step === 'browser_page' && (
        <div className="flex-1 flex flex-col justify-between p-5 rounded-xl border border-gray-800 bg-[#08101a] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-xs">
            <div className="flex items-center space-x-2 text-sky-400">
              <Globe size={16} />
              <span className="font-bold tracking-wider font-mono">
                PRZEGLĄDARKA OFIARY // HTTPS://{targetDomain.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">STATUS: 200 OK</span>
          </div>

          {/* Browser Content */}
          <div className="p-6 rounded-lg bg-black/70 border border-gray-800 text-center space-y-4 my-auto">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              PORTAL BIEGOWY // DALEKOBIEŻNI
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white max-w-lg mx-auto">
              {payloadTitle}
            </h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
              Zdobądź przewagę na trasie maratonu. 10 sprawdzonych technik regeneracji, planów interwałowych i doboru sprzętu biegowego.
            </p>

            <div className="pt-3">
              <button
                onClick={handleVictimDownload}
                className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 mx-auto cursor-pointer shadow-[0_0_25px_rgba(0,255,102,0.5)] active:scale-95 animate-bounce"
              >
                <Download size={18} />
                <span>POBIERZ DARMOWY PORADNIK (PDF)</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Anita zdecydowała się pobrać poradnik biegowy na dysk służbowego komputera.
            </span>
            <button
              onClick={handleVictimDownload}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] transition-all flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span>OFIARA KLIKA POBIERZ</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INFECTION ANIMATION */}
      {step === 'infection' && (
        <div className="flex-1 flex flex-col justify-center items-center p-8 rounded-xl border border-emerald-500/40 bg-[#08101a] space-y-6 shadow-[0_0_35px_rgba(0,255,102,0.2)]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
            <Cpu size={32} />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-sm font-black tracking-widest text-[#00ff66] uppercase">
              OFIARA POBRAŁA PLIK!
            </h3>
            <p className="text-xs text-gray-300 font-mono">
              WYKONYWANIE KODU EXPLOITU W TLE SYSTEMU OPERACYJNEGO...
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md space-y-1">
            <div className="h-3 w-full bg-gray-900 rounded-full border border-gray-700 overflow-hidden p-0.5">
              <div
                className="h-full bg-[#00ff66] rounded-full transition-all duration-300 shadow-[0_0_15px_#00ff66]"
                style={{ width: `${infectionProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>WSTRZYKIWANIE PROCESU DO PAMIĘCI RAM</span>
              <span className="font-bold text-[#00ff66]">{infectionProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: NETWORK TAKEOVER & EXFILTRATION */}
      {step === 'network_takeover' && (
        <div className="flex-1 flex flex-col justify-between p-5 rounded-xl border-2 border-[#00ff66] bg-[#08101a] space-y-4 shadow-[0_0_30px_rgba(0,255,102,0.3)] animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-3">
            <div className="flex items-center space-x-2 text-[#00ff66]">
              <Sparkles size={18} />
              <h3 className="text-sm font-black tracking-wider uppercase">
                UDAŁO SIĘ! UZYSKANO DOSTĘP DO SIECI FIRMY PETROLOG
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500 font-black">
              DOSTĘP DOMENOWY: ADMIN
            </span>
          </div>

          {/* Network Topology Visualization */}
          <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/30 space-y-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">
              PRZEJĘTE WĘZŁY SIECI WEWNĘTRZNEJ PETROLOG:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(config?.networkNodes || [
                {
                  id: 'n1',
                  label: 'STACJA_ANITY_KSIĘGOWOŚĆ',
                  ip: '192.168.10.45',
                  role: 'PUNKT WEJŚCIA (EXPLOIT OK)'
                },
                {
                  id: 'n2',
                  label: 'SERWER_PLIKÓW_PETROLOG',
                  ip: '192.168.10.2',
                  role: 'UDOSTĘPNIANIE ZASOBÓW SMB'
                },
                {
                  id: 'n3',
                  label: 'DOKUMENTACJA_FREEVOLT',
                  ip: '192.168.10.88',
                  role: 'ŁAŃCUCH DOSTAW (EXFILTRACJA)'
                }
              ]).map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-lg border border-[#00ff66]/50 bg-[#00ff66]/10 flex flex-col justify-between shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                >
                  <div className="flex items-center space-x-2">
                    <Server size={16} className="text-[#00ff66]" />
                    <span className="text-xs font-bold text-white truncate">{node.label}</span>
                  </div>
                  <div className="text-[10px] text-gray-300 pt-2 space-y-0.5">
                    <div>IP: <span className="font-mono text-emerald-400">{node.ip}</span></div>
                    <div>ROLA: <span className="text-white">{node.role}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-[#00ff66] shrink-0" />
              <span>
                <strong>SUKCES OPERACYJNY:</strong> Zabezpieczono dane logistyczne i wykaz podmiotów współpracujących z technologią Freevolt!
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Zadanie zakończone powodzeniem. Przejdź do podsumowania debriefingu SCORM.
            </span>
            <button
              onClick={handleFinishMission}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.5)] active:scale-95"
            >
              <span>PODSUMOWANIE ZADANIA</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
