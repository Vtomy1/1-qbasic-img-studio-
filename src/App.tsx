import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BitDepth,
  ConversionOutput,
  ImageProcessingConfig,
  PalettePreset,
} from './types';
import { PALETTE_PRESETS } from './utils/palettes';
import { quantizeAndDither } from './utils/dithering';
import { encodeQBasicImage } from './utils/qbasicHeader';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { generateBloadPutCode } from './utils/codeGenerators';
import { Header } from './components/Header';
import { ImageStage } from './components/ImageStage';
import { ControlsPanel } from './components/ControlsPanel';
import { HeaderInspector } from './components/HeaderInspector';
import { CodeViewer } from './components/CodeViewer';
import { SpecModal } from './components/SpecModal';

export default function App() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [fileName, setFileName] = useState<string>('RETRO_CGA.BIN');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  // Configuration state with 2-bit CGA dithering as prominent default
  const [config, setConfig] = useState<ImageProcessingConfig>({
    targetWidth: 320,
    targetHeight: 200,
    fitMode: 'fit',
    bitDepth: 2, // 2-bit CGA
    paletteId: '2bit-cga1-high',
    ditherAlgorithm: 'atkinson',
    ditherStrength: 0.9,
    brightness: 0,
    contrast: 15,
    gamma: 1.0,
    serpentine: true,
    headerFormat: 'qbasic-get-put',
    wordAlignScanlines: true,
    fourBitFormat: 'planar',
  });

  const [conversion, setConversion] = useState<ConversionOutput | null>(null);

  // Active palette preset lookup
  const activePalette: PalettePreset = useMemo(() => {
    const list = PALETTE_PRESETS.filter((p) => p.bitDepth === config.bitDepth);
    return list.find((p) => p.id === config.paletteId) || list[0] || PALETTE_PRESETS[0];
  }, [config.bitDepth, config.paletteId]);

  // Load default retro sample image on initial mount
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    const imgData = initialSample.generate(320, 200);
    setOriginalImage(imgData);
    setFileName('SYNTHWAVE.BIN');
  }, []);

  // Update conversion whenever image or config changes
  useEffect(() => {
    if (!originalImage) return;

    // 1. Scale original image to target resolution on offscreen canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.targetWidth;
    tempCanvas.height = config.targetHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill background with black
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, config.targetWidth, config.targetHeight);

    // Source canvas
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = originalImage.width;
    srcCanvas.height = originalImage.height;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.putImageData(originalImage, 0, 0);

    if (config.fitMode === 'stretch') {
      tempCtx.drawImage(srcCanvas, 0, 0, config.targetWidth, config.targetHeight);
    } else if (config.fitMode === 'fill') {
      // Cover
      const scale = Math.max(
        config.targetWidth / originalImage.width,
        config.targetHeight / originalImage.height
      );
      const sw = originalImage.width * scale;
      const sh = originalImage.height * scale;
      const sx = (config.targetWidth - sw) / 2;
      const sy = (config.targetHeight - sh) / 2;
      tempCtx.drawImage(srcCanvas, sx, sy, sw, sh);
    } else {
      // Contain (Fit)
      const scale = Math.min(
        config.targetWidth / originalImage.width,
        config.targetHeight / originalImage.height
      );
      const sw = originalImage.width * scale;
      const sh = originalImage.height * scale;
      const sx = (config.targetWidth - sw) / 2;
      const sy = (config.targetHeight - sh) / 2;
      tempCtx.drawImage(srcCanvas, sx, sy, sw, sh);
    }

    const scaledImageData = tempCtx.getImageData(0, 0, config.targetWidth, config.targetHeight);

    // 2. Quantize & Dither pixels into palette
    const { indexed, rgb } = quantizeAndDither(scaledImageData.data, {
      width: config.targetWidth,
      height: config.targetHeight,
      palette: activePalette.colors,
      algorithm: config.ditherAlgorithm,
      strength: config.ditherStrength,
      brightness: config.brightness,
      contrast: config.contrast,
      gamma: config.gamma,
      serpentine: config.serpentine,
    });

    // 3. Encode into QBasic graphic binary format
    const { buffer, headerDetails } = encodeQBasicImage({
      width: config.targetWidth,
      height: config.targetHeight,
      bitDepth: config.bitDepth,
      indexedPixels: indexed,
      format: config.headerFormat,
      wordAlignScanlines: config.wordAlignScanlines,
      fourBitFormat: config.fourBitFormat,
    });

    setConversion({
      width: config.targetWidth,
      height: config.targetHeight,
      bitDepth: config.bitDepth,
      palette: activePalette.colors,
      indexedPixels: indexed,
      rgbPixels: rgb,
      binaryBuffer: buffer,
      headerDetails,
      dataStatements: '',
    });
  }, [originalImage, config, activePalette]);

  // Handle uploading custom image files
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        setOriginalImage(data);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').toUpperCase() + '.BIN';
        setFileName(cleanName);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle sample image selection
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId);
    if (!sample) return;
    const imgData = sample.generate(320, 200);
    setOriginalImage(imgData);
    setFileName(sample.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase() + '.BIN');
  };

  // Bit depth switch shortcut
  const handleSelectBitDepth = (bpp: BitDepth) => {
    const newPalettes = PALETTE_PRESETS.filter((p) => p.bitDepth === bpp);
    setConfig((prev) => ({
      ...prev,
      bitDepth: bpp,
      paletteId: newPalettes[0]?.id || prev.paletteId,
    }));
  };

  // Reset adjustment sliders
  const handleResetAdjustments = () => {
    setConfig((prev) => ({
      ...prev,
      brightness: 0,
      contrast: 0,
      gamma: 1.0,
      ditherStrength: 0.85,
    }));
  };

  // Download binary image file (.BIN)
  const handleDownloadBin = () => {
    if (!conversion) return;
    const blob = new Blob([conversion.binaryBuffer.buffer as ArrayBuffer], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.BIN') ? fileName : `${fileName}.BIN`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download QBasic source code (.BAS)
  const handleDownloadBas = (code: string, outFileName: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Quantized PNG preview
  const handleDownloadPng = () => {
    if (!conversion) return;
    const canvas = document.createElement('canvas');
    canvas.width = conversion.width;
    canvas.height = conversion.height;
    const ctx = canvas.getContext('2d')!;
    const imgData = new ImageData(
      new Uint8ClampedArray(conversion.rgbPixels),
      conversion.width,
      conversion.height
    );
    ctx.putImageData(imgData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + `_${conversion.bitDepth}BIT.PNG`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-stone-950">
      {/* Top Header */}
      <Header
        currentBitDepth={config.bitDepth}
        onSelectBitDepth={handleSelectBitDepth}
        onDownloadBin={handleDownloadBin}
        onDownloadBas={() => {
          if (!conversion) return;
          const code = generateBloadPutCode({ conversion, palette: activePalette, fileName });
          handleDownloadBas(code, fileName.replace(/\.[^/.]+$/, '') + '_LOADER.BAS');
        }}
        onOpenDoc={() => setIsSpecModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Canvas Stage & Header Inspector (7 columns on large screens) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ImageStage
            originalImage={originalImage}
            conversion={conversion}
            paletteColors={activePalette.colors}
            onUploadImage={handleUploadImage}
            onSelectSample={handleSelectSample}
          />

          {conversion && (
            <HeaderInspector
              headerDetails={conversion.headerDetails}
              bitDepth={conversion.bitDepth}
            />
          )}
        </div>

        {/* Right Column: Controls Panel & Code Viewer (5 columns on large screens) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ControlsPanel
            config={config}
            onChangeConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
            onResetAdjustments={handleResetAdjustments}
          />

          {conversion && (
            <CodeViewer
              conversion={conversion}
              palette={activePalette}
              fileName={fileName}
              onDownloadBas={handleDownloadBas}
              onDownloadBin={handleDownloadBin}
              onDownloadPng={handleDownloadPng}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-4 px-6 text-center text-xs font-mono text-stone-500">
        <p>
          QBasic Graphic Header Studio • Compatible with QuickBASIC 4.5, QBasic 1.1, QB64, FreeBASIC, and DOSBox
        </p>
      </footer>

      {/* Specification Modal */}
      <SpecModal isOpen={isSpecModalOpen} onClose={() => setIsSpecModalOpen(false)} />
    </div>
  );
}
