import React from 'react';
import { HeaderDetails, BitDepth } from '../types';
import { Binary, HelpCircle, Layers, Cpu, Database } from 'lucide-react';

interface HeaderInspectorProps {
  headerDetails: HeaderDetails;
  bitDepth: BitDepth;
}

export const HeaderInspector: React.FC<HeaderInspectorProps> = ({ headerDetails, bitDepth }) => {
  const {
    format,
    headerSizeBytes,
    widthInBits,
    widthInPixels,
    heightInPixels,
    bytesPerScanline,
    pixelDataSizeBytes,
    totalSizeBytes,
    dimIntegerElements,
    dimStatement,
    hexPreview,
  } = headerDetails;

  // Header word bytes breakdown
  const word0Lo = widthInBits & 0xff;
  const word0Hi = (widthInBits >> 8) & 0xff;
  const word1Lo = heightInPixels & 0xff;
  const word1Hi = (heightInPixels >> 8) & 0xff;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-xs font-mono text-stone-300 shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-stone-100 text-sm">QBasic Graphic Header Inspector</h3>
        </div>
        <span className="text-[10px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
          Format: {format === 'qbasic-get-put' ? 'QBasic GET/PUT Array' : 'Custom .IMG Binary'}
        </span>
      </div>

      {/* Header Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-4">
        {/* Word 0 */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
            Byte 0..1 (Word 0)
          </div>
          <div className="text-emerald-400 font-bold text-sm">
            {widthInBits} <span className="text-[10px] text-stone-400">bits</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Hex: <span className="text-stone-200">0x{word0Lo.toString(16).padStart(2, '0').toUpperCase()} 0x{word0Hi.toString(16).padStart(2, '0').toUpperCase()}</span>
          </div>
          <div className="text-[9px] text-stone-500 mt-0.5">
            Formula: {widthInPixels}px &times; {bitDepth}bpp
          </div>
        </div>

        {/* Word 1 */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
            Byte 2..3 (Word 1)
          </div>
          <div className="text-cyan-400 font-bold text-sm">
            {heightInPixels} <span className="text-[10px] text-stone-400">scanlines</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Hex: <span className="text-stone-200">0x{word1Lo.toString(16).padStart(2, '0').toUpperCase()} 0x{word1Hi.toString(16).padStart(2, '0').toUpperCase()}</span>
          </div>
          <div className="text-[9px] text-stone-500 mt-0.5">Height in scanlines</div>
        </div>

        {/* Scanline Pitch */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
            Row Stride (Pitch)
          </div>
          <div className="text-amber-400 font-bold text-sm">
            {bytesPerScanline} <span className="text-[10px] text-stone-400">bytes/row</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Aligned: <span className="text-stone-200">16-bit word aligned</span>
          </div>
          <div className="text-[9px] text-stone-500 mt-0.5">
            {bitDepth === 2 && '4 pixels packed per byte'}
            {bitDepth === 1 && '8 pixels packed per byte'}
            {bitDepth === 4 && '2 pixels/byte or 4-plane'}
            {bitDepth === 8 && '1 pixel per byte (Mode 13h)'}
          </div>
        </div>

        {/* Total File Size */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
            Total Memory Size
          </div>
          <div className="text-purple-400 font-bold text-sm">
            {totalSizeBytes} <span className="text-[10px] text-stone-400">bytes</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Integers: <span className="text-stone-200">{dimIntegerElements} words (%)</span>
          </div>
          <div className="text-[9px] text-stone-500 mt-0.5">{headerSizeBytes}B header + {pixelDataSizeBytes}B data</div>
        </div>
      </div>

      {/* DIM Statement Box */}
      <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-stone-400 text-[11px] font-semibold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Required QBasic DIM Statement:</span>
          </span>
          <span className="text-[10px] text-stone-500">2 bytes per integer (%)</span>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded p-2 text-emerald-300 font-mono text-xs select-all">
          {dimStatement}
        </div>
        <p className="text-[10px] text-stone-500 mt-1.5">
          Rule: QBasic allocates indices 0 to N (<span className="text-stone-400">N + 1 elements</span>).
          Formula: <code className="text-stone-300">DIM img%(INT((TotalBytes - 1) / 2))</code>
        </p>
      </div>

      {/* Hex Dump Inspector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-stone-400 text-[11px] font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Raw Binary Dump (First {Math.min(64, totalSizeBytes)} Bytes):</span>
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500 inline-block" />
              <span>Header Words</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-500 inline-block" />
              <span>Pixel Data</span>
            </span>
          </div>
        </div>

        <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed select-all font-mono">
          {hexPreview.map((line, idx) => {
            if (idx === 0 && format === 'qbasic-get-put') {
              // Highlight the first 4 bytes (header)
              const parts = line.split('  ');
              const offset = parts[0]?.split(':')[0] || '0000';
              const rest = line.substring(6);
              return (
                <div key={idx} className="flex">
                  <span className="text-stone-600 mr-2">{offset}:</span>
                  <span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded mr-2" title="Word 0 (width in bits) & Word 1 (height in scanlines)">
                      {line.substring(6, 17)}
                    </span>
                    <span className="text-stone-300">{line.substring(17)}</span>
                  </span>
                </div>
              );
            }
            return (
              <div key={idx} className="text-stone-400">
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
