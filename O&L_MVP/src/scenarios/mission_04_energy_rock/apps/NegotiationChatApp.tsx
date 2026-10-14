import React, { useState } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Award, 
  PhoneCall,
  User,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';

interface DialogChoice {
  id: string;
  text: string;
  points: number;
  isCorrect: boolean;
  isCriticalError?: boolean;
  feedback: string;
  nextNode: number;
}

interface DialogNode {
  nodeId: number;
  incomingText: string;
  options: DialogChoice[];
}

// Correct options are NOT always the first ones!
const NODES: DialogNode[] = [
  {
    nodeId: 1,
    incomingText: 'ROZWIĄZUJEMY PROBLEM RANSOMWARE! ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE',
    options: [
      {
        id: 'aggression',
        text: 'NIE BOJĘ SIĘ POLICJI',
        points: 3.0,
        isCorrect: false,
        feedback: 'Pusta agresja bez argumentów technicznych.',
        nextNode: 2
      },
      {
        id: 'surrender',
        text: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM',
        points: 0.0,
        isCorrect: false,
        isCriticalError: true,
        feedback: 'Kapitulacja i rezygnacja z szantażu.',
        nextNode: 2
      },
      {
        id: 'firm_stance',
        text: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ',
        points: 11.11,
        isCorrect: true,
        feedback: 'Rzeczowy argument techniczny paraliżujący decyzyjność ofiary.',
        nextNode: 2
      }
    ]
  },
  {
    nodeId: 2,
    incomingText: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?',
    options: [
      {
        id: 'troll',
        text: 'NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D',
        points: 0.0,
        isCorrect: false,
        feedback: 'Utrata wiarygodności profesjonalnego szantażu.',
        nextNode: 3
      },
      {
        id: 'reveal_motive',
        text: 'CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT',
        points: 0.0,
        isCorrect: false,
        isCriticalError: true,
        feedback: 'Dekonspiracja właściwego celu ataku i zdemaskowanie motywów szpiegowskich.',
        nextNode: 3
      },
      {
        id: 'btc_demand',
        text: 'TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY',
        points: 11.11,
        isCorrect: true,
        feedback: 'Podtrzymanie wiarygodnej przykrywki finansowej.',
        nextNode: 3
      }
    ]
  },
  {
    nodeId: 3,
    incomingText: 'POTRZEBUJEMY CZASU NA ICH ZDOBYCIE',
    options: [
      {
        id: 'give_days',
        text: 'DOBRZE, DAM WAM KILKA DNI',
        points: 0.0,
        isCorrect: false,
        isCriticalError: true,
        feedback: 'Daje ofierze czas na odzyskanie danych z backupów lub kontakt ze śledczymi.',
        nextNode: 4
      },
      {
        id: 'deadline_3h',
        text: 'MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA DO ODSZYFROWANIA',
        points: 11.11,
        isCorrect: true,
        feedback: 'Narzucenie twardego limitu czasu (3h) uniemożliwia ofierze wykonanie analizy śledczej i próby deszyfrowania.',
        nextNode: 4
      }
    ]
  }
];

export const NegotiationChatApp: React.FC = () => {
  const { 
    recordChoice, 
    openApp, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const [currentNodeId, setCurrentNodeId] = useState<number>(customState.m4_neg_node ?? 1);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; isPlayer?: boolean }>>(
    customState.m4_neg_history || [
      { sender: 'SZEF IT ENERGY ROCK', text: NODES[0].incomingText, isPlayer: false }
    ]
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(customState.m4_neg_completed || false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const currentNode = NODES.find(n => n.nodeId === currentNodeId);

  const handleSelectOption = (choice: DialogChoice) => {
    if (isProcessing) return;
    setIsProcessing(true);
    sounds.playClick();

    const updatedMessages = [
      ...messages,
      { sender: 'TY (HAKER)', text: choice.text, isPlayer: true }
    ];
    setMessages(updatedMessages);

    if (choice.nextNode && choice.nextNode <= 3) {
      const nextN = NODES.find(n => n.nodeId === choice.nextNode);
      setTimeout(() => {
        sounds.playClick(1000, 0.03);
        if (nextN) {
          const withReply = [
            ...updatedMessages,
            { sender: 'SZEF IT ENERGY ROCK', text: nextN.incomingText, isPlayer: false }
          ];
          setMessages(withReply);
          setCurrentNodeId(choice.nextNode);
          setCustomState('m4_neg_node', choice.nextNode);
          setCustomState('m4_neg_history', withReply);
        }
        setIsProcessing(false);
      }, 700);
    } else {
      // Conclusion at Node 4
      setTimeout(() => {
        sounds.playSuccess();
        const finalMessages = [
          ...updatedMessages,
          { 
            sender: 'SZEF IT ENERGY ROCK', 
            text: 'ROZUMIEM... PRZYGOTOWUJEMY BITCOINY. TYLKO NIE NISZCZCIE NASZYCH BAZ.', 
            isPlayer: false 
          },
          { 
            sender: 'BYTE_MASTER', 
            text: 'PERFEKCYJNA ROBOTA! Cel osiągnięty – dokumentacja Freevolt jest zabezpieczona na naszym serwerze, a Energy Rock kupiło naszą przykrywkę.', 
            isPlayer: false 
          }
        ];
        setMessages(finalMessages);
        setIsCompleted(true);
        setIsProcessing(false);
        setCustomState('m4_neg_completed', true);
        setCustomState('m4_neg_history', finalMessages);

        // Record Decision 9
        recordChoice({
          num: 9,
          question: 'Negocjacje z ofiarą:',
          answer: choice.id === 'deadline_3h' ? 'Twardy limit 3h i żądanie BTC' : choice.text,
          isCorrect: choice.isCorrect,
          details: choice.feedback
        }, choice.isCorrect ? 0 : (choice.isCriticalError ? 11.11 : 7.11));

        // Advance story: unlocks debrief app, Byte_Master confirms completion
        advanceMission4Story('negotiation_done');
      }, 900);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-hidden p-4 space-y-4">
      {/* Header with Call Status */}
      <div className="border-b border-[#f59e0b]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b]">
            <PhoneCall size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//KANAŁ NEGOCJACYJNY // SZEF IT ENERGY ROCK</h2>
            <p className="text-[11px] text-[#f59e0b]">POŁĄCZENIE AWARYJNE HACKER.OS // KROK 9/9: SFINALIZUJ ROZMOWĘ</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/50 text-[#fde68a]">
            POŁĄCZENIE NA ŻYWO
          </span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#08101a] rounded-xl border border-gray-800">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.isPlayer ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              {msg.isPlayer ? (
                <User size={12} className="text-[#a855f7]" />
              ) : msg.sender.includes('BYTE_MASTER') ? (
                <Bot size={12} className="text-[#10b981]" />
              ) : (
                <ShieldAlert size={12} className="text-[#f59e0b]" />
              )}
              <span className={`text-[10px] font-bold ${
                msg.isPlayer 
                  ? 'text-[#c084fc]' 
                  : msg.sender.includes('BYTE_MASTER') 
                  ? 'text-[#10b981]' 
                  : 'text-[#f59e0b]'
              }`}>
                {msg.sender}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                msg.isPlayer
                  ? 'bg-[#a855f7]/20 border border-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : msg.sender.includes('BYTE_MASTER')
                  ? 'bg-[#10b981]/20 border border-[#10b981] text-[#a7f3d0] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-black/60 border border-gray-700 text-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-[11px] text-gray-400 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span>Szef IT analizuje odpowiedź...</span>
          </div>
        )}
      </div>

      {/* Choice Options or Debrief Link */}
      <div className="pt-2">
        {!isCompleted && currentNode ? (
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              WYBIERZ ODPOWIEDŹ DLA SZEFA IT:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentNode.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isProcessing}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3 text-left text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${
                    isProcessing 
                      ? 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#08101a] border-gray-800 hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 text-gray-200 hover:text-white cursor-pointer'
                  }`}
                >
                  <span>{opt.text}</span>
                  <Send size={14} className="text-[#f59e0b] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => openApp('debrief_app')}
              className="px-6 py-2.5 rounded-xl font-black text-xs uppercase bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center space-x-2 animate-pulse cursor-pointer"
            >
              <Award size={16} />
              <span>ZOBACZ PODSUMOWANIE MISJI (DEBRIEFING SCORM) ➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
