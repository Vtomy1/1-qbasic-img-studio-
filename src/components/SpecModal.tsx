import React from 'react';
import { X, BookOpen, Terminal, CheckCircle2, Cpu } from 'lucide-react';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-mono text-xs text-stone-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-stone-100">
              QBasic Graphic Array & Binary Header Specification
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-stone-100 font-bold text-xs uppercase tracking-wider text-emerald-400">
              1. The QBasic GET / PUT Array Header
            </h3>
            <p className="text-stone-400">
              In MS-DOS QuickBASIC 4.5, QBasic 1.1, and QB64, graphic images captured via <code className="text-stone-200">GET (x1, y1)-(x2, y2), array%</code> or displayed via <code className="text-stone-200">PUT (x, y), array%, PSET</code> begin with a 4-byte header:
            </p>

            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-emerald-400 font-bold">Word 0 (Bytes 0..1):</span>{' '}
                <span className="text-stone-200">Width in Bits</span> (Little Endian, 16-bit integer).
              </div>
              <div className="pl-4 text-stone-400">
                • 1-Bit (SCREEN 2): <code className="text-stone-300">width &times; 1</code><br />
                • 2-Bit (SCREEN 1 CGA): <code className="text-stone-300">width &times; 2</code><br />
                • 4-Bit (SCREEN 7/9/12): <code className="text-stone-300">width &times; 4</code><br />
                • 8-Bit (SCREEN 13 VGA): <code className="text-stone-300">width &times; 8</code>
              </div>
              <div className="pt-1">
                <span className="text-cyan-400 font-bold">Word 1 (Bytes 2..3):</span>{' '}
                <span className="text-stone-200">Height in Scanlines</span> (Little Endian, 16-bit integer).
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-stone-100 font-bold text-xs uppercase tracking-wider text-amber-400">
              2. 2-Bit CGA Bit Packing (SCREEN 1)
            </h3>
            <p className="text-stone-400">
              In 2-bit mode (CGA 4-color palettes), each byte packs exactly 4 pixels:
            </p>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-2.5 font-mono text-[11px] text-stone-300">
              <span className="text-stone-500">Byte format:</span> [ Bit 7-6: Px 0 | Bit 5-4: Px 1 | Bit 3-2: Px 2 | Bit 1-0: Px 3 ]<br />
              <span className="text-stone-500">Scanline padding:</span> Each scanline row is padded to a 16-bit word boundary (2-byte multiple).
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-stone-100 font-bold text-xs uppercase tracking-wider text-purple-400">
              3. Calculating the DIM Statement
            </h3>
            <p className="text-stone-400">
              Each integer (<code className="text-stone-200">%</code>) in QBasic occupies 2 bytes. In QBasic:
            </p>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-emerald-300 font-mono text-[11px]">
              totalBytes = 4 + (bytesPerScanline * height)<br />
              DIM img%(0 TO INT((totalBytes + 1) / 2) - 1)
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-stone-100 font-bold text-xs uppercase tracking-wider text-cyan-400">
              4. Supported Dithering Algorithms
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-stone-200 font-bold">Atkinson:</span>
                <p className="text-stone-400 mt-0.5">Bill Atkinson's 6-neighbor filter. High contrast, perfect for 2-bit CGA.</p>
              </div>
              <div className="bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-stone-200 font-bold">Floyd-Steinberg:</span>
                <p className="text-stone-400 mt-0.5">Classic 4-neighbor error diffusion. Smooth photographic tonal ramps.</p>
              </div>
              <div className="bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-stone-200 font-bold">Bayer 4x4 & 8x8:</span>
                <p className="text-stone-400 mt-0.5">Crosshatch ordered dithering, faithful to 1980s PC video games.</p>
              </div>
              <div className="bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-stone-200 font-bold">Sierra & Burkes:</span>
                <p className="text-stone-400 mt-0.5">Multi-row distribution filters that prevent serpentine artifacts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
