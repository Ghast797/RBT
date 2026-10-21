import React, { useState } from 'react';
import { Search, Lock, Unlock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { OsintSearchConfig, EmployeeProfile } from './types';

export const OsintSearchApp: React.FC<BlockProps<OsintSearchConfig>> = ({
  config,
  onComplete
}) => {
  const blue = '#38bdf8';

  const [query, setQuery] = useState(config.suggestedQuery || 'PETROLOG PRACOWNICY');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);
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
    sounds.playClick();
    if (!profile.isPublic) {
      sounds.playError();
      setSelectedProfile(null);
      setErrorMessage(
        profile.privacyNotice ||
          "ERROR: MARCELINA SOJKA USTAWIŁA WSZYSTKIE SWOJE SOCIAL MEDIA NA 'PRYWATNE'. NIE MAMY JAK ZDOBYĆ O NIEJ INFORMACJI."
      );
    } else {
      sounds.playSuccess();
      setErrorMessage(null);
      setSelectedProfile(profile);
    }
  };

  const handleProceed = () => {
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div
        className="border-b pb-3 flex items-center justify-between"
        style={{ borderColor: `${blue}4d` }}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${blue}26`, borderColor: blue, color: blue }}
          >
            <Search size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//WYSZUKIWARKA: OSINT</h2>
            <p className="text-[11px]" style={{ color: blue }}>
              INDEKSACJA PERSONELU I WERYFIKACJA WIDOCZNOŚCI PROFILI
            </p>
          </div>
        </div>
        <span
          className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider"
          style={{ backgroundColor: `${blue}1a`, borderColor: `${blue}66`, color: blue }}
        >
          SELEKCJA CELU
        </span>
      </div>

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
            <div className="p-4 rounded-xl border border-dashed border-gray-800 bg-[#08101a]/50 text-center space-y-2 my-auto">
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
              <p className="text-xs text-red-200 leading-relaxed font-mono">
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
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span>WYNIKI WYSZUKIWANIA ({config.profiles.length}):</span>
                <span className="text-[11px] text-[#38bdf8]">
                  WYBIERZ PROFIL DO PROFILOWANIA SOCJOTECHNICZNEGO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.profiles.map((profile) => {
                  const isSelected = selectedProfile?.id === profile.id;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleSelectProfile(profile)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#00ff66] bg-[#00ff66]/15 shadow-[0_0_20px_rgba(0,255,102,0.35)] scale-[1.01]'
                          : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border"
                              style={{
                                backgroundColor: profile.isPublic ? '#00ff6626' : '#ff336626',
                                borderColor: profile.isPublic ? '#00ff66' : '#ff3366',
                                color: profile.isPublic ? '#00ff66' : '#ff3366'
                              }}
                            >
                              {profile.avatarText}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white tracking-wide">
                                {profile.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {profile.role} • {profile.department}
                              </p>
                            </div>
                          </div>

                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center space-x-1"
                            style={{
                              backgroundColor: profile.isPublic ? '#00ff6620' : '#ff336620',
                              color: profile.isPublic ? '#00ff66' : '#ff3366'
                            }}
                          >
                            {profile.isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                            <span>{profile.isPublic ? 'PUBLICZNY' : 'PRYWATNY'}</span>
                          </span>
                        </div>

                        {profile.tags && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
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

                      <div className="pt-4 mt-2 border-t border-gray-800/60 flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[11px]">
                          STATUS INTEL: {profile.isPublic ? 'DOSTĘPNY' : 'ZABLOKOWANY'}
                        </span>
                        <span
                          className="font-bold text-[11px]"
                          style={{ color: isSelected ? '#00ff66' : blue }}
                        >
                          {isSelected ? '✓ WYBRANO CEL' : 'KLIKNIJ ABY SPRAWDZIĆ ▸'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedProfile && selectedProfile.isPublic && (
                <div className="p-4 rounded-xl border-2 border-[#00ff66] bg-[#00ff66]/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,255,102,0.2)] animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#00ff66] text-[#05090f]">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wider">
                        CEL WYTYPOWANY: {selectedProfile.name.toUpperCase()} ({selectedProfile.department.toUpperCase()})
                      </h4>
                      <p className="text-[11px] text-[#00ff66]">
                        Profil publiczny dostępny w 3 sieciach społecznościowych. Gotowy do analizy faktów.
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
