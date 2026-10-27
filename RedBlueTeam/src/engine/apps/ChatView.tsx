import React, { useRef, useEffect, useState } from 'react';
import { Bot, Globe, Download, Send } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import type { ChatMessage } from '../store/useMissionStore';

export interface ChatViewChoice {
  id: string;
  label: string;
}

interface ChatViewProps {
  messages: ChatMessage[];
  choices: ChatViewChoice[];
  /** „BYTE_MASTER pisze…” — wiadomość jeszcze nie dotarła. */
  isTyping: boolean;
  onChoose: (id: string) => void;
  /** Podświetlenie ramki (zwrócenie uwagi gracza). */
  attention?: boolean;
  title?: string;
  /** Zastępuje listę odpowiedzi (np. przycisk końca intra), pokazywany gdy rozmówca skończył pisać. */
  footer?: React.ReactNode;
}

const CHARS_PER_TICK = 1;
const TICK_MS = 16;

/** Wyświetla tekst litera po literze (dymek ma od razu docelowy rozmiar); kliknięcie pokazuje całość. */
const TypedText: React.FC<{ text: string; onDone: () => void }> = ({ text, onDone }) => {
  const [count, setCount] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (count >= text.length) {
      doneRef.current();
      return;
    }
    const timer = setTimeout(() => setCount((c) => Math.min(text.length, c + CHARS_PER_TICK)), TICK_MS);
    return () => clearTimeout(timer);
  }, [count, text]);

  return (
    // Pełny tekst (niewidoczny) rezerwuje rozmiar dymka od razu; animowany jest tylko wpisywany tekst.
    <span className="relative block" onClick={() => setCount(text.length)}>
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {text.slice(0, count)}
        {count < text.length && <span className="inline-block w-1.5 h-3 ml-0.5 bg-[#00f0ff] align-middle animate-pulse" />}
      </span>
    </span>
  );
};

/** Wspólny widok rozmowy z Byte_Masterem — intro i aplikacja Czat na pulpicie. */
export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  choices,
  isTyping,
  onChoose,
  attention = false,
  title = 'BYTE_MASTER',
  footer
}) => {
  const openApp = useMissionStore((s) => s.openApp);
  const endRef = useRef<HTMLDivElement>(null);

  // Wiadomości obecne przy montowaniu (powrót do aplikacji) nie są animowane.
  const initialIds = useRef(new Set(messages.map((m) => m.id)));
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const newBm = messages.filter(
    (m) => m.sender === 'BYTE_MASTER' && !initialIds.current.has(m.id) && !doneIds.has(m.id)
  );
  const animatingId = newBm.length > 0 ? newBm[newBm.length - 1].id : null;
  const isAnimating = animatingId !== null;
  const ready = !isTyping && !isAnimating;

  const markDone = (id: string) => setDoneIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, choices, isTyping, doneIds]);

  // Przewijaj także w trakcie pisania.
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setInterval(() => endRef.current?.scrollIntoView(), 120);
    return () => clearInterval(timer);
  }, [isAnimating]);

  return (
    <div className={`flex flex-col h-full bg-[#060c14]/95 border-2 transition-all rounded-xl overflow-hidden font-mono text-xs select-none ${
      attention
        ? 'border-[#00ff66] shadow-[0_0_35px_rgba(0,255,102,0.5)]'
        : 'border-[#00f0ff]/50 shadow-[0_0_25px_rgba(0,240,255,0.2)]'
    }`}>
      {/* Top Header */}
      <div className={`flex items-center justify-between px-3.5 py-2.5 border-b transition-colors ${
        attention || (ready && choices.length > 0)
          ? 'border-[#00ff66]/60 bg-[#071922]'
          : 'border-[#00f0ff]/40 bg-[#0a1622]'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#00f0ff]/20 border border-[#00f0ff] flex items-center justify-center">
            <Bot size={14} className="text-[#00f0ff]" />
          </div>
          <span className="font-bold text-xs tracking-wider text-[#00f0ff]">{title}</span>
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse ml-1" />
        </div>

        {ready && choices.length > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] animate-pulse tracking-wide">
            [TWOJA TURA]
          </span>
        ) : (
          <span className="text-[10px] text-[#00f0ff]/60 tracking-widest">TOR SECURE LINK</span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => {
          const typingNow = msg.id === animatingId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'PLAYER'
                  ? 'items-end'
                  : msg.sender === 'SYSTEM'
                  ? 'items-center'
                  : 'items-start'
              }`}
            >
              {msg.sender === 'SYSTEM' ? (
                <div className="px-3 py-1 rounded bg-[#091119] border border-[#00ff66]/30 text-[10px] text-[#00ff66] italic my-1">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[92%] p-3 text-xs leading-relaxed transition-all relative ${
                    msg.sender === 'PLAYER'
                      ? 'bg-[#00f0ff]/15 border border-[#00f0ff] text-[#d1fae5] rounded-l-lg rounded-tr-lg shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'bg-[#0b1724] border border-[#00f0ff]/40 text-[#d1fae5] rounded-r-lg rounded-tl-lg shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                  }`}
                  style={{
                    clipPath:
                      msg.sender === 'PLAYER'
                        ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
                        : 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)'
                  }}
                >
                  <div className="text-[10px] font-bold mb-1 flex items-center justify-between">
                    <span className={msg.sender === 'PLAYER' ? 'text-[#00f0ff]' : 'text-[#38bdf8]'}>
                      {msg.sender === 'PLAYER' ? 'TY (HAKER)' : 'BYTE_MASTER'}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap">
                    {typingNow ? <TypedText text={msg.text} onDone={() => markDone(msg.id)} /> : msg.text}
                  </div>

                  {/* Embedded Action Button (e.g. Link to Browser, Download attachments) */}
                  {!typingNow && msg.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-[#00f0ff]/20">
                      {msg.actionButton.type === 'link_browser' && (
                        <button
                          onClick={() => openApp('browser')}
                          className="w-full py-2 px-3 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff] text-[#00f0ff] rounded font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                        >
                          <Globe size={13} />
                          <span>{msg.actionButton.label}</span>
                        </button>
                      )}

                      {msg.actionButton.type === 'download_attachments' && (
                        <button
                          onClick={() => {
                            useMissionStore.setState({ hasUsbInserted: true });
                            openApp('pendrive_app');
                          }}
                          className="w-full py-2 px-3 bg-[#00ff66]/20 hover:bg-[#00ff66]/30 border border-[#00ff66] text-[#00ff66] rounded font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                        >
                          <Download size={13} />
                          <span>{msg.actionButton.label}</span>
                        </button>
                      )}

                      {msg.actionButton.type === 'open_app' && msg.actionButton.payload && (
                        <button
                          onClick={() => openApp(msg.actionButton!.payload as any)}
                          className="w-full py-2 px-3 bg-[#00ff66]/20 hover:bg-[#00ff66]/30 border border-[#00ff66] text-[#00ff66] rounded font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                        >
                          <Send size={13} />
                          <span>{msg.actionButton.label}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Embedded Vehicle Image Reference from video */}
                  {!typingNow && msg.imageSrc === 'car_ref' && (
                    <div className="mt-2.5 p-2 bg-[#050b11] border border-[#00f0ff]/30 rounded">
                      <div className="w-full h-24 bg-[#0a121a] rounded flex flex-col items-center justify-center p-2 border border-slate-700">
                        <svg viewBox="0 0 160 80" className="w-full h-full max-h-20 drop-shadow-md">
                          <circle cx="45" cy="65" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                          <circle cx="115" cy="65" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                          <circle cx="45" cy="65" r="4" fill="#94a3b8" />
                          <circle cx="115" cy="65" r="4" fill="#94a3b8" />
                          <path d="M 20 58 Q 20 48 35 48 L 130 48 Q 145 48 145 58 L 145 65 L 125 65 Q 125 55 105 55 Q 85 55 85 65 L 55 65 Q 55 55 35 55 Q 20 55 20 65 Z" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                          <polygon points="50,48 68,30 108,30 118,48" fill="#1e293b" />
                          <rect x="66" y="27" width="44" height="4" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                        </svg>
                        <div className="text-[10px] text-center font-bold text-white mt-1">
                          BIAŁY HATCHBACK // DACH: CZERWONY
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Byte_Master Typing Indicator */}
        {isTyping && !isAnimating && (
          <div className="flex items-start space-x-2 mr-6 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-[#00f0ff]/20 border border-[#00f0ff] flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} className="text-[#00f0ff]" />
            </div>
            <div
              className="px-3 py-2 rounded-r-lg rounded-tl-lg bg-[#0b1724] border border-[#00f0ff]/50 text-[#00f0ff] flex items-center space-x-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}
            >
              <span className="font-bold tracking-wider text-[11px]">BYTE_MASTER pisze</span>
              <span className="flex space-x-1 items-center ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Footer (np. start systemu) albo opcje odpowiedzi */}
      {ready && footer && (
        <div className="p-3 border-t-2 border-[#00ff66]/50 bg-[#08121a] flex justify-end">{footer}</div>
      )}
      {ready && !footer && choices.length > 0 && (
        <div className={`p-3 border-t transition-all ${
          attention
            ? 'bg-[#081820] border-t-2 border-[#00ff66] shadow-[0_-5px_20px_rgba(0,255,102,0.3)]'
            : 'bg-[#08121a] border-t-2 border-[#00ff66]/50 shadow-[0_-3px_15px_rgba(0,255,102,0.15)]'
        } space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-[#00ff66] font-black uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping shrink-0" />
              <span>WYBIERZ ODPOWIEDŹ DLA BYTE_MASTERA:</span>
            </div>
            <span className="text-[9px] text-[#00ff66]/80 font-bold uppercase hidden sm:inline">[KLIKNIJ OPCJĘ]</span>
          </div>

          <div className="space-y-2">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice.id)}
                className="w-full text-left p-3 rounded-lg bg-[#0b1724] border-2 border-[#00ff66]/40 hover:border-[#00ff66] hover:bg-[#00ff66]/20 text-xs font-bold text-[#d1fae5] transition-all flex items-center justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] cursor-pointer"
              >
                <span className="leading-snug group-hover:text-[#00ff66] transition-colors">{choice.label}</span>
                <Send size={14} className="text-[#00ff66] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
