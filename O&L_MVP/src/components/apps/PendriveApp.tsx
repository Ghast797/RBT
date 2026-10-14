import React from 'react';
import { HardDrive, FileArchive, X, CheckCircle, Bug, FileText, ArrowRight } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';

export const PendriveApp: React.FC = () => {
  const {
    activeMission,
    usbFiles,
    addAttachmentToUsb,
    isRatBoundToZip,
    bindRatToArchive,
    selectedVolumeName,
    setUsbVolumeName,
    selectedEnvelopeName,
    setUsbEnvelopeName,
    ejectUsbDrive,
    closeApp
  } = useMissionStore();

  const step3 = activeMission.step3 || {
    attachments: [],
    volumeOptions: [],
    envelopeOptions: [],
    volumeNamePrompt: "WYBIERZ NAZWĘ PENDRIVE'A:",
    envelopePrompt: "WYBIERZ PODPIS NA KOPERCIE:"
  };
  const attachments = step3.attachments || [];

  const hasPhotos = usbFiles.includes('party_photos');

  return (
    <div className="flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2.5">
        <div className="flex items-center space-x-2 text-[#00ff66]">
          <HardDrive size={18} />
          <span className="font-bold text-sm tracking-wider">//DYSK E: PENDRIVE (BAITING)</span>
        </div>

        <button
          onClick={closeApp}
          className="p-1 hover:bg-[#ff3366]/20 text-[#00ff66] hover:text-[#ff3366] rounded transition-colors"
          title="Zamknij i wróć do pulpitu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Two-Panel Layout (matching video 2.mp4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
        {/* Left Panel: //E: USB */}
        <div className="p-4 bg-[#081219] border-2 border-[#00ff66]/40 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-20" />

          <div>
            <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2 mb-3">
              <span className="font-bold text-xs text-[#00ff66] tracking-wider">//E: USB</span>
              <span className="text-[10px] text-gray-400">Pojemność: 16 GB FAT32</span>
            </div>

            {/* Empty state / Files on USB */}
            {!hasPhotos ? (
              <div className="py-8 text-center text-gray-500 text-xs italic">
                Pusty nośnik USB. Kliknij załącznik po prawej stronie, aby przenieść go na dysk.
              </div>
            ) : !isRatBoundToZip ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#050a0f] border border-[#00ff66]/40 rounded text-xs flex items-center justify-between">
                  <span className="text-[#00ff66]">IMG_00034521.JPG X3</span>
                  <CheckCircle size={15} className="text-[#00ff66]" />
                </div>

                <div className="p-3 bg-[#00f0ff]/10 border border-[#00f0ff] rounded-lg text-xs space-y-2">
                  <div className="text-[10px] text-[#00f0ff] font-bold">
                    WYMAGANE: PODPIĘCIE ŁADUNKU WIRUSA
                  </div>
                  <p className="text-[11px] text-gray-300 leading-tight">
                    Wirus RAT musi zostać ukryty w archiwum ZIP razem ze zdjęciami, aby ominąć podstawowe skanery.
                  </p>
                  <button
                    onClick={bindRatToArchive}
                    className="w-full py-2 bg-[#00f0ff] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  >
                    <Bug size={14} />
                    <span>PODEPNIJ //WIRUS: RAT W ARCHIWUM ZIP</span>
                  </button>
                </div>
              </div>
            ) : !selectedVolumeName ? (
              /* Modal 1: WYBIERZ NAZWĘ PENDRIVE'A (matching USB.png) */
              <div className="space-y-2.5">
                <div className="p-2 bg-[#00ff66]/15 border border-[#00ff66] rounded text-xs font-bold text-[#00ff66] text-center">
                  UTWORZONO: FOTKI_AFTERPARTY.ZIP (ŁADUNEK PODPIĘTY)
                </div>

                <div className="text-center py-1">
                  <span className="font-bold text-xs text-[#00ff66] tracking-wider">
                    {step3.volumeNamePrompt}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {step3.volumeOptions.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => setUsbVolumeName(opt.id)}
                      className="w-full py-2.5 px-3 rounded bg-[#060e14] border border-[#00ff66]/40 hover:border-[#00ff66] hover:bg-[#00ff66]/15 text-xs text-white font-bold tracking-wider transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : !selectedEnvelopeName ? (
              /* Modal 2: WYBIERZ PODPIS NA KOPERCIE (matching USB2.png) */
              <div className="space-y-2.5">
                <div className="p-1.5 bg-[#050a0f] border border-[#00ff66]/30 rounded text-[11px] text-[#00ff66] text-center">
                  NAZWA WOLUMINU: {step3.volumeOptions.find((o: any) => o.id === selectedVolumeName)?.label}
                </div>

                <div className="text-center py-1">
                  <span className="font-bold text-xs text-[#00ff66] tracking-wider">
                    {step3.envelopePrompt}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {step3.envelopeOptions.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => setUsbEnvelopeName(opt.id)}
                      className="w-full py-2.5 px-3 rounded bg-[#060e14] border border-[#00ff66]/40 hover:border-[#00ff66] hover:bg-[#00ff66]/15 text-xs text-white font-bold tracking-wider transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Ready to Eject State */
              <div className="space-y-3 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#00ff66]/20 border-2 border-[#00ff66] mx-auto flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.4)]">
                  <FileArchive size={28} />
                </div>

                <div className="font-black text-sm text-[#00ff66]">
                  FOTKI_AFTERPARTY.ZIP
                </div>

                <div className="p-2 bg-[#050b10] border border-[#00ff66]/40 rounded text-[11px] text-gray-300 space-y-0.5">
                  <div>Wolumin: <strong className="text-[#00ff66]">{step3.volumeOptions.find((o: any) => o.id === selectedVolumeName)?.label}</strong></div>
                  <div>Koperta: <strong className="text-white">{step3.envelopeOptions.find((o: any) => o.id === selectedEnvelopeName)?.label}</strong></div>
                </div>

                <button
                  onClick={ejectUsbDrive}
                  className="w-full py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.5)] flex items-center justify-center space-x-2"
                >
                  <HardDrive size={16} />
                  <span>WYSUŃ PAMIĘĆ USB</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: ZAŁĄCZNIKI (matching video 2.mp4) */}
        <div className="p-4 bg-[#081219] border-2 border-[#00ff66]/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2 mb-2">
            <span className="font-bold text-xs text-[#00ff66] tracking-wider">ZAŁĄCZNIKI OD BYTE_MASTERA</span>
            <span className="text-[10px] text-gray-400">{attachments.length} POZYCJE</span>
          </div>

          <div className="space-y-2">
            {attachments.map((att: any) => {
              const isAdded = usbFiles.includes(att.id);
              return (
                <div
                  key={att.id}
                  onClick={() => !hasPhotos && addAttachmentToUsb(att.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isAdded
                      ? 'bg-[#00ff66]/20 border-[#00ff66]'
                      : hasPhotos
                      ? 'bg-[#050a0f] border-slate-800 opacity-50 cursor-not-allowed'
                      : 'bg-[#050a0f] border-[#00ff66]/30 hover:border-[#00ff66] hover:bg-[#00ff66]/10'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-[#0e1b26] border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66]">
                      {att.type === 'image_bundle' ? <FileArchive size={16} /> : <FileText size={16} />}
                    </div>
                    <span className="font-bold text-xs text-white">{att.name}</span>
                  </div>

                  {!isAdded && !hasPhotos && (
                    <ArrowRight size={15} className="text-[#00ff66]" />
                  )}
                  {isAdded && (
                    <CheckCircle size={16} className="text-[#00ff66]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#050a0f] border border-slate-800 rounded-lg text-[10px] text-gray-400 leading-relaxed">
            Wskazówka: Wybierz paczkę plików korespondującą z kontekstem imprezy integracyjnej O&L Company, by nie wzbudzić podejrzeń Mateusza.
          </div>
        </div>
      </div>
    </div>
  );
};
