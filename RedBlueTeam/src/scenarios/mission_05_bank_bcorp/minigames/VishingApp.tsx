// Etap 6 — //ROZMOWA: dwufazowy vishing (D3–D10) + przechwytywanie AiTM na żywo.
// Źródło prawdy: scenario.md (linie 110–241) i status.md.
// Faza 1: ekran gotowości + rozmowa telefoniczna z Filipem Wójcikiem na głównym ekranie,
//         notatki z białego wywiadu stale na prawym monitorze (SideMonitor), brak licznika zaufania.
// Faza 2: dwie strony logowania obok siebie na głównym ekranie (fałszywa po lewej zależna od D1,
//         oryginalna po prawej), ta sama rozmowa kontynuowana na prawym monitorze, przenoszenie
//         loginu, hasła i kodu SMS 2FA (drag-drop lub klik-klik) oraz pobranie 2 raportów finansowych.

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Download,
  FileText,
  GripVertical,
  Lock,
  Mail,
  Phone,
  PhoneCall,
  PhoneOff,
  Send
} from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceRows, ChoiceZone } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { SidePanel } from '../../../engine/components/SidePanel';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { submitDecision } from '../../../engine/core/report';
import { createTimerBag } from '../../../engine/core/runGuard';
import { useShuffled } from '../../../engine/core/shuffle';
import { useDecisionChoice, useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import type { VishingCallConfig, VishingTurnOption } from './types';
import { ImageSlot } from './ui';

const DEFAULT_ACCENT = '#00ff66';
const REPLY_DELAY_MS = 1300;
const AUTO_PLAYER_DELAY_MS = 500;
const PHASE2_TRANSITION_MS = 1200;
// Loadery Fazy 2 (pasek + licznik, standard 1,5–2,5 s): weryfikacja logowania i otwarcie skrzynki.
const LOGIN_LOADER_MS = LOADER_MS;
const ENTER_MAILBOX_MS = LOADER_MS;
const DEFAULT_TASK_EXFILTRATE_CALL = 'ZAKOŃCZ ROZMOWĘ Z FILIPEM NA PRAWYM MONITORZE.';
const DEFAULT_TASK_EXFILTRATE_DOWNLOAD = 'POBIERZ OBA RAPORTY FINANSOWE ZE SKRZYNKI POCZTOWEJ.';
const DOWNLOAD_MS = 1500;
const COMPLETION_DELAY_MS = 1200;

type MainPhase = 'ready' | 'phase1' | 'phase2';
type Phase2Step =
  | 'transfer_creds'
  | 'logging_in_1'
  | 'phase2_dialogue'
  | 'transfer_2fa'
  | 'ready_to_enter'
  | 'entering_mailbox'
  | 'exfiltrate';

type TokenId = 'login' | 'password' | 'sms';

interface CallLine {
  sender: string;
  text: string;
  isPlayer: boolean;
  isLink?: boolean;
}

interface DownloadState {
  status: 'idle' | 'downloading' | 'done';
  progress: number;
}

export const VishingApp: React.FC<BlockProps<VishingCallConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || DEFAULT_ACCENT;
  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  const d1Choice = useDecisionChoice(1);

  const isBcorpPl = d1Choice?.optionId === 'bcorp_pl';
  const fakeUrl = isBcorpPl ? config.phase2.fakeUrlSuboptimal : config.phase2.fakeUrlIdeal;

  // --- Stan główny ---
  const [phase, setPhase] = useState<MainPhase>('ready');
  const [lines, setLines] = useState<CallLine[]>([]);
  const [isCalleeTyping, setIsCalleeTyping] = useState(false);
  const [callDisconnected, setCallDisconnected] = useState(false);

  // --- Stan Fazy 1 (D3–D10) ---
  const [turnIndex, setTurnIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [awaitingLink, setAwaitingLink] = useState(false);
  const [locked, setLocked] = useState(false);

  // --- Stan Fazy 2 (AiTM + skrzynka) ---
  const [phase2Step, setPhase2Step] = useState<Phase2Step>('transfer_creds');
  const [placedTokens, setPlacedTokens] = useState<Record<TokenId, boolean>>({
    login: false,
    password: false,
    sms: false
  });
  const [selectedToken, setSelectedToken] = useState<TokenId | null>(null);
  const [bounceSlot, setBounceSlot] = useState<TokenId | null>(null);
  const [slotWarning, setSlotWarning] = useState<string | null>(null);

  const [dialogueStepIdx, setDialogueStepIdx] = useState(0);
  const [waitingPhase2Reply, setWaitingPhase2Reply] = useState(false);
  const [closingIdx, setClosingIdx] = useState(0);
  const [waitingClosingReply, setWaitingClosingReply] = useState(false);

  const [downloads, setDownloads] = useState<Record<string, DownloadState>>(() =>
    Object.fromEntries(config.phase2.reports.map((r) => [r.id, { status: 'idle', progress: 0 }]))
  );
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  // --- Timery i strażniki ---
  const timerBag = useRef(createTimerBag()).current;
  const intervalIdsRef = useRef<Array<ReturnType<typeof setInterval>>>([]);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    return () => {
      timerBag.clear();
      intervalIdsRef.current.forEach(clearInterval);
      intervalIdsRef.current = [];
    };
  }, [timerBag]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [lines.length, isCalleeTyping, waitingPhase2Reply, waitingClosingReply, phase]);

  // --- Faza 1: bieżąca tura i tasowanie opcji ---
  const currentTurn = config.turns[turnIndex];
  const shuffledOptions = useShuffled(currentTurn?.options ?? []);

  // --- Start rozmowy ---
  const handleStartCall = () => {
    if (phase !== 'ready') return;
    sounds.playNotification();
    setLines([{ sender: config.calleeName, text: config.openingLine, isPlayer: false }]);
    setPhase('phase1');
  };

  // --- Faza 1: przejście do kolejnej tury lub Fazy 2 ---
  const finishTurnAdvance = () => {
    if (turnIndex + 1 < config.turns.length) {
      setTurnIndex((prev) => prev + 1);
      setIsBusy(false);
    } else {
      timerBag.later(() => {
        sounds.playNotification();
        setPhase('phase2');
        setIsBusy(false);
      }, PHASE2_TRANSITION_MS);
    }
  };

  // --- Faza 1: zatwierdzenie odpowiedzi (D3–D10) ---
  const handleConfirmTurn = () => {
    if (!currentTurn || !selectedOptionId || isBusy || locked || awaitingLink) return;
    const option: VishingTurnOption | undefined = currentTurn.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    // B2: mentor odrzuca wybór — nalicza karę, blokuje opcję, NIE dodaje dymka i NIE kończy tury.
    const outcome = submitDecision(
      { decisionNum: currentTurn.decisionNum, question: currentTurn.question },
      option,
      { onDecision, rejectDecision }
    );
    if (outcome === 'rejected') {
      setSelectedOptionId(null);
      return;
    }

    sounds.playClick();
    setSelectedOptionId(null);
    setLines((prev) => [...prev, { sender: 'TY', text: option.label, isPlayer: true }]);

    // Critical kończy rozmowę i uruchamia modal wykrycia w silniku.
    if (option.tier === 'critical') {
      setLocked(true);
      return;
    }

    setIsBusy(true);

    const runAfterCalleeAndLink = () => {
      // D5 (lub inna tura z sekwencją po decyzji): kwestia gracza -> odpowiedź Filipa.
      if (currentTurn.afterPlayerLine) {
        timerBag.later(() => {
          sounds.playClick();
          setLines((prev) => [...prev, { sender: 'TY', text: currentTurn.afterPlayerLine!, isPlayer: true }]);
          if (currentTurn.afterCalleeLine) {
            setIsCalleeTyping(true);
            timerBag.later(() => {
              setIsCalleeTyping(false);
              sounds.playNotification();
              setLines((prev) => [...prev, { sender: config.calleeName, text: currentTurn.afterCalleeLine!, isPlayer: false }]);
              finishTurnAdvance();
            }, REPLY_DELAY_MS);
          } else {
            finishTurnAdvance();
          }
        }, AUTO_PLAYER_DELAY_MS);
        return;
      }

      // D9: po ewentualnej reakcji przed linkiem gracz klika LINK.
      if (currentTurn.linkStep) {
        setIsBusy(false);
        setAwaitingLink(true);
        return;
      }

      finishTurnAdvance();
    };

    if (option.reaction) {
      setIsCalleeTyping(true);
      timerBag.later(() => {
        setIsCalleeTyping(false);
        sounds.playNotification();
        setLines((prev) => [...prev, { sender: config.calleeName, text: option.reaction!, isPlayer: false }]);
        runAfterCalleeAndLink();
      }, REPLY_DELAY_MS);
    } else {
      runAfterCalleeAndLink();
    }
  };

  // --- Faza 1: wysłanie linku w D9 (skutek odroczony D1) ---
  const handleSendLink = () => {
    if (!currentTurn?.linkStep || !awaitingLink || isBusy || locked) return;
    const { linkStep } = currentTurn;
    sounds.playClick();
    setAwaitingLink(false);
    setIsBusy(true);
    setLines((prev) => [...prev, { sender: 'TY', text: fakeUrl, isPlayer: true, isLink: true }]);

    const reaction = isBcorpPl ? linkStep.calleeReactionSuboptimal : linkStep.calleeReactionIdeal;
    setIsCalleeTyping(true);
    timerBag.later(() => {
      setIsCalleeTyping(false);
      sounds.playNotification();
      setLines((prev) => [...prev, { sender: config.calleeName, text: reaction, isPlayer: false }]);
      finishTurnAdvance();
    }, REPLY_DELAY_MS);
  };

  // --- Faza 2: logika przeciągania i klik-klik ---
  const canUseToken = (tokenId: TokenId): boolean => {
    if (phase !== 'phase2') return false;
    if (placedTokens[tokenId]) return false;
    if (phase2Step === 'transfer_creds') return tokenId === 'login' || tokenId === 'password';
    if (phase2Step === 'transfer_2fa') return tokenId === 'sms';
    return false;
  };

  const triggerSlotMismatch = (zoneId: TokenId) => {
    sounds.playError();
    setBounceSlot(zoneId);
    setSlotWarning('TE DANE NIE PASUJĄ DO TEGO POLA — DOPASUJ WŁAŚCIWE POLE.');
    timerBag.later(() => {
      setBounceSlot(null);
      setSlotWarning(null);
    }, 1000);
  };

  const tryPlaceToken = (tokenId: TokenId, zoneId: TokenId) => {
    if (!canUseToken(tokenId)) return;
    if (tokenId !== zoneId) {
      triggerSlotMismatch(zoneId);
      return;
    }
    sounds.playSuccess();
    setPlacedTokens((prev) => ({ ...prev, [zoneId]: true }));
    setSelectedToken(null);
    setBounceSlot(null);
    setSlotWarning(null);
  };

  const drag = usePointerDrag<TokenId>({
    onDrop: ({ itemId, zoneId }) => tryPlaceToken(itemId, zoneId as TokenId),
    onTap: (itemId) => {
      if (!canUseToken(itemId)) return;
      sounds.playClick();
      setSlotWarning(null);
      setSelectedToken((prev) => (prev === itemId ? null : itemId));
    },
    canDrag: (itemId) => canUseToken(itemId)
  });

  const handleTargetSlotClick = (zoneId: TokenId) => {
    if (placedTokens[zoneId]) return;
    if (phase2Step !== 'transfer_creds' && phase2Step !== 'transfer_2fa') return;
    if (!selectedToken) {
      sounds.playClick();
      setSlotWarning('NAJPIERW KLIKNIJ PRZECHWYCONĄ WARTOŚĆ PO LEWEJ (LUB PRZECIĄGNIJ JĄ TUTAJ).');
      return;
    }
    tryPlaceToken(selectedToken, zoneId);
  };

  // --- Faza 2: rozmowa na prawym monitorze (krok 2FA) ---
  const playPhase2CalleeStep = (idx: number) => {
    const step = config.phase2.dialogueSteps[idx];
    if (!step) {
      setPhase2Step('transfer_2fa');
      return;
    }
    setIsCalleeTyping(true);
    timerBag.later(() => {
      setIsCalleeTyping(false);
      sounds.playNotification();
      setLines((prev) => [...prev, { sender: config.calleeName, text: step.calleeLine, isPlayer: false }]);
      setDialogueStepIdx(idx);
      setWaitingPhase2Reply(true);
    }, REPLY_DELAY_MS);
  };

  const handlePhase2Reply = () => {
    if (!waitingPhase2Reply) return;
    const step = config.phase2.dialogueSteps[dialogueStepIdx];
    if (!step) return;
    sounds.playClick();
    setWaitingPhase2Reply(false);
    setLines((prev) => [...prev, { sender: 'TY', text: step.playerLine, isPlayer: true }]);

    const advanceAfterStep = () => {
      const nextIdx = dialogueStepIdx + 1;
      if (nextIdx < config.phase2.dialogueSteps.length) {
        playPhase2CalleeStep(nextIdx);
      } else {
        setPhase2Step('transfer_2fa');
      }
    };

    if (step.calleeAfter) {
      setIsCalleeTyping(true);
      timerBag.later(() => {
        setIsCalleeTyping(false);
        sounds.playNotification();
        setLines((prev) => [...prev, { sender: config.calleeName, text: step.calleeAfter!, isPlayer: false }]);
        advanceAfterStep();
      }, REPLY_DELAY_MS);
    } else {
      advanceAfterStep();
    }
  };

  // --- Faza 2: ZALOGUJ po przeniesieniu loginu i hasła ---
  const handleLoginSubmit = () => {
    if (phase2Step !== 'transfer_creds' || !placedTokens.login || !placedTokens.password) return;
    sounds.playClick();
    setSelectedToken(null);
    setSlotWarning(null);
    setPhase2Step('logging_in_1');
  };

  // Koniec loadera weryfikacji (ModuleLoader sam gra dźwięk sukcesu).
  const handleLoginLoaded = () => {
    setPhase2Step('phase2_dialogue');
    playPhase2CalleeStep(0);
  };

  // --- Faza 2: ZALOGUJ po przeniesieniu kodu 2FA ---
  const handle2faSubmit = () => {
    if (phase2Step !== 'transfer_2fa' || !placedTokens.sms) return;
    sounds.playSuccess();
    setSelectedToken(null);
    setSlotWarning(null);
    setPhase2Step('ready_to_enter');
  };

  // --- Faza 2: WEJDŹ DO SYSTEMU -> skrzynka + rozmowa końcowa ---
  const runClosingFrom = (idx: number) => {
    const items = config.phase2.closingDialogue;
    if (idx >= items.length) {
      setCallDisconnected(true);
      return;
    }
    const item = items[idx];
    if (item.speaker === 'callee') {
      setIsCalleeTyping(true);
      timerBag.later(() => {
        setIsCalleeTyping(false);
        sounds.playNotification();
        setLines((prev) => [...prev, { sender: config.calleeName, text: item.text, isPlayer: false }]);
        runClosingFrom(idx + 1);
      }, REPLY_DELAY_MS);
    } else {
      setClosingIdx(idx);
      setWaitingClosingReply(true);
    }
  };

  const handleClosingReply = () => {
    if (!waitingClosingReply) return;
    const item = config.phase2.closingDialogue[closingIdx];
    if (!item || item.speaker !== 'player') return;
    sounds.playClick();
    setWaitingClosingReply(false);
    setLines((prev) => [...prev, { sender: 'TY', text: item.text, isPlayer: true }]);
    runClosingFrom(closingIdx + 1);
  };

  const handleEnterSystem = () => {
    if (phase2Step !== 'ready_to_enter') return;
    sounds.playClick();
    setPhase2Step('entering_mailbox');
  };

  // Koniec loadera skrzynki: najpierw rozmowa zamykająca (scenario.md, pkt 5), potem pobieranie (pkt 6).
  const handleMailboxLoaded = () => {
    setPhase2Step('exfiltrate');
    if (config.phase2.closingDialogue.length === 0) {
      setCallDisconnected(true);
    } else {
      runClosingFrom(0);
    }
  };

  // --- Faza 2: pobieranie raportów (dopiero po ROZŁĄCZONO) ---
  const handleDownloadReport = (reportId: string) => {
    if (phase2Step !== 'exfiltrate' || !callDisconnected) return;
    const current = downloads[reportId];
    if (!current || current.status !== 'idle') return;
    sounds.playClick();
    setDownloads((prev) => ({ ...prev, [reportId]: { status: 'downloading', progress: 10 } }));

    let pct = 10;
    const tickMs = Math.max(50, Math.floor(DOWNLOAD_MS / 10));
    const intervalId = setInterval(() => {
      pct = Math.min(100, pct + 10);
      setDownloads((prev) => ({
        ...prev,
        [reportId]: { status: pct >= 100 ? 'done' : 'downloading', progress: pct }
      }));
      if (pct >= 100) {
        clearInterval(intervalId);
        sounds.playSuccess();
      }
    }, tickMs);
    intervalIdsRef.current.push(intervalId);
  };

  const allReportsDownloaded =
    config.phase2.reports.length > 0 && config.phase2.reports.every((r) => downloads[r.id]?.status === 'done');

  useEffect(() => {
    if (phase !== 'phase2' || phase2Step !== 'exfiltrate') return;
    if (!allReportsDownloaded || !callDisconnected) return;
    if (showCompletionBanner) return;
    setShowCompletionBanner(true);
    sounds.playSuccess();
    timerBag.later(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, COMPLETION_DELAY_MS);
  }, [phase, phase2Step, allReportsDownloaded, callDisconnected, showCompletionBanner, timerBag]);

  // --- Render pomocniczy: historia rozmowy z Filipem ---
  const renderCallMessages = (compact = false) => (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      {lines.map((line, i) => (
        <div key={i} className={`flex ${line.isPlayer ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[88%] px-3 py-2 rounded-xl leading-relaxed font-sans ${
              compact ? 'text-xs' : 'text-xs sm:text-sm'
            } ${
              line.isPlayer
                ? 'bg-[#0b1a26] border border-gray-700 text-gray-100'
                : 'bg-black/55 border border-gray-800 text-gray-200'
            }`}
          >
            <div className="text-xs font-bold font-mono mb-0.5 opacity-75">{line.sender}</div>
            {line.isLink ? (
              <span className="font-mono font-bold underline break-all" style={{ color: accent }}>
                {line.text}
              </span>
            ) : (
              <span>{line.text}</span>
            )}
          </div>
        </div>
      ))}
      {isCalleeTyping && (
        <div className="flex justify-start">
          <div className="max-w-[85%] px-3 py-2 rounded-xl bg-black/55 border border-gray-800">
            <div className="text-xs font-bold font-mono mb-0.5 opacity-75">{config.calleeName}</div>
            <div className="flex items-center space-x-1" style={{ color: accent }}>
              <span className="text-xs opacity-80">mówi</span>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );

  // --- Prawy monitor: w gotowości i Fazie 1 = notatki OSINT, w Fazie 2 = ciąg dalszy rozmowy ---
  const currentPhase2ReplyText =
    phase2Step === 'phase2_dialogue' && waitingPhase2Reply
      ? config.phase2.dialogueSteps[dialogueStepIdx]?.playerLine
      : phase2Step === 'exfiltrate' && waitingClosingReply
        ? config.phase2.closingDialogue[closingIdx]?.text
        : undefined;

  const sideMonitorContent =
    phase === 'phase2' ? (
      <SidePanel
        accent={accent}
        heading={`//ROZMOWA: ${config.calleeName}`}
        sub={
          <span className="flex items-center justify-between gap-2">
            <span>POŁĄCZENIE GŁOSOWE</span>
            <span
              data-testid="call-status"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black tracking-widest ${
                callDisconnected
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/50'
              }`}
            >
              {callDisconnected ? <PhoneOff size={11} /> : <PhoneCall size={11} />}
              {callDisconnected ? 'ROZŁĄCZONO' : 'AKTYWNE'}
            </span>
          </span>
        }
        footer={
          currentPhase2ReplyText ? (
            <div className="shrink-0 pt-2 border-t border-gray-800 space-y-1.5">
              <div className="text-xs font-black tracking-widest uppercase" style={{ color: accent }}>
                TWOJA ODPOWIEDŹ:
              </div>
              <button
                type="button"
                data-testid="phase2-reply-btn"
                onClick={phase2Step === 'exfiltrate' ? handleClosingReply : handlePhase2Reply}
                className="w-full text-left px-3 py-2.5 rounded-lg border-2 bg-[#0b1724] hover:bg-[#102438] text-xs font-sans font-bold text-white transition-all flex items-center justify-between gap-2 cursor-pointer"
                style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}33` }}
              >
                <span className="leading-snug">{currentPhase2ReplyText}</span>
                <Send size={14} className="shrink-0" style={{ color: accent }} />
              </button>
            </div>
          ) : undefined
        }
      >
        {renderCallMessages(true)}
      </SidePanel>
    ) : (
      <SidePanel accent={accent} heading={config.osintNotesTitle} sub={config.calleeName}>
        <ul className="space-y-2.5" data-testid="osint-notes-list">
          {config.osintNotes.map((note, idx) => (
            <li
              key={idx}
              className="rounded-lg border border-gray-800 bg-[#0b1522] px-3 py-2.5 text-xs font-sans leading-relaxed text-gray-100 flex items-start gap-2.5"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black font-mono shrink-0 mt-0.5"
                style={{ backgroundColor: `${accent}26`, color: accent, border: `1px solid ${accent}66` }}
              >
                {idx + 1}
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </SidePanel>
    );

  // --- Zadanie w pasku AppHeader ---
  const headerTask = (() => {
    if (phase === 'ready' || phase === 'phase1') return config.taskPhase1;
    if (phase2Step === 'transfer_creds' || phase2Step === 'logging_in_1') return config.taskPhase2;
    if (phase2Step === 'phase2_dialogue') return 'ODPOWIEDZ FILIPOWI NA PRAWYM MONITORZE, ABY PODAŁ KOD 2FA.';
    if (phase2Step === 'transfer_2fa' || phase2Step === 'ready_to_enter' || phase2Step === 'entering_mailbox') {
      return 'PRZENIEŚ KOD SMS NA ORYGINALNĄ STRONĘ I WEJDŹ DO SYSTEMU.';
    }
    if (showCompletionBanner) return config.phase2.completionMessage;
    // Krok 'exfiltrate': jedna rzecz naraz — najpierw rozmowa, po ROZŁĄCZONO pobieranie.
    if (!callDisconnected) return config.taskExfiltrateCall ?? DEFAULT_TASK_EXFILTRATE_CALL;
    return config.taskExfiltrateDownload ?? DEFAULT_TASK_EXFILTRATE_DOWNLOAD;
  })();

  const headerStep = phase === 'phase2' ? 'FAZA 2/2' : 'FAZA 1/2';

  // --- Etykieta ducha przeciągania w Fazie 2 ---
  const draggedText =
    drag.draggedId === 'login'
      ? config.phase2.capturedLogin
      : drag.draggedId === 'password'
        ? config.phase2.capturedPasswordMasked
        : drag.draggedId === 'sms'
          ? config.phase2.capturedSmsCode
          : null;

  // --- Pomocniczy render tokenu (login / hasło / kod 2FA) na fałszywej stronie ---
  const renderSourceToken = (id: TokenId, label: string, value: string) => {
    const used = placedTokens[id];
    const draggable = canUseToken(id);
    const isSelected = selectedToken === id;
    const dragProps = drag.getDragProps(id);

    return (
      <div
        data-testid={`fake-token-${id}`}
        role={draggable ? 'button' : undefined}
        aria-label={draggable ? `Przenieś: ${label}` : undefined}
        tabIndex={draggable ? 0 : undefined}
        onKeyDown={
          draggable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  sounds.playClick();
                  setSlotWarning(null);
                  setSelectedToken((prev) => (prev === id ? null : id));
                }
              }
            : undefined
        }
        {...(draggable ? dragProps : {})}
        style={draggable ? dragProps.style : undefined}
        className={`rounded-lg border-2 px-3 py-2 flex items-center justify-between gap-2 transition-all ${
          used
            ? 'border-[#00ff66]/40 bg-[#00ff66]/10 opacity-60 cursor-default'
            : draggable
              ? isSelected
                ? 'border-[#00ff66] bg-[#00ff66]/15 shadow-[0_0_12px_rgba(0,255,102,0.35)] cursor-grab'
                : 'border-amber-400/70 bg-[#0b1522] hover:border-amber-300 cursor-grab'
              : 'border-gray-700 bg-[#0b1522] opacity-60'
        } ${drag.draggedId === id ? 'opacity-40' : ''}`}
      >
        <div className="min-w-0">
          <div className="text-xs font-black tracking-widest text-amber-300/90">{label}</div>
          <div className="text-sm font-black font-mono text-white truncate">{value}</div>
        </div>
        {used ? (
          <Check size={16} className="text-[#00ff66] shrink-0" />
        ) : (
          draggable && <GripVertical size={16} className="text-amber-300 shrink-0" />
        )}
      </div>
    );
  };

  // --- Pomocniczy render slotu docelowego na oryginalnej stronie ---
  const renderTargetSlot = (id: TokenId, label: string, filledValue: string, placeholder: string, interactive: boolean) => {
    const filled = placedTokens[id];
    const isBouncing = bounceSlot === id;
    const isHovered = drag.isOver(id);
    const isTarget = drag.isDropTarget(id);

    return (
      <div
        ref={drag.zoneRef(id)}
        data-testid={`orig-slot-${id}`}
        role={interactive && !filled ? 'button' : undefined}
        tabIndex={interactive && !filled ? 0 : undefined}
        onClick={() => {
          if (interactive && !filled) handleTargetSlotClick(id);
        }}
        onKeyDown={
          interactive && !filled
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTargetSlotClick(id);
                }
              }
            : undefined
        }
        className={`rounded-lg border-2 px-3 py-2 flex items-center justify-between gap-2 transition-all ${
          filled
            ? 'border-[#00ff66] bg-[#00ff66]/10'
            : interactive
              ? isBouncing
                ? 'border-red-500 bg-red-500/20 animate-pulse cursor-pointer'
                : isHovered
                  ? 'border-[#00ff66] bg-[#00ff66]/20 cursor-pointer'
                  : selectedToken || isTarget
                    ? 'border-dashed border-sky-400 bg-sky-500/10 cursor-pointer'
                    : 'border-dashed border-gray-600 bg-[#060c14] cursor-pointer hover:border-sky-400/70'
              : 'border-dashed border-gray-700 bg-[#060c14] opacity-70'
        }`}
      >
        <div className="min-w-0">
          <div className="text-xs font-black tracking-widest text-sky-300/90">{label}</div>
          <div className={`text-sm font-mono truncate ${filled ? 'font-black text-white' : 'text-gray-400'}`}>
            {filled ? filledValue : placeholder}
          </div>
        </div>
        {filled && <Check size={16} className="text-[#00ff66] shrink-0" />}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-3 sm:p-4 gap-2.5">
      <SideMonitor>{sideMonitorContent}</SideMonitor>

      <AppHeader
        icon={Phone}
        accent={accent}
        title={config.title || '//ROZMOWA'}
        subtitle={config.subtitle || config.calleeName}
        step={headerStep}
        task={headerTask}
      />

      {/* EKRAN GOTOWOŚCI */}
      {phase === 'ready' && (
        <div className="flex-1 min-h-0 flex items-center justify-center p-4">
          <div
            className="max-w-xl w-full rounded-2xl border-2 bg-[#071019] p-6 sm:p-8 flex flex-col items-center text-center gap-5 shadow-2xl"
            style={{ borderColor: `${accent}66`, boxShadow: `0 0 30px ${accent}1a` }}
          >
            <div
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: accent, backgroundColor: `${accent}1f`, color: accent }}
            >
              <PhoneCall size={30} />
            </div>
            {config.readyScreen.title && (
              <h3 className="text-sm font-black tracking-widest" style={{ color: accent }}>
                {config.readyScreen.title}
              </h3>
            )}
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed font-sans">
              {config.readyScreen.message}
            </p>
            <button
              type="button"
              data-testid="start-call-btn"
              onClick={handleStartCall}
              className="px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest text-[#05090f] transition-all flex items-center gap-2.5 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: accent, boxShadow: `0 0 22px ${accent}66` }}
            >
              <PhoneCall size={18} />
              <span>{config.readyScreen.buttonLabel}</span>
            </button>
          </div>
        </div>
      )}

      {/* FAZA 1: ROZMOWA D3–D10 */}
      {phase === 'phase1' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-1" data-testid="phase1-chat-log">
            {renderCallMessages(false)}
          </div>

          {awaitingLink && currentTurn?.linkStep && !locked && (
            <div className="shrink-0">
              <ChoiceZone accent={accent} label="WYŚLIJ LINK DO FAŁSZYWEJ STRONY">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm font-mono font-bold text-white break-all">{fakeUrl}</div>
                  <ConfirmButton
                    accent={accent}
                    label={currentTurn.linkStep.buttonLabel}
                    onClick={handleSendLink}
                    icon={<Send size={15} />}
                    className="w-full sm:w-auto px-6"
                  />
                </div>
              </ChoiceZone>
            </div>
          )}

          {!awaitingLink && currentTurn && !isBusy && !locked && (
            <div className="shrink-0 flex flex-col gap-2">
              <ChoiceRows
                accent={accent}
                options={shuffledOptions}
                selectedId={selectedOptionId}
                onSelect={(id) => {
                  sounds.playClick();
                  setSelectedOptionId(id);
                }}
                label={currentTurn.prompt || currentTurn.question}
                decisionNum={currentTurn.decisionNum}
              />
              <div className="flex justify-end">
                <ConfirmButton
                  accent={accent}
                  label="WYŚLIJ ODPOWIEDŹ"
                  enabled={!!selectedOptionId}
                  onClick={handleConfirmTurn}
                  icon={<Send size={15} />}
                  className="w-auto px-6"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAZA 2: AiTM NA ŻYWO (DWIE STRONY) + SKRZYNKA POCZTOWA */}
      {phase === 'phase2' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {phase2Step === 'exfiltrate' ? (
            /* SKRZYNKA POCZTOWA FILIPA + POBRANIE RAPORTÓW */
            <div className="flex-1 min-h-0 flex flex-col gap-3 rounded-xl border border-sky-500/40 bg-[#08101a] overflow-hidden">
              <div className="px-4 py-2 bg-[#0d1624] border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-sky-400" />
                  <span className="text-xs font-black tracking-widest text-white">
                    {`${config.phase2.originalUrl.replace(/\/LOGIN$/i, '/INBOX')} — ${config.phase2.capturedLogin}`}
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-300">{config.phase2.brandTitle}</span>
              </div>

              <div className="flex-1 min-h-0 p-4 flex flex-col justify-center gap-3">
                <div className="text-xs font-bold tracking-widest text-gray-400">
                  ZAŁĄCZNIKI W SKRZYNCE PRACOWNIKA:
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {config.phase2.reports.map((report) => {
                    const dl = downloads[report.id] ?? { status: 'idle', progress: 0 };
                    return (
                      <div
                        key={report.id}
                        data-testid={`report-item-${report.id}`}
                        className="rounded-xl border border-gray-700 bg-[#0b1522] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-white truncate">{report.title}</div>
                            {report.year && <div className="text-xs text-gray-400">{`ROK: ${report.year}`}</div>}
                          </div>
                        </div>

                        {dl.status === 'idle' && (
                          <button
                            type="button"
                            data-testid={`download-btn-${report.id}`}
                            disabled={!callDisconnected}
                            onClick={() => handleDownloadReport(report.id)}
                            className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 transition-transform ${
                              callDisconnected
                                ? 'text-[#05090f] cursor-pointer active:scale-95'
                                : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                            }`}
                            style={
                              callDisconnected
                                ? { backgroundColor: accent, boxShadow: `0 0 12px ${accent}55` }
                                : undefined
                            }
                          >
                            {callDisconnected ? <Download size={14} /> : <Lock size={14} />}
                            <span>POBIERZ</span>
                          </button>
                        )}

                        {dl.status === 'downloading' && (
                          <div className="w-full sm:w-48 space-y-1 shrink-0">
                            <div className="flex justify-between text-xs font-bold" style={{ color: accent }}>
                              <span>POBIERANIE…</span>
                              <span>{dl.progress}%</span>
                            </div>
                            <div className="h-2.5 rounded bg-black/60 border border-gray-700 p-0.5">
                              <div
                                className="h-full rounded transition-all duration-100"
                                style={{ width: `${dl.progress}%`, backgroundColor: accent }}
                              />
                            </div>
                          </div>
                        )}

                        {dl.status === 'done' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff66]/15 border border-[#00ff66]/60 text-[#00ff66] text-xs font-black shrink-0">
                            <Check size={14} />
                            <span>POBRANO</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!callDisconnected && (
                  <div
                    data-testid="download-locked-hint"
                    className="px-3.5 py-2.5 rounded-lg border border-amber-400/60 bg-amber-950/30 text-amber-200 text-xs font-bold text-center"
                  >
                    POBIERANIE ODBLOKUJE SIĘ PO ZAKOŃCZENIU ROZMOWY Z FILIPEM NA PRAWYM MONITORZE.
                  </div>
                )}

                {showCompletionBanner && (
                  <div
                    data-testid="vishing-completion-banner"
                    className="px-4 py-3 rounded-xl border-2 border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66] text-sm sm:text-base font-black tracking-widest text-center animate-in fade-in duration-200"
                  >
                    {config.phase2.completionMessage}
                  </div>
                )}
              </div>

              <div className="px-3 py-1.5 bg-[#060c14] border-t border-gray-800 text-center text-xs font-bold text-gray-400 shrink-0">
                {config.phase2.footerText}
              </div>
            </div>
          ) : (
            /* DWIE STRONY OBOK SIEBIE: FAŁSZYWA (LEWA) + ORYGINALNA (PRAWA) */
            <>
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* LEWY PANEL: FAŁSZYWA STRONA PRZECHWYTUJĄCA */}
                <div className="flex flex-col min-h-0 rounded-xl border border-amber-400/50 bg-[#08101a] overflow-hidden shadow-xl">
                  <div className="px-3 py-1.5 bg-[#0d1624] border-b border-gray-800 flex items-center justify-between shrink-0">
                    <span className="text-xs font-black tracking-wider text-amber-300">FAŁSZYWA STRONA (AiTM)</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PRZECHWYCONO
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#060c14] border-b border-gray-800 flex items-center gap-2 shrink-0">
                    <Lock size={13} className="text-amber-400 shrink-0" />
                    <span data-testid="phase2-fake-url" className="text-xs font-bold text-white truncate">
                      {fakeUrl}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 p-3 flex flex-col justify-center gap-2.5">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0d192b] border border-amber-500/30 shrink-0">
                      <div className="w-9 h-9 rounded bg-black/50 border border-amber-400/40 overflow-hidden shrink-0">
                        <ImageSlot asset={config.phase2.logoAsset} label={config.phase2.brandTitle} fit="contain" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-black tracking-wider text-white block truncate">
                          {config.phase2.brandTitle}
                        </span>
                        <span className="text-xs text-amber-300/80 block">SERWER PRZECHWYTUJĄCY</span>
                      </div>
                    </div>

                    {(phase2Step === 'transfer_creds' || phase2Step === 'logging_in_1') && (
                      <div className="space-y-2">
                        {renderSourceToken('login', 'LOGIN', config.phase2.capturedLogin)}
                        {renderSourceToken('password', 'HASŁO', config.phase2.capturedPasswordMasked)}
                      </div>
                    )}

                    {phase2Step === 'phase2_dialogue' && (
                      <div className="rounded-lg border border-gray-800 bg-[#060c14] p-3 text-center space-y-1">
                        <div className="text-xs font-black text-[#00ff66]">POŚWIADCZENIA PRZEKAZANE ✓</div>
                        <div className="text-xs text-gray-400">
                          ROZMAWIAJ Z FILIPEM NA PRAWYM MONITORZE, ABY PODAŁ KOD SMS.
                        </div>
                      </div>
                    )}

                    {(phase2Step === 'transfer_2fa' ||
                      phase2Step === 'ready_to_enter' ||
                      phase2Step === 'entering_mailbox') && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-amber-300 tracking-wider">PRZECHWYCONY KOD 2FA:</div>
                        {renderSourceToken('sms', 'KOD SMS', config.phase2.capturedSmsCode)}
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-1.5 bg-[#060c14] border-t border-gray-800 text-center text-xs font-bold text-gray-400 shrink-0">
                    {config.phase2.footerText}
                  </div>
                </div>

                {/* PRAWY PANEL: ORYGINALNA STRONA BANKU */}
                <div className="flex flex-col min-h-0 rounded-xl border border-sky-500/50 bg-[#08101a] overflow-hidden shadow-xl">
                  <div className="px-3 py-1.5 bg-[#0d1624] border-b border-gray-800 flex items-center justify-between shrink-0">
                    <span className="text-xs font-black tracking-wider text-sky-300">ORYGINALNA STRONA</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      SYSTEM BANKU
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#060c14] border-b border-gray-800 flex items-center gap-2 shrink-0">
                    <Lock size={13} className="text-sky-400 shrink-0" />
                    <span data-testid="phase2-original-url" className="text-xs font-bold text-white truncate">
                      {config.phase2.originalUrl}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 p-3 flex flex-col justify-center gap-2.5">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0d192b] border border-sky-500/30 shrink-0">
                      <div className="w-9 h-9 rounded bg-black/50 border border-sky-400/40 overflow-hidden shrink-0">
                        <ImageSlot asset={config.phase2.logoAsset} label={config.phase2.brandTitle} fit="contain" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-black tracking-wider text-white block truncate">
                          {config.phase2.brandTitle}
                        </span>
                        <span className="text-xs text-sky-300/80 block">OFICJALNY PORTAL LOGOWANIA</span>
                      </div>
                    </div>

                    {phase2Step === 'transfer_creds' && (
                      <div className="space-y-2">
                        {renderTargetSlot(
                          'login',
                          'LOGIN',
                          config.phase2.capturedLogin,
                          'PRZECIĄGNIJ LUB WSTAW LOGIN',
                          true
                        )}
                        {renderTargetSlot(
                          'password',
                          'HASŁO',
                          config.phase2.capturedPasswordMasked,
                          'PRZECIĄGNIJ LUB WSTAW HASŁO',
                          true
                        )}
                        <ConfirmButton
                          accent={accent}
                          label="ZALOGUJ"
                          enabled={placedTokens.login && placedTokens.password}
                          onClick={handleLoginSubmit}
                        />
                      </div>
                    )}

                    {phase2Step === 'logging_in_1' && (
                      <div data-testid="login-loader" className="rounded-lg border border-sky-500/40 overflow-hidden h-40">
                        <ModuleLoader
                          accent="#38bdf8"
                          label="WERYFIKACJA DANYCH LOGOWANIA…"
                          durationMs={LOGIN_LOADER_MS}
                          onDone={handleLoginLoaded}
                        />
                      </div>
                    )}

                    {(phase2Step === 'phase2_dialogue' || phase2Step === 'transfer_2fa') && (
                      <div className="space-y-2">
                        <div className="text-xs font-black tracking-wider text-sky-200">
                          {config.phase2.twoFaPrompt}
                        </div>
                        {renderTargetSlot(
                          'sms',
                          'KOD',
                          config.phase2.capturedSmsCode,
                          phase2Step === 'phase2_dialogue'
                            ? 'OCZEKIWANIE NA KOD SMS…'
                            : 'PRZECIĄGNIJ LUB WSTAW KOD SMS',
                          phase2Step === 'transfer_2fa'
                        )}
                        <ConfirmButton
                          accent={accent}
                          label="ZALOGUJ"
                          enabled={phase2Step === 'transfer_2fa' && placedTokens.sms}
                          onClick={handle2faSubmit}
                        />
                      </div>
                    )}

                    {phase2Step === 'ready_to_enter' && (
                      <div className="space-y-3 text-center">
                        <div className="rounded-lg border border-[#00ff66]/50 bg-[#00ff66]/10 p-2.5 text-xs font-black text-[#00ff66]">
                          KOD 2FA ZAAKCEPTOWANY ✓
                        </div>
                        <ConfirmButton
                          accent={accent}
                          label="WEJDŹ DO SYSTEMU"
                          enabled={true}
                          onClick={handleEnterSystem}
                        />
                      </div>
                    )}

                    {phase2Step === 'entering_mailbox' && (
                      <div data-testid="mailbox-loader" className="rounded-lg border border-[#00ff66]/50 overflow-hidden h-40">
                        <ModuleLoader
                          accent={accent}
                          label="OTWIERANIE SKRZYNKI POCZTOWEJ…"
                          durationMs={ENTER_MAILBOX_MS}
                          onDone={handleMailboxLoaded}
                        />
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-1.5 bg-[#060c14] border-t border-gray-800 text-center text-xs font-bold text-gray-400 shrink-0">
                    {config.phase2.footerText}
                  </div>
                </div>
              </div>

              {slotWarning && (
                <div
                  role="alert"
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-red-500/60 bg-red-950/40 text-xs font-bold text-red-200 flex items-center justify-center gap-2"
                >
                  <AlertCircle size={14} className="shrink-0 text-red-400" />
                  <span>{slotWarning}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <DragGhost dragging={drag.dragging}>{draggedText}</DragGhost>
    </div>
  );
};
