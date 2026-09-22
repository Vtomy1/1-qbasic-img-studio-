import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid,
  Maximize2,
  Upload,
  Layers,
  Columns,
  Eye,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { ConversionOutput, RGBColor } from '../types';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { rgbToHex } from '../utils/palettes';

interface ImageStageProps {
  originalImage: ImageData | null;
  conversion: ConversionOutput | null;
  paletteColors: RGBColor[];
  onUploadImage: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
}

type ViewMode = 'converted' | 'split' | 'side-by-side' | 'original';

export const ImageStage: React.FC<ImageStageProps> = ({
  originalImage,
  conversion,
  paletteColors,
  onUploadImage,
  onSelectSample,
}) => {
  const [zoom, setZoom] = useState<number>(2);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('converted');
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    index: number;
    color: RGBColor;
    bitPattern: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const convertedCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const splitCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Render converted canvas
  useEffect(() => {
    if (!conversion || !convertedCanvasRef.current) return;
    const canvas = convertedCanvasRef.current;
    canvas.width = conversion.width;
    canvas.height = conversion.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = new ImageData(
      new Uint8ClampedArray(conversion.rgbPixels),
      conversion.width,
      conversion.height
    );
    ctx.putImageData(imgData, 0, 0);
  }, [conversion]);

  // Render original canvas
  useEffect(() => {
    if (!originalImage || !originalCanvasRef.current) return;
    const canvas = originalCanvasRef.current;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(originalImage, 0, 0);
  }, [originalImage]);

  // Render split comparison canvas
  useEffect(() => {
    if (viewMode !== 'split' || !splitCanvasRef.current || !conversion || !originalImage) return;
    const canvas = splitCanvasRef.current;
    canvas.width = conversion.width;
    canvas.height = conversion.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw converted image completely
    const convertedImgData = new ImageData(
      new Uint8ClampedArray(conversion.rgbPixels),
      conversion.width,
      conversion.height
    );
    ctx.putImageData(convertedImgData, 0, 0);

    // 2. Draw original image on left side up to split position
    const splitX = Math.round((conversion.width * splitPos) / 100);

    // Create temp canvas for original scaled to target size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImage.width;
    tempCanvas.height = originalImage.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(originalImage, 0, 0);

    // Save and clip left side
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, conversion.height);
    ctx.clip();
    ctx.drawImage(tempCanvas, 0, 0, conversion.width, conversion.height);
    ctx.restore();

    // Draw dividing line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX + 0.5, 0);
    ctx.lineTo(splitX + 0.5, conversion.height);
    ctx.stroke();
  }, [viewMode, conversion, originalImage, splitPos]);

  // Handle canvas mouse move for pixel inspector
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!conversion) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = conversion.width / rect.width;
    const scaleY = conversion.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < conversion.width && y >= 0 && y < conversion.height) {
      const idx = y * conversion.width + x;
      const colorIndex = conversion.indexedPixels[idx];
      const color = conversion.palette[colorIndex] || { r: 0, g: 0, b: 0, index: 0 };

      // Bit representation
      let bitPattern = '';
      if (conversion.bitDepth === 1) {
        bitPattern = `${colorIndex & 1}b`;
      } else if (conversion.bitDepth === 2) {
        bitPattern = `0b${(colorIndex & 3).toString(2).padStart(2, '0')}`;
      } else if (conversion.bitDepth === 4) {
        bitPattern = `0x${colorIndex.toString(16).toUpperCase()}`;
      } else {
        bitPattern = `#${colorIndex}`;
      }

      setHoverPixel({ x, y, index: colorIndex, color, bitPattern });
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverPixel(null);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Split slider mouse events
  const handleSplitMouseDown = () => setIsDraggingSplit(true);
  const handleSplitMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPos(pct);
    },
    [isDraggingSplit]
  );
  const handleSplitMouseUp = useCallback(() => setIsDraggingSplit(false), []);

  useEffect(() => {
    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleSplitMouseMove);
      window.addEventListener('mouseup', handleSplitMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSplitMouseMove);
        window.removeEventListener('mouseup', handleSplitMouseUp);
      };
    }
  }, [isDraggingSplit, handleSplitMouseMove, handleSplitMouseUp]);

  return (
    <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-stone-950/70 border-b border-stone-800">
        {/* Left: View Mode Controls */}
        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
          <button
            type="button"
            id="view-converted-btn"
            onClick={() => setViewMode('converted')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'converted'
                ? 'bg-stone-800 text-emerald-400 font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Show Quantized / Dithered Image"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Result</span>
          </button>

          <button
            type="button"
            id="view-split-btn"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'split'
                ? 'bg-stone-800 text-cyan-400 font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Interactive Split Comparison Slider"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            type="button"
            id="view-side-btn"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-stone-800 text-stone-200 font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Side by Side Comparison"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2-Up</span>
          </button>
        </div>

        {/* Center: Sample Presets */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-stone-500 text-[11px]">Presets:</span>
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample.id)}
              className="px-2 py-0.5 rounded text-[11px] bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* Right: Zoom & Grid Controls */}
        <div className="flex items-center gap-1.5">
          {/* Pixel Grid Toggle */}
          <button
            type="button"
            id="toggle-grid-btn"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded text-xs transition-colors border ${
              showGrid
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
            title="Toggle Pixel Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
            <button
              type="button"
              id="zoom-out-btn"
              onClick={() => setZoom((z) => Math.max(1, z - 1))}
              disabled={zoom <= 1}
              className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-stone-300 px-2 min-w-[32px] text-center select-none">
              {zoom}x
            </span>
            <button
              type="button"
              id="zoom-in-btn"
              onClick={() => setZoom((z) => Math.min(8, z + 1))}
              disabled={zoom >= 8}
              className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadImage(e.target.files[0]);
              }
            }}
          />
          <button
            type="button"
            id="stage-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Upload Image</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative flex-1 flex items-center justify-center p-4 min-h-[360px] max-h-[520px] overflow-auto bg-stone-950/90 select-none"
        style={{
          backgroundImage:
            'radial-gradient(#262626 1px, transparent 1px), radial-gradient(#262626 1px, #0c0a09 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {conversion ? (
          <div className="flex flex-col items-center gap-3">
            {/* Display according to View Mode */}
            {viewMode === 'converted' && (
              <div
                className="relative shadow-2xl rounded border border-stone-800 overflow-hidden bg-black"
                style={{
                  width: conversion.width * zoom,
                  height: conversion.height * zoom,
                }}
              >
                <canvas
                  ref={convertedCanvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  style={{
                    width: `${conversion.width * zoom}px`,
                    height: `${conversion.height * zoom}px`,
                    imageRendering: 'pixelated',
                  }}
                  className="block cursor-crosshair"
                />
                {showGrid && zoom >= 3 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                      backgroundSize: `${zoom}px ${zoom}px`,
                    }}
                  />
                )}
              </div>
            )}

            {viewMode === 'split' && (
              <div
                className="relative shadow-2xl rounded border border-stone-800 overflow-hidden bg-black"
                style={{
                  width: conversion.width * zoom,
                  height: conversion.height * zoom,
                }}
              >
                <canvas
                  ref={splitCanvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  style={{
                    width: `${conversion.width * zoom}px`,
                    height: `${conversion.height * zoom}px`,
                    imageRendering: 'pixelated',
                  }}
                  className="block cursor-crosshair"
                />

                {/* Draggable Divider Handle */}
                <div
                  onMouseDown={handleSplitMouseDown}
                  className="absolute top-0 bottom-0 w-3 -ml-1.5 cursor-ew-resize flex items-center justify-center group z-10"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="w-0.5 h-full bg-cyan-400 group-hover:w-1 transition-all shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <div className="absolute w-5 h-5 rounded-full bg-cyan-500 border border-white text-stone-950 text-[9px] font-bold flex items-center justify-center shadow-lg pointer-events-none">
                    ⟷
                  </div>
                </div>

                {/* Labels on Split View */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-stone-300 border border-stone-700/50 pointer-events-none">
                  Original
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-emerald-300 border border-stone-700/50 pointer-events-none">
                  QBasic {conversion.bitDepth}-bit
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' && (
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Original */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-mono text-stone-400">Original Source</span>
                  <div
                    className="relative shadow-xl rounded border border-stone-800 overflow-hidden bg-black"
                    style={{
                      width: Math.min(conversion.width * zoom, 320),
                      height: Math.min(conversion.height * zoom, 240),
                    }}
                  >
                    <canvas
                      ref={originalCanvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                      className="block"
                    />
                  </div>
                </div>

                {/* Quantized */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-mono text-emerald-400 font-medium">
                    QBasic {conversion.bitDepth}-Bit Dithered
                  </span>
                  <div
                    className="relative shadow-xl rounded border border-stone-800 overflow-hidden bg-black"
                    style={{
                      width: Math.min(conversion.width * zoom, 320),
                      height: Math.min(conversion.height * zoom, 240),
                    }}
                  >
                    <canvas
                      ref={convertedCanvasRef}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleCanvasMouseLeave}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                      className="block cursor-crosshair"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed border-stone-800 rounded-xl max-w-sm">
            <Upload className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-300">Drag & drop an image here</p>
            <p className="text-xs text-stone-500 mt-1 mb-3">or choose one of our retro test presets above</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-mono font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Browse Files
            </button>
          </div>
        )}

        {/* Live Pixel Inspector Float */}
        {hoverPixel && (
          <div className="absolute top-3 left-3 bg-stone-950/95 border border-stone-700/80 rounded-lg p-2.5 shadow-2xl backdrop-blur font-mono text-xs z-30 pointer-events-none flex items-center gap-3">
            <div
              className="w-7 h-7 rounded border border-stone-600 shadow-inner"
              style={{ backgroundColor: rgbToHex(hoverPixel.color) }}
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-stone-400">POS:</span>
                <span className="text-stone-200">
                  {hoverPixel.x}, {hoverPixel.y}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-400">COLOR:</span>
                <span className="text-emerald-400 font-bold">
                  {hoverPixel.color.name || `Index ${hoverPixel.index}`}
                </span>
                <span className="text-[10px] text-stone-500">({hoverPixel.bitPattern})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <span>RGB({hoverPixel.color.r}, {hoverPixel.color.g}, {hoverPixel.color.b})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      {conversion && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 bg-stone-950 border-t border-stone-800 text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {conversion.width} &times; {conversion.height} px
              </span>
            </div>
            <span className="text-stone-700">|</span>
            <div>
              <span className="text-stone-500">Format:</span>{' '}
              <span className="text-stone-200 font-semibold">{conversion.bitDepth}-Bit</span> (
              {conversion.palette.length} colors)
            </div>
            <span className="text-stone-700">|</span>
            <div>
              <span className="text-stone-500">Total File:</span>{' '}
              <span className="text-stone-200">{conversion.headerDetails.totalSizeBytes} B</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Array:</span>
            <span className="text-cyan-400">{conversion.headerDetails.dimStatement.split("'")[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
};
