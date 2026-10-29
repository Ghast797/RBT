import React from 'react';
import { Crosshair, Navigation, Radio, Camera, CheckCircle2, X } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';

export const DroneApp: React.FC = () => {
  const {
    activeMission,
    droneFlightState,
    attachEnvelopeToDrone,
    selectedCoordId,
    selectDroneCoord,
    confirmDroneCoords,
    activateDroneCamera,
    selectedCarId,
    selectCarTarget,
    dropPayloadOnCar,
    droneDropSuccess,
    closeDroneApp
  } = useMissionStore();

  const step4 = activeMission.step4 || {
    droneStats: { model: '//DRON: CONDOR MIT63', video: '', speed: '', connection: '' },
    mapLocations: [],
    parkingCars: [],
    successDrop: ''
  };
  const droneStats = step4.droneStats || { model: '//DRON: CONDOR MIT63', video: '', speed: '', connection: '' };
  const mapLocations: any[] = step4.mapLocations || [];
  const parkingCars: any[] = step4.parkingCars || [];

  const isCameraView = droneFlightState === 'camera_active' || droneFlightState === 'dropped';
  const selectedCar = parkingCars.find((c: any) => c.id === selectedCarId);

  return (
    <div className="flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2">
        <div className="flex items-center space-x-2 text-[#00ff66]">
          <Crosshair size={18} />
          <span className="font-bold text-sm tracking-wider">{droneStats.model}</span>
        </div>

        <button
          onClick={closeDroneApp}
          className="p-1 hover:bg-[#ff3366]/20 text-[#00ff66] hover:text-[#ff3366] rounded transition-colors"
          title="Zamknij aplikację drona"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Container */}
      {!isCameraView ? (
        droneFlightState === 'waiting_payload' ? (
          /* Step 4.1: Attach USB Payload to Drone */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="p-4 bg-[#081219] border-2 border-[#00ff66]/40 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="text-center py-2">
                  <div className="w-24 h-24 mx-auto bg-[#0a1822] border-2 border-[#00ff66] rounded-full flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.3)] mb-2">
                    <Crosshair size={42} className="animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div className="font-black text-xs text-[#00ff66] tracking-widest">
                    {droneStats.model}
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="p-2.5 bg-[#050a0f] border border-[#00ff66]/30 rounded-lg flex items-center space-x-3 text-xs text-gray-300">
                    <Camera size={16} className="text-[#00ff66] shrink-0" />
                    <span className="font-semibold">{droneStats.video}</span>
                  </div>
                  <div className="p-2.5 bg-[#050a0f] border border-[#00ff66]/30 rounded-lg flex items-center space-x-3 text-xs text-gray-300">
                    <Navigation size={16} className="text-[#00ff66] shrink-0" />
                    <span className="font-semibold">{droneStats.speed}</span>
                  </div>
                  <div className="p-2.5 bg-[#050a0f] border border-[#00ff66]/30 rounded-lg flex items-center space-x-3 text-xs text-gray-300">
                    <Radio size={16} className="text-[#00ff66] shrink-0" />
                    <span className="font-semibold">{droneStats.connection}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={attachEnvelopeToDrone}
                className="w-full py-2.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)]"
              >
                [PODEPNIJ KOPERTĘ Z PENDRIVE'EM]
              </button>
            </div>

            <div className="p-4 bg-[#081219] border-2 border-[#00ff66]/40 rounded-xl flex flex-col justify-between items-center text-center space-y-4">
              <div className="w-full flex items-center justify-between border-b border-[#00ff66]/30 pb-2">
                <span className="font-bold text-xs text-[#00ff66]">STATUS DRONA</span>
                <span className="text-[0.625rem] text-gray-400">STOI W POKOJU HAKERA</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-gray-400 text-xs px-2">
                <Radio size={40} className="text-[#00ff66]/60 animate-pulse" />
                <p className="text-gray-300">CONDOR MIT63 czeka na podłączenie fizycznego ładunku USB.</p>
                <p className="text-[0.6875rem] text-[#00ff66]/80 leading-relaxed">
                  Podepnij kopertę z pendrive'em, aby odblokować nawigację satelitarną i wskazać adres ofiary.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Step 4.2: Large Full-Width Satellite Map */
          <div className="flex-1 min-h-0 flex flex-col justify-between space-y-2.5 overflow-y-auto pr-1">
            <div className="p-2.5 bg-[#081219] border border-[#00ff66]/40 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-black text-[#00ff66]">{droneStats.model}</span>
                <span className="text-gray-500">|</span>
                <span className="px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] font-bold text-[0.625rem]">
                  {droneFlightState === 'waiting_coords' ? 'CZEKA NA WSPÓŁRZĘDNE' : 'W LOCIE // 25 KM/H'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[0.6875rem] text-gray-300">
                <span className="flex items-center space-x-1">
                  <Camera size={13} className="text-[#00ff66]" />
                  <span>WIDEO AKTYWNE</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Radio size={13} className="text-[#00ff66]" />
                  <span>LINK P2P SECURE</span>
                </span>
              </div>
            </div>

            <div className="relative w-full h-80 sm:h-96 md:h-[440px] bg-[#04090e] rounded-xl border-2 border-[#00ff66]/50 overflow-hidden flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                <defs>
                  <pattern id="largeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ff66" strokeWidth="0.5" strokeOpacity="0.12" />
                  </pattern>
                </defs>
                <rect width="800" height="400" fill="url(#largeGrid)" />

                <path d="M 0 140 Q 240 180 440 120 T 800 160" fill="none" stroke="#00f0ff" strokeWidth="3.5" strokeOpacity="0.35" />
                <text x="440" y="105" fill="#00f0ff" fillOpacity="0.45" fontSize="11" textAnchor="middle" letterSpacing="4">
                  RZEKA ODRA // SEKTOR POŁUDNIOWY
                </text>

                <line x1="160" y1="0" x2="190" y2="400" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />
                <line x1="600" y1="0" x2="570" y2="400" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />
                <line x1="0" y1="240" x2="800" y2="240" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />

                <circle cx="400" cy="200" r="160" fill="none" stroke="#00ff66" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="4,4" />
                <circle cx="400" cy="200" r="280" fill="none" stroke="#00ff66" strokeWidth="0.8" strokeOpacity="0.1" />

                {mapLocations.map((loc) => {
                  const isSelected = selectedCoordId === loc.id;
                  const cx = (loc.x / 100) * 620 + 80;
                  const cy = (loc.y / 100) * 280 + 50;
                  const isRightQuadrant = loc.id === 'loc_3' || cx > 500;
                  const badgeX = isRightQuadrant ? cx - 195 : cx + 25;
                  const badgeY = cy - 24;

                  return (
                    <g
                      key={loc.id}
                      onClick={() => droneFlightState === 'waiting_coords' && selectDroneCoord(loc.id)}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle cx={cx} cy={cy} r="25" fill="none" stroke="#00ff66" strokeWidth="2" className="animate-ping" />
                      )}

                      <circle
                        cx={cx}
                        cy={cy}
                        r="16"
                        fill={isSelected ? '#00ff66' : '#040d14'}
                        stroke="#00ff66"
                        strokeWidth="2.5"
                      />
                      <text
                        x={cx}
                        y={cy + 5}
                        textAnchor="middle"
                        fill={isSelected ? '#04090e' : '#00ff66'}
                        fontSize="14"
                        fontWeight="900"
                      >
                        {loc.number}
                      </text>

                      <rect
                        x={badgeX}
                        y={badgeY}
                        width="170"
                        height="48"
                        rx="6"
                        fill="#050e17"
                        stroke={isSelected ? '#00ff66' : '#00ff6655'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all"
                      />
                      <text
                        x={badgeX + 12}
                        y={badgeY + 21}
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {loc.address}
                      </text>
                      <text
                        x={badgeX + 12}
                        y={badgeY + 39}
                        fill="#00ff66"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {loc.district}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="space-y-2">
              {droneFlightState === 'waiting_coords' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {mapLocations.map((loc) => {
                      const isSelected = selectedCoordId === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => selectDroneCoord(loc.id)}
                          className={`p-2.5 rounded-lg border text-left font-mono transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#00ff66]/20 border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                              : 'bg-[#081219] border-slate-800 hover:border-[#00ff66]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-sm text-[#00ff66]">[{loc.number}]</span>
                            <span className="text-xs text-gray-300 font-bold">{loc.district}</span>
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-white truncate mt-1">
                            {loc.address}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={confirmDroneCoords}
                    disabled={!selectedCoordId}
                    className="w-full py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                  >
                    [ZATWIERDŹ KOORDYNATY I ROZPOCZNIJ LOT]
                  </button>
                </>
              )}

              {droneFlightState === 'flying' && (
                <div className="p-3 bg-[#081219] border border-[#00ff66]/40 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs text-[#00ff66]">
                    <Crosshair size={16} className="animate-spin" />
                    <span className="font-bold">DRON DOTARŁ DO CELU // OŁTASZYŃSKA 92C</span>
                  </div>
                  <button
                    onClick={activateDroneCamera}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center justify-center space-x-1.5"
                  >
                    <Camera size={14} />
                    <span>[URUCHOM KAMERĘ PARKINGU]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Top-Down Parking Lot Camera View */
        <div className="flex-1 min-h-0 flex flex-col justify-between space-y-3 overflow-y-auto pr-1">
          <div className="p-2.5 bg-[#081219] border border-[#00ff66]/40 rounded-lg flex items-center justify-between text-xs text-[#00ff66]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold">KAMERA AKTYWNA [48%]</span>
            </div>
            <div className="text-[0.6875rem] text-gray-300">
              Wybierz miejsce na parkingu, gdzie ofiara znajdzie kopertę na samochodzie.
            </div>
          </div>

          <div className="relative w-full aspect-[360/220] max-h-[36vh] min-h-[170px] bg-[#0a1218] border-2 border-[#00ff66]/50 rounded-xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

            <svg viewBox="0 0 360 220" className="w-full h-full max-h-60">
              <rect width="360" height="220" fill="#0d141b" />
              <line x1="20" y1="110" x2="340" y2="110" stroke="#334155" strokeWidth="1.5" strokeDasharray="6,6" />

              {parkingCars.map((car, idx) => {
                const isTopRow = idx < 3;
                const colIdx = idx % 3;
                const x = 35 + colIdx * 110;
                const y = isTopRow ? 25 : 120;
                const isSelected = selectedCarId === car.id;

                return (
                  <g
                    key={car.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Pojazd ${car.id}: ${car.desc}`}
                    onClick={() => !droneDropSuccess && selectCarTarget(car.id)}
                    onKeyDown={(e) => {
                      if (!droneDropSuccess && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        selectCarTarget(car.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <rect
                      x={x}
                      y={y}
                      width="90"
                      height="75"
                      fill={isSelected ? '#00ff6615' : 'transparent'}
                      stroke={isSelected ? '#00ff66' : '#1e293b'}
                      strokeWidth={isSelected ? '2' : '1'}
                      rx="3"
                    />

                    <rect
                      x={x + 22}
                      y={y + 12}
                      width="46"
                      height="52"
                      rx="10"
                      fill={car.body}
                      stroke="#000"
                      strokeWidth="1.5"
                    />

                    <polygon points={`${x+28},${y+22} ${x+62},${y+22} ${x+59},${y+27} ${x+31},${y+27}`} fill="#0f172a" />
                    <polygon points={`${x+28},${y+48} ${x+62},${y+48} ${x+59},${y+43} ${x+31},${y+43}`} fill="#0f172a" />

                    <rect
                      x={x + 30}
                      y={y + 26}
                      width="30"
                      height="20"
                      rx="3"
                      fill={car.roof}
                      stroke="#000"
                      strokeWidth="1"
                    />

                    {droneDropSuccess && car.isTarget && (
                      <g>
                        <rect x={x + 37} y={y + 31} width="16" height="10" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                        <line x1={x + 37} y1={y + 31} x2={x + 45} y2={y + 36} stroke="#ca8a04" strokeWidth="0.8" />
                        <line x1={x + 53} y1={y + 31} x2={x + 45} y2={y + 36} stroke="#ca8a04" strokeWidth="0.8" />
                      </g>
                    )}

                    {isSelected && (
                      <g>
                        <circle
                          cx={x + 45}
                          cy={y + 36}
                          r="22"
                          fill="none"
                          stroke="#00ff66"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          className="animate-spin"
                          style={{ transformOrigin: `${x + 45}px ${y + 36}px` }}
                        />
                        <line x1={x + 45} y1={y + 10} x2={x + 45} y2={y + 18} stroke="#00ff66" strokeWidth="1.5" />
                        <line x1={x + 45} y1={y + 54} x2={x + 45} y2={y + 62} stroke="#00ff66" strokeWidth="1.5" />
                        <line x1={x + 19} y1={y + 36} x2={x + 27} y2={y + 36} stroke="#00ff66" strokeWidth="1.5" />
                        <line x1={x + 63} y1={y + 36} x2={x + 71} y2={y + 36} stroke="#00ff66" strokeWidth="1.5" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-2">
            {!droneDropSuccess ? (
              <>
                {selectedCar && (
                  <div className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                    selectedCar.isTarget
                      ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]'
                      : 'bg-[#ff3366]/10 border-[#ff3366]/40 text-[#ff3366]'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-400">ANALIZA POJAZDU:</span>
                      <span className="text-white font-mono">{selectedCar.desc}</span>
                    </div>
                    <span className="font-black">
                      {selectedCar.isTarget ? '100% ZGODNOŚĆ ZE ZDJĘCIEM' : 'NIEZGODNOŚĆ ZE ZDJĘCIEM'}
                    </span>
                  </div>
                )}
                <button
                  onClick={dropPayloadOnCar}
                  disabled={!selectedCarId}
                  className="w-full py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,255,102,0.5)] flex items-center justify-center space-x-2"
                >
                  <Crosshair size={16} />
                  <span>[ZRZUĆ ŁADUNEK NA SAMOCHÓD]</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-[#00ff66]/20 border-2 border-[#00ff66] rounded-lg text-xs font-bold text-[#00ff66] text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>{step4.successDrop}</span>
                </div>

                <button
                  onClick={closeDroneApp}
                  className="w-full py-2.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 transition-all text-center"
                >
                  WYŁĄCZ APLIKACJĘ DRONA
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
