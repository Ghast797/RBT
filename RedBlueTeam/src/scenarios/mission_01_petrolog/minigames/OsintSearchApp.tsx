import React, { useState } from 'react';
import { Search, Lock, Unlock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import type { BlockProps } from '../../../engine/types/mission';
import type { OsintSearchConfig, EmployeeProfile } from './types';
import { resolveOsintImage, OSINT_ASSETS_DIR } from './osintAssets';

export const OsintSearchApp: React.FC<BlockProps<OsintSearchConfig>> = ({
  config,
  onComplete
}) => {
  const blue = '#38bdf8';

  const [query, setQuery] = useState(config.suggestedQuery || 'PETROLOG PRACOWNICY');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  // Kliknięcie karty tylko zaznacza profil; ocena wyboru dopiero po zatwierdzeniu (tak samo dla każdego profilu).
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    sounds.playClick();
    setIsLoadingResults(true);
  };

  const handleLoaderFinish = () => {
    setIsLoadingResults(false);
    setHasSearched(true);
    sounds.playNotification();
  };

  const handleSelectProfile = (profile: EmployeeProfile) => {
    if (isConfirmed) return;
    sounds.playClick();
    setErrorMessage(null);
    setSelectedProfile(profile);
  };

  const handleConfirmSelection = () => {
    if (!selectedProfile) return;
    if (!selectedProfile.isPublic) {
      sounds.playError();
      setSelectedProfile(null);
      setErrorMessage(
        selectedProfile.privacyNotice ||
          "ERROR: MARCELINA SOJKA USTAWIŁA WSZYSTKIE SWOJE SOCIAL MEDIA NA 'PRYWATNE'. NIE MAMY JAK ZDOBYĆ O NIEJ INFORMACJI."
      );
    } else {
      sounds.playSuccess();
      setIsConfirmed(true);
    }
  };

  const task = isLoadingResults
    ? 'Trwa skanowanie sieci…'
    : !hasSearched
    ? 'Wyszukaj pracowników PetroLog: wpisz frazę albo kliknij sugerowane zapytanie.'
    : errorMessage
    ? 'Tego profilu nie da się przeanalizować. Wróć do listy i wybierz inną osobę.'
    : isConfirmed
    ? 'Cel wybrany. Przejdź do analizy jej mediów społecznościowych.'
    : selectedProfile
    ? 'Zatwierdź wybór celu albo zaznacz inny profil.'
    : 'Wybierz pracownika, którego profil przeanalizujesz, i zatwierdź wybór.';

  const handleProceed = () => {
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <AppHeader
        icon={Search}
        accent={blue}
        title="//WYSZUKIWARKA: OSINT"
        subtitle="INDEKSACJA PERSONELU I WERYFIKACJA WIDOCZNOŚCI PROFILI"
        step="SELEKCJA CELU"
        task={task}
      />

      {isLoadingResults ? (
        <ModuleLoader
          label="INDEKSOWANIE PUBLICZNYCH REJESTRÓW I PROFILI SPOŁECZNOŚCIOWYCH..."
          accent={blue}
          onComplete={handleLoaderFinish}
        />
      ) : (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="osint-query-input"
                name="osint-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder={config.searchPlaceholder || 'WPROWADŹ FRAZĘ WYSZUKIWANIA...'}
                aria-label="Wyszukiwanie pracowników PetroLog"
                className="w-full pl-10 pr-4 py-2.5 bg-[#08101a] border border-gray-700 rounded-lg text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#38bdf8] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: blue,
                color: '#05090f',
                boxShadow: `0 0 15px ${blue}4d`
              }}
            >
              <span>SZUKAJ</span>
            </button>
          </form>

          {/* Quick Query Suggestion Chip */}
          {!hasSearched && (
            <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a]/50 text-center space-y-2 my-auto">
              <p className="text-xs text-gray-400">
                Wpisz frazę lub kliknij sugerowane zapytanie, aby przeskanować sieć:
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery(config.suggestedQuery || 'PETROLOG PRACOWNICY');
                  sounds.playClick();
                  setIsLoadingResults(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer"
                style={{
                  backgroundColor: `${blue}15`,
                  borderColor: `${blue}66`,
                  color: blue
                }}
              >
                <span>🔍 {config.suggestedQuery || 'PETROLOG PRACOWNICY'}</span>
              </button>
            </div>
          )}

          {/* Error Message Modal / Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                <AlertTriangle size={18} className="animate-pulse" />
                <span className="tracking-wider">BŁĄD POZYSKIWANIA INFORMACJI</span>
              </div>
              <p className="text-xs text-red-200 leading-relaxed font-mono whitespace-pre-line">
                {errorMessage}
              </p>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                [WRÓĆ DO LISTY PRACOWNIKÓW]
              </button>
            </div>
          )}

          {/* Search Results Display */}
          {hasSearched && !errorMessage && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span>WYNIKI WYSZUKIWANIA ({config.profiles.length}):</span>
              </div>

              <ChoiceZone accent={blue} label="WYBIERZ CEL">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.profiles.map((profile) => {
                  const isSelected = selectedProfile?.id === profile.id;
                  const isChosen = isSelected && isConfirmed;
                  return (
                    <ChoiceTile
                      key={profile.id}
                      accent={blue}
                      state={isChosen ? 'correct' : isSelected ? 'selected' : isConfirmed ? 'dimmed' : 'idle'}
                      markerPosition="corner"
                      onClick={() => handleSelectProfile(profile)}
                      className="p-4 h-full"
                    >
                      <div className="flex flex-col justify-between h-full">
                      <div className="flex gap-3">
                        {/* Zdjęcie pracowniczki: assets/osint/<id profilu>.*; brak pliku = zastępnik */}
                        <div
                          className="relative w-[48%] shrink-0 self-start aspect-[4/5] rounded-lg overflow-hidden border-2 flex items-center justify-center"
                          style={{
                            backgroundColor: profile.isPublic ? '#00ff6614' : '#ff336614',
                            borderColor: profile.isPublic ? '#00ff66' : '#ff3366',
                            color: profile.isPublic ? '#00ff66' : '#ff3366'
                          }}
                        >
                          {resolveOsintImage(profile.id) ? (
                            <img
                              src={resolveOsintImage(profile.id)}
                              alt={profile.name}
                              className="w-full h-full object-cover relative z-[60]"
                              draggable={false}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-2 space-y-1">
                              <span className="font-black text-4xl">{profile.avatarText}</span>
                              {import.meta.env.DEV && (
                                <span className="text-[10px] text-gray-500 leading-tight break-all">
                                  {`${OSINT_ASSETS_DIR}/${profile.id}.png`}
                                </span>
                              )}
                            </div>
                          )}
                          <span
                            className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center space-x-1 backdrop-blur-sm"
                            style={{
                              backgroundColor: profile.isPublic ? '#00ff6633' : '#ff336633',
                              color: profile.isPublic ? '#00ff66' : '#ff3366'
                            }}
                          >
                            {profile.isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                            <span>{profile.isPublic ? 'PUBLICZNY' : 'PRYWATNY'}</span>
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-2.5">
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-wide">{profile.name}</h3>
                            <p className="text-xs text-gray-400">{profile.role}</p>
                            <p className="text-xs text-gray-500">{profile.department}</p>
                          </div>

                          {profile.tags && (
                            <div className="flex flex-wrap content-start items-start gap-1">
                              {profile.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-2 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-gray-800/60 flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[11px]">
                          {profile.isPublic ? 'DOSTĘPNY' : 'ZABLOKOWANY'}
                        </span>
                        <span
                          className="font-bold text-[11px]"
                          style={{ color: isChosen ? '#00ff66' : blue }}
                        >
                          {isChosen ? '✓ CEL ZATWIERDZONY' : isSelected ? '● ZAZNACZONO' : isConfirmed ? '' : 'KLIKNIJ ABY WYBRAĆ ▸'}
                        </span>
                      </div>
                      </div>
                    </ChoiceTile>
                  );
                })}
              </div>
              </ChoiceZone>

              {selectedProfile && !isConfirmed && (
                <div
                  className="p-4 rounded-xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in"
                  style={{ borderColor: blue, backgroundColor: `${blue}14`, boxShadow: `0 0 20px ${blue}33` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: blue, color: '#05090f' }}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wider">
                        ZAZNACZONO: {selectedProfile.name.toUpperCase()} ({selectedProfile.department.toUpperCase()})
                      </h4>
                      <p className="text-[11px]" style={{ color: blue }}>
                        Czy to właściwy cel ataku? Zatwierdź wybór albo zaznacz inny profil.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmSelection}
                    className="w-full sm:w-auto px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 active:scale-95"
                    style={{ backgroundColor: blue, color: '#05090f', boxShadow: `0 0 15px ${blue}80` }}
                  >
                    <span>ZATWIERDŹ WYBÓR CELU</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {selectedProfile && isConfirmed && (
                <div className="p-4 rounded-xl border-2 border-[#00ff66] bg-[#00ff66]/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,255,102,0.2)] animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#00ff66] text-[#05090f] shrink-0">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wider">
                        CEL WYTYPOWANY: {selectedProfile.name.toUpperCase()} ({selectedProfile.department.toUpperCase()})
                      </h4>
                      <p className="text-[11px] text-[#00ff66] leading-relaxed">
                        {selectedProfile.selectionNotice ||
                          'DOBRY WYBÓR! Profil publiczny dostępny w 3 sieciach społecznościowych. Gotowy do analizy faktów.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleProceed}
                    className="w-full sm:w-auto px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.5)] shrink-0"
                  >
                    <span>PRZEJDŹ DO ANALIZY SOCIAL MEDIA</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
