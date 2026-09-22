import React from 'react';
import {
  Sliders,
  Palette,
  Shuffle,
  Monitor,
  FileCode2,
  RefreshCw,
  Info,
  Check,
  Layers,
} from 'lucide-react';
import {
  BitDepth,
  DitherAlgorithm,
  HeaderFormat,
  ImageProcessingConfig,
  PalettePreset,
} from '../types';
import { PALETTE_PRESETS, rgbToHex } from '../utils/palettes';

interface ControlsPanelProps {
  config: ImageProcessingConfig;
  onChangeConfig: (newConfig: Partial<ImageProcessingConfig>) => void;
  onResetAdjustments: () => void;
}

const DITHER_ALGORITHMS: { id: DitherAlgorithm; name: string; desc: string; bestFor?: string }[] = [
  {
    id: 'atkinson',
    name: 'Atkinson',
    desc: 'Classic Mac OS dither. Keeps 25% error contrast, clean clusters. Superb for 1-bit and 2-bit CGA!',
    bestFor: '2-Bit & 1-Bit',
  },
  {
    id: 'floyd-steinberg',
    name: 'Floyd-Steinberg',
    desc: 'Standard error diffusion. Smooth gradients, excellent for continuous tones and photos.',
  },
  {
    id: 'bayer-4x4',
    name: 'Bayer 4x4 (Ordered)',
    desc: 'Classic 1980s crosshatch ordered pattern. Stable without error diffusion bleeding.',
    bestFor: 'Retro Games',
  },
  {
    id: 'bayer-8x8',
    name: 'Bayer 8x8 (Ordered)',
    desc: 'Fine 64-level ordered matrix. Great for subtle shading transitions.',
  },
  {
    id: 'sierra-2',
    name: 'Two-Row Sierra',
    desc: 'Fast 2-line error diffusion, reduces worm artifacts.',
  },
  {
    id: 'burkes',
    name: 'Burkes',
    desc: '7-neighbor diffusion for soft transitions.',
  },
  {
    id: 'none',
    name: 'None (Threshold)',
    desc: 'Direct nearest-color mapping without dithering.',
  },
];

const SCREEN_PRESETS = [
  { label: '320×200 (Mode 1 / 13)', w: 320, h: 200, modes: 'SCREEN 1 / 7 / 13' },
  { label: '640×200 (Mode 2)', w: 640, h: 200, modes: 'SCREEN 2 (CGA)' },
  { label: '640×350 (Mode 9)', w: 640, h: 350, modes: 'SCREEN 9 (EGA)' },
  { label: '640×480 (Mode 11/12)', w: 640, h: 480, modes: 'SCREEN 11 / 12' },
  { label: '160×100 (CGA Low)', w: 160, h: 100, modes: 'CGA 160x100' },
  { label: '64×64 (Sprite)', w: 64, h: 64, modes: 'Game Sprite' },
  { label: '32×32 (Icon)', w: 32, h: 32, modes: 'Small Icon' },
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  onChangeConfig,
  onResetAdjustments,
}) => {
  // Filter palettes matching the active bit depth
  const availablePalettes = PALETTE_PRESETS.filter((p) => p.bitDepth === config.bitDepth);
  const activePalette = availablePalettes.find((p) => p.id === config.paletteId) || availablePalettes[0];

  return (
    <div className="flex flex-col gap-5 text-stone-200 text-xs font-mono">
      {/* 1. Bit Depth Selector */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Bit Depth</span>
          </label>
          <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
            {config.bitDepth === 1 && '2 Colors • SCREEN 2'}
            {config.bitDepth === 2 && '4 Colors • SCREEN 1 (CGA)'}
            {config.bitDepth === 4 && '16 Colors • SCREEN 12 / 7'}
            {config.bitDepth === 8 && '256 Colors • SCREEN 13'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 4, 8] as BitDepth[]).map((bpp) => {
            const isSelected = config.bitDepth === bpp;
            return (
              <button
                key={bpp}
                type="button"
                id={`ctrl-bpp-${bpp}`}
                onClick={() => {
                  // When switching bit depth, pick first palette for that depth
                  const newPalettes = PALETTE_PRESETS.filter((p) => p.bitDepth === bpp);
                  onChangeConfig({
                    bitDepth: bpp,
                    paletteId: newPalettes[0]?.id || config.paletteId,
                  });
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="text-sm font-bold">{bpp}-Bit</span>
                <span className="text-[10px] text-stone-400 mt-0.5">
                  {bpp === 1 && '2 Colors'}
                  {bpp === 2 && '4 Colors (CGA)'}
                  {bpp === 4 && '16 Colors'}
                  {bpp === 8 && '256 Colors'}
                </span>
                {bpp === 2 && (
                  <span className="mt-1 text-[8px] tracking-wide uppercase px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                    CGA Spec
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Palette Presets */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hardware Palette ({availablePalettes.length})</span>
          </label>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availablePalettes.map((preset) => {
            const isSelected = activePalette.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`palette-option-${preset.id}`}
                onClick={() => onChangeConfig({ paletteId: preset.id })}
                className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-stone-800 border-cyan-500/80 text-white shadow-sm'
                    : 'bg-stone-950/50 border-stone-800/80 text-stone-300 hover:bg-stone-800/50 hover:border-stone-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[11px] truncate">{preset.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">{preset.description}</p>
                </div>

                {/* Swatch chips */}
                <div className="flex items-center shrink-0 border border-stone-700 rounded overflow-hidden shadow-inner">
                  {preset.colors.slice(0, 16).map((c, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-5"
                      style={{ backgroundColor: rgbToHex(c) }}
                      title={`${c.name || `Color ${idx}`}: ${rgbToHex(c)}`}
                    />
                  ))}
                  {preset.colors.length > 16 && (
                    <div className="px-1 text-[9px] bg-stone-800 text-stone-400 flex items-center justify-center">
                      +{preset.colors.length - 16}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Dithering Configuration (Highlighted for 2-bit!) */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Dithering Engine</span>
          </label>
          {config.bitDepth === 2 && (
            <span className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
              2-Bit Dither Active
            </span>
          )}
        </div>

        {/* Algorithm Select */}
        <div className="space-y-1.5 mb-3">
          <div className="grid grid-cols-2 gap-1.5">
            {DITHER_ALGORITHMS.map((algo) => {
              const isSelected = config.ditherAlgorithm === algo.id;
              return (
                <button
                  key={algo.id}
                  type="button"
                  id={`dither-${algo.id}`}
                  onClick={() => onChangeConfig({ ditherAlgorithm: algo.id })}
                  className={`p-2 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500 text-amber-100 font-semibold shadow-sm'
                      : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                  title={algo.desc}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">{algo.name}</span>
                    {algo.bestFor && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-stone-800 text-amber-400 font-mono">
                        {algo.bestFor}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dither Strength Slider */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">Diffusion Strength:</span>
            <span className="text-stone-200 font-bold">{Math.round(config.ditherStrength * 100)}%</span>
          </div>
          <input
            id="dither-strength-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.ditherStrength}
            onChange={(e) => onChangeConfig({ ditherStrength: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Serpentine Scan Option */}
        <label className="flex items-center gap-2 text-[11px] text-stone-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.serpentine}
            onChange={(e) => onChangeConfig({ serpentine: e.target.checked })}
            className="rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-0"
          />
          <span>Serpentine scanlines (alternating scan direction, eliminates diagonal streaks)</span>
        </label>
      </section>

      {/* 4. Preprocessing Adjustments */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Image Pre-Adjustments</span>
          </label>
          <button
            type="button"
            onClick={onResetAdjustments}
            className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-stone-400">Brightness:</span>
              <span className="text-stone-200">{config.brightness > 0 ? `+${config.brightness}` : config.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="2"
              value={config.brightness}
              onChange={(e) => onChangeConfig({ brightness: parseInt(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-stone-400">Contrast:</span>
              <span className="text-stone-200">{config.contrast > 0 ? `+${config.contrast}` : config.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="2"
              value={config.contrast}
              onChange={(e) => onChangeConfig({ contrast: parseInt(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Gamma */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-stone-400">Gamma Curve:</span>
              <span className="text-stone-200">{config.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.05"
              value={config.gamma}
              onChange={(e) => onChangeConfig({ gamma: parseFloat(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 5. Resolution & Scaling */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Target Resolution</span>
          </label>
        </div>

        {/* Screen mode quick pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SCREEN_PRESETS.map((p) => {
            const isMatch = config.targetWidth === p.w && config.targetHeight === p.h;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeConfig({ targetWidth: p.w, targetHeight: p.h })}
                className={`px-2 py-1 rounded text-[10px] border transition-all ${
                  isMatch
                    ? 'bg-blue-950 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
                title={p.modes}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom Width & Height Inputs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-stone-400 text-[10px] block mb-1">Width (px):</label>
            <input
              type="number"
              min="8"
              max="1024"
              step="4"
              value={config.targetWidth}
              onChange={(e) => onChangeConfig({ targetWidth: Math.max(8, parseInt(e.target.value) || 320) })}
              className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1 text-stone-100 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-stone-400 text-[10px] block mb-1">Height (px):</label>
            <input
              type="number"
              min="8"
              max="1024"
              step="2"
              value={config.targetHeight}
              onChange={(e) => onChangeConfig({ targetHeight: Math.max(8, parseInt(e.target.value) || 200) })}
              className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1 text-stone-100 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fit Mode */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-stone-400">Aspect Ratio Fit:</span>
          <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded border border-stone-800">
            {(['fit', 'fill', 'stretch'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeConfig({ fitMode: m })}
                className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                  config.fitMode === m ? 'bg-stone-800 text-stone-100 font-medium' : 'text-stone-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. QBasic Header & Binary Alignment */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-stone-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            <span>QBasic Header Specification</span>
          </label>
        </div>

        {/* Header Format */}
        <div className="space-y-2 mb-3">
          <div className="flex gap-2">
            <button
              type="button"
              id="hdr-format-getput"
              onClick={() => onChangeConfig({ headerFormat: 'qbasic-get-put' })}
              className={`flex-1 p-2 rounded-lg border text-left transition-all ${
                config.headerFormat === 'qbasic-get-put'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-100 font-medium'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold text-[11px]">QBasic GET/PUT</div>
              <div className="text-[10px] text-stone-400 mt-0.5">4-byte Word0 (Width*BPP), Word1 (Height)</div>
            </button>

            <button
              type="button"
              id="hdr-format-custom"
              onClick={() => onChangeConfig({ headerFormat: 'custom-binary-img' })}
              className={`flex-1 p-2 rounded-lg border text-left transition-all ${
                config.headerFormat === 'custom-binary-img'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-100 font-medium'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold text-[11px]">Custom .IMG</div>
              <div className="text-[10px] text-stone-400 mt-0.5">8-byte Header [QB, W, H, BPP, Flags]</div>
            </button>
          </div>
        </div>

        {/* Word Align Scanlines */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] text-stone-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.wordAlignScanlines}
              onChange={(e) => onChangeConfig({ wordAlignScanlines: e.target.checked })}
              className="rounded bg-stone-800 border-stone-700 text-purple-500 focus:ring-0"
            />
            <span>Word-align scanlines (16-bit boundary, required for standard QBasic PUT)</span>
          </label>

          {config.bitDepth === 4 && (
            <div className="pt-2 border-t border-stone-800/80">
              <label className="text-stone-400 text-[10px] block mb-1">4-Bit Color Layout:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ fourBitFormat: 'planar' })}
                  className={`flex-1 py-1 px-2 rounded text-[10px] border ${
                    config.fourBitFormat === 'planar'
                      ? 'bg-stone-800 border-purple-500 text-white font-medium'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  4-Plane Planar (SCREEN 7/12 PUT)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ fourBitFormat: 'packed' })}
                  className={`flex-1 py-1 px-2 rounded text-[10px] border ${
                    config.fourBitFormat === 'packed'
                      ? 'bg-stone-800 border-purple-500 text-white font-medium'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  Packed Nibbles (2 px/byte)
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
