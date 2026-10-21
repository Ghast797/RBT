import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  ArrowRight,
  Camera,
  Briefcase,
  MessageCircle,
  Scan,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { SocialIntelConfig, SocialPost } from './types';

export const SocialIntelApp: React.FC<BlockProps<SocialIntelConfig>> = ({
  config,
  onComplete
}) => {
  const purple = '#a855f7';

  const [activePlatformId, setActivePlatformId] = useState<'kneenook' | 'quickgram' | 'joinin'>('kneenook');
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
  const [discoveredFactIds, setDiscoveredFactIds] = useState<string[]>([]);
  const [scannedPostIds, setScannedPostIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<{
    type: 'success' | 'distractor';
    text: string;
  } | null>(null);

  const platformPosts = config.posts.filter((p) => p.platform === activePlatformId);
  const currentPost: SocialPost | undefined = platformPosts[currentPostIndex] || platformPosts[0];

  const totalRequired = config.target.requiredFacts || 8;
  const isComplete = discoveredFactIds.length >= totalRequired;

  const handleSelectPlatform = (pid: 'kneenook' | 'quickgram' | 'joinin') => {
    sounds.playClick();
    setActivePlatformId(pid);
    setCurrentPostIndex(0);
    setScanFeedback(null);
  };

  const handleScanPost = () => {
    if (!currentPost || isScanning || scannedPostIds.includes(currentPost.id)) return;

    sounds.playClick();
    setIsScanning(true);
    setScanFeedback(null);

    setTimeout(() => {
      setIsScanning(false);
      setScannedPostIds((prev) => [...prev, currentPost.id]);

      if (currentPost.fact) {
        sounds.playSuccess();
        setScanFeedback({
          type: 'success',
          text: `ZNALEZIONO INFORMACJĘ: "${currentPost.fact.text}"`
        });
        if (!discoveredFactIds.includes(currentPost.fact.id)) {
          setDiscoveredFactIds((prev) => [...prev, currentPost.fact!.id]);
        }
      } else {
        sounds.playNotification();
        setScanFeedback({
          type: 'distractor',
          text: currentPost.distractorNotice || 'BRAK PRZYDATNYCH INFORMACJI (ZMYŁKA)'
        });
      }
    }, 700);
  };

  const handleNextPost = () => {
    sounds.playClick();
    setScanFeedback(null);
    setCurrentPostIndex((prev) => (prev + 1) % platformPosts.length);
  };

  const handlePrevPost = () => {
    sounds.playClick();
    setScanFeedback(null);
    setCurrentPostIndex((prev) => (prev - 1 + platformPosts.length) % platformPosts.length);
  };

  const platformMeta = {
    kneenook: { icon: MessageCircle, color: '#3b82f6', label: 'Kneenook' },
    quickgram: { icon: Camera, color: '#ec4899', label: 'Quickgram' },
    joinin: { icon: Briefcase, color: '#06b6d4', label: 'Joinin' }
  };

  // Find all facts from config to show slots
  const allFacts = config.posts
    .filter((p) => p.fact)
    .map((p) => p.fact!);

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div
        className="border-b pb-3 flex items-center justify-between"
        style={{ borderColor: `${purple}4d` }}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${purple}26`, borderColor: purple, color: purple }}
          >
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//INTEL_SOCIAL_MEDIA</h2>
            <p className="text-[11px]" style={{ color: purple }}>
              PROFILOWANIE OFIARY: {config.target.name.toUpperCase()} ({config.target.company.toUpperCase()})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider font-bold"
            style={{
              backgroundColor: isComplete ? '#00ff6620' : `${purple}1a`,
              borderColor: isComplete ? '#00ff66' : `${purple}66`,
              color: isComplete ? '#00ff66' : purple
            }}
          >
            ZEBRANE FAKTY: {discoveredFactIds.length}/{totalRequired}
          </span>
        </div>
      </div>

      {/* Split-Screen: Left Profile & Collected Facts | Right Social Simulator */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* LEFT PANEL: Victim Profile & 8 Trait Slots (cols 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl border border-gray-800 bg-[#08101a]/95 space-y-3">
          {/* Victim Mini-Card */}
          <div className="p-3 rounded-lg border border-gray-800 bg-black/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm"
                style={{ borderColor: purple, color: purple, backgroundColor: `${purple}20` }}
              >
                AK
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  {config.target.name}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {config.target.role} • {config.target.company}
                </p>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold">
              PROFIL PUBLICZNY
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>POSTĘP PROFILOWANIA SOCJOTECHNICZNEGO</span>
              <span className="font-bold" style={{ color: isComplete ? '#00ff66' : purple }}>
                {Math.round((discoveredFactIds.length / totalRequired) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(discoveredFactIds.length / totalRequired) * 100}%`,
                  backgroundColor: isComplete ? '#00ff66' : purple,
                  boxShadow: `0 0 10px ${isComplete ? '#00ff66' : purple}`
                }}
              />
            </div>
          </div>

          {/* 8 Fact Slots List */}
          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {allFacts.map((fact, idx) => {
              const isFound = discoveredFactIds.includes(fact.id);
              return (
                <div
                  key={fact.id || idx}
                  className={`p-2 rounded-lg border text-xs flex items-center space-x-2 transition-all ${
                    isFound
                      ? 'border-[#00ff66] bg-[#00ff66]/10 text-white shadow-[0_0_10px_rgba(0,255,102,0.15)] animate-in fade-in zoom-in-95'
                      : 'border-gray-800/80 bg-black/20 text-gray-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      isFound ? 'bg-[#00ff66] text-[#05090f]' : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {isFound ? '✓' : idx + 1}
                  </span>
                  <span className={`text-[11px] leading-tight font-mono ${isFound ? 'text-emerald-200 font-bold' : ''}`}>
                    {isFound ? fact.text : `[ NIEODKRYTY FAKT #${idx + 1} ]`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Completion Callout */}
          {isComplete && (
            <div className="p-3 rounded-lg border-2 border-[#00ff66] bg-[#00ff66]/15 space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2 text-[#00ff66] text-xs font-bold">
                <CheckCircle2 size={16} />
                <span>INFORMACJE GOTOWE!</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Wszystkie 8 kluczowych cech ofiary zostało zebranych. Czas przygotować stronę internetową z wirusem!
              </p>
              <button
                onClick={() => {
                  sounds.playSuccess();
                  onComplete();
                }}
                className="w-full py-2 bg-[#00ff66] text-[#05090f] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.4)]"
              >
                <span>PRZEJDŹ DALEJ</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Social Media Simulator (cols 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl border border-gray-800 bg-[#08101a]/95 space-y-3">
          {/* Platform Switcher Tabs */}
          <div className="flex space-x-2 border-b border-gray-800 pb-2">
            {(['kneenook', 'quickgram', 'joinin'] as const).map((pid) => {
              const meta = platformMeta[pid];
              const Icon = meta.icon;
              const isActive = activePlatformId === pid;
              const factsOnPlatform = config.posts.filter((p) => p.platform === pid && p.fact).length;
              const discoveredOnPlatform = config.posts.filter(
                (p) => p.platform === pid && p.fact && discoveredFactIds.includes(p.fact.id)
              ).length;

              return (
                <button
                  key={pid}
                  onClick={() => handleSelectPlatform(pid)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'border-transparent text-white shadow-lg'
                      : 'border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isActive ? meta.color : undefined
                  }}
                >
                  <Icon size={14} />
                  <span>{meta.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/30 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {discoveredOnPlatform}/{factsOnPlatform}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Social Post Feed Display */}
          {currentPost && (
            <div className="flex-1 flex flex-col justify-between p-4 rounded-lg border border-gray-800 bg-[#05090f]/90 space-y-4">
              {/* Post Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: platformMeta[activePlatformId].color }}
                  >
                    AK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {currentPost.author}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {currentPost.handle} • {currentPost.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-500 font-mono">
                    POST {currentPostIndex + 1}/{platformPosts.length}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3 my-auto">
                <p className="text-sm text-gray-200 leading-relaxed font-sans">
                  "{currentPost.content}"
                </p>

                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Scan Feedback Banner */}
              {scanFeedback && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 animate-in fade-in ${
                    scanFeedback.type === 'success'
                      ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66]'
                      : 'border-amber-500/50 bg-amber-950/30 text-amber-300'
                  }`}
                >
                  {scanFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0" />
                  )}
                  <span className="font-bold text-[11px]">{scanFeedback.text}</span>
                </div>
              )}

              {/* Post Action Footer */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPost}
                    disabled={platformPosts.length <= 1}
                    className="p-2 rounded border border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextPost}
                    disabled={platformPosts.length <= 1}
                    className="p-2 rounded border border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  onClick={handleScanPost}
                  disabled={isScanning || scannedPostIds.includes(currentPost.id)}
                  className={`px-5 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${
                    scannedPostIds.includes(currentPost.id)
                      ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-default'
                      : 'bg-[#a855f7] text-white hover:bg-[#a855f7]/90 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95'
                  }`}
                >
                  <Scan size={14} className={isScanning ? 'animate-spin' : ''} />
                  <span>
                    {isScanning
                      ? 'SKANOWANIE...'
                      : scannedPostIds.includes(currentPost.id)
                      ? 'PRZESKANOWANO ✓'
                      : 'SKANUJ WPIS OFIARY'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
