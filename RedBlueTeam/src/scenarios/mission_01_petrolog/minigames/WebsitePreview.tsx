import React from 'react';
import {
  Globe,
  Lock,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  FileText,
  Image,
  FileCode,
  Download,
  Activity,
  UtensilsCrossed,
  CheckCircle2,
  Bug,
  Sparkles,
} from 'lucide-react';

export interface WebsitePreviewProps {
  domainId: string | null;
  domainLabel?: string;
  payloadId?: string | null;
  payloadLabel?: string;
  isPayloadInjected?: boolean;
  isInteractiveTarget?: boolean;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  domainId,
  domainLabel,
  payloadId,
  payloadLabel,
  isPayloadInjected = false,
  isInteractiveTarget = false,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
  className = ''
}) => {
  // Theme definitions for the 3 domains (unified, neutral palettes without right/wrong color cues)
  const getDomainConfig = () => {
    switch (domainId) {
      case 'mufina_org_pl':
        return {
          domainName: domainLabel?.toLowerCase() || 'mufina.org.pl',
          siteTitle: 'MUFINA.ORG.PL',
          tagline: 'Słodkie wypieki, domowe babeczki i tradycyjne ciasta',
          themeColor: '#a78bfa',
          navItems: ['PRZEPISY', 'BABECZKI', 'CIASTA KRUCHE', 'STREFA POBIERANIA'],
          heroTitle: 'Puszyste muffinki z owocami i domowe ciasta',
          heroSubtitle:
            'Proste, sprawdzone receptury na domowe słodkości. Krok po kroku od składników po wypiek.',
          icon: <UtensilsCrossed size={18} className="text-violet-400" />,
          accentBg: 'bg-violet-950/20',
          accentBorder: 'border-violet-500/30',
          accentText: 'text-violet-300',
          badgeText: 'BLOG KULINARNY'
        };
      case 'medikarz_iq':
        return {
          domainName: domainLabel?.toLowerCase() || 'medikarz.iq',
          siteTitle: 'MEDIKARZ.IQ',
          tagline: 'Internetowa Przychodnia Medyczna i Konsultacje Online 24/7',
          themeColor: '#2dd4bf',
          navItems: ['TELEPORADY', 'E-RECEPTA', 'ZWOLNIENIA L4', 'DOKUMENTACJA'],
          heroTitle: 'Konsultacja lekarska i e-recepta w 15 minut',
          heroSubtitle:
            'Całodobowa opieka telemedyczna bez kolejek i skierowań. Zarejestruj wizytę online.',
          icon: <Activity size={18} className="text-teal-400" />,
          accentBg: 'bg-teal-950/20',
          accentBorder: 'border-teal-500/30',
          accentText: 'text-teal-300',
          badgeText: 'PRZYCHODNIA TELEMEDYCZNA'
        };
      case 'dalekbieg_info':
      default:
        return {
          domainName: domainLabel?.toLowerCase() || 'dalekbieg.info',
          siteTitle: 'DALEKBIEG.INFO',
          tagline: 'Portal dla pasjonatów biegów długodystansowych & maratonów',
          themeColor: '#38bdf8',
          navItems: ['PLANY TRENINGOWE', 'DIETA BIEGACZA', 'KALKULATOR TEMPA', 'STREFA POBIERANIA'],
          heroTitle: 'Trenujesz do maratonu? Zbuduj formę na życiówkę!',
          heroSubtitle:
            'Profesjonalne wskazówki dotyczące periodyzacji treningu maratońskiego, regeneracji i porady żywieniowe.',
          icon: <Activity size={18} className="text-sky-400" />,
          accentBg: 'bg-sky-950/20',
          accentBorder: 'border-sky-500/30',
          accentText: 'text-sky-300',
          badgeText: 'PORTAL SPORTOWY'
        };
    }
  };

  const domainCfg = getDomainConfig();

  // Unified payload resource styling across all choices
  const renderPayloadCard = () => {
    if (!payloadId) {
      return (
        <div className="p-3.5 rounded-lg border border-dashed border-gray-700 bg-black/40 text-center space-y-1.5 my-2">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs font-bold font-mono">
            <Download size={14} className="opacity-60" />
            <span>[ STREFA POBIERANIA PLIKÓW ]</span>
          </div>
          <p className="text-[11px] text-gray-500 max-w-md mx-auto font-mono">
            W kolejnym kroku wybierzesz, jaki plik-przynęta zostanie umieszczony na tej stronie dla Anity Klimek.
          </p>
        </div>
      );
    }

    const payloadData = (() => {
      switch (payloadId) {
        case 'guide_running':
          return {
            badge: 'DARMOWY E-BOOK (PDF) • 4.8 MB',
            downloads: 'Pobrano 1,420 razy',
            title: payloadLabel || 'Poradnik dla biegaczy długodystansowych - 10 porad jak poprawić swój wynik',
            desc: 'Kompleksowy poradnik dla osób przygotowujących się do biegów od 10km do maratonu. Wskazówki dotyczące regeneracji, nawadniania i unikania kontuzji.',
            buttonLabel: 'POBIERZ DARMOWY PORADNIK (PDF)',
            icon: <FileText size={20} className={domainCfg.accentText} />
          };
        case 'wallpapers_running':
          return {
            badge: 'PAKIET GRAFIK (ZIP) • 18.2 MB',
            downloads: 'Pobrano 89 razy',
            title: payloadLabel || 'Tapety dla biegaczy na telefon',
            desc: 'Zestaw 12 motywacyjnych grafik wysokiej rozdzielczości z cytatami o sporcie na ekran blokady smartfona.',
            buttonLabel: 'POBIERZ PAKIET TAPET (.ZIP)',
            icon: <Image size={20} className={domainCfg.accentText} />
          };
        case 'guide_muffins':
          return {
            badge: 'DARMOWY E-BOOK (PDF) • 5.4 MB',
            downloads: 'Pobrano 840 razy',
            title: payloadLabel || 'Poradnik kulinarny - 10 sprawdzonych przepisów na domowe muffinki',
            desc: 'Kompleksowy poradnik kulinarny z domowymi recepturami na puszyste babeczki. Wskazówki dotyczące proporcji składników, temperatury pieczenia i dekorowania.',
            buttonLabel: 'POBIERZ DARMOWY PRZEPIS (PDF)',
            icon: <FileText size={20} className={domainCfg.accentText} />
          };
        case 'wallpapers_muffins':
          return {
            badge: 'PAKIET GRAFIK (ZIP) • 14.6 MB',
            downloads: 'Pobrano 52 razy',
            title: payloadLabel || 'Tapety ze słodkimi muffinkami na telefon',
            desc: 'Zestaw 12 estetycznych grafik i fotografii domowych babeczek w wysokiej rozdzielczości na ekran smartfona.',
            buttonLabel: 'POBIERZ PAKIET TAPET (.ZIP)',
            icon: <Image size={20} className={domainCfg.accentText} />
          };
        case 'source_code_muffins':
          return {
            badge: 'KOD ŹRÓDŁOWY (TAR.GZ) • 720 KB',
            downloads: 'Pobrano 2 razy',
            title: payloadLabel || 'Kod źródłowy bloga kulinarnego',
            desc: 'Surowe pliki szablonu bloga PHP/JS, arkusze stylów CSS i skrypty backendu strony internetowej.',
            buttonLabel: 'POBIERZ KOD ŹRÓDŁOWY (.TAR.GZ)',
            icon: <FileCode size={20} className={domainCfg.accentText} />
          };
        case 'source_code':
        default:
          return {
            badge: 'KOD ŹRÓDŁOWY (TAR.GZ) • 850 KB',
            downloads: 'Pobrano 3 razy',
            title: payloadLabel || 'Kod źródłowy strony',
            desc: 'Surowe pliki szablonu HTML, arkusze stylów CSS i skrypty backendu strony internetowej.',
            buttonLabel: 'POBIERZ KOD ŹRÓDŁOWY (.TAR.GZ)',
            icon: <FileCode size={20} className={domainCfg.accentText} />
          };
      }
    })();

    return (
      <div className="p-3.5 rounded-lg border border-gray-700/80 bg-[#0c1422] space-y-2.5 my-2 text-left">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded border ${domainCfg.accentBg} ${domainCfg.accentBorder} ${domainCfg.accentText}`}>
              {payloadData.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                  {payloadData.badge}
                </span>
                <span className="text-[10px] text-gray-400">{payloadData.downloads}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">
                {payloadData.title}
              </h4>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-300 leading-relaxed">
          {payloadData.desc}
        </p>

        {renderDownloadButton(payloadData.buttonLabel)}
      </div>
    );
  };

  const renderDownloadButton = (label: string) => {
    if (!isInteractiveTarget) {
      return (
        <div className="pt-1 flex items-center justify-between font-mono">
          <span className="text-[10px] text-gray-400 flex items-center space-x-1">
            <CheckCircle2 size={12} className={domainCfg.accentText} />
            <span>Plik gotowy do udostępnienia</span>
          </span>
          <button
            type="button"
            className={`px-4 py-2 rounded font-bold text-xs flex items-center space-x-2 ${domainCfg.accentBg} ${domainCfg.accentText} ${domainCfg.accentBorder} border hover:brightness-125 cursor-default`}
          >
            <Download size={14} />
            <span>[ 📥 {label} ]</span>
          </button>
        </div>
      );
    }

    // Interactive target for malware injection (Step 3)
    return (
      <div
        onDragOver={(e) => {
          if (!isPayloadInjected && onDragOver) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            onDragOver(e);
          }
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          if (!isPayloadInjected && onDrop) {
            e.preventDefault();
            onDrop(e);
          }
        }}
        className={`pt-2 transition-all duration-200 font-mono ${isDragOver ? 'scale-105' : ''}`}
      >
        <div
          className={`w-full py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border select-none ${
            isPayloadInjected
              ? 'bg-[#00ff66] text-[#05090f] border-[#00ff66] shadow-[0_0_25px_#00ff66] cursor-default'
              : isDragOver
              ? 'bg-pink-500/30 text-pink-300 border-2 border-pink-500 shadow-[0_0_30px_#ec4899] animate-pulse cursor-copy'
              : `${domainCfg.accentBg} hover:brightness-125 ${domainCfg.accentText} border-dashed ${domainCfg.accentBorder} shadow-lg cursor-default`
          }`}
        >
          {isPayloadInjected ? <Sparkles size={16} /> : isDragOver ? <Bug size={16} /> : <Download size={16} />}
          <span>
            {isPayloadInjected
              ? 'POBIERZ (ZAINFEKOWANY // EXPLOIT ✓)'
              : isDragOver
              ? 'UPUŚĆ TUTAJ, ABY WSTRZYKNĄĆ EXPLOIT!'
              : '[ POBIERZ PLIK ] – UPUŚĆ TUTAJ WIRUSA (PRZECIĄGNIJ)'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl border border-gray-800 bg-[#060c14] overflow-hidden shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* 1. Browser Chrome / Window Top Bar */}
      <div className="bg-[#0b121d] px-3.5 py-2 border-b border-gray-800 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          {/* Traffic light control dots */}
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-gray-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-gray-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-gray-500" />
          </div>

          {/* Active Tab */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-t-md bg-[#060c14] border-t border-x border-gray-700/60 text-[11px] font-mono text-gray-200">
            {domainCfg.icon}
            <span className="font-bold truncate max-w-[180px]">{domainCfg.domainName}</span>
          </div>
        </div>

        {/* Browser Sandbox Tag */}
        <span className="text-[10px] text-gray-500 font-mono hidden sm:inline-block">
          HACKERS.OS // CYBER SANDBOX WEB PREVIEW
        </span>
      </div>

      {/* 2. Browser Navigation & URL Bar */}
      <div className="bg-[#08101a] px-3 py-1.5 border-b border-gray-800 flex items-center space-x-2 select-none">
        <div className="flex items-center space-x-1 text-gray-500">
          <button type="button" className="p-1 hover:text-gray-300 disabled:opacity-30" disabled>
            <ArrowLeft size={13} />
          </button>
          <button type="button" className="p-1 hover:text-gray-300 disabled:opacity-30" disabled>
            <ArrowRight size={13} />
          </button>
          <button type="button" className="p-1 hover:text-gray-300">
            <RefreshCw size={12} />
          </button>
        </div>

        {/* URL Input Box */}
        <div className="flex-1 flex items-center space-x-2 bg-black/60 border border-gray-700/80 rounded px-2.5 py-1 text-xs">
          <div className="flex items-center space-x-1 text-sky-400 shrink-0">
            <Lock size={12} />
            <span className="font-bold text-[11px]">https://</span>
          </div>
          <span className="text-white font-mono font-bold tracking-wide">
            {domainCfg.domainName}
          </span>
          <span className="text-gray-500 font-mono">/download</span>

          <div className="ml-auto hidden sm:flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>SSL SECURE 256-BIT</span>
          </div>
        </div>
      </div>

      {/* 3. Website Viewport Content */}
      <div className="p-4 bg-[#05090f] text-gray-200 space-y-3 font-sans">
        {/* Website Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${domainCfg.accentBg} ${domainCfg.accentBorder} border`}>
              {domainCfg.icon}
            </div>
            <div>
              <h3 className="text-xs font-black tracking-wider text-white font-mono">
                {domainCfg.siteTitle}
              </h3>
              <p className="text-[10px] text-gray-400">{domainCfg.tagline}</p>
            </div>
          </div>

          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${domainCfg.accentBg} ${domainCfg.accentBorder} ${domainCfg.accentText}`}
          >
            {domainCfg.badgeText}
          </span>
        </div>

        {/* Website Navigation Bar */}
        <div className="hidden sm:flex items-center space-x-4 text-[10px] text-gray-400 font-mono border-b border-gray-800/40 pb-2">
          {domainCfg.navItems.map((item, idx) => (
            <span
              key={item}
              className={`hover:text-white cursor-pointer transition-colors ${
                idx === domainCfg.navItems.length - 1
                  ? `${domainCfg.accentText} font-bold underline underline-offset-4`
                  : ''
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Website Hero Banner */}
        <div
          className={`p-3 rounded-lg border ${domainCfg.accentBorder} ${domainCfg.accentBg} space-y-1 text-left relative overflow-hidden`}
        >
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">
            <Sparkles size={12} className={domainCfg.accentText} />
            <span>STREFA POBIERANIA I AKTUALNOŚCI DLA SPOŁECZNOŚCI</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-tight font-mono">
            {domainCfg.heroTitle}
          </h2>
          <p className="text-[11px] text-gray-300 leading-relaxed max-w-xl">
            {domainCfg.heroSubtitle}
          </p>
        </div>

        {/* Downloadable Resource Card (Payload) */}
        {renderPayloadCard()}
      </div>
    </div>
  );
};
