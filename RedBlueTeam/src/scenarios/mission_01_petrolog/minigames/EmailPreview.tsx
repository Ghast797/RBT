import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

export interface EmailPreviewProps {
  senderName: string | null;
  senderEmail: string | null;
  targetDomain: string;
  payloadName?: string;
  step?: 'sender' | 'email' | 'summary';
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  senderName,
  senderEmail,
  targetDomain,
  payloadName,
  step = 'email'
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#060c14] overflow-hidden shadow-xl text-left select-none">
      {/* Email Client Header */}
      <div className="bg-[#0b121d] px-3.5 py-2 border-b border-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-pink-400">
          <Mail size={15} />
          <span className="font-bold tracking-wider">HACKERS.OS // SZABLON MAILA SPEAR-PHISHINGOWEGO</span>
        </div>
        <span className="text-[0.625rem] text-gray-500">KLIENT POCZTY (PODGLĄD NA ŻYWO)</span>
      </div>

      {/* Email Envelope Header */}
      <div className="p-3.5 bg-[#08101a] border-b border-gray-800/80 space-y-2 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-gray-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-bold w-12 shrink-0">OD:</span>
            <span className="text-white font-bold">
              {senderName || (
                <span className="text-gray-500 italic">[Wybierz nadawcę po prawej…]</span>
              )}
            </span>
            {step === 'sender' ? null : (
              <span className="text-pink-400 font-mono text-[0.6875rem]">
                &lt;
                {senderEmail ? (
                  <span className="font-bold underline text-pink-300">{senderEmail.toLowerCase()}</span>
                ) : (
                  <span className="text-purple-400/60 italic">[wybierz adres e-mail po prawej…]</span>
                )}
                &gt;
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-bold w-12 shrink-0">DO:</span>
            <span className="text-gray-200">
              Anita Klimek &lt;<span className="text-sky-300">a.klimek@petrolog.com</span>&gt;
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-0.5">
          <span className="text-gray-400 font-bold w-12 shrink-0">TEMAT:</span>
          <span className="text-white font-bold">Zobacz to!</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-4 bg-[#05090f] text-gray-200 space-y-3 font-sans text-xs leading-relaxed">
        <p>Cześć Anita,</p>
        <p>
          Koniecznie musisz zobaczyć tę stronę:
        </p>

        {/* Highlighted phishing link */}
        <div className="p-3 rounded-lg bg-black/60 border border-sky-500/40 flex items-center justify-between font-mono my-2">
          <div className="flex items-center space-x-2 text-sky-400">
            <ExternalLink size={16} />
            <span className="font-bold underline text-sm tracking-wide">
              https://{targetDomain.toLowerCase()}
            </span>
          </div>
          <span className="text-[0.625rem] text-sky-400 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded uppercase font-bold font-mono">
            LINK DOCELOWY
          </span>
        </div>

        <p>
          {(() => {
            if (!payloadName) {
              return 'Mają tam świetny poradnik dla biegaczy długodystansowych! Coś, czego szukałaś!';
            }
            const lower = payloadName.toLowerCase();
            const prefix = lower.startsWith('tapety') ? 'Mają tam świetne' : 'Mają tam świetny';
            return `${prefix} ${lower}! Coś, czego szukałaś!`;
          })()}
        </p>

        <p className="pt-2 text-gray-400 font-mono">
          Pozdrawiam,
          <br />
          <strong className="text-white">{senderName || '[Nadawca]'}</strong>
        </p>
      </div>
    </div>
  );
};
