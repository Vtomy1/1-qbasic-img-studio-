import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Palette,
  Sliders,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Download,
  Upload,
  Terminal,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  SunMedium,
} from 'lucide-react';
import { BitDepth, RGBColor, PalettePreset } from '../types';
import {
  PALETTE_PRESETS,
  rgbToHex,
  hexToRgb,
  interpolateColor,
  generateQBasicDacCode,
} from '../utils/palettes';

interface PaletteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBitDepth: BitDepth;
  currentPalette: PalettePreset;
  customColorsForDepth?: RGBColor[];
  onApplyPalette: (colors: RGBColor[], bitDepth: BitDepth, name?: string) => void;
}

export const PaletteEditorModal: React.FC<PaletteEditorModalProps> = ({
  isOpen,
  onClose,
  currentBitDepth,
  currentPalette,
  customColorsForDepth,
  onApplyPalette,
}) => {
  const [selectedDepth, setSelectedDepth] = useState<BitDepth>(currentBitDepth);
  const [colors, setColors] = useState<RGBColor[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [paletteName, setPaletteName] = useState<string>('Custom Palette');
  const [activeTab, setActiveTab] = useState<'editor' | 'gradient' | 'qbasic' | 'import-export'>('editor');

  // Gradient tool states
  const [gradientStartHex, setGradientStartHex] = useState<string>('#000000');
  const [gradientEndHex, setGradientEndHex] = useState<string>('#00FFFF');
  const [gradientStartIdx, setGradientStartIdx] = useState<number>(0);
  const [gradientEndIdx, setGradientEndIdx] = useState<number>(1);

  // Import / Export state
  const [importText, setImportText] = useState<string>('');
  const [importMessage, setImportMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Target count per bit depth
  const targetCount = useMemo(() => {
    switch (selectedDepth) {
      case 1:
        return 2;
      case 2:
        return 4;
      case 4:
        return 16;
      case 8:
        return 256;
      default:
        return 4;
    }
  }, [selectedDepth]);

  // Available standard presets for this bit depth
  const availablePresets = useMemo(() => {
    return PALETTE_PRESETS.filter((p) => p.bitDepth === selectedDepth);
  }, [selectedDepth]);

  // Synchronize on modal open or when bit depth changes
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDepth(currentBitDepth);
  }, [isOpen, currentBitDepth]);

  useEffect(() => {
    if (!isOpen) return;

    // If custom colors exist for this depth, use them; otherwise use active preset or first preset
    let baseColors: RGBColor[] = [];
    if (customColorsForDepth && customColorsForDepth.length === targetCount && selectedDepth === currentBitDepth) {
      baseColors = customColorsForDepth;
    } else if (currentPalette.bitDepth === selectedDepth) {
      baseColors = currentPalette.colors;
    } else {
      const match = PALETTE_PRESETS.find((p) => p.bitDepth === selectedDepth);
      baseColors = match ? match.colors : [];
    }

    // Ensure array length matches targetCount
    const newColors: RGBColor[] = [];
    for (let i = 0; i < targetCount; i++) {
      if (baseColors[i]) {
        newColors.push({
          r: baseColors[i].r,
          g: baseColors[i].g,
          b: baseColors[i].b,
          name: baseColors[i].name || `Color ${i}`,
          index: i,
        });
      } else {
        const grayVal = Math.round((i / (targetCount - 1 || 1)) * 255);
        newColors.push({
          r: grayVal,
          g: grayVal,
          b: grayVal,
          name: `Color ${i}`,
          index: i,
        });
      }
    }

    setColors(newColors);
    setSelectedColorIndex(0);
    setPaletteName(`Custom ${selectedDepth}-Bit (${targetCount} Colors)`);
    setGradientStartIdx(0);
    setGradientEndIdx(targetCount - 1);
    if (newColors.length >= 2) {
      setGradientStartHex(rgbToHex(newColors[0]));
      setGradientEndHex(rgbToHex(newColors[newColors.length - 1]));
    }
    setImportMessage(null);
  }, [isOpen, selectedDepth, targetCount]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active selected color
  const activeColor = colors[selectedColorIndex] || colors[0] || { r: 0, g: 0, b: 0, index: 0, name: 'Color 0' };

  // Update a specific channel of active color
  const handleUpdateActiveColor = (field: 'r' | 'g' | 'b' | 'name', value: number | string) => {
    setColors((prev) =>
      prev.map((c, i) => {
        if (i !== selectedColorIndex) return c;
        if (field === 'name') return { ...c, name: String(value) };
        return {
          ...c,
          [field]: Math.min(255, Math.max(0, Number(value))),
        };
      })
    );
  };

  // Update color via hex input
  const handleUpdateHex = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    setColors((prev) =>
      prev.map((c, i) => {
        if (i !== selectedColorIndex) return c;
        return {
          ...c,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        };
      })
    );
  };

  // Load colors from standard preset
  const handleLoadPreset = (presetId: string) => {
    const preset = availablePresets.find((p) => p.id === presetId);
    if (!preset) return;
    const loaded = preset.colors.slice(0, targetCount).map((c, i) => ({
      r: c.r,
      g: c.g,
      b: c.b,
      name: c.name || `Color ${i}`,
      index: i,
    }));
    setColors(loaded);
    setPaletteName(`Custom ${preset.name}`);
    if (loaded[0]) setGradientStartHex(rgbToHex(loaded[0]));
    if (loaded[loaded.length - 1]) setGradientEndHex(rgbToHex(loaded[loaded.length - 1]));
  };

  // Invert colors in palette
  const handleInvertPalette = () => {
    setColors((prev) => {
      const reversed = [...prev].reverse();
      return reversed.map((c, i) => ({
        ...c,
        index: i,
        name: `Color ${i} (was ${c.index})`,
      }));
    });
  };

  // Convert all colors to perceptual grayscale
  const handleGrayscale = () => {
    setColors((prev) =>
      prev.map((c) => {
        const lum = Math.round(0.299 * c.r + 0.587 * c.g + 0.114 * c.b);
        return {
          ...c,
          r: lum,
          g: lum,
          b: lum,
          name: `Gray ${lum}`,
        };
      })
    );
  };

  // Apply gradient across a range of indices
  const handleApplyGradient = () => {
    const startRGB = hexToRgb(gradientStartHex);
    const endRGB = hexToRgb(gradientEndHex);
    if (!startRGB || !endRGB) return;

    const start = Math.min(gradientStartIdx, gradientEndIdx);
    const end = Math.max(gradientStartIdx, gradientEndIdx);
    const steps = end - start;

    setColors((prev) =>
      prev.map((c, i) => {
        if (i < start || i > end) return c;
        const t = steps === 0 ? 0 : (i - start) / steps;
        return interpolateColor(startRGB, endRGB, t, i, `Gradient ${i}`);
      })
    );
    setActiveTab('editor');
  };

  // Import from hex text or JSON
  const handleImportText = () => {
    try {
      setImportMessage(null);
      const text = importText.trim();
      let imported: { r: number; g: number; b: number; name?: string }[] = [];

      if (text.startsWith('[') && text.endsWith(']')) {
        // Parse JSON
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          imported = parsed.map((item, idx) => {
            if (typeof item === 'string') {
              const rgb = hexToRgb(item);
              return rgb ? { ...rgb, name: `Color ${idx}` } : { r: 0, g: 0, b: 0, name: `Color ${idx}` };
            }
            if (item && typeof item === 'object' && 'r' in item && 'g' in item && 'b' in item) {
              return {
                r: Number(item.r) || 0,
                g: Number(item.g) || 0,
                b: Number(item.b) || 0,
                name: item.name || `Color ${idx}`,
              };
            }
            return { r: 0, g: 0, b: 0, name: `Color ${idx}` };
          });
        }
      } else {
        // Parse comma or newline separated hex values
        const hexTokens = text.split(/[\s,;\n\r]+/).filter((t) => t.length >= 3);
        imported = hexTokens.map((tok, idx) => {
          const rgb = hexToRgb(tok);
          return rgb ? { ...rgb, name: `Color ${idx}` } : { r: 0, g: 0, b: 0, name: `Color ${idx}` };
        });
      }

      if (imported.length === 0) {
        setImportMessage({ text: 'No valid RGB or Hex colors found.', isError: true });
        return;
      }

      // Populate into current bit depth
      const newColors: RGBColor[] = [];
      for (let i = 0; i < targetCount; i++) {
        if (imported[i]) {
          newColors.push({
            r: Math.min(255, Math.max(0, imported[i].r)),
            g: Math.min(255, Math.max(0, imported[i].g)),
            b: Math.min(255, Math.max(0, imported[i].b)),
            name: imported[i].name || `Color ${i}`,
            index: i,
          });
        } else {
          // Fallback to previous or default
          newColors.push(colors[i] || { r: 0, g: 0, b: 0, name: `Color ${i}`, index: i });
        }
      }

      setColors(newColors);
      setImportMessage({ text: `Successfully loaded ${Math.min(imported.length, targetCount)} colors!`, isError: false });
      setTimeout(() => setActiveTab('editor'), 800);
    } catch (err: any) {
      setImportMessage({ text: `Import failed: ${err.message || 'Invalid format'}`, isError: true });
    }
  };

  // Export current palette as Hex / JSON
  const exportHexList = colors.map((c) => rgbToHex(c)).join(', ');
  const exportJson = JSON.stringify(
    colors.map((c) => ({
      index: c.index,
      hex: rgbToHex(c),
      r: c.r,
      g: c.g,
      b: c.b,
      name: c.name,
    })),
    null,
    2
  );

  const qbasicDacCode = generateQBasicDacCode(colors, selectedDepth);

  const handleCopyQBasic = () => {
    navigator.clipboard.writeText(qbasicDacCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Save and apply to main app
  const handleSaveAndApply = () => {
    onApplyPalette(colors, selectedDepth, paletteName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl font-mono text-xs text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>Hardware Palette Editor</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {selectedDepth}-Bit • {targetCount} Colors
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bit Depth Selector inside modal */}
            <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[11px]">
              {([1, 2, 4, 8] as BitDepth[]).map((bpp) => (
                <button
                  key={bpp}
                  type="button"
                  onClick={() => setSelectedDepth(bpp)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedDepth === bpp
                      ? 'bg-emerald-600 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {bpp}-Bit
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar / Presets / Subtabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-stone-950/70 border-b border-stone-800/80">
          {/* Quick preset loader */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-[11px]">Load Preset:</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value);
              }}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="" disabled>
                Select hardware preset...
              </option>
              {availablePresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === 'editor'
                  ? 'bg-stone-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Color Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gradient')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === 'gradient'
                  ? 'bg-stone-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ramp / Gradient
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qbasic')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === 'qbasic'
                  ? 'bg-stone-800 text-purple-400 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              QBasic DAC Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import-export')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === 'import-export'
                  ? 'bg-stone-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Import / Export
            </button>
          </div>
        </div>

        {/* Live Swatch Bar (Always visible at top of body) */}
        <div className="px-5 py-2.5 bg-stone-950/40 border-b border-stone-800/60 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] text-stone-400">
            <span>Palette Swatches ({colors.length} total):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInvertPalette}
                className="hover:text-stone-200 flex items-center gap-1 transition-colors"
                title="Reverse color index order"
              >
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                <span>Invert</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleGrayscale}
                className="hover:text-stone-200 flex items-center gap-1 transition-colors"
                title="Convert to perceptual grayscale"
              >
                <SunMedium className="w-3 h-3 text-amber-400" />
                <span>Grayscale</span>
              </button>
            </div>
          </div>

          <div
            className={`grid gap-1 border border-stone-700/80 rounded-lg p-1.5 bg-stone-950 shadow-inner overflow-x-auto`}
            style={{
              gridTemplateColumns:
                selectedDepth === 1
                  ? 'repeat(2, minmax(0, 1fr))'
                  : selectedDepth === 2
                  ? 'repeat(4, minmax(0, 1fr))'
                  : selectedDepth === 4
                  ? 'repeat(16, minmax(0, 1fr))'
                  : 'repeat(32, minmax(0, 1fr))',
            }}
          >
            {colors.map((c, idx) => {
              const isSelected = selectedColorIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedColorIndex(idx);
                    setActiveTab('editor');
                  }}
                  className={`h-7 rounded transition-all relative flex flex-col justify-end items-center ${
                    isSelected ? 'ring-2 ring-emerald-400 scale-105 z-10 shadow-lg' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: rgbToHex(c) }}
                  title={`[${idx}] ${c.name || `Color ${idx}`}: ${rgbToHex(c)} (R:${c.r} G:${c.g} B:${c.b})`}
                >
                  <span
                    className={`text-[8px] font-bold px-0.5 rounded leading-none mb-0.5 ${
                      c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 128 ? 'text-black bg-white/70' : 'text-white bg-black/70'
                    }`}
                  >
                    {idx}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[300px]">
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Color Index List or Grid */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <label className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  Select Index to Edit
                </label>

                {selectedDepth <= 2 ? (
                  // 1-bit & 2-bit: Detailed cards list
                  <div className="space-y-2">
                    {colors.map((c, idx) => {
                      const isSelected = selectedColorIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                            isSelected
                              ? 'bg-stone-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/40 text-white'
                              : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-lg border border-stone-700 shadow-inner shrink-0"
                              style={{ backgroundColor: rgbToHex(c) }}
                            />
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>Index {idx}</span>
                                {idx === 0 && (
                                  <span className="text-[9px] px-1 bg-stone-700 text-stone-300 rounded font-normal">
                                    BG
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-400">{c.name || `Color ${idx}`}</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[11px] text-emerald-400">{rgbToHex(c)}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : selectedDepth === 4 ? (
                  // 4-bit 16 colors: 2-column cards
                  <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {colors.map((c, idx) => {
                      const isSelected = selectedColorIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`p-2 rounded-lg border flex items-center gap-2 text-left transition-all ${
                            isSelected
                              ? 'bg-stone-800 border-emerald-500 text-white'
                              : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded border border-stone-700 shadow-inner shrink-0"
                            style={{ backgroundColor: rgbToHex(c) }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold truncate">#{idx}: {rgbToHex(c)}</div>
                            <div className="text-[9px] text-stone-400 truncate">{c.name || `Col ${idx}`}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // 8-bit 256 colors: 16x16 grid with search/jump
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 text-[10px]">Jump to Index:</span>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={selectedColorIndex}
                        onChange={(e) =>
                          setSelectedColorIndex(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))
                        }
                        className="w-16 bg-stone-950 border border-stone-800 rounded px-2 py-0.5 text-xs text-stone-100 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-16 gap-0.5 border border-stone-800 p-1.5 bg-stone-950 rounded max-h-[260px] overflow-y-auto">
                      {colors.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`h-4 w-4 rounded-xs transition-all ${
                            selectedColorIndex === idx ? 'ring-2 ring-emerald-400 scale-125 z-10' : 'hover:opacity-80'
                          }`}
                          style={{ backgroundColor: rgbToHex(c) }}
                          title={`#${idx}: ${rgbToHex(c)}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Active Color Inspector & Fine-Tuning Controls */}
              <div className="md:col-span-7 bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    {/* Native Color Picker Clickable Box */}
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl border-2 border-stone-600 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: rgbToHex(activeColor) }}
                      />
                      <input
                        type="color"
                        value={rgbToHex(activeColor)}
                        onChange={(e) => handleUpdateHex(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to open system color picker"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-100">Index {selectedColorIndex}</span>
                        <span className="text-emerald-400 font-mono text-xs font-semibold">
                          {rgbToHex(activeColor)}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        QBasic 6-Bit DAC (0..63): R={Math.round((activeColor.r * 63) / 255)}, G=
                        {Math.round((activeColor.g * 63) / 255)}, B={Math.round((activeColor.b * 63) / 255)}
                      </div>
                    </div>
                  </div>

                  {/* Hex Text Box */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-xs font-mono">Hex:</span>
                    <input
                      type="text"
                      maxLength={7}
                      value={rgbToHex(activeColor)}
                      onChange={(e) => handleUpdateHex(e.target.value)}
                      className="w-20 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Color Name Input */}
                <div>
                  <label className="text-stone-400 text-[10px] block mb-1">Color Description / Label:</label>
                  <input
                    type="text"
                    value={activeColor.name || ''}
                    onChange={(e) => handleUpdateActiveColor('name', e.target.value)}
                    placeholder={`e.g. Color ${selectedColorIndex}`}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* RGB Channels Sliders */}
                <div className="space-y-3 pt-1">
                  {/* Red */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-rose-400 font-bold">Red (R):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-[10px]">DAC 6-bit: {Math.round((activeColor.r * 63) / 255)}</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={activeColor.r}
                          onChange={(e) => handleUpdateActiveColor('r', e.target.value)}
                          className="w-14 bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-xs text-right font-mono"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={activeColor.r}
                      onChange={(e) => handleUpdateActiveColor('r', e.target.value)}
                      className="w-full accent-rose-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Green */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-bold">Green (G):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-[10px]">DAC 6-bit: {Math.round((activeColor.g * 63) / 255)}</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={activeColor.g}
                          onChange={(e) => handleUpdateActiveColor('g', e.target.value)}
                          className="w-14 bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-xs text-right font-mono"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={activeColor.g}
                      onChange={(e) => handleUpdateActiveColor('g', e.target.value)}
                      className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Blue */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-400 font-bold">Blue (B):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-[10px]">DAC 6-bit: {Math.round((activeColor.b * 63) / 255)}</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={activeColor.b}
                          onChange={(e) => handleUpdateActiveColor('b', e.target.value)}
                          className="w-14 bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-xs text-right font-mono"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={activeColor.b}
                      onChange={(e) => handleUpdateActiveColor('b', e.target.value)}
                      className="w-full accent-blue-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Swatch Jump Buttons for Neighbor Colors */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedColorIndex((prev) => Math.max(0, prev - 1))}
                    disabled={selectedColorIndex === 0}
                    className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-xs"
                  >
                    ← Prev Color
                  </button>
                  <span className="text-stone-400 text-[10px]">
                    Editing {selectedColorIndex + 1} of {colors.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedColorIndex((prev) => Math.min(colors.length - 1, prev + 1))}
                    disabled={selectedColorIndex === colors.length - 1}
                    className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-xs"
                  >
                    Next Color →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gradient' && (
            <div className="space-y-4 max-w-xl mx-auto bg-stone-950/70 border border-stone-800 rounded-xl p-5">
              <div>
                <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Color Ramp & Gradient Interpolator</span>
                </h3>
                <p className="text-stone-400 text-[11px] mt-1">
                  Generate smooth RGB transitions across an index range. Useful for smooth shading ramps, fiery palettes, or atmospheric retro fades.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Color */}
                <div className="space-y-1.5 bg-stone-900 p-3 rounded-lg border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Start Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientStartHex}
                      onChange={(e) => setGradientStartHex(e.target.value)}
                      className="w-8 h-8 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={gradientStartHex}
                      onChange={(e) => setGradientStartHex(e.target.value)}
                      className="w-24 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs font-mono uppercase text-stone-200"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-stone-400 text-[10px]">From Index:</span>
                    <input
                      type="number"
                      min="0"
                      max={colors.length - 1}
                      value={gradientStartIdx}
                      onChange={(e) => setGradientStartIdx(parseInt(e.target.value) || 0)}
                      className="w-14 bg-stone-950 border border-stone-800 rounded px-1.5 py-0.5 text-xs text-stone-100 font-mono"
                    />
                  </div>
                </div>

                {/* End Color */}
                <div className="space-y-1.5 bg-stone-900 p-3 rounded-lg border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">End Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientEndHex}
                      onChange={(e) => setGradientEndHex(e.target.value)}
                      className="w-8 h-8 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={gradientEndHex}
                      onChange={(e) => setGradientEndHex(e.target.value)}
                      className="w-24 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs font-mono uppercase text-stone-200"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-stone-400 text-[10px]">To Index:</span>
                    <input
                      type="number"
                      min="0"
                      max={colors.length - 1}
                      value={gradientEndIdx}
                      onChange={(e) => setGradientEndIdx(parseInt(e.target.value) || 0)}
                      className="w-14 bg-stone-950 border border-stone-800 rounded px-1.5 py-0.5 text-xs text-stone-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Bar */}
              <div className="space-y-1">
                <span className="text-stone-400 text-[10px]">Preview Ramp:</span>
                <div
                  className="h-8 rounded-lg border border-stone-700 shadow-inner"
                  style={{
                    background: `linear-gradient(to right, ${gradientStartHex}, ${gradientEndHex})`,
                  }}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleApplyGradient}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Gradient Across Range</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'qbasic' && (
            <div className="space-y-3 bg-stone-950/90 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>QBasic Hardware DAC Statements</span>
                  </h3>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Authentic MS-DOS QBasic code to program the VGA DAC registers via ports <code className="text-stone-200">&H3C8</code> (Write Index) and <code className="text-stone-200">&H3C9</code> (RGB Data 0..63).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyQBasic}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-black/80 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[300px] leading-relaxed border border-stone-800">
                <code>{qbasicDacCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="space-y-4 max-w-xl mx-auto bg-stone-950/70 border border-stone-800 rounded-xl p-5">
              <div>
                <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Import / Export Custom Palette</span>
                </h3>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  Paste hex codes (e.g. <code className="text-stone-300">#000000, #55FFFF, #FF55FF, #FFFFFF</code>) or a JSON color array to import.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-400 text-[10px] block">Palette Data (Hex list or JSON):</label>
                <textarea
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`#000000, #55FFFF, #FF55FF, #FFFFFF`}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {importMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-sans ${
                    importMessage.isError ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {importMessage.text}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportText(exportHexList);
                      navigator.clipboard.writeText(exportHexList);
                      setImportMessage({ text: 'Copied Hex list to clipboard!', isError: false });
                    }}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700"
                  >
                    Copy Hex List
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImportText(exportJson);
                      navigator.clipboard.writeText(exportJson);
                      setImportMessage({ text: 'Copied JSON to clipboard!', isError: false });
                    }}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700"
                  >
                    Copy JSON
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleImportText}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Parse & Load Colors</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-[11px]">Palette Name:</span>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="apply-palette-btn"
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Custom Palette</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
