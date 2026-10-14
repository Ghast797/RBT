import React, { useState } from 'react';
import { 
  Server, 
  Lock, 
  FileText, 
  Download, 
  AlertOctagon, 
  Flame, 
  Check, 
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';

interface FileItem {
  name: string;
  type: 'freevolt' | 'decoy' | 'honeypot';
  size: string;
}

// 10 files pool - thoroughly INTERSPERSED (Freevolt files are NOT the first 3 files!)
const FILES_POOL: FileItem[] = [
  { name: 'WYPOWIEDZENIE.PDF', type: 'decoy', size: '1.2 MB' },
  { name: 'FREEVOLT_SCHEMAT.PDF', type: 'freevolt', size: '28.6 MB' }, // Freevolt 1
  { name: 'MAREK.JPG', type: 'decoy', size: '4.8 MB' },
  { name: 'SEKRET.TXT', type: 'honeypot', size: '12 KB' },
  { name: 'ENERGIA_FVOLT.KCF', type: 'freevolt', size: '8.4 MB' },   // Freevolt 2
  { name: 'KONTRAKTY.XCF', type: 'decoy', size: '19.1 MB' },
  { name: 'WAZNE_DANE.DOCX', type: 'honeypot', size: '45 KB' },
  { name: 'FVOLT_TECH.DOCX', type: 'freevolt', size: '14.2 MB' },     // Freevolt 3
  { name: 'MATERIALY.TXT', type: 'decoy', size: '240 KB' },
  { name: 'UMOWA2022.PDF', type: 'decoy', size: '2.1 MB' }
];

export const WorkstationExfiltrationApp: React.FC = () => {
  const { 
    recordChoice, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const [isEncrypted, setIsEncrypted] = useState<boolean>(customState.m4_station_encrypted || false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(customState.m4_exfil_files || []);
  const [isExfiltrating, setIsExfiltrating] = useState<boolean>(false);
  const [showRansomNoteFlash, setShowRansomNoteFlash] = useState<boolean>(false);

  const handleEncryptNetwork = () => {
    sounds.playAlarm();
    setIsEncrypted(true);
    setCustomState('m4_station_encrypted', true);
  };

  const toggleFile = (fileName: string) => {
    sounds.playClick();
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(selectedFiles.filter(f => f !== fileName));
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const handleExfiltrate = async () => {
    sounds.playClick();
    setIsExfiltrating(true);

    await new Promise((res) => setTimeout(res, 2000));

    // Evaluate choice 8
    const freevoltSelected = selectedFiles.filter(f => 
      ['FVOLT_TECH.DOCX', 'FREEVOLT_SCHEMAT.PDF', 'ENERGIA_FVOLT.KCF'].includes(f)
    );
    const nonFreevoltSelected = selectedFiles.filter(f => 
      !['FVOLT_TECH.DOCX', 'FREEVOLT_SCHEMAT.PDF', 'ENERGIA_FVOLT.KCF'].includes(f)
    );

    const isAllFreevolt = freevoltSelected.length === 3;
    const hasExtras = nonFreevoltSelected.length > 0;

    let isCorrect = false;
    let points = 0.0;
    let feedback = '';

    if (isAllFreevolt && !hasExtras) {
      isCorrect = true;
      points = 11.11;
      feedback = 'Pobrano kompletny zestaw dokumentacji technologii Freevolt (3 pliki) bez pozostawiania śladów w logach.';
    } else if (isAllFreevolt && hasExtras) {
      points = 6.0;
      feedback = 'Generowanie niepotrzebnego transferu sieciowego – pobrano pliki Freevolt, lecz także zbędne pliki decoy/honeypot.';
    } else {
      points = 0.0;
      feedback = 'Główny cel zlecenia nie został osiągnięty – brakujące kluczowe pliki technologii Freevolt.';
    }

    recordChoice({
      num: 8,
      question: 'Wybór plików do kradzieży:',
      answer: `Pobrano ${selectedFiles.length} plików (${freevoltSelected.length}/3 Freevolt, ${nonFreevoltSelected.length} zbędnych)`,
      isCorrect: isCorrect,
      details: feedback
    }, isCorrect ? 0 : (points === 0 ? 11.11 : 5.11));

    setCustomState('m4_exfil_done', true);
    setCustomState('m4_exfil_files', selectedFiles);

    // Show Ransomware Note Flash on screen as IT Chief emergency call comes in!
    sounds.playAlarm();
    setShowRansomNoteFlash(true);

    await new Promise((res) => setTimeout(res, 2200));

    // Advance story: closes app, returns to desktop, unlocks negotiation chat with incoming call alert, Byte_Master guides player in chat
    advanceMission4Story('workstation_done');
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4 relative">
      {/* Ransomware Note Flash Overlay */}
      {showRansomNoteFlash && (
        <div className="absolute inset-0 z-50 bg-[#1c0202] border-4 border-red-600 rounded-xl p-6 flex flex-col justify-between items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="flex items-center space-x-3 text-red-500 animate-pulse">
            <AlertOctagon size={48} />
            <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
              TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!
            </h1>
            <AlertOctagon size={48} />
          </div>

          <div className="p-4 bg-black/60 border border-red-600 rounded-xl max-w-lg w-full text-red-200 space-y-2">
            <p className="text-sm font-bold">
              SYSTEMY ENERGY ROCK WYŁĄCZONE. SERWERY SPARALIŻOWANE.
            </p>
            <div className="p-3 bg-red-950/80 rounded border border-red-500 flex items-center justify-center space-x-3 text-amber-300 animate-bounce">
              <PhoneCall size={20} className="animate-spin" />
              <span className="text-xs font-black uppercase">
                POŁĄCZENIE PRZYCHODZĄCE: SZEF DZIAŁU IT ENERGY ROCK...
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Przekierowywanie do pulpitu i otwieranie szyfrowanego kanału negocjacji...
            </p>
          </div>

          <div className="text-xs text-red-400 font-bold tracking-wider">
            //HACKER.OS // KANAŁ ALARMOWY AKTYWNY
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#ef4444]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444]">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//STACJA OFIARY // ENERGY_ROCK_01_PC</h2>
            <p className="text-[11px] text-[#ef4444]">IP DOCELOWE: 151.89.159.52 // KROK 8: SZYFROWANIE I EKSFILTRACJA FREEVOLT</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#ef4444]/15 border border-[#ef4444]/50 text-[#fca5a5]">
          KROK 8
        </span>
      </div>

      {/* PHASE 1: Ransomware Trigger Banner (FIRST!) */}
      {!isEncrypted ? (
        <div className="p-5 rounded-xl bg-[#1c0808] border-2 border-[#ef4444] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-in fade-in duration-200">
          <div className="flex items-center space-x-3.5">
            <Flame size={32} className="text-[#ef4444] animate-pulse shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                KROK 8A: ŁADUNEK RANSOMWARE W PAMIĘCI RAM STACJI ROBOCZEJ
              </h3>
              <p className="text-[11px] text-gray-300 mt-1">
                Najpierw uruchom procedurę szyfrowania zasobów firmy, aby sparaliżować serwery i stworzyć zasłonę dymną.
              </p>
            </div>
          </div>
          <button
            onClick={handleEncryptNetwork}
            className="px-6 py-3 rounded-xl font-black text-xs uppercase bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_0_20px_#ef4444] flex items-center space-x-2 shrink-0 animate-bounce cursor-pointer transition-all"
          >
            <Lock size={16} />
            <span>SZYFRUJ ZASOBY FIRMY</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-600 text-red-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 font-bold">
            <Lock size={16} className="text-red-400" />
            <span>SERWERY ZASZYFROWANE KLUCZEM RSA! SYSTEMY FIRMY SPARALIŻOWANE.</span>
          </div>
          <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">
            ZASŁONA DYMNA AKTYWNA
          </span>
        </div>
      )}

      {/* PHASE 2: Exfiltration Selection (LOCKED UNTIL ENCRYPTED) */}
      {isEncrypted ? (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span>KROK 8B: WYBIERZ DOKŁADNIE 3 PLIKI TECHNOLOGII 'FREEVOLT' DO KRADZIEŻY:</span>
            <span className="text-[#a855f7]">
              WYBRANO: {selectedFiles.length} PLIKÓW
            </span>
          </div>

          {/* Mixed Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {FILES_POOL.map((file) => {
              const isSelected = selectedFiles.includes(file.name);
              return (
                <div
                  key={file.name}
                  data-file-name={file.name}
                  onClick={() => !isExfiltrating && toggleFile(file.name)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#a855f7] bg-[#a855f7]/20 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'border-gray-800 bg-[#08101a] text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText size={18} className={isSelected ? 'text-[#a855f7]' : 'text-gray-500'} />
                    <div className="truncate">
                      <span className="text-xs font-bold font-mono block truncate">{file.name}</span>
                      <span className="text-[10px] text-gray-500">{file.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#a855f7] text-white flex items-center justify-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800 text-center text-xs text-gray-500 space-y-2">
          <Lock size={24} className="mx-auto text-gray-600" />
          <p>[MODUŁ EKSFILTRACJI ZABLOKOWANY: NAJPIERW URUCHOM PROCEDURĘ SZYFROWANIA ZASOBÓW POWYŻEJ]</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {isEncrypted 
            ? 'Pobranie plików wyświetli komunikat o okupie i zainicjuje kontakt z szefem IT.' 
            : 'Wymagane: Szyfrowanie serwerów.'}
        </span>

        <button
          disabled={!isEncrypted || selectedFiles.length === 0 || isExfiltrating}
          onClick={handleExfiltrate}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            isEncrypted && selectedFiles.length > 0 && !isExfiltrating
              ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isExfiltrating ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>EKSFILTRACJA W TOKU...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>POBIERZ PLIKI I ZAINICJUJ NEGOCJACJE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
