import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Briefcase,
  MessageCircle,
  AlertCircle,
  Gauge,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  Lock,
  ImageIcon
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps } from '../../../engine/types/mission';
import type { SocialIntelConfig, SocialPost, SocialPlatformInfo, DeductionOption } from './types';
import { resolveSocialImage, SOCIAL_ASSETS_DIR } from './socialAssets';

type PlatformId = SocialPlatformInfo['id'];

// Ekrany: HUB (3 grafiki platform, odblokowywane po kolei) → ładowanie → FEED (wpisy jeden po drugim).
type Phase =
  | { kind: 'hub' }
  | { kind: 'loading'; platformId: PlatformId }
  | { kind: 'feed'; platformId: PlatformId };

const PLATFORM_ICONS = {
  kneenook: MessageCircle,
  quickgram: Camera,
  joinin: Briefcase
};

const DEFAULT_PLATFORMS: SocialPlatformInfo[] = [
  { id: 'kneenook', name: 'Kneenook', handlePrefix: '', accentColor: '#3b82f6', tagline: 'Platforma społecznościowa' },
  { id: 'quickgram', name: 'Quickgram', handlePrefix: '', accentColor: '#ec4899', tagline: 'Fotorelacje i chwile' },
  { id: 'joinin', name: 'Joinin', handlePrefix: '', accentColor: '#06b6d4', tagline: 'Sieć kontaktów zawodowych' }
];

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** Miejsce na grafikę: plik z assets/social/<name>.*, w dev zastępnik z nazwą brakującego pliku. */
const ImageSlot: React.FC<{
  name: string;
  label: string;
  className: string;
  fallback?: React.ReactNode;
}> = ({ name, label, className, fallback = null }) => {
  const url = resolveSocialImage(name);
  if (url) {
    return <img src={url} alt={label} className={`${className} object-cover relative z-[60]`} draggable={false} />;
  }
  if (!import.meta.env.DEV) return <>{fallback}</>;
  return (
    <div
      className={`${className} border-2 border-dashed border-gray-700 bg-black/40 flex flex-col items-center justify-center text-center p-2 space-y-1`}
    >
      <ImageIcon size={22} className="text-gray-600" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{`GRAFIKA: ${label}`}</span>
      <span className="text-[9px] text-gray-600">{`${SOCIAL_ASSETS_DIR}/${name}.png`}</span>
    </div>
  );
};

export const SocialIntelApp: React.FC<BlockProps<SocialIntelConfig>> = ({
  config,
  onComplete
}) => {
  const purple = '#a855f7';
  const totalRequired = config?.target?.requiredFacts || 8;
  const minPrecision = config?.target?.requiredPrecision || 70;
  const posts = config?.posts || [];
  const platforms = config?.platforms && config.platforms.length > 0 ? config.platforms : DEFAULT_PLATFORMS;
  const target = config?.target || {
    name: 'Anita Klimek',
    role: 'Specjalista ds. Księgowości',
    company: 'PetroLog',
    requiredFacts: 8,
    requiredPrecision: 70
  };
  const initials = target.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const [phase, setPhase] = useState<Phase>({ kind: 'hub' });
  const [postIndexByPlatform, setPostIndexByPlatform] = useState<Partial<Record<PlatformId, number>>>({});
  const [discoveredFactIds, setDiscoveredFactIds] = useState<string[]>([]);
  const [solvedPostIds, setSolvedPostIds] = useState<string[]>([]);
  const [failedOptionIds, setFailedOptionIds] = useState<string[]>([]);
  const [precision, setPrecision] = useState<number>(100);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const postsOf = (pid: PlatformId) => posts.filter((p) => p.platform === pid);
  const isPlatformDone = (pid: PlatformId) => postsOf(pid).every((p) => solvedPostIds.includes(p.id));
  // Platforma odblokowuje się dopiero po przejrzeniu wszystkich poprzednich.
  const isPlatformUnlocked = (idx: number) => platforms.slice(0, idx).every((p) => isPlatformDone(p.id));
  const nextPlatformIdx = platforms.findIndex((p) => !isPlatformDone(p.id));

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

  // Kolejność odpowiedzi losowana przy każdym podejściu (i po resecie), żeby przy powtórce trzeba było czytać.
  const shuffleOptionOrder = () =>
    Object.fromEntries(posts.map((p) => [p.id, shuffle(getDeductionOptions(p).map((o) => o.id))]));
  const [optionOrder, setOptionOrder] = useState<Record<string, string[]>>(shuffleOptionOrder);
  const orderedDeductionOptions = (post: SocialPost) => {
    const order = optionOrder[post.id] || [];
    return [...getDeductionOptions(post)].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  };

  const handleOpenPlatform = (pid: PlatformId) => {
    sounds.playClick();
    setFeedback(null);
    setPhase({ kind: 'loading', platformId: pid });
  };

  const handleBackToHub = () => {
    sounds.playClick();
    setFeedback(null);
    setPhase({ kind: 'hub' });
  };

  const handleNextPost = (pid: PlatformId) => {
    sounds.playClick();
    setFeedback(null);
    setPostIndexByPlatform((prev) => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
  };

  const handleChooseDeduction = (post: SocialPost, opt: DeductionOption) => {
    if (solvedPostIds.includes(post.id) || failedOptionIds.includes(opt.id) || isPrecisionFailed) {
      return;
    }

    if (opt.isCorrect) {
      sounds.playSuccess();
      setSolvedPostIds((prev) => [...prev, post.id]);

      if (post.fact) {
        if (!discoveredFactIds.includes(post.fact.id)) {
          setDiscoveredFactIds((prev) => [...prev, post.fact!.id]);
        }
        setFeedback({
          type: 'success',
          text: opt.feedback || `ZNALEZIONO FAKT: "${post.fact.text}"`
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
          text: `PRECYZJA WYWIADU SPADŁA PONIŻEJ ${minPrecision}%! Zbyt wiele fałszywych wniosków spali naszą operację.`
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
    setPostIndexByPlatform({});
    setOptionOrder(shuffleOptionOrder());
    setPhase({ kind: 'hub' });
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
  const precisionColor = precision >= 80 ? '#00ff66' : precision >= minPrecision ? '#facc15' : '#ff3366';

  // Notatnik faktów — żyje na prawym monitorze przez cały etap (hub i feed), żeby ekran
  // platform mieścił się bez przewijania. Prawy monitor jest wtedy zablokowany na notatniku.
  const factsNotebook = (
    <div className="flex flex-col h-full bg-[#060c14] border-2 rounded-xl p-4 space-y-3" style={{ borderColor: `${purple}66` }}>
      <div className="flex items-center justify-between border-b pb-2 shrink-0" style={{ borderColor: `${purple}40` }}>
        <span className="text-xs font-black tracking-widest" style={{ color: purple }}>
          //NOTATNIK: CO O NIEJ WIEMY
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded border font-mono tracking-wider font-bold"
          style={{
            backgroundColor: isComplete ? '#00ff6620' : `${purple}1a`,
            borderColor: isComplete ? '#00ff66' : `${purple}66`,
            color: isComplete ? '#00ff66' : purple
          }}
        >
          {`${discoveredFactIds.length}/${totalRequired}`}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
        {allFacts.map((fact, idx) => {
          const isFound = discoveredFactIds.includes(fact.id);
          return (
            <div
              key={fact.id || idx}
              className={`p-2 rounded-lg border text-xs flex items-center space-x-2 transition-all ${
                isFound
                  ? 'border-[#00ff66] bg-[#00ff66]/10 text-white animate-in fade-in zoom-in-95'
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
              <span className={`text-[11px] leading-tight ${isFound ? 'text-emerald-200 font-bold' : ''}`}>
                {isFound ? fact.text : '[ ??? ]'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const header = (task: string) => (
    <AppHeader
      icon={Users}
      accent={purple}
      title="//SOCIAL_MEDIA"
      subtitle={`PROFILOWANIE OFIARY: ${target.name.toUpperCase()} (${target.company.toUpperCase()})`}
      task={task}
      aside={
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg border bg-black/40 border-gray-800 flex items-center space-x-2.5">
            <Gauge size={16} style={{ color: precisionColor }} />
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] text-gray-400 space-x-2">
                <span>PRECYZJA WYWIADU:</span>
                <span className="font-black" style={{ color: precisionColor }}>
                  {`${precision}%`}
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${precision}%`, backgroundColor: precisionColor, boxShadow: `0 0 8px ${precisionColor}` }}
                />
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-bold">
              {`MIN ${minPrecision}%`}
            </span>
          </div>

          <span
            className="text-[10px] px-2.5 py-2 rounded-lg border font-mono tracking-wider font-bold"
            style={{
              backgroundColor: isComplete ? '#00ff6620' : `${purple}1a`,
              borderColor: isComplete ? '#00ff66' : `${purple}66`,
              color: isComplete ? '#00ff66' : purple
            }}
          >
            {`FAKTY: ${discoveredFactIds.length}/${totalRequired}`}
          </span>
        </div>
      }
    />
  );

  // ---------------------------------------------------------------------------
  // ŁADOWANIE PLATFORMY
  // ---------------------------------------------------------------------------
  if (phase.kind === 'loading') {
    const platform = platforms.find((p) => p.id === phase.platformId)!;
    return (
      <ModuleLoader
        label={`ŁĄCZENIE Z ${platform.name.toUpperCase()}…`}
        accent={platform.accentColor}
        durationMs={900}
        onDone={() => setPhase({ kind: 'feed', platformId: phase.platformId })}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // FEED PLATFORMY: wpisy jeden po drugim
  // ---------------------------------------------------------------------------
  if (phase.kind === 'feed') {
    const platform = platforms.find((p) => p.id === phase.platformId)!;
    const PlatformIcon = PLATFORM_ICONS[platform.id];
    const platformPosts = postsOf(platform.id);
    const postIdx = Math.min(postIndexByPlatform[platform.id] || 0, platformPosts.length - 1);
    const post = platformPosts[postIdx];
    const isPostSolved = post ? solvedPostIds.includes(post.id) : false;
    const isLastPost = postIdx >= platformPosts.length - 1;

    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        <SideMonitor>{factsNotebook}</SideMonitor>
        {header(
          isPrecisionFailed
            ? 'Za dużo pomyłek. Zacznij analizę od nowa.'
            : !isPostSolved
            ? 'Przeczytaj wpis i wskaż, jaki fakt wywiadowczy z niego wynika.'
            : isLastPost
            ? `${platform.name} przejrzany. Wróć do profili.`
            : 'Dobrze. Przejdź do następnego wpisu.'
        )}

        {post && (
          <div className="flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1 gap-6">
            {/* LEWA POŁOWA: wpis jak w aplikacji platformy, zdjęcie 4:5 dopasowane do wolnego miejsca */}
            <div className="flex items-center justify-center lg:min-h-0 lg:[container-type:size]">
              <div
                className="rounded-xl border overflow-hidden bg-[#08101a]/95 flex flex-col w-full max-w-sm lg:max-w-none lg:max-h-full lg:w-[min(100cqw,calc(80cqh-10rem))]"
                style={{ borderColor: `${platform.accentColor}80` }}
              >
                <div
                  className="px-3 py-1.5 flex items-center justify-between"
                  style={{ backgroundColor: platform.accentColor }}
                >
                  <div className="flex items-center space-x-2 text-white font-black text-sm tracking-wide">
                    <PlatformIcon size={15} />
                    <span>{platform.name}</span>
                  </div>
                  <button
                    onClick={handleBackToHub}
                    className="px-2 py-1 rounded bg-black/25 hover:bg-black/40 text-white text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={12} />
                    <span>PROFILE</span>
                  </button>
                </div>

                <div className="px-3 py-2 flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-[11px] text-white shrink-0"
                    style={{ borderColor: platform.accentColor, backgroundColor: `${platform.accentColor}40` }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{post.handle}</span>
                    <span className="text-[10px] text-gray-500">{post.timestamp}</span>
                  </div>
                </div>

                <div className="px-2 py-1 shrink-0">
                  <ImageSlot name={post.id} label={`wpis ${post.id}`} className="w-full aspect-[4/5] shrink-0" />
                </div>

                <div className="px-3 py-2 space-y-1.5 h-28 shrink-0 overflow-y-auto">
                  <p className="text-sm text-gray-100 leading-snug font-sans">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[11px]" style={{ color: platform.accentColor }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRAWA POŁOWA: analiza wpisu */}
            <div className="flex items-center justify-center">
              <div className="rounded-xl border border-gray-800 bg-[#08101a]/95 p-4 space-y-3 w-full max-w-xl">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ANALIZA WPISU</span>
                  <span className="text-[10px] text-gray-500 font-bold">{`WPIS ${postIdx + 1}/${platformPosts.length}`}</span>
                </div>

                {/* Dedukcja */}
                {!isPrecisionFailed ? (
                  <ChoiceZone accent={purple} label="WYBIERZ ODPOWIEDŹ">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                        <HelpCircle size={14} />
                        <span>JAKI FAKT WYWIADOWCZY WYNIKA Z TEGO WPISU?</span>
                      </span>
                      {orderedDeductionOptions(post).map((opt, optIdx) => {
                        const isOptFailed = failedOptionIds.includes(opt.id);
                        return (
                          <ChoiceTile
                            key={opt.id || optIdx}
                            accent={purple}
                            state={
                              isPostSolved
                                ? opt.isCorrect
                                  ? 'correct'
                                  : 'dimmed'
                                : isOptFailed
                                ? 'wrong'
                                : 'idle'
                            }
                            marker={String.fromCharCode(65 + optIdx)}
                            onClick={() => handleChooseDeduction(post, opt)}
                            className="p-3 items-center"
                          >
                            <span
                              className={`font-sans text-xs leading-snug ${
                                isPostSolved && opt.isCorrect ? 'text-white font-bold' : isOptFailed ? 'text-red-300' : 'text-gray-200'
                              }`}
                            >
                              {opt.text}
                            </span>
                          </ChoiceTile>
                        );
                      })}
                    </div>
                  </ChoiceZone>
                ) : (
                  <div className="p-4 rounded-lg border-2 border-red-500 bg-red-950/30 text-center space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-center space-x-2 text-red-400 font-black text-xs uppercase tracking-wider">
                      <AlertTriangle size={18} />
                      <span>{`PRECYZJA WYWIADU SPADŁA DO ${precision}% (PONIŻEJ PROGU ${minPrecision}%)`}</span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      <strong className="text-red-300">BYTE_MASTER:</strong> Za dużo pomyłek i niesprawdzonych domysłów. Zacznijmy analizę od nowa.
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
                    <span className="font-bold text-[11px] leading-tight font-sans">{feedback.text}</span>
                  </div>
                )}

                {/* Postęp wpisów + dalej */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {platformPosts.map((p, idx) => (
                      <span
                        key={p.id}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: solvedPostIds.includes(p.id)
                            ? '#00ff66'
                            : idx === postIdx
                            ? platform.accentColor
                            : '#1f2937'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => (isLastPost ? handleBackToHub() : handleNextPost(platform.id))}
                    disabled={!isPostSolved}
                    className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center space-x-1.5 transition-all ${
                      isPostSolved
                        ? 'bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.35)] active:scale-95'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{isLastPost ? `ZAKOŃCZ ${platform.name.toUpperCase()}` : 'NASTĘPNY WPIS'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // HUB: trzy platformy po kolei + notatnik faktów
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <SideMonitor>{factsNotebook}</SideMonitor>
      {header(
        isComplete
          ? 'Profil kompletny. Zatwierdź zebrane fakty.'
          : 'Przejrzyj jej profile po kolei. W każdym wpisie wskaż, czego się o niej dowiadujesz.'
      )}

      <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-4 w-full">
        {platforms.map((platform, idx) => {
          const Icon = PLATFORM_ICONS[platform.id];
          const unlocked = isPlatformUnlocked(idx);
          const done = isPlatformDone(platform.id);
          const isNext = idx === nextPlatformIdx;
          const platformPosts = postsOf(platform.id);
          const solvedCount = platformPosts.filter((p) => solvedPostIds.includes(p.id)).length;

          return (
            <button
              key={platform.id}
              disabled={!unlocked}
              onClick={() => handleOpenPlatform(platform.id)}
              className={`relative w-full max-w-[340px] rounded-xl border-2 overflow-hidden text-left transition-all flex flex-col ${
                isNext
                  ? 'cursor-pointer scale-[1.04] hover:scale-[1.06]'
                  : unlocked
                  ? 'cursor-pointer opacity-70 hover:opacity-100'
                  : 'cursor-not-allowed opacity-40 grayscale'
              }`}
              style={{
                borderColor: done ? '#00ff66' : platform.accentColor,
                boxShadow: isNext
                  ? `0 0 0 3px ${platform.accentColor}, 0 0 30px ${platform.accentColor}cc, 0 0 70px ${platform.accentColor}66`
                  : undefined
              }}
            >
              {/* Aktualna platforma: pulsująca ramka i etykieta nad grafiką (z-[70], bo grafiki leżą na z-[60]) */}
              {isNext && (
                <>
                  <span
                    className="absolute inset-0 rounded-[10px] border-[6px] pointer-events-none animate-pulse z-[70]"
                    style={{ borderColor: platform.accentColor, boxShadow: `inset 0 0 25px ${platform.accentColor}` }}
                  />
                  <span
                    className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white whitespace-nowrap pointer-events-none z-[70] flex items-center space-x-1.5"
                    style={{ backgroundColor: platform.accentColor, boxShadow: `0 0 15px ${platform.accentColor}` }}
                  >
                    <ArrowRight size={13} />
                    <span>TERAZ TUTAJ</span>
                  </span>
                </>
              )}
              <ImageSlot
                name={platform.id}
                label={platform.name}
                className="w-full aspect-square"
                fallback={
                  <div
                    className="w-full aspect-square flex items-center justify-center"
                    style={{ backgroundColor: `${platform.accentColor}26`, color: platform.accentColor }}
                  >
                    <Icon size={48} />
                  </div>
                }
              />
              <div className="p-3 bg-[#08101a]/95 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-white block">{platform.name}</span>
                  <span className="text-[10px] text-gray-400">{platform.tagline}</span>
                </div>
                <span
                  className="text-[10px] font-bold flex items-center space-x-1"
                  style={{ color: done ? '#00ff66' : platform.accentColor }}
                >
                  {done ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>PRZEJRZANE</span>
                    </>
                  ) : unlocked ? (
                    <span
                      className={isNext ? 'px-2.5 py-1 rounded text-white font-black' : undefined}
                      style={isNext ? { backgroundColor: platform.accentColor } : undefined}
                    >
                      {solvedCount > 0 ? `WPISY ${solvedCount}/${platformPosts.length}` : 'OTWÓRZ'}
                    </span>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>ZABLOKOWANE</span>
                    </>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="p-3 rounded-lg border-2 border-[#00ff66] bg-[#00ff66]/15 space-y-2 animate-in fade-in">
          <div className="flex items-center space-x-2 text-[#00ff66] text-xs font-bold">
            <CheckCircle2 size={16} />
            <span>INFORMACJE WYWIADOWCZE SKOMPLETOWANE!</span>
          </div>
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
  );
};
