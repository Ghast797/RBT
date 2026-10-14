import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  ArrowRight, 
  Check, 
  RefreshCw, 
  Cpu, 
  DollarSign, 
  Clock, 
  Wallet,
  AlertOctagon
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';

type BuilderTab = 'password_generator' | 'extortion_strategy' | 'ransom_note';

export const RansomwareBuilderApp: React.FC = () => {
  const { 
    recordChoice, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const [activeTab, setActiveTab] = useState<BuilderTab>(customState.m4_builder_tab || 'password_generator');

  // Step 2 State: Password Generator
  // Starts at 12 (not 24), slider 8-24, step 1.
  const [passwordLength, setPasswordLength] = useState<number>(customState.m4_pwd_len || 12);
  // All toggles start unchecked (false) by default
  const [useUppercase, setUseUppercase] = useState<boolean>(customState.m4_pwd_upper ?? false);
  const [useLowercase, setUseLowercase] = useState<boolean>(customState.m4_pwd_lower ?? false);
  const [useNumbers, setUseNumbers] = useState<boolean>(customState.m4_pwd_nums ?? false);
  const [useSymbols, setUseSymbols] = useState<boolean>(customState.m4_pwd_syms ?? false);
  const [useNational, setUseNational] = useState<boolean>(customState.m4_pwd_national ?? false);
  const [useSpaces, setUseSpaces] = useState<boolean>(customState.m4_pwd_spaces ?? false);
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [step2Saved, setStep2Saved] = useState<boolean>(customState.m4_step2_saved || false);

  // Step 3 State: Extortion Strategy
  const [extortionChoice, setExtortionChoice] = useState<'yes' | 'no' | null>(customState.m4_extortion_choice || null);
  const [step3Saved, setStep3Saved] = useState<boolean>(customState.m4_step3_saved || false);

  // Step 4 State: Ransom Note (green, white, red - correct red is NOT first)
  const [selectedColor, setSelectedColor] = useState<'green' | 'white' | 'red' | null>(customState.m4_ransom_color || null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isCompiled, setIsCompiled] = useState<boolean>(customState.m4_compiled || false);

  // Generate encryption key string based on parameters
  useEffect(() => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijkmnopqrstuvwxyz';
    if (useNumbers) charset += '23456789';
    if (useSymbols) charset += '!@#$%^&*()_+';
    if (useNational) charset += 'ĄĘŚĆŻŹÓŁń';
    if (useSpaces) charset += ' ';

    if (!charset) charset = '— (WYBIERZ ZESTAW ZNAKÓW) —';

    let result = '';
    if (charset.length > 20) {
      for (let i = 0; i < passwordLength; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    } else {
      result = charset;
    }
    setGeneratedKey(result);
  }, [passwordLength, useUppercase, useLowercase, useNumbers, useSymbols, useNational, useSpaces]);

  // Evaluate Password Strength (1 to 5)
  const evaluatePassword = () => {
    const hasForbidden = useNational || useSpaces;
    const safeGroupsCount = [useUppercase, useLowercase, useNumbers, useSymbols].filter(Boolean).length;

    if (safeGroupsCount === 0) {
      return {
        strength: 1,
        points: 0.0,
        isCorrect: false,
        isCriticalError: true,
        feedback: 'Brak wybranych bezpiecznych zestawów znaków – klucz jest pusty lub niepoprawny.'
      };
    }

    if (hasForbidden || passwordLength < 14 || safeGroupsCount < 2) {
      return {
        strength: Math.max(1, Math.min(3, Math.floor(passwordLength / 7))),
        points: 0.0,
        isCorrect: false,
        isCriticalError: true,
        feedback: 'Hasło podatne na szybki atak słownikowy LUB błąd wykonania skryptu szyfrującego w systemie ofiary (znaki specjalne/spacje).'
      };
    }

    if (passwordLength >= 22 && safeGroupsCount === 4) {
      return {
        strength: 5,
        points: 11.11,
        isCorrect: true,
        isCriticalError: false,
        feedback: 'Maksymalna entropia klucza (24 znaki, pełny bezpieczny zestaw). Zespoły obronne nie mają szans na złamanie hasła brute-forcem.'
      };
    }

    return {
      strength: 4,
      points: 6.0,
      isCorrect: false,
      isCriticalError: false,
      feedback: 'Hasło silne, lecz w sprzyjających warunkach (np. klastry GPU) czas łamania ulega znacznemu skróceniu.'
    };
  };

  const currentEvaluation = evaluatePassword();

  // Save Step 2
  const handleSaveStep2 = () => {
    sounds.playSuccess();
    setStep2Saved(true);
    setCustomState('m4_step2_saved', true);
    setCustomState('m4_pwd_len', passwordLength);
    setCustomState('m4_pwd_upper', useUppercase);
    setCustomState('m4_pwd_lower', useLowercase);
    setCustomState('m4_pwd_nums', useNumbers);
    setCustomState('m4_pwd_syms', useSymbols);
    setCustomState('m4_pwd_national', useNational);
    setCustomState('m4_pwd_spaces', useSpaces);

    recordChoice({
      num: 2,
      question: 'Siła wygenerowanego hasła:',
      answer: `${currentEvaluation.strength}/5 (${passwordLength} znaki, ${useNational || useSpaces ? 'niebezpieczne znaki' : 'bezpieczny charset'})`,
      isCorrect: currentEvaluation.isCorrect,
      details: currentEvaluation.feedback
    }, currentEvaluation.isCorrect ? 0 : (currentEvaluation.isCriticalError ? 11.11 : 5.11));

    setActiveTab('extortion_strategy');
    setCustomState('m4_builder_tab', 'extortion_strategy');
  };

  // Save Step 3
  const handleSaveStep3 = (choice: 'yes' | 'no') => {
    sounds.playClick();
    setExtortionChoice(choice);
    setStep3Saved(true);
    setCustomState('m4_extortion_choice', choice);
    setCustomState('m4_step3_saved', true);

    const isCorrect = choice === 'yes';
    recordChoice({
      num: 3,
      question: 'Czy warto wyłudzić okup?',
      answer: isCorrect ? 'TAK' : 'NIE',
      isCorrect: isCorrect,
      details: isCorrect
        ? 'Stwarza wiarygodną motywację finansową, skupiając uwagę obrońców na ratowaniu operacji bieżących zamiast na audycie wycieku tajemnic technologicznych.'
        : 'Ofiara natychmiast diagnozuje atak celowany (APT / szpiegostwo przemysłowe) i odcina archiwa techniczne Freevolt.'
    }, isCorrect ? 0 : 11.11);

    setActiveTab('ransom_note');
    setCustomState('m4_builder_tab', 'ransom_note');
  };

  // Compile Step 4
  const handleCompileRansomware = async () => {
    if (!selectedColor) return;
    sounds.playClick();
    setIsCompiling(true);

    const isCorrectColor = selectedColor === 'red';
    const isMediumColor = selectedColor === 'white';

    await new Promise((res) => setTimeout(res, 1800));

    sounds.playSuccess();
    setIsCompiling(false);
    setIsCompiled(true);
    setCustomState('m4_compiled', true);
    setCustomState('m4_ransom_color', selectedColor);

    recordChoice({
      num: 4,
      question: 'Wybierz kolor okna i elementów:',
      answer: selectedColor.toUpperCase(),
      isCorrect: isCorrectColor,
      details: isCorrectColor
        ? 'Kolor alarmowy. Maksymalizuje stres psychologiczny ofiary, potęguje poczucie nieodwracalnej awarii i zmusza decydentów do pośpiechu.'
        : isMediumColor
        ? 'Zbyt neutralny, nie budzi poczucia natychmiastowego kryzysu.'
        : 'Kolor kojarzący się z sukcesem i stabilnością. Pracownicy mogą zignorować powiadomienie jako test systemowy.'
    }, isCorrectColor ? 0 : (isMediumColor ? 7.11 : 11.11));

    // Advance story: closes app, returns to desktop, unlocks mail client with badge, Byte_Master guides player in chat
    advanceMission4Story('builder_done');
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-[#a855f7]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7]">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//RANSOMWARE_BUILDER v4.0 // KONFIGURATOR ŁADUNKU</h2>
            <p className="text-[11px] text-[#a855f7]">ARCHITEKTURA SZYFROWANIA RSA-4096 / CHA-CHA20 // KAMUFLAŻ FINANSOWY</p>
          </div>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setActiveTab('password_generator')}
            className={`px-3 py-1 text-[11px] rounded font-bold border transition-all cursor-pointer ${
              activeTab === 'password_generator'
                ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            1. KLUCZ SZYFRUJĄCY {step2Saved && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('extortion_strategy')}
            className={`px-3 py-1 text-[11px] rounded font-bold border transition-all cursor-pointer ${
              activeTab === 'extortion_strategy'
                ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            2. STRATEGIA SZANTAŻU {step3Saved && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('ransom_note')}
            className={`px-3 py-1 text-[11px] rounded font-bold border transition-all cursor-pointer ${
              activeTab === 'ransom_note'
                ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            3. EKRAN OFIARY {isCompiled && '✓'}
          </button>
        </div>
      </div>

      {/* TAB 1: Password Generator (Krok 2) */}
      {activeTab === 'password_generator' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-wider">
              KROK 2: GENERATOR HASŁA I KLUCZA GŁÓWNEGO (MASTER ENCRYPTION KEY)
            </span>
            <span className="text-[10px] text-[#c084fc]">OCENA ENTROPII: {currentEvaluation.strength}/5</span>
          </div>

          {/* Generated Key Display */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-[#a855f7]/40 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <Key size={16} className="text-[#a855f7] shrink-0" />
              <span className="text-xs font-bold text-gray-400 shrink-0">KLUCZ:</span>
              <span className="text-xs sm:text-sm font-bold text-[#e9d5ff] tracking-widest break-all font-mono truncate">
                {generatedKey}
              </span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setPasswordLength(l => l);
              }}
              className="p-1.5 rounded hover:bg-[#a855f7]/20 text-[#a855f7] shrink-0 cursor-pointer ml-2"
              title="Przelicz ponownie"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Slider for Length: 8 to 24 with step 1, starts at 12 */}
          <div className="p-3.5 rounded-xl bg-[#08101a] border border-gray-800 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-300">DŁUGOŚĆ KLUCZA (ZAKRES: 8 - 24 ZNAKI, KROK: 1):</span>
              <span className="text-[#a855f7] text-sm">{passwordLength} ZNAKÓW</span>
            </div>
            <input
              type="range"
              min={8}
              max={24}
              step={1}
              value={passwordLength}
              onChange={(e) => {
                sounds.playKeypress();
                setPasswordLength(parseInt(e.target.value));
              }}
              className="w-full accent-[#a855f7] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>8 (MINIMUM)</span>
              <span>12 (POCZĄTKOWA)</span>
              <span>18</span>
              <span>24 (MAKSIMUM)</span>
            </div>
          </div>

          {/* Character rules switches: NO pre-checked choices, neutral labels without [PUŁAPKA] */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-300">
              ZESTAWY ZNAKÓW I REGUŁY SKŁADNIOWE (ZAZNACZ ODPOWIEDNIE):
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                { label: 'DUŻE LITERY A-Z', val: useUppercase, set: setUseUppercase },
                { label: 'MAŁE LITERY A-Z', val: useLowercase, set: setUseLowercase },
                { label: 'CYFRY 0-9', val: useNumbers, set: setUseNumbers },
                { label: 'ZNAKI SPECJALNE (!@#$%)', val: useSymbols, set: setUseSymbols },
                { label: 'ZNAKI NARODOWE (np. Ą, Ę...)', val: useNational, set: setUseNational },
                { label: 'BIAŁE ZNAKI (np. SPACJA)', val: useSpaces, set: setUseSpaces },
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    item.set(!item.val);
                  }}
                  className={`p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    item.val
                      ? 'bg-[#a855f7]/20 border-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-[#08101a] border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="font-bold">{item.label}</span>
                  {item.val ? <Check size={14} className="text-[#c084fc]" /> : <span className="text-[10px] text-gray-600">NIE</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Strength Bar */}
          <div className="p-3.5 rounded-xl bg-[#090f18] border border-gray-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">SIŁA HASŁA W AUDYCIE KRYPTOGRAFICZNYM:</span>
              <span className={`font-bold ${
                currentEvaluation.strength === 5 ? 'text-[#10b981]' : currentEvaluation.strength === 4 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
              }`}>
                {currentEvaluation.strength}/5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 h-2.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`rounded-full transition-all ${
                    lvl <= currentEvaluation.strength
                      ? currentEvaluation.strength === 5 
                        ? 'bg-[#10b981]' 
                        : currentEvaluation.strength === 4 
                        ? 'bg-[#f59e0b]' 
                        : 'bg-[#ef4444]'
                      : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveStep2}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center space-x-2 cursor-pointer"
            >
              <span>ZAPISZ KLUCZ I PRZEJDŹ DO STRATEGII SZANTAŻU</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Extortion Strategy (Krok 3) - Options shuffled, NIE first, TAK second */}
      {activeTab === 'extortion_strategy' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-gray-800 pb-2">
            <span className="text-xs font-bold text-white tracking-wider">
              KROK 3: STRATEGIA OPERACYJNA – CZY WARTO WYŁUDZIĆ OKUP?
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#08101a] border border-[#a855f7]/30 text-xs text-gray-300 leading-relaxed">
            <span className="text-[#c084fc] font-bold">WYTYCZNA BYTE_MASTERA: </span>
            Prawdziwym celem misji jest kradzież tajnych plików technologii <span className="text-white font-bold">FREEVOLT</span>. 
            Czy powinniśmy zażądać okupu w Bitcoinach jako zasłony dymnej?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Option NIE (first) */}
            <div
              data-extortion="no"
              onClick={() => handleSaveStep3('no')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                extortionChoice === 'no'
                  ? 'border-[#a855f7] bg-[#a855f7]/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'border-gray-800 bg-[#08101a] hover:border-gray-600 hover:bg-[#0c1624]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 px-2 py-0.5 rounded bg-black/40">
                    WARIANT 1
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">
                  NIE – SKUP SIĘ TYLKO NA KRADZIEŻY PLIKÓW
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Blokujemy pliki bez kontaktu z ofiarą i bez żądania Bitcoinów, po cichu pobierając dokumentację technologii Freevolt.
                </p>
              </div>

              {extortionChoice === 'no' && (
                <div className="mt-4 pt-3 border-t border-[#a855f7]/30 text-xs font-bold text-[#c084fc] flex items-center space-x-1.5">
                  <Check size={16} />
                  <span>WYBRANO</span>
                </div>
              )}
            </div>

            {/* Option TAK (second) */}
            <div
              data-extortion="yes"
              onClick={() => handleSaveStep3('yes')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                extortionChoice === 'yes'
                  ? 'border-[#a855f7] bg-[#a855f7]/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'border-gray-800 bg-[#08101a] hover:border-gray-600 hover:bg-[#0c1624]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 px-2 py-0.5 rounded bg-black/40">
                    WARIANT 2
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">
                  TAK – WYŁUDŹ OKUP W BITCOINACH JAKO PRZYKRYWKĘ
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Zaszyfrujemy bazy i zażądamy 200 000 USD w BTC. Zarząd Energy Rock skupi całe swoje siły na gaszeniu pożaru operacyjnego i negocjacjach finansowych, nie orientując się o kradzieży dokumentacji Freevolt.
                </p>
              </div>

              {extortionChoice === 'yes' && (
                <div className="mt-4 pt-3 border-t border-[#a855f7]/30 text-xs font-bold text-[#c084fc] flex items-center space-x-1.5">
                  <Check size={16} />
                  <span>WYBRANO</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Ransom Note Design (Krok 4) - Colors: ZIELONY, BIAŁY, CZERWONY */}
      {activeTab === 'ransom_note' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-gray-800 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-wider">
              KROK 4: PROJEKTOWANIE EKRANU OKUPU DLA OFIARY
            </span>
            <span className="text-[10px] text-[#c084fc]">INTERFEJS SZANTAŻU</span>
          </div>

          {/* Color Selection Buttons: Green, White, Red (Red is NOT first!) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-300">
              WYBIERZ KOLOR OKNA I ELEMENTÓW INTERFEJSU SZANTAŻU:
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'green', name: 'ZIELONY', colorClass: 'border-green-600 bg-green-950/40 text-green-300', dot: 'bg-green-500' },
                { id: 'white', name: 'BIAŁY', colorClass: 'border-gray-400 bg-gray-900/40 text-gray-200', dot: 'bg-white' },
                { id: 'red', name: 'CZERWONY', colorClass: 'border-red-600 bg-red-950/40 text-red-300', dot: 'bg-red-500' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedColor(c.id as any);
                  }}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    selectedColor === c.id
                      ? `${c.colorClass} shadow-[0_0_15px_currentColor]`
                      : 'border-gray-800 bg-[#08101a] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                    <span className="font-bold text-xs">{c.name}</span>
                  </div>
                  {selectedColor === c.id && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview of Ransom Note */}
          <div className={`p-5 rounded-2xl border-4 transition-all duration-300 ${
            selectedColor === 'red'
              ? 'bg-[#180404] border-red-600 text-red-100 shadow-[0_0_35px_rgba(220,38,38,0.5)]'
              : selectedColor === 'green'
              ? 'bg-[#021808] border-green-600 text-green-100 shadow-[0_0_35px_rgba(22,163,74,0.5)]'
              : selectedColor === 'white'
              ? 'bg-[#121214] border-gray-400 text-gray-100 shadow-[0_0_25px_rgba(200,200,200,0.3)]'
              : 'bg-black/60 border-gray-800 text-gray-400'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/30">
              <div className="flex items-center space-x-2">
                <AlertOctagon size={24} className="animate-pulse" />
                <h2 className="text-sm md:text-base font-black tracking-widest uppercase">
                  TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-current">
                ENERGY ROCK CORP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
                <DollarSign size={24} />
                <div>
                  <div className="text-[10px] opacity-70">KWOTA OKUPU (BTC):</div>
                  <div className="text-base font-black tracking-wider">$ 200 000</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
                <Clock size={24} className="animate-pulse" />
                <div>
                  <div className="text-[10px] opacity-70">POZOSTAŁY CZAS:</div>
                  <div className="text-base font-black tracking-widest font-mono">00:30:00:00</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
                <Wallet size={24} />
                <div>
                  <div className="text-[10px] opacity-70">ADRES PORTFELA:</div>
                  <div className="text-xs font-mono font-bold">XKAJI023KJDF93</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-current/30">
              <p className="text-xs opacity-80">
                Wszystkie bazy danych, dokumentacja i kopie bezpieczeństwa zostały zablokowane kluczem RSA-4096.
              </p>
              <button className="px-5 py-2 rounded-lg font-black text-xs uppercase bg-current text-black tracking-wider">
                NAPISZ DO NAS
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {selectedColor ? 'Wybierz kolor i skompiluj ostateczny ładunek.' : 'Wybierz kolor okna szantażu przed kompilacją.'}
            </span>

            <button
              disabled={!selectedColor || isCompiling}
              onClick={handleCompileRansomware}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                selectedColor && !isCompiling
                  ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isCompiling ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>KOMPILACJA ŁADUNKU W TOKU...</span>
                </>
              ) : (
                <>
                  <Cpu size={14} />
                  <span>KOMPILUJ ŁADUNEK RANSOMWARE</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
