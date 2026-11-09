// Wspólne elementy prawego monitora minigier M3: sekcja notatki i kwestie mentora.
// Prawy monitor przejmuje czat, więc kwestie BYTE_MASTERA potrzebne do decyzji
// gracz czyta w notatce (zob. docs/scenario-engine.md, sekcja 3).

import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

/** Czas ładowania między ekranami minigier M3 (ms): standard M2 to ok. 1,5–2 s. */
export const LOADER_MS = 1700;
/** Dłuższe ładowanie dla „ciężkich” akcji (kompilacja, zapis planu). */
export const LOADER_LONG_MS = 2000;

/** Sekcja panelu prawego monitora z nagłówkiem. */
export const NoteSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <div className="text-xs font-black tracking-widest text-gray-400 uppercase">{title}</div>
    {children}
  </div>
);

/** Sekcja „Od BYTE_MASTERA”: kwestie mentora jako cytaty (źródło: dane misji, nie JSX). */
export const MentorNote: React.FC<{ accent: string; lines: string[] }> = ({ accent, lines }) => (
  <NoteSection title="Od BYTE_MASTERA">
    <div className="space-y-2">
      {lines.map((line) => (
        <div
          key={line}
          className="flex gap-2 p-2.5 rounded-lg border bg-black/20 text-sm text-gray-200 leading-snug font-sans"
          style={{ borderColor: `${accent}55` }}
        >
          <MessageSquareQuote size={15} className="shrink-0 mt-0.5" style={{ color: accent }} />
          <span>{line}</span>
        </div>
      ))}
    </div>
  </NoteSection>
);
