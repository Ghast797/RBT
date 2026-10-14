import React, { useState } from 'react';
import { Lock, X, ChevronRight, Phone, Mail, Sparkles, Building2, User, Camera } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';

export const TorBrowserApp: React.FC = () => {
  const {
    activeMission,
    inspectEmployee,
    selectedEmployeeId,
    closeApp,
    chatStage,
    hasViewedEvents,
    viewEventsTab
  } = useMissionStore();

  const [activeTab, setActiveTab] = useState<'home' | 'events'>('home');

  const site = activeMission.step2?.browser || {
    url: 'https://olcompany.cloud',
    title: 'O&L COMPANY',
    heroHeadline: '',
    heroSubheadline: '',
    contact: { phone: '', email: '' },
    employees: [],
    news: []
  };
  const isEventsHighlighted = chatStage === 'awaiting_events' && !hasViewedEvents;

  return (
    <div className="flex flex-col h-full bg-[#04080e] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl">
      {/* Top Browser Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#09121c] border-b border-[#00ff66]/30 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] font-bold text-[11px]">
            <Lock size={12} />
            <span>HTTPS://OLCOMPANY.CLOUD</span>
          </div>
          <span className="text-[10px] text-[#00ff66]/60 hidden sm:inline">TOR ONION ROUTER // SSL VERIFIED</span>
        </div>

        <button
          onClick={closeApp}
          className="p-1 hover:bg-[#ff3366]/20 text-[#00ff66] hover:text-[#ff3366] rounded transition-colors"
          title="Zamknij przeglądarkę i wróć do pulpitu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Website Navigation Header (matching strona_O&L1.png) */}
      <div className="px-4 py-3 bg-[#0e1d2e] border-b border-blue-900/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-wider">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Building2 size={16} />
          </div>
          <span className="text-blue-300 font-black">O&L COMPANY</span>
        </div>

        <div className="flex items-center space-x-2.5 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 font-black transition-all flex items-center space-x-2 ${
              activeTab === 'home'
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
                : 'bg-blue-950/70 border-blue-800/60 text-blue-200 hover:bg-blue-900/80 hover:border-blue-500'
            }`}
          >
            <Building2 size={15} />
            <span>STRONA GŁÓWNA</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('events');
              viewEventsTab();
            }}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 font-black transition-all flex items-center space-x-2 relative ${
              isEventsHighlighted
                ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66] ring-4 ring-[#00ff66]/60 shadow-[0_0_25px_#00ff66] animate-pulse scale-105'
                : activeTab === 'events'
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
                : 'bg-blue-950/70 border-blue-800/60 text-blue-200 hover:bg-blue-900/80 hover:border-blue-500'
            }`}
          >
            <Camera size={15} className={isEventsHighlighted ? 'text-[#00ff66] animate-bounce' : 'text-[#00ff66]'} />
            <span>WYDARZENIA</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border animate-pulse ${
              isEventsHighlighted
                ? 'bg-[#00ff66] text-[#05080c] border-[#00ff66] shadow-[0_0_10px_#00ff66]'
                : 'bg-[#00ff66]/20 border-[#00ff66]/70 text-[#00ff66]'
            }`}>
              {isEventsHighlighted ? '[KLIKNIJ TUTAJ!]' : '[FOTORELACJE]'}
            </span>
          </button>
        </div>
      </div>

      {/* Website Body Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs text-[#d1fae5]">
        {activeTab === 'home' ? (
          <div className="space-y-4">
            {/* Refinery Hero Banner (vector SVG depiction) */}
            <div className="relative w-full h-36 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-lg overflow-hidden border border-blue-800/40 flex items-center justify-center">
              <svg viewBox="0 0 500 140" className="w-full h-full opacity-60">
                {/* Factory Silhouettes */}
                <rect x="60" y="30" width="35" height="110" fill="#1e293b" />
                <rect x="110" y="50" width="25" height="90" fill="#334155" />
                <line x1="77" y1="30" x2="77" y2="10" stroke="#94a3b8" strokeWidth="3" />
                <rect x="200" y="60" width="60" height="80" rx="6" fill="#1e293b" />
                <rect x="280" y="40" width="30" height="100" fill="#334155" />
                <line x1="295" y1="40" x2="295" y2="15" stroke="#ef4444" strokeWidth="2" />
                {/* Towers and Pipe structures */}
                <line x1="60" y1="80" x2="200" y2="80" stroke="#475569" strokeWidth="4" />
                <line x1="260" y1="90" x2="400" y2="90" stroke="#475569" strokeWidth="4" />
              </svg>

              {/* O&L Watermark in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-black text-white/30 tracking-widest flex items-center space-x-2">
                  <span>⚙ O&L</span>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="text-center space-y-1 py-1">
              <h3 className="font-black text-xs text-blue-200 tracking-wider">
                {site.heroHeadline}
              </h3>
              <p className="text-[11px] text-gray-400">
                {site.heroSubheadline}
              </p>
            </div>

            {/* NASI EKSPERCI Section */}
            <div className="space-y-3 pt-2">
              <div className="font-black text-sm text-[#00ff66] tracking-wider border-b border-[#00ff66]/30 pb-1">
                NASI EKSPERCI:
              </div>

              <div className="space-y-2">
                {site.employees.map((emp: any) => {
                  const isExpanded = selectedEmployeeId === emp.id;
                  return (
                    <div
                      key={emp.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isExpanded
                          ? 'bg-[#0a1624] border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                          : 'bg-[#08101a] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Avatar icon */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ backgroundColor: emp.avatarBg }}
                          >
                            <User size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white tracking-wide">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium">
                              - {emp.role}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => inspectEmployee(emp.id)}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 transition-all ${
                            isExpanded
                              ? 'bg-[#00f0ff] text-[#05080c]'
                              : 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/30'
                          }`}
                        >
                          <span>PRZECZYTAJ</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      {/* Expanded Bio Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-gray-300 leading-relaxed space-y-1">
                          <p>{emp.bio}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Footer */}
            <div className="p-3 bg-[#08101a] border border-slate-800 rounded-lg text-center space-y-1 text-[11px] text-gray-400">
              <div>W CELU OTRZYMANIA OFERTY PROSIMY O KONTAKT:</div>
              <div className="flex items-center justify-center space-x-4 text-blue-300 font-bold">
                <span className="flex items-center space-x-1">
                  <Phone size={12} />
                  <span>{site.contact.phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail size={12} />
                  <span>{site.contact.email}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* WYDARZENIA Tab (matching strona_O&L2.png) */
          <div className="space-y-4">
            {site.news.map((item: any) => (
              <div
                key={item.id}
                className="p-4 bg-[#08121c] border border-blue-900/60 rounded-lg space-y-3"
              >
                {/* Event Top Bar */}
                <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                  <span className="font-black text-sm text-blue-300 flex items-center space-x-1.5">
                    <Sparkles size={15} />
                    <span>{item.title}</span>
                  </span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>

                {/* Pub / Event Photo Placeholder (Vector SVG) */}
                <div className="w-full h-32 bg-slate-900 rounded border border-slate-700 flex flex-col items-center justify-center p-2 text-center text-gray-400">
                  <div className="text-2xl mb-1">🍻 🎉</div>
                  <span className="text-[11px] font-bold text-blue-200">
                    FOTORELACJA: SPOTKANIE PRACOWNIKÓW DZIAŁU
                  </span>
                </div>

                {/* Green Framed Box from VR screenshot */}
                <div className="p-3 bg-[#00ff66]/10 border-2 border-[#00ff66] rounded-md text-center text-xs font-bold text-[#00ff66] tracking-wide">
                  {item.boxText}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed text-center">
                  {item.content}
                </p>

                <div className="text-center font-bold text-xs text-blue-400">
                  {item.hashtags}
                </div>

                <div className="text-center text-[11px] text-gray-400 pt-1">
                  {item.galleryText}
                </div>

                {/* Mini Photo Gallery Grid */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-14 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] text-gray-400"
                    >
                      FOTO #{n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <div className="px-3 py-1.5 bg-[#08101a] border-t border-[#00ff66]/20 flex items-center justify-between text-[10px] text-[#00ff66]/60">
        <span className="flex items-center space-x-1">
          <Lock size={10} />
          <span>//OLCOMPANY.CLOUD</span>
        </span>
        <span>19.05.2026</span>
      </div>
    </div>
  );
};
