import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Terminal,
  Save,
  BookOpen,
  Code2,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ConversionOutput, PalettePreset } from '../types';
import {
  generateBloadPutCode,
  generateBinaryReaderCode,
  generateBsaveCode,
  generateStandaloneDataCode,
} from '../utils/codeGenerators';

interface CodeViewerProps {
  conversion: ConversionOutput;
  palette: PalettePreset;
  fileName: string;
  onDownloadBas: (code: string, fileName: string) => void;
  onDownloadBin: () => void;
  onDownloadPng: () => void;
}

type CodeTab = 'bload' | 'binary' | 'bsave' | 'data' | 'guide';

export const CodeViewer: React.FC<CodeViewerProps> = ({
  conversion,
  palette,
  fileName,
  onDownloadBas,
  onDownloadBin,
  onDownloadPng,
}) => {
  const [activeTab, setActiveTab] = useState<CodeTab>('bload');
  const [copied, setCopied] = useState<boolean>(false);

  const bloadCode = generateBloadPutCode({ conversion, palette, fileName });
  const binaryCode = generateBinaryReaderCode({ conversion, palette, fileName });
  const bsaveCode = generateBsaveCode({ conversion, palette, fileName });
  const dataCode = generateStandaloneDataCode({ conversion, palette, fileName });

  let activeCode = bloadCode;
  let fileSuffix = 'LOADER.BAS';
  if (activeTab === 'binary') {
    activeCode = binaryCode;
    fileSuffix = 'BINREAD.BAS';
  } else if (activeTab === 'bsave') {
    activeCode = bsaveCode;
    fileSuffix = 'SAVER.BAS';
  } else if (activeTab === 'data') {
    activeCode = dataCode;
    fileSuffix = 'INLINE.BAS';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadActiveBas = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '').toUpperCase();
    onDownloadBas(activeCode, `${baseName}_${fileSuffix}`);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm flex flex-col font-mono text-xs text-stone-200">
      {/* Top Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-950/80 border-b border-stone-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            id="tab-bload"
            onClick={() => setActiveTab('bload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeTab === 'bload'
                ? 'bg-stone-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>BLOAD & PUT (Array)</span>
          </button>

          <button
            type="button"
            id="tab-binary"
            onClick={() => setActiveTab('binary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeTab === 'binary'
                ? 'bg-stone-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>OPEN FOR BINARY</span>
          </button>

          <button
            type="button"
            id="tab-bsave"
            onClick={() => setActiveTab('bsave')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeTab === 'bsave'
                ? 'bg-stone-800 text-amber-400 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>BSAVE Saver Code</span>
          </button>

          <button
            type="button"
            id="tab-data"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeTab === 'data'
                ? 'bg-stone-800 text-purple-400 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Standalone DATA</span>
          </button>

          <button
            type="button"
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeTab === 'guide'
                ? 'bg-stone-800 text-stone-100 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DOSBox / QB Guide</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab !== 'guide' && (
            <>
              <button
                type="button"
                id="copy-code-btn"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                id="download-active-bas-btn"
                onClick={handleDownloadActiveBas}
                className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .BAS</span>
              </button>
            </>
          )}

          <button
            type="button"
            id="download-bin-btn-alt"
            onClick={onDownloadBin}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
            title="Download .BIN graphic payload"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>.BIN</span>
          </button>

          <button
            type="button"
            id="download-png-btn"
            onClick={onDownloadPng}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
            title="Download Quantized PNG"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>.PNG</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 bg-stone-950/95 overflow-x-auto min-h-[280px] max-h-[460px]">
        {activeTab === 'guide' ? (
          <div className="space-y-4 max-w-3xl text-stone-300 text-xs leading-relaxed p-2 font-sans">
            <h4 className="font-bold text-stone-100 text-sm font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Running in MS-DOS QBasic, QuickBASIC, and DOSBox
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 space-y-2">
                <div className="font-mono text-emerald-400 font-bold">1. DOSBox Quick Start</div>
                <p className="text-stone-400 text-[11px]">
                  Place both the generated <code className="text-stone-200">.BAS</code> file and <code className="text-stone-200">.BIN</code> file into your mounted DOSBox folder (e.g. <code className="text-stone-200">C:\QBASIC\</code>).
                </p>
                <div className="bg-stone-950 p-2 rounded text-[11px] font-mono text-cyan-300">
                  mount c c:\qbasic<br />
                  c:<br />
                  qbasic /run myloader.bas
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 space-y-2">
                <div className="font-mono text-cyan-400 font-bold">2. QuickBASIC 4.5 & QB64</div>
                <p className="text-stone-400 text-[11px]">
                  In QuickBASIC 4.5, QB64, or FreeBASIC (<code className="text-stone-200">fbc -lang qb</code>), both <code className="text-stone-200">PUT ..., PSET</code> and binary parsing work natively with 100% backward compatibility.
                </p>
                <div className="bg-stone-950 p-2 rounded text-[11px] font-mono text-emerald-300">
                  qb64 myloader.bas<br />
                  ' Or FreeBASIC:<br />
                  fbc -lang qb myloader.bas
                </div>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 space-y-2">
              <div className="font-mono text-amber-400 font-bold">3. QBasic GET & PUT Memory Rules</div>
              <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px]">
                <li>
                  <strong className="text-stone-200">Integer Array Size:</strong> In QBasic, each array index in an integer array (<code className="text-stone-200">%</code>) holds 2 bytes. <code className="text-stone-200">DIM img%(N)</code> allocates indices 0 through N (total of <code className="text-stone-200">N + 1</code> integers).
                </li>
                <li>
                  <strong className="text-stone-200">2-Bit CGA (SCREEN 1):</strong> Each scanline has <code className="text-stone-200">width &times; 2</code> bits, packed 4 pixels per byte. Scanlines must be aligned to 16-bit boundaries.
                </li>
                <li>
                  <strong className="text-stone-200">1-Bit Monochrome (SCREEN 2):</strong> 8 pixels per byte, aligned to 16-bit boundaries.
                </li>
                <li>
                  <strong className="text-stone-200">8-Bit VGA (SCREEN 13):</strong> 1 byte per pixel. Header is 4 bytes (Word 0: <code className="text-stone-200">width * 8</code>, Word 1: <code className="text-stone-200">height</code>).
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <pre className="text-stone-200 text-xs font-mono select-all leading-relaxed">
            <code>{activeCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
