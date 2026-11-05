// Etap 2 — //TOR: PRZEGLĄDARKA. Rekonesans OSINT na stronie O&L Company, potem
// D2 (wybór celu, małe rozgałęzienie) i D3 (wektor socjotechniczny).
// Wzorzec M2: AppHeader, karty na dużym ekranie, notatki na prawym monitorze
// (SideMonitor przejmuje czat, więc kwestie mentora potrzebne do D2/D3 są w notatce).
// Interfejs milczy o ocenie — poziomy idą tylko przez onDecision; treść (bio, wydarzenia,
// mentor) naprowadza. Spec: docs/migration-spec.md, sekcja 2.

import React, { useRef, useState } from 'react';
import { Globe, Lock, Building2, Camera, Sparkles, User, ChevronRight, Phone, Mail, MessageSquareQuote } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { SidePanel } from '../../../engine/components/SidePanel';
import type { BlockProps } from '../../../engine/types/mission';
import type { OsintBrowserConfig, OsintEmployee } from './types';
import { resolveTargetPick } from './osintLogic';

type Screen = 'site' | 'loading_target' | 'target' | 'loading_vector' | 'vector' | 'finishing';
type SiteTab = 'home' | 'events';

const ACCENT = '#3b82f6'; // kolor kafelka //TOR: PRZEGLĄDARKA

/** Awatar pracownika (kolor z danych strony). */
const Avatar: React.FC<{ color: string; size?: number }> = ({ color, size = 40 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white shrink-0"
    style={{ backgroundColor: color, width: size, height: size }}
  >
    <User size={Math.round(size / 2)} />
  </div>
);

/** Sekcja panelu prawego monitora. */
const NoteSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <div className="text-[0.6875rem] font-black tracking-widest text-gray-400 uppercase">{title}</div>
    {children}
  </div>
);

export const OsintBrowserApp: React.FC<BlockProps<OsintBrowserConfig>> = ({ config, onDecision, onComplete }) => {
  const { site } = config;

  const [screen, setScreen] = useState<Screen>('site');
  const [tab, setTab] = useState<SiteTab>('home');
  const [eventsViewed, setEventsViewed] = useState(false);
  const [readEmployeeId, setReadEmployeeId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [vectorId, setVectorId] = useState<string | null>(null);
  // Czy gracz wybrał wcześniej zły (suboptimal) cel — końcowe D2 agreguje się do suboptimal.
  const [attempted, setAttempted] = useState(false);
  const [pushbacks, setPushbacks] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const completedRef = useRef(false);

  // Kolejność kart losuje się raz przy zamontowaniu (od nowa przy powtórce misji).
  const targetOptions = useShuffled(config.target.options);
  const vectorOptions = useShuffled(config.vector.options);

  const target = config.target.options.find((o) => o.id === targetId);
  const vector = config.vector.options.find((o) => o.id === vectorId);
  const readEmployee = site.employees.find((e) => e.id === readEmployeeId);
  const employeeForOption = (optionId: string): OsintEmployee | undefined =>
    site.employees.find((e) => e.optionId === optionId);

  const phase: 'site' | 'target' | 'vector' =
    screen === 'site' ? 'site' : screen === 'target' || screen === 'loading_target' ? 'target' : 'vector';

  // --- D2: cel ---
  const handleTargetConfirm = () => {
    if (!target || locked) return;
    const result = resolveTargetPick(target, attempted);
    if (result.kind === 'critical') {
      sounds.playSuccess();
      setLocked(true);
      onDecision({
        num: config.target.decisionNum,
        question: config.target.question,
        answer: target.label,
        tier: 'critical',
        feedback: target.feedback
      });
      return;
    }
    if (result.kind === 'retry') {
      // Mentor cofa do ponownego wyboru (mechanika silnika, bez gałęzi w store).
      sounds.playNotification();
      setAttempted(true);
      setPushbacks((p) => (p.includes(result.pushback) ? p : [...p, result.pushback]));
      setTargetId(null);
      return;
    }
    sounds.playSuccess();
    onDecision({
      num: config.target.decisionNum,
      question: config.target.question,
      answer: target.label,
      tier: result.tier,
      feedback: target.feedback
    });
    setScreen('loading_vector');
  };

  // --- D3: wektor ---
  const handleVectorConfirm = () => {
    if (!vector || locked) return;
    sounds.playSuccess();
    onDecision({
      num: config.vector.decisionNum,
      question: config.vector.question,
      answer: vector.label,
      tier: vector.tier,
      feedback: vector.feedback
    });
    if (vector.tier === 'critical') {
      setLocked(true);
      return;
    }
    setScreen('finishing');
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={Globe} accent={ACCENT} title="//TOR: PRZEGLĄDARKA" subtitle={subtitle} task={task} step={step} />
  );

  // Kwestie mentora w notatce: z intro/mostka plus odesłania do ponownego wyboru celu.
  const mentorLines =
    phase === 'vector' ? config.mentorNote.vector : [...config.mentorNote.target, ...pushbacks];

  // --- Prawy monitor: notatki OSINT + kwestie mentora (czat jest wtedy schowany) ---
  const notesPanel = (
    <SidePanel
      accent={ACCENT}
      heading="//TOR: NOTATKI OSINT"
      sub="Notatki z rekonesansu O&L Company."
    >
      <div className="space-y-4">
        <NoteSection title="Od BYTE_MASTERA">
          <div className="space-y-2">
            {mentorLines.map((line) => (
              <div
                key={line}
                className="flex gap-2 p-2.5 rounded-lg border bg-black/20 text-xs text-gray-200 leading-snug font-sans"
                style={{ borderColor: `${ACCENT}55` }}
              >
                <MessageSquareQuote size={15} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </NoteSection>

        {phase === 'site' && (
          <NoteSection title="Profil pracownika">
            {readEmployee ? (
              <div className="p-3 rounded-lg border border-gray-800 bg-black/20 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Avatar color={readEmployee.avatarBg} size={34} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">{readEmployee.name}</div>
                    <div className="text-xs text-gray-400">{readEmployee.role}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">{readEmployee.bio}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Kliknij PRZECZYTAJ przy pracowniku, aby zobaczyć jego profil.</p>
            )}
          </NoteSection>
        )}

        {phase === 'vector' && (
          <NoteSection title="Wydarzenia na stronie O&L">
            <div className="space-y-2">
              {site.news.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg border border-gray-800 bg-black/20 space-y-1">
                  <div className="text-xs font-bold text-white">
                    {item.title} <span className="text-gray-400 font-medium">— {item.date}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-snug font-sans">
                    {item.boxText} {item.content}
                  </p>
                </div>
              ))}
            </div>
          </NoteSection>
        )}
      </div>
    </SidePanel>
  );

  const tabButton = (id: SiteTab, label: string, icon: React.ReactNode, badge?: string) => (
    <button
      type="button"
      onClick={() => {
        sounds.playClick();
        setTab(id);
        if (id === 'events') setEventsViewed(true);
      }}
      className={`px-4 py-1.5 rounded-lg border-2 font-black transition-all flex items-center gap-2 text-xs ${
        tab === id
          ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
          : 'bg-blue-950/70 border-blue-800/60 text-blue-200 hover:bg-blue-900/80 hover:border-blue-500'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded text-[0.6875rem] font-black border bg-[#00ff66]/15 border-[#00ff66]/60 text-[#00ff66]">
          {badge}
        </span>
      )}
    </button>
  );

  const siteView = (
    <div className="flex flex-col flex-1 min-h-0 space-y-3 animate-in fade-in duration-200">
      {header(
        site.url.toUpperCase(),
        'Przeczytaj profile pracowników, otwórz zakładkę WYDARZENIA i przejdź do wyboru celu.',
        'KROK 1/3'
      )}

      <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden border border-[#00ff66]/30 bg-[#04080e]">
        {/* Pasek adresu */}
        <div className="shrink-0 flex items-center gap-3 px-3 py-1.5 bg-[#09121c] border-b border-[#00ff66]/30 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] font-bold">
            <Lock size={12} />
            <span>{site.url.toUpperCase()}</span>
          </div>
          <span className="text-[0.6875rem] text-[#00ff66]/60">TOR ONION ROUTER // SSL VERIFIED</span>
        </div>

        {/* Nawigacja strony */}
        <div className="shrink-0 px-4 py-2 bg-[#0e1d2e] border-b border-blue-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wider">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <span className="text-blue-300 font-black">{site.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {tabButton('home', 'STRONA GŁÓWNA', <Building2 size={14} />)}
            {tabButton('events', 'WYDARZENIA', <Camera size={14} className="text-[#00ff66]" />, '[FOTORELACJE]')}
          </div>
        </div>

        {/* Treść strony */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 text-xs text-[#d1fae5]">
          {tab === 'home' ? (
            <>
              <div className="relative w-full h-16 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-lg overflow-hidden border border-blue-800/40">
                <svg viewBox="0 0 500 140" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice">
                  <rect x="60" y="30" width="35" height="110" fill="#1e293b" />
                  <rect x="110" y="50" width="25" height="90" fill="#334155" />
                  <line x1="77" y1="30" x2="77" y2="10" stroke="#94a3b8" strokeWidth="3" />
                  <rect x="200" y="60" width="60" height="80" rx="6" fill="#1e293b" />
                  <rect x="280" y="40" width="30" height="100" fill="#334155" />
                  <line x1="295" y1="40" x2="295" y2="15" stroke="#ef4444" strokeWidth="2" />
                  <line x1="60" y1="80" x2="200" y2="80" stroke="#475569" strokeWidth="4" />
                  <line x1="260" y1="90" x2="400" y2="90" stroke="#475569" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 space-y-0.5">
                  <h3 className="font-black text-sm text-blue-100 tracking-wider leading-tight">{site.heroHeadline}</h3>
                  <p className="text-xs text-gray-300 leading-tight">{site.heroSubheadline}</p>
                </div>
              </div>

              <div className="font-black text-sm text-[#00ff66] tracking-wider border-b border-[#00ff66]/30 pb-1">
                NASI EKSPERCI:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {site.employees.map((emp) => {
                  const isRead = readEmployeeId === emp.id;
                  return (
                    <div
                      key={emp.id}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-3 ${
                        isRead ? 'bg-[#0a1624] border-[#00f0ff]/50' : 'bg-[#08101a] border-slate-800'
                      }`}
                    >
                      <Avatar color={emp.avatarBg} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-white tracking-wide">{emp.name}</div>
                        <div className="text-xs text-gray-400 leading-tight">{emp.role}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setReadEmployeeId(emp.id);
                        }}
                        className={`shrink-0 px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          isRead
                            ? 'bg-[#00f0ff] text-[#05080c]'
                            : 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/30'
                        }`}
                      >
                        <span>PRZECZYTAJ</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  );
                })}
                <div className="px-3 py-2 rounded-lg border border-slate-800 bg-[#08101a] text-xs text-gray-400 flex flex-col justify-center gap-1">
                  <div className="leading-tight">W CELU OTRZYMANIA OFERTY PROSIMY O KONTAKT:</div>
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <Phone size={12} />
                    <span>{site.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <Mail size={12} />
                    <span>{site.contact.email}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {site.news.map((item) => (
                <div key={item.id} className="p-3 bg-[#08121c] border border-blue-900/60 rounded-lg space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-900/40 pb-1.5 gap-2">
                    <span className="font-black text-sm text-blue-300 flex items-center gap-1.5">
                      <Sparkles size={15} />
                      <span>{item.title}</span>
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{item.date}</span>
                  </div>
                  <div className="p-2 bg-[#00ff66]/10 border border-[#00ff66]/70 rounded-md text-center text-xs font-bold text-[#00ff66] tracking-wide">
                    {item.boxText}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed text-center">{item.content}</p>
                  <div className="text-center font-bold text-xs text-blue-400">{item.hashtags}</div>
                  <div className="text-center text-xs text-gray-400">{item.galleryText}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[0.6875rem] text-gray-400"
                      >
                        FOTO #{n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-4">
        {!eventsViewed && (
          <span className="text-xs text-gray-400">Otwórz zakładkę WYDARZENIA, aby przejść dalej.</span>
        )}
        <ConfirmButton
          accent={ACCENT}
          label="PRZEJDŹ DO WYBORU CELU"
          enabled={eventsViewed}
          onClick={() => {
            sounds.playClick();
            setScreen('loading_target');
          }}
          className="w-auto px-6"
        />
      </div>
    </div>
  );

  const targetView = (
    <div className="flex flex-col flex-1 min-h-0 space-y-3 animate-in fade-in duration-200">
      {header(
        'WYBÓR OFIARY',
        'Wskaż pracownika O&L Company, którego zaatakujesz. Słowa mentora masz w notatkach na prawym monitorze.',
        'KROK 2/3'
      )}
      {pushbacks.length > 0 && (
        <div
          className="shrink-0 flex gap-2 px-3 py-2 rounded-lg border bg-black/30 text-sm text-gray-100 leading-snug font-sans"
          style={{ borderColor: `${ACCENT}88` }}
        >
          <MessageSquareQuote size={18} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <span>
            <span className="font-mono font-black text-xs tracking-wider mr-2" style={{ color: ACCENT }}>
              BYTE_MASTER:
            </span>
            {pushbacks[pushbacks.length - 1]}
          </span>
        </div>
      )}
      <ChoiceZone accent={ACCENT} label="WYBIERZ OFIARĘ" className="flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-3 h-full">
          {targetOptions.map((opt) => {
            const emp = employeeForOption(opt.id);
            return (
              <ChoiceTile
                key={opt.id}
                accent={ACCENT}
                state={targetId === opt.id ? 'selected' : 'idle'}
                markerPosition="corner"
                disabled={locked}
                onClick={() => {
                  sounds.playClick();
                  setTargetId(opt.id);
                }}
                className="p-4 items-center!"
              >
                <div className="flex items-center gap-4 pr-6">
                  {emp && <Avatar color={emp.avatarBg} size={56} />}
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base font-black text-white tracking-wide leading-snug">{opt.label}</h3>
                    {(emp?.bio ?? opt.desc) && (
                      <p className="text-sm text-gray-200 leading-snug font-sans">{emp?.bio ?? opt.desc}</p>
                    )}
                  </div>
                </div>
              </ChoiceTile>
            );
          })}
        </div>
      </ChoiceZone>
      <div className="shrink-0 flex justify-end">
        <ConfirmButton
          accent={ACCENT}
          label="ZATWIERDŹ CEL"
          enabled={!!target && !locked}
          onClick={handleTargetConfirm}
          className="w-auto px-6"
        />
      </div>
    </div>
  );

  const vectorView = (
    <div className="flex flex-col flex-1 min-h-0 space-y-3 animate-in fade-in duration-200">
      {header(
        'WEKTOR SOCJOTECHNICZNY',
        'Wybierz, w jaki sposób dostarczysz ładunek wybranej ofierze. Wydarzenia ze strony O&L i słowa mentora masz w notatkach na prawym monitorze.',
        'KROK 3/3'
      )}
      <ChoiceZone accent={ACCENT} label="WYBIERZ WEKTOR" className="flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-3 h-full">
          {vectorOptions.map((opt) => (
            <ChoiceTile
              key={opt.id}
              accent={ACCENT}
              state={vectorId === opt.id ? 'selected' : 'idle'}
              markerPosition="corner"
              disabled={locked}
              onClick={() => {
                sounds.playClick();
                setVectorId(opt.id);
              }}
              className="p-5 items-center!"
            >
              <div className="flex flex-col items-center justify-center text-center space-y-3 px-6">
                <h3 className="text-lg font-black text-white tracking-wider leading-snug">{opt.label}</h3>
                {opt.desc && <p className="text-base text-gray-200 leading-snug">{opt.desc}</p>}
              </div>
            </ChoiceTile>
          ))}
        </div>
      </ChoiceZone>
      <div className="shrink-0 flex justify-end">
        <ConfirmButton
          accent={ACCENT}
          label="ZATWIERDŹ WEKTOR"
          enabled={!!vector && !locked}
          onClick={handleVectorConfirm}
          className="w-auto px-6"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-3">
      <SideMonitor>{notesPanel}</SideMonitor>

      {screen === 'site' && siteView}

      {screen === 'loading_target' && (
        <ModuleLoader label="ŁADOWANIE LISTY PRACOWNIKÓW…" durationMs={1000} accent={ACCENT} onDone={() => setScreen('target')} />
      )}

      {screen === 'target' && targetView}

      {screen === 'loading_vector' && (
        <ModuleLoader label="ŁADOWANIE MODUŁU SOCJOTECHNIKI…" durationMs={1000} accent={ACCENT} onDone={() => setScreen('vector')} />
      )}

      {screen === 'vector' && vectorView}

      {screen === 'finishing' && (
        <ModuleLoader label="ZAPISYWANIE PLANU ATAKU…" durationMs={1300} accent={ACCENT} onDone={finish} />
      )}
    </div>
  );
};
