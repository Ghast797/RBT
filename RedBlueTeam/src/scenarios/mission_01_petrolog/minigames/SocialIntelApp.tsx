import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  ArrowRight,
  Camera,
  Briefcase,
  MessageCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Gauge,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { SocialIntelConfig, SocialPost, DeductionOption } from './types';

export const SocialIntelApp: React.FC<BlockProps<SocialIntelConfig>> = ({
  config,
  onComplete
}) => {
  const purple = '#a855f7';
  const totalRequired = config?.target?.requiredFacts || 8;
  const minPrecision = config?.target?.requiredPrecision || 70;
  const posts = config?.posts || [];
  const target = config?.target || {
    name: 'Anita Klimek',
    role: 'Specjalista ds. Księgowości',
    company: 'PetroLog',
    requiredFacts: 8,
    requiredPrecision: 70
  };

  const [activePlatformId, setActivePlatformId] = useState<'kneenook' | 'quickgram' | 'joinin'>('kneenook');
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
  const [discoveredFactIds, setDiscoveredFactIds] = useState<string[]>([]);
  const [solvedPostIds, setSolvedPostIds] = useState<string[]>([]);
  const [failedOptionIds, setFailedOptionIds] = useState<string[]>([]);
  const [precision, setPrecision] = useState<number>(100);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const platformPosts = posts.filter((p) => p.platform === activePlatformId);
  const currentPost: SocialPost | undefined = platformPosts[currentPostIndex] || platformPosts[0];

  const isPrecisionFailed = precision < minPrecision;
  const isComplete = discoveredFactIds.length >= totalRequired && precision >= minPrecision;

  // Fallback deduction options if missing in post config
  const getDeductionOptions = (post: SocialPost): DeductionOption[] => {
    if (post.deductionOptions && post.deductionOptions.length > 0) {
      return post.deductionOptions;
    }
    if (post.fact) {
      return [
        {
          id: `${post.id}_fallback_correct`,
          text: post.fact.text,
          isCorrect: true,
          feedback: `Trafna dedukcja! Znaleziono fakt: ${post.fact.text}`
        },
        {
          id: `${post.id}_fallback_d1`,
          text: 'Brak bezpośredniego związku z profilem zawodowym',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale.'
        },
        {
          id: `${post.id}_fallback_d2`,
          text: 'Niesprawdzona plotka bez dowodów operacyjnych',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale.'
        }
      ];
    }
    return [
      {
        id: `${post.id}_fallback_distractor_correct`,
        text: 'Brak wartości operacyjnej (szum informacyjny / post prywatny)',
        isCorrect: true,
        feedback: 'Trafna ocena! Wpis nie zawiera przydatnych danych operacyjnych.'
      },
      {
        id: `${post.id}_fallback_distractor_d1`,
        text: 'Posiada uprawnienia administratora systemów IT',
        isCorrect: false,
        feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale.'
      },
      {
        id: `${post.id}_fallback_distractor_d2`,
        text: 'Nadzoruje procedury bezpieczeństwa fizycznego',
        isCorrect: false,
        feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale.'
      }
    ];
  };

  const handleSelectPlatform = (pid: 'kneenook' | 'quickgram' | 'joinin') => {
    sounds.playClick();
    setActivePlatformId(pid);
    setCurrentPostIndex(0);
    setFeedback(null);
  };

  const handleNextPost = () => {
    sounds.playClick();
    setFeedback(null);
    setCurrentPostIndex((prev) => (prev + 1) % platformPosts.length);
  };

  const handlePrevPost = () => {
    sounds.playClick();
    setFeedback(null);
    setCurrentPostIndex((prev) => (prev - 1 + platformPosts.length) % platformPosts.length);
  };

  const handleChooseDeduction = (opt: DeductionOption) => {
    if (!currentPost || solvedPostIds.includes(currentPost.id) || failedOptionIds.includes(opt.id) || isPrecisionFailed) {
      return;
    }

    if (opt.isCorrect) {
      sounds.playSuccess();
      setSolvedPostIds((prev) => [...prev, currentPost.id]);

      if (currentPost.fact) {
        if (!discoveredFactIds.includes(currentPost.fact.id)) {
          setDiscoveredFactIds((prev) => [...prev, currentPost.fact!.id]);
        }
        setFeedback({
          type: 'success',
          text: opt.feedback || `ZNALEZIONO FAKT: "${currentPost.fact.text}"`
        });
      } else {
        setFeedback({
          type: 'success',
          text: opt.feedback || 'Trafna ocena! Ten wpis nie zawiera przydatnych informacji operacyjnych (szum).'
        });
      }
    } else {
      sounds.playNotification();
      setFailedOptionIds((prev) => [...prev, opt.id]);
      const newPrecision = Math.max(0, precision - 10);
      setPrecision(newPrecision);

      if (newPrecision < minPrecision) {
        sounds.playAlarm();
        setFeedback({
          type: 'error',
          text: 'PRECYZJA WYWIADU SPADŁA PONIŻEJ 70%! Zbyt wiele fałszywych wniosków spali naszą operację.'
        });
      } else {
        setFeedback({
          type: 'warning',
          text: opt.feedback || 'Nietrafna dedukcja. Zwracaj uwagę na detale, nie zbieraj niesprawdzonych domysłów.'
        });
      }
    }
  };

  const handleResetMinigame = () => {
    sounds.playClick();
    setPrecision(100);
    setDiscoveredFactIds([]);
    setSolvedPostIds([]);
    setFailedOptionIds([]);
    setFeedback(null);
    setCurrentPostIndex(0);
  };

  const platformMeta = {
    kneenook: { icon: MessageCircle, color: '#3b82f6', label: 'Kneenook' },
    quickgram: { icon: Camera, color: '#ec4899', label: 'Quickgram' },
    joinin: { icon: Briefcase, color: '#06b6d4', label: 'Joinin' }
  };

  // Find all facts from config to show slots
  const allFacts = Array.from(
    new Map(
      posts
        .filter((p) => p.fact)
        .map((p) => [p.fact!.id, p.fact!])
    ).values()
  );

  // Precision color badge
  const precisionColor = precision >= 80 ? '#00ff66' : precision >= 70 ? '#facc15' : '#ff3366';

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header with Intel Precision Meter */}
      <div
        className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-widest">//INTEL_SOCIAL_MEDIA</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/40 font-bold">
                DEDUKCJA OPERACYJNA
              </span>
            </div>
            <p className="text-[11px]" style={{ color: purple }}>
              PROFILOWANIE OFIARY: {target.name.toUpperCase()} ({target.company.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Precision Meter and Facts Counter */}
        <div className="flex items-center space-x-3">
          {/* Precision Meter Box */}
          <div className="px-3 py-1.5 rounded-lg border bg-black/40 border-gray-800 flex items-center space-x-2.5">
            <Gauge size={16} style={{ color: precisionColor }} />
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] text-gray-400 space-x-2">
                <span>PRECYZJA WYWIADU:</span>
                <span className="font-black" style={{ color: precisionColor }}>
                  {precision}%
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${precision}%`,
                    backgroundColor: precisionColor,
                    boxShadow: `0 0 8px ${precisionColor}`
                  }}
                />
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-bold">
              MIN 70%
            </span>
          </div>

          {/* Facts count */}
          <span
            className="text-[10px] px-2.5 py-2 rounded-lg border font-mono tracking-wider font-bold flex items-center space-x-1"
            style={{
              backgroundColor: isComplete ? '#00ff6620' : `${purple}1a`,
              borderColor: isComplete ? '#00ff66' : `${purple}66`,
              color: isComplete ? '#00ff66' : purple
            }}
          >
            <span>FAKTY:</span>
            <span className="font-black">{discoveredFactIds.length}/{totalRequired}</span>
          </span>
        </div>
      </div>

      {/* Split-Screen: Left Profile & Collected Facts | Right Social Simulator & Deduction */}
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
                  {target.name}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {target.role} • {target.company}
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
                <span>INFORMACJE WYWIADOWCZE SKOMPLETOWANE!</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Wszystkie 8 kluczowych faktów zebrane z precyzją {precision}%. Pora przygotować spersonalizowaną stronę-pułapkę i maila!
              </p>
              <button
                onClick={() => {
                  sounds.playSuccess();
                  onComplete();
                }}
                className="w-full py-2.5 bg-[#00ff66] text-[#05090f] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95"
              >
                <span>ZATWIERDŹ PROFIL // PRZEJDŹ DALEJ</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Social Media Simulator & Active Deduction (cols 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl border border-gray-800 bg-[#08101a]/95 space-y-3">
          {/* Platform Switcher Tabs */}
          <div className="flex space-x-2 border-b border-gray-800 pb-2">
            {(['kneenook', 'quickgram', 'joinin'] as const).map((pid) => {
              const meta = platformMeta[pid];
              const Icon = meta.icon;
              const isActive = activePlatformId === pid;
              const factsOnPlatform = posts.filter((p) => p.platform === pid && p.fact).length;
              const discoveredOnPlatform = posts.filter(
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
            <div className="flex-1 flex flex-col justify-between p-4 rounded-lg border border-gray-800 bg-[#05090f]/90 space-y-3">
              {/* Post Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
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
                  {solvedPostIds.includes(currentPost.id) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-bold flex items-center space-x-1">
                      <CheckCircle2 size={11} />
                      <span>PRZEANALIZOWANO</span>
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 font-mono">
                    POST {currentPostIndex + 1}/{platformPosts.length}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-2.5 py-1">
                <p className="text-sm text-gray-200 leading-relaxed font-sans">
                  "{currentPost.content}"
                </p>

                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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

              {/* Deduction Section: 3 Tiles */}
              {!isPrecisionFailed ? (
                <div className="pt-2 border-t border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                      <HelpCircle size={13} />
                      <span>JAKI FAKT WYWIADOWCZY WYNIKA Z TEGO WPISU?</span>
                    </span>
                    <span className="text-[10px] text-gray-500">Wskaż trafną dedukcję:</span>
                  </div>

                  <div className="space-y-1.5">
                    {getDeductionOptions(currentPost).map((opt, optIdx) => {
                      const isPostSolved = solvedPostIds.includes(currentPost.id);
                      const isOptFailed = failedOptionIds.includes(opt.id);
                      const isOptCorrect = opt.isCorrect;

                      return (
                        <button
                          key={opt.id || optIdx}
                          disabled={isPostSolved || isOptFailed}
                          onClick={() => handleChooseDeduction(opt)}
                          className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center space-x-2.5 ${
                            isPostSolved
                              ? isOptCorrect
                                ? 'border-[#00ff66] bg-[#00ff66]/15 text-white font-bold'
                                : 'border-gray-800/40 bg-black/20 text-gray-600 opacity-50'
                              : isOptFailed
                              ? 'border-red-500/50 bg-red-950/20 text-red-300 opacity-60 cursor-not-allowed'
                              : 'border-gray-800 bg-black/40 hover:border-purple-500/60 hover:bg-purple-950/20 text-gray-200 cursor-pointer'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isPostSolved && isOptCorrect
                                ? 'bg-[#00ff66] text-[#05090f]'
                                : isOptFailed
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {isPostSolved && isOptCorrect ? '✓' : isOptFailed ? '✗' : String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 font-sans text-[11px] leading-tight">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Precision Failed Screen */
                <div className="p-4 rounded-lg border-2 border-red-500 bg-red-950/30 text-center space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-center space-x-2 text-red-400 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle size={18} />
                    <span>PRECYZJA WYWIADU SPADŁA DO {precision}% (PONIŻEJ PROGU 70%)</span>
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    <strong className="text-red-300">BYTE_MASTER:</strong> Za dużo pomyłek i niesprawdzonych domysłów. W ten sposób narazimy się na dekonspirację przed rozpoczęciem kampanii spear-phishingu. Zacznijmy analizę od nowa.
                  </p>
                  <button
                    onClick={handleResetMinigame}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded transition-all inline-flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95"
                  >
                    <RotateCcw size={14} />
                    <span>ZACZNIJMY ANALIZĘ OD NOWA</span>
                  </button>
                </div>
              )}

              {/* Feedback Banner */}
              {feedback && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 animate-in fade-in ${
                    feedback.type === 'success'
                      ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66]'
                      : feedback.type === 'warning'
                      ? 'border-amber-500/50 bg-amber-950/30 text-amber-300'
                      : 'border-red-500/50 bg-red-950/40 text-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0 text-[#00ff66]" />
                  ) : feedback.type === 'warning' ? (
                    <AlertCircle size={16} className="shrink-0 text-amber-400" />
                  ) : (
                    <AlertTriangle size={16} className="shrink-0 text-red-400" />
                  )}
                  <span className="font-bold text-[11px] leading-tight font-sans">
                    {feedback.text}
                  </span>
                </div>
              )}

              {/* Post Navigation Footer */}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResetMinigame}
                    title="Zresetuj profilowanie i zacznij od nowa"
                    className="px-2.5 py-1.5 rounded border border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-gray-200 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <RotateCcw size={11} />
                    <span>RESET</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
