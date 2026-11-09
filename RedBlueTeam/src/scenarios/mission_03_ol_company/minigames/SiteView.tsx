// Okno przeglądarki ze stroną O&L Company (//TOR, ekran 1). Pasek adresu i zakładki stoją u góry okna,
// a strona pod nimi przewija się pionowo jak prawdziwa (świadomy wyjątek od zasady „bez przewijania”:
// przewija się wyłącznie wnętrze okna przeglądarki). Wszystkie teksty pochodzą z `OsintSite` (stages.ts).

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Lock, ChevronDown, Check, Phone, Mail, Fuel } from 'lucide-react';
import { useIsActiveApp } from '../../../engine/components/SideMonitor';
import { sounds } from '../../../engine/audio/soundEffects';
import { ImageSlot } from './ui';
import { isScrolledToEnd, SITE_TABS, type ReadState, type SiteTab } from './osintLogic';
import type { OsintSite } from './types';

// Kolory „prawdziwej” strony firmy: jasna, korporacyjna, w odróżnieniu od ciemnego interfejsu HACKERS.OS.
const SITE_NAVY = '#0f2744';
const SITE_ORANGE = '#e8710a';
/** Treść strony wyśrodkowana jak na prawdziwej witrynie (szerokie okno nie zostawia pustej prawej połowy). */
const PAGE_WIDTH = 'w-full max-w-4xl mx-auto px-8';

interface SiteViewProps {
  site: OsintSite;
  /** Kolor akcentu aplikacji (ramka okna, aktywna zakładka). */
  accent: string;
  tab: SiteTab;
  onTabChange: (tab: SiteTab) => void;
  /** Które zakładki są już przewinięte do końca (znacznik przy zakładce). */
  read: ReadState;
  /** Zakładka przewinięta do końca. */
  onTabRead: (tab: SiteTab) => void;
  /** Zapamiętana pozycja przewinięcia zakładki (pamięć stanu aplikacji po zamknięciu i otwarciu okna). */
  getScroll: (tab: SiteTab) => number;
  setScroll: (tab: SiteTab, scrollTop: number) => void;
  /** Zwarty pasek po prawej stronie rzędu zakładek (wskaźniki „PRZECZYTANO” i przycisk dalej), żeby nie zabierał wysokości stronie. */
  toolbar?: React.ReactNode;
}

export const SiteView: React.FC<SiteViewProps> = ({
  site,
  accent,
  tab,
  onTabChange,
  read,
  onTabRead,
  getScroll,
  setScroll,
  toolbar
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = useIsActiveApp();
  // Czy bieżąca zakładka jest przewinięta do końca (steruje strzałką „jest więcej”).
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientHeight <= 0) return;
    const end = isScrolledToEnd({ scrollTop: el.scrollTop, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight });
    setAtEnd(end);
    if (end) onTabRead(tab);
  }, [tab, onTabRead]);

  // Po zmianie zakładki i po powrocie do aplikacji: przywróć zapamiętaną pozycję (ukrycie okna zeruje przewinięcie).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    el.scrollTop = getScroll(tab);
    measure();
  }, [tab, active, getScroll, measure]);

  // Zmiana rozmiaru okna (np. 1366 → 1920): krótsza treść może już nie wymagać przewijania.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (active) measure();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, measure]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientHeight <= 0) return;
    setScroll(tab, el.scrollTop);
    measure();
  };

  const scrollDown = () => {
    const el = scrollRef.current;
    if (!el) return;
    sounds.playClick();
    el.scrollBy({ top: Math.max(120, el.clientHeight * 0.8), behavior: 'smooth' });
  };

  return (
    <div
      className="flex-1 min-h-0 flex flex-col rounded-xl border-2 overflow-hidden bg-[#0b1220]"
      style={{ borderColor: `${accent}88`, boxShadow: `0 0 18px ${accent}33` }}
    >
      {/* Chrome przeglądarki: pasek adresu i zakładki (przyklejone u góry, nie przewijają się ze stroną). */}
      <div className="shrink-0 bg-[#111a2b] border-b border-gray-700">
        <div className="flex items-center gap-3 px-3 pt-2.5">
          <div className="flex gap-1.5 shrink-0" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#05090f] border border-gray-700 text-sm font-mono text-gray-200">
            <Lock size={13} className="text-[#00ff66] shrink-0" />
            <span className="truncate">{site.url}</span>
          </div>
        </div>
        <div className="flex items-end gap-1 px-3 pt-2" role="tablist">
          {SITE_TABS.map((t) => {
            const isActive = t === tab;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (t === tab) return;
                  sounds.playClick();
                  onTabChange(t);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border border-b-0 text-xs font-black tracking-widest cursor-pointer transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 bg-transparent border-transparent'
                }`}
                style={isActive ? { backgroundColor: SITE_NAVY, borderColor: `${accent}99` } : undefined}
              >
                <span>{t === 'home' ? site.tabs.home : site.tabs.events}</span>
                {read[t] && <Check size={13} className="text-[#00ff66]" aria-label="przeczytano" />}
              </button>
            );
          })}
          {toolbar && <div className="ml-auto flex items-center gap-3 pb-1.5 min-w-0">{toolbar}</div>}
        </div>
      </div>

      {/* Strona: tylko ten obszar się przewija. */}
      <div className="relative flex-1 min-h-0">
        <div ref={scrollRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto bg-slate-100 text-slate-800 font-sans">
          {tab === 'home' ? <HomePage site={site} /> : <EventsPage site={site} />}
        </div>
        {!atEnd && (
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 flex items-end justify-center pb-2 bg-gradient-to-t from-black/40 to-transparent">
            {/* Strzałka „jest więcej”: klik przewija stronę o ekran w dół. */}
            <button
              type="button"
              aria-label={site.scrollDownLabel}
              onClick={scrollDown}
              className="pointer-events-auto cursor-pointer rounded-full p-1 hover:bg-white/20"
            >
              <ChevronDown size={28} className="text-white animate-bounce drop-shadow" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Nagłówek firmy powtarzany na każdej zakładce strony (logo i nazwa). */
const SiteMasthead: React.FC<{ site: OsintSite }> = ({ site }) => (
  <div style={{ backgroundColor: SITE_NAVY }}>
    <div className={`${PAGE_WIDTH} flex items-center gap-3 py-2`}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: SITE_ORANGE }}>
        <Fuel size={20} />
      </div>
      <span className="text-lg font-black tracking-widest text-white">{site.title}</span>
    </div>
  </div>
);

const SiteFooter: React.FC<{ site: OsintSite }> = ({ site }) => (
  <footer className="px-8 py-6 text-center text-sm text-slate-300" style={{ backgroundColor: SITE_NAVY }}>
    <div className="font-bold tracking-widest text-white">{site.title}</div>
    <div className="mt-1 font-mono">
      {site.contact.phone} · {site.contact.email}
    </div>
  </footer>
);

const HomePage: React.FC<{ site: OsintSite }> = ({ site }) => (
  <div>
    <SiteMasthead site={site} />
    <section className="py-5 text-white" style={{ background: `linear-gradient(135deg, ${SITE_NAVY} 0%, #1d4670 100%)` }}>
      <div className={PAGE_WIDTH}>
        <h1 className="text-xl lg:text-2xl font-black leading-tight max-w-3xl">{site.heroHeadline}</h1>
        <p className="mt-2 text-sm lg:text-base text-slate-200 max-w-3xl leading-snug">{site.heroSubheadline}</p>
      </div>
    </section>

    <section className="py-2.5 bg-white border-b border-slate-200 text-sm font-semibold text-slate-700">
      <div className={`${PAGE_WIDTH} flex flex-wrap gap-x-8 gap-y-2`}>
        <span className="flex items-center gap-2">
          <Phone size={15} style={{ color: SITE_ORANGE }} />
          {site.contact.phone}
        </span>
        <span className="flex items-center gap-2">
          <Mail size={15} style={{ color: SITE_ORANGE }} />
          {site.contact.email}
        </span>
      </div>
    </section>

    <section className={`${PAGE_WIDTH} py-5`}>
      <h2 className="text-xl font-black tracking-wide mb-4" style={{ color: SITE_NAVY }}>
        {site.employeesHeading}
      </h2>
      <div className="flex flex-col gap-5">
        {site.employees.map((e) => (
          <article key={e.id} className="flex gap-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-200">
              <ImageSlot asset={e.photo} label={`${e.name}, ${e.role}`} />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="text-lg font-black leading-tight" style={{ color: SITE_NAVY }}>
                {e.name}
              </h3>
              <div className="text-sm font-bold" style={{ color: SITE_ORANGE }}>
                {e.role}
              </div>
              <div className="text-xs font-bold tracking-wider text-slate-500">{e.tenure}</div>
              <p className="text-sm text-slate-700 leading-relaxed pt-1">{e.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
    <SiteFooter site={site} />
  </div>
);

const EventsPage: React.FC<{ site: OsintSite }> = ({ site }) => (
  <div>
    <SiteMasthead site={site} />
    <section className={`${PAGE_WIDTH} py-8 space-y-8`}>
      <h2 className="text-xl font-black tracking-wide" style={{ color: SITE_NAVY }}>
        {site.tabs.events}
      </h2>
      {site.events.map((ev) => (
        <article key={ev.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-lg font-black leading-snug" style={{ color: SITE_NAVY }}>
            {ev.headline}
          </h3>
          {ev.body && <p className="text-sm text-slate-700 leading-relaxed">{ev.body}</p>}
          {ev.hashtags && <p className="text-sm font-bold text-sky-700">{ev.hashtags}</p>}
          <div className="flex flex-col gap-4 pt-1">
            {ev.photos.map((p) => (
              <div key={p.name} className="w-full max-w-xl aspect-video rounded-lg overflow-hidden bg-slate-200">
                <ImageSlot asset={p} label={ev.headline} />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
    <SiteFooter site={site} />
  </div>
);
