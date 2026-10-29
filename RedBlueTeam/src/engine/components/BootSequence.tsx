import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, Terminal } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import type { ChatMessage } from '../store/useMissionStore';
import { ChatView } from '../apps/ChatView';
import { sounds } from '../audio/soundEffects';

export const BootSequence: React.FC = () => {
  const {
    activeMission,
    bootStage,
    introDialogIndex,
    acceptIncomingCall,
    nextIntroDialog,
    startBiosBoot,
    finishBiosBoot
  } = useMissionStore();

  const [biosLineCount, setBiosLineCount] = useState<number>(0);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [sent, setSent] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState<boolean>(true);

  const introDialogue = activeMission.intro?.dialogue || [];
  const currentDialog = introDialogue[introDialogIndex] || { id: '', text: '', playerResponse: '' };
  const biosLines = activeMission.intro?.biosLines || [];
  const callerName = activeMission.intro?.callerName || 'BYTE_MASTER';
  const callStatus = activeMission.intro?.callStatus || 'POŁĄCZENIE PRZYCHODZĄCE (TOR v3)';

  // Pokazuje „BYTE_MASTER pisze” przed każdą nową wiadomością rozmówcy.
  useEffect(() => {
    if (bootStage !== 'intro_chat') return;
    setTyping(true);
    const delay = Math.min(3200, 1400 + (introDialogue[introDialogIndex]?.text.length || 0) * 8);
    const timer = setTimeout(() => setTyping(false), delay);
    return () => clearTimeout(timer);
  }, [bootStage, introDialogIndex]);


  // Handle BIOS typewriter effect & progress bar
  useEffect(() => {
    if (bootStage !== 'bios_boot') return;

    if (biosLineCount < biosLines.length) {
      const timer = setTimeout(() => {
        sounds.playClick(1200, 0.02);
        setBiosLineCount((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timer);
    } else if (bootProgress < 100) {
      const timer = setTimeout(() => {
        setBootProgress((prev) => Math.min(100, prev + 10));
      }, 90);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        finishBiosBoot();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [bootStage, biosLineCount, bootProgress, biosLines.length, finishBiosBoot]);

  if (bootStage === 'incoming_call') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080c] p-4 font-mono select-none">
        <div className="w-full max-w-xl bg-[#091118]/95 border-2 border-[#00ff66] rounded-xl p-8 flex flex-col items-center text-center shadow-[0_0_35px_rgba(0,255,102,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

          {/* Caller Avatar */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-[#00ff66]/15 border-2 border-[#00ff66] flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.5)]">
              <ShieldAlert size={48} className="animate-pulse" />
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#091118] animate-ping" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#091118]" />
          </div>

          <div className="text-xl font-bold tracking-widest text-[#00ff66] mb-1">
            {callerName}
          </div>
          <div className="text-xs text-[#00ff66]/70 uppercase tracking-wider mb-8 animate-pulse">
            {callStatus}
          </div>

          <button
            onClick={acceptIncomingCall}
            className="px-8 py-3.5 bg-[#00ff66] text-[#05080c] font-black text-sm uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_25px_rgba(0,255,102,0.6)] flex items-center space-x-2"
          >
            <PhoneCall size={18} />
            <span>[ODBIERZ]</span>
          </button>
        </div>
      </div>
    );
  }

  if (bootStage === 'intro_chat') {
    const isLastDialog = introDialogIndex === introDialogue.length - 1;
    const options = currentDialog.playerOptions || [];
    const sendText = (currentDialog.playerResponse || '').trim();

    // Rozmowa budowana z dialogu: dymek rozmówcy (po „pisze…”), potem wysłana odpowiedź gracza.
    const messages: ChatMessage[] = [];
    introDialogue.slice(0, introDialogIndex + 1).forEach((node, idx) => {
      const isCurrent = idx === introDialogIndex;
      if (!isCurrent || !typing) {
        messages.push({ id: `m-${node.id}`, sender: 'BYTE_MASTER', text: node.text });
      }
      if (sent[node.id]) {
        messages.push({ id: `p-${node.id}`, sender: 'PLAYER', text: sent[node.id] });
      }
    });

    // Ostatnia kwestia też może mieć odpowiedź gracza — dopiero po jej wysłaniu pojawia się start systemu.
    const needsReply = options.length > 0 || sendText !== '' || !isLastDialog;
    const replied = sent[currentDialog.id] !== undefined;
    const showStart = isLastDialog && (!needsReply || replied);

    const choices = showStart || replied
      ? []
      : options.length > 0
      ? options.map((o) => ({ id: o.id, label: o.label }))
      : [{ id: 'send', label: sendText || '[WYŚLIJ]' }];

    const choose = (id: string) => {
      sounds.playClick();
      const label = choices.find((c) => c.id === id)?.label || '';
      const text = id === 'send' && !sendText ? '' : label;
      setSent((prev) => ({ ...prev, [currentDialog.id]: text }));
      nextIntroDialog({ dialogId: currentDialog.id, text });
    };

    return (
      <div className="flex items-stretch justify-center w-screen h-screen bg-[#05080c] p-3 font-mono select-none">
        <div className="w-full max-w-3xl h-full relative">
          <ChatView
            messages={messages}
            choices={choices}
            isTyping={typing}
            onChoose={choose}
            title={callerName}
            footer={
              showStart ? (
                <button
                  onClick={startBiosBoot}
                  className="px-6 py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(0,255,102,0.5)]"
                >
                  <Terminal size={16} />
                  <span>WŁĄCZ SYSTEM OPERACYJNY {activeMission.mission.systemOs || 'HACKERS.OS'}</span>
                </button>
              ) : undefined
            }
          />
        </div>
      </div>
    );
  }

  if (bootStage === 'bios_boot') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080c] p-4 font-mono select-none">
        <div className="w-full max-w-2xl bg-black border-2 border-[#00ff66] rounded-xl p-6 max-h-[92vh] overflow-y-auto flex flex-col justify-between shadow-[0_0_30px_rgba(0,255,102,0.3)] relative">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

          {/* BIOS Text Typewriter */}
          <div className="text-xs text-[#00ff66] space-y-0.5 leading-tight font-mono">
            {biosLines.slice(0, biosLineCount).map((line, idx) => (
              <div key={idx} className={line === '' ? 'h-2' : ''}>
                {line}
              </div>
            ))}
          </div>

          {/* System OS loading bar */}
          {biosLineCount >= biosLines.length && (
            <div className="mt-6 pt-4 border-t border-[#00ff66]/30 flex flex-col items-center space-y-3">
              <div className="text-sm font-black tracking-widest text-[#00ff66] flex items-center space-x-2">
                <ShieldAlert size={18} className="animate-pulse" />
                <span>{activeMission.mission.systemOs || '//HACKERS.OS'}</span>
              </div>

              {/* Segmented green progress bar */}
              <div className="w-64 h-4 bg-[#0a1610] border border-[#00ff66] p-0.5 rounded flex items-center">
                <div
                  className="h-full bg-[#00ff66] transition-all duration-100 shadow-[0_0_10px_#00ff66]"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>

              <div className="text-[0.625rem] text-[#00ff66]/70">
                ŁADOWANIE PAMIĘCI RAM & MODUŁÓW JĄDRA: {bootProgress}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
