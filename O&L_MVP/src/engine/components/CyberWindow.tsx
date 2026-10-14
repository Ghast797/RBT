import React from 'react';
import { Minus, X, Square } from 'lucide-react';
import type { WindowId } from '../store/useMissionStore';

interface CyberWindowProps {
  id?: WindowId;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  defaultPosition?: { top?: string; left?: string; width?: string; height?: string };
}

export const CyberWindow: React.FC<CyberWindowProps> = ({
  title,
  icon,
  children,
  isOpen = true,
  onClose,
  defaultPosition = { width: 'w-full max-w-3xl', height: 'h-[540px]' }
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`relative flex flex-col bg-[#0b1016]/95 backdrop-blur-md border border-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.25)] z-30 rounded-md overflow-hidden transition-all duration-150 ${defaultPosition.width || 'w-full'} ${defaultPosition.height || 'h-[520px]'}`}
    >
      {/* Window Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 border-b select-none bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]"
      >
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold tracking-wider uppercase">
          {icon && <span className="opacity-90">{icon}</span>}
          <span>{title}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#00ff66] animate-pulse ml-2" />
        </div>

        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 hover:bg-[#00ff66]/20 text-[#00ff66]/80 hover:text-[#00ff66] rounded transition-colors"
            title="Minimalizuj"
          >
            <Minus size={13} />
          </button>
          <button
            className="p-1 hover:bg-[#00ff66]/20 text-[#00ff66]/80 hover:text-[#00ff66] rounded transition-colors"
            title="Maksymalizuj / Przywróć"
          >
            <Square size={11} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#ff3366]/30 text-[#ff3366]/80 hover:text-[#ff3366] rounded transition-colors"
              title="Zamknij"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto p-4 text-[#d1fae5] font-mono text-sm relative">
        {children}
      </div>

      {/* Window Bottom Status Border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#00ff66]/20 to-transparent" />
    </div>
  );
};
