import React from 'react';
import { Terminal, Download, Cpu, Sparkles, BookOpen } from 'lucide-react';
import { BitDepth } from '../types';

interface HeaderProps {
  currentBitDepth: BitDepth;
  onSelectBitDepth: (bpp: BitDepth) => void;
  onDownloadBin: () => void;
  onDownloadBas: () => void;
  onOpenDoc: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBitDepth,
  onSelectBitDepth,
  onDownloadBin,
  onDownloadBas,
  onOpenDoc,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-stone-100 font-mono">
                QBasic <span className="text-emerald-400">IMG</span> Studio
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold tracking-wider bg-stone-800 text-stone-300 rounded border border-stone-700">
                v2.0
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Retro binary header encoder, 1/2/4/8-bit ditherer & QBasic code generator
            </p>
          </div>
        </div>

        {/* Bit Depth Selector Pills */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
          <span className="text-[11px] font-mono text-stone-500 px-2 select-none">BPP:</span>
          {([1, 2, 4, 8] as BitDepth[]).map((bpp) => {
            const isSelected = currentBitDepth === bpp;
            return (
              <button
                key={bpp}
                id={`bitdepth-pill-${bpp}`}
                type="button"
                onClick={() => onSelectBitDepth(bpp)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <span>{bpp}-Bit</span>
                {bpp === 2 && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                      isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-800 text-emerald-400'
                    }`}
                  >
                    CGA
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="header-doc-btn"
            type="button"
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors"
            title="QBasic GET/PUT Specification and Quick Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">QBasic Spec</span>
          </button>

          <button
            id="header-download-bin-btn"
            type="button"
            onClick={onDownloadBin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors"
            title="Download Raw Binary Image with QBasic Header"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>.BIN</span>
          </button>

          <button
            id="header-download-bas-btn"
            type="button"
            onClick={onDownloadBas}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
            title="Download Runnable QBasic Source Program (.BAS)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>.BAS Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
