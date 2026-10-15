import React, { useState } from 'react';
import { 
  Mail, 
  Paperclip, 
  CheckCircle2, 
  ArrowRight,
  AtSign,
  Lock
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';

interface SubjectOption {
  id: string;
  label: string;
  points: number;
  isCorrect: boolean;
  isCriticalError?: boolean;
  feedback: string;
}

interface BodyOption {
  id: string;
  label: string;
  text: string;
  points: number;
  isCorrect: boolean;
  isCriticalError?: boolean;
  feedback: string;
}

// Order: Analityk Michał Wilk, Milk CV, CV Michał Wilk (Correct is NOT first!)
const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    id: 'subj_analyst',
    label: 'ANALITYK MICHAŁ WILK',
    points: 5.0,
    isCorrect: false,
    feedback: 'Wskazuje stanowisko, lecz pomija kluczowy znacznik "CV", co może opóźnić otwarcie przez rekrutera.'
  },
  {
    id: 'subj_milk',
    label: 'MILK CV',
    points: 0.0,
    isCorrect: false,
    isCriticalError: true,
    feedback: 'Literówka w nazwisku (Milk zamiast Wilk), brak profesjonalizmu, wysokie ryzyko natychmiastowego odrzucenia.'
  },
  {
    id: 'subj_cv_wilk',
    label: 'CV MICHAŁ WILK',
    points: 11.11,
    isCorrect: true,
    feedback: 'Zgodny z instrukcją rekrutacyjną. Format "CV [Imię Nazwisko]" bez problemu przechodzi przez filtry regułowe skrzynek HR.'
  }
];

// Order: Wariant A, Wariant B, Wariant C
const BODY_OPTIONS: BodyOption[] = [
  {
    id: 'body_no_pwd',
    label: 'WARIANT A',
    text: 'Cześć.\n\nPrzesyłam CV na stanowisko analityka usług energetycznych.\n\nPozdrawiam,\nMichał Wilk',
    points: 4.0,
    isCorrect: false,
    feedback: 'Zbyt swobodny ton oraz brak hasła na załączniku – skanery antywirusowe bramki pocztowej mogą zneutralizować plik.'
  },
  {
    id: 'body_formal',
    label: 'WARIANT B',
    text: 'Dzień dobry.\n\nPrzesyłam CV w związku z rekrutacją na stanowisko Analityka rynków energetycznych.\nHasło do pliku: MWILK.\n\nPozdrawiam,\nMichał Wilk',
    points: 11.11,
    isCorrect: true,
    feedback: 'Formalny styl biznesowy. Szyfrowanie załącznika hasłem uniemożliwia bramkom pocztowym automatyczną detekcję ładunku Ransomware.'
  },
  {
    id: 'body_casual',
    label: 'WARIANT C',
    text: 'Hej.\n\nW załączniku przesyłam cv.\n\nPozdrawiam,\nMichał Wilk',
    points: 0.0,
    isCorrect: false,
    isCriticalError: true,
    feedback: 'Niedopuszczalny ton w korespondencji do sektora infrastruktury krytycznej. Wzbudza natychmiastowe podejrzenia.'
  }
];

export const PhishingMailApp: React.FC = () => {
  const { 
    recordChoice, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(customState.m4_mail_subject || null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(customState.m4_mail_body || null);

  const selectedSubject = SUBJECT_OPTIONS.find(s => s.id === selectedSubjectId);
  const selectedBody = BODY_OPTIONS.find(b => b.id === selectedBodyId);

  const handleSaveAndProceed = () => {
    if (!selectedSubject || !selectedBody) return;

    sounds.playSuccess();
    setCustomState('m4_mail_saved', true);
    setCustomState('m4_mail_subject', selectedSubject.id);
    setCustomState('m4_mail_body', selectedBody.id);

    // Record Step 5 (Subject)
    const isSubjIdeal = selectedSubject.isCorrect;
    const isSubjCritical = !!selectedSubject.isCriticalError;
    const subjOutcome = isSubjIdeal ? 'ideal' : (isSubjCritical ? 'critical' : 'suboptimal');
    const subjPenalty = isSubjIdeal ? 0 : (isSubjCritical ? 11.11 : 6.11);
    const subjBtcPenalty = isSubjIdeal ? 0 : (isSubjCritical ? -0.89 : -0.45);

    recordChoice({
      num: 5,
      question: 'Wybierz temat maila:',
      answer: selectedSubject.label,
      isCorrect: selectedSubject.isCorrect,
      outcome: subjOutcome,
      btcPenalty: subjBtcPenalty,
      details: selectedSubject.feedback
    }, subjPenalty);

    // Record Step 6 (Body)
    const isBodyIdeal = selectedBody.isCorrect;
    const isBodyCritical = !!selectedBody.isCriticalError;
    const bodyOutcome = isBodyIdeal ? 'ideal' : (isBodyCritical ? 'critical' : 'suboptimal');
    const bodyPenalty = isBodyIdeal ? 0 : (isBodyCritical ? 11.11 : 7.11);
    const bodyBtcPenalty = isBodyIdeal ? 0 : (isBodyCritical ? -0.89 : -0.45);

    recordChoice({
      num: 6,
      question: 'Wybierz treść maila:',
      answer: selectedBody.label,
      isCorrect: selectedBody.isCorrect,
      outcome: bodyOutcome,
      btcPenalty: bodyBtcPenalty,
      details: selectedBody.feedback
    }, bodyPenalty);

    // Advance story only if no critical error occurred
    if (subjOutcome !== 'critical' && bodyOutcome !== 'critical') {
      advanceMission4Story('mail_done');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Top Header */}
      <div className="border-b border-[#38bdf8]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#38bdf8]/20 border border-[#38bdf8] text-[#38bdf8]">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//MAIL_CLIENT // KAMPANIA SPEAR-PHISHINGOWA</h2>
            <p className="text-[11px] text-[#38bdf8]">CEL: REKRUTACJA ENERGY ROCK // WEKTOR: ZASZYFROWANE CV Z ŁADUNKIEM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] px-2 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/50 text-[#7dd3fc]">
          <span>KROKI 5 & 6 / 9</span>
        </div>
      </div>

      {/* Target Info Banner */}
      <div className="p-3 rounded-xl bg-[#081524] border border-[#38bdf8]/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-[#7dd3fc]">
          <AtSign size={16} />
          <span className="font-bold">ADRESAT:</span>
          <span className="text-white font-mono">rekrutacja@energyrock.com (HR Dept)</span>
        </div>
        <span className="text-[11px] text-gray-400">
          STANOWISKO: <strong className="text-white">Analityk rynków energetycznych</strong>
        </span>
      </div>

      {/* Step 5: Email Subject */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-gray-300">
          <span>KROK 5: WYBIERZ TEMAT WIADOMOŚCI E-MAIL:</span>
          {selectedSubject && (
            <span className="text-[10px] text-[#7dd3fc]">
              WYBRANO: {selectedSubject.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {SUBJECT_OPTIONS.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedSubjectId(sub.id);
                }}
                className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#38bdf8] bg-[#38bdf8]/20 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'border-gray-800 bg-[#08101a] text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{sub.label}</span>
                  {isSelected && <CheckCircle2 size={15} className="text-[#38bdf8]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 6: Email Body */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-gray-300">
          <span>KROK 6: WYBIERZ TREŚĆ WIADOMOŚCI E-MAIL:</span>
          {selectedBody && (
            <span className="text-[10px] text-[#7dd3fc]">
              WYBRANO: {selectedBody.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {BODY_OPTIONS.map((bod) => {
            const isSelected = selectedBodyId === bod.id;
            return (
              <button
                key={bod.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedBodyId(bod.id);
                }}
                className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#38bdf8] bg-[#38bdf8]/20 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'border-gray-800 bg-[#08101a] text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#7dd3fc]">{bod.label}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-[#38bdf8]" />}
                  </div>
                  <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed opacity-85">
                    {bod.text}
                  </pre>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attachment Box */}
      <div className="p-3 rounded-xl bg-black/50 border border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-gray-300">
          <Paperclip size={16} className="text-[#38bdf8]" />
          <span>ZAŁĄCZNIK:</span>
          <span className="font-bold text-white font-mono">CV_WILK.PDF</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a855f7]/20 border border-[#a855f7] text-[#c084fc] flex items-center space-x-1">
            <Lock size={10} />
            <span>ZASZYFROWANY ŁADUNEK</span>
          </span>
        </div>
        <span className="text-[10px] text-gray-500">ROZMIAR: 2.4 MB</span>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-[11px] text-gray-400">
          {selectedSubject && selectedBody 
            ? 'Mail gotowy. Po zatwierdzeniu przejdziesz do pulpitu, gdzie Byte_Master poinstruuje Cię o routingu VPN.' 
            : 'Wybierz temat oraz treść wiadomości przed kontynuacją.'}
        </div>

        <button
          disabled={!selectedSubjectId || !selectedBodyId}
          onClick={handleSaveAndProceed}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedSubjectId && selectedBodyId
              ? 'bg-[#38bdf8] hover:bg-[#0284c7] text-white shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>ZATWIERDŹ MAILA I PRZEKAŻ DO BYTE_MASTERA</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
