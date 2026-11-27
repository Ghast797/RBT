// Etap 1 — //FILIP_WOJCIK_BIALY_WYWIAD.PDF: przeglądarka dokumentu OSINT (nieoceniana).
// Zgodne z scenario.md: 4 punkty wywiadowcze, slot na portret celu (ImageSlot), wyróżniony komunikat
// WAŻNE INFORMACJE, potwierdzenie przeczytania kończy etap. Pamięć stanu zapewnia AppHost.

import React from 'react';
import { AlertTriangle, FileText, Shield } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { IntelPdfConfig } from './types';
import { ImageSlot } from './ui';

const ACCENT = '#00ff66';

const FALLBACK_CONFIG: IntelPdfConfig = {
  title: '//FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  subtitle: 'DOKUMENT OSINT // MATERIAŁY WYWIADOWCZE',
  task: 'PRZECZYTAJ DOKUMENT Z BIAŁEGO WYWIADU I ZAPAMIĘTAJ DANE PRZED ROZMOWĄ.',
  fileName: 'FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  notice: 'WAŻNE INFORMACJE — BĘDZIESZ WYKORZYSTYWAŁ TE INFORMACJE PODCZAS ROZMOWY. DOBRZE JE ZAPAMIĘTAJ!',
  points: [
    'FILIP PRACUJE W BANKU BCORP JAKO DYREKTOR SPRZEDAŻY',
    'JEGO PRZEŁOŻONYM JEST DAWID MAJEWSKI. OBECNIE PRZEBYWA NA URLOPIE',
    'MICHAŁ MITNIK TO ŚWIEŻY PRACOWNIK DZIAŁU IT. JEGO SZEFOWĄ JEST SANDRA JASIŃSKA',
    'WYKUP PODOBNĄ DOMENĘ. ADRES POCZTY FIRMOWEJ TO: HTTPS://MAIL.BCORP.BIZ'
  ],
  portraitAsset: { group: 'intel', name: 'filip_wojcik' },
  portraitLabel: 'FILIP WÓJCIK — PORTRET CELU',
  confirmLabel: 'ZAMKNIJ DOKUMENT'
};

export const IntelPdfApp: React.FC<BlockProps<IntelPdfConfig>> = ({ config, onComplete }) => {
  const cfg: IntelPdfConfig = {
    ...FALLBACK_CONFIG,
    ...config,
    points: config?.points?.length ? config.points : FALLBACK_CONFIG.points,
    portraitAsset: config?.portraitAsset ?? FALLBACK_CONFIG.portraitAsset
  };

  const portraitAsset = cfg.portraitAsset ?? { group: 'intel', name: 'filip_wojcik' };
  const portraitLabel = cfg.portraitLabel ?? `${cfg.fileName} — PORTRET CELU`;

  const handleConfirm = () => {
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader
        icon={FileText}
        accent={ACCENT}
        title={cfg.title}
        subtitle={cfg.subtitle ?? FALLBACK_CONFIG.subtitle}
        step="DOKUMENT 1/1"
        task={cfg.task}
      />

      {/* Główny widok dokumentu PDF (karta informacyjna: bez przerywanych ramek przyciskowych i hovera) */}
      <div
        className="flex-1 min-h-0 flex flex-col rounded-xl border bg-[#08101a] overflow-hidden shadow-2xl"
        style={{ borderColor: `${ACCENT}44` }}
      >
        {/* Pasek pliku PDF */}
        <div className="px-4 py-2 bg-[#0b1522] border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} style={{ color: ACCENT }} className="shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wider text-white truncate">{cfg.fileName}</span>
          </div>
          <span
            className="text-xs px-2.5 py-0.5 rounded border font-bold tracking-wider shrink-0"
            style={{ backgroundColor: `${ACCENT}18`, borderColor: `${ACCENT}55`, color: ACCENT }}
          >
            OSINT // PDF
          </span>
        </div>

        {/* Treść dokumentu */}
        <div className="flex-1 min-h-0 p-4 flex flex-col justify-center gap-3">
          {/* Wyróżniony komunikat WAŻNE INFORMACJE */}
          <div className="px-4 py-2.5 rounded-lg border border-amber-400/60 bg-amber-500/10 flex items-center gap-3 shrink-0">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm font-black tracking-wide text-amber-200 leading-snug">{cfg.notice}</p>
          </div>

          {/* Portret celu + 4 punkty z białego wywiadu */}
          <div className="grid grid-cols-1 md:grid-cols-[176px_1fr] gap-4 items-center min-h-0">
            <div className="flex flex-col rounded-xl border border-gray-700/80 bg-[#0b1522] overflow-hidden shrink-0">
              <div className="w-full h-44 bg-black/50">
                <ImageSlot asset={portraitAsset} label={portraitLabel} fit="cover" />
              </div>
              <div className="px-3 py-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-white">FILIP WÓJCIK</span>
                <Shield size={14} style={{ color: ACCENT }} />
              </div>
            </div>

            <ol className="flex flex-col gap-2.5 min-w-0">
              {cfg.points.map((point, idx) => (
                <li
                  key={idx}
                  className="px-3.5 py-2.5 rounded-lg border border-gray-800 bg-[#0b1522] flex items-center gap-3"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ backgroundColor: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}55` }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white leading-snug font-sans">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="flex justify-end shrink-0">
        <ConfirmButton
          accent={ACCENT}
          label={cfg.confirmLabel}
          onClick={handleConfirm}
          className="w-auto px-6"
        />
      </div>
    </div>
  );
};
