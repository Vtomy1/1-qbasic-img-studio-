export type BitDepth = 1 | 2 | 4 | 8;

export type DitherAlgorithm =
  | 'none'
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-4x4'
  | 'bayer-8x8'
  | 'sierra-2'
  | 'burkes';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  name?: string;
  index: number;
}

export interface PalettePreset {
  id: string;
  name: string;
  bitDepth: BitDepth;
  description: string;
  screenMode: string;
  colors: RGBColor[];
  qbasicScreenCmd: string;
  qbasicPaletteCode: string;
}

export type HeaderFormat = 'qbasic-get-put' | 'custom-binary-img';

export interface HeaderDetails {
  format: HeaderFormat;
  headerSizeBytes: number;
  widthInBits: number;
  widthInPixels: number;
  heightInPixels: number;
  bpp: BitDepth;
  bytesPerScanline: number;
  pixelDataSizeBytes: number;
  totalSizeBytes: number;
  dimIntegerElements: number;
  dimStatement: string;
  hexPreview: string[];
}

export interface ImageProcessingConfig {
  targetWidth: number;
  targetHeight: number;
  fitMode: 'fit' | 'fill' | 'stretch';
  bitDepth: BitDepth;
  paletteId: string;
  customColors?: RGBColor[];
  ditherAlgorithm: DitherAlgorithm;
  ditherStrength: number; // 0 to 1
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  gamma: number; // 0.2 to 3.0
  serpentine: boolean;
  headerFormat: HeaderFormat;
  wordAlignScanlines: boolean;
  fourBitFormat: 'planar' | 'packed'; // For 4-bit: standard QBasic 4-plane vs packed nibbles
}

export interface ConversionOutput {
  width: number;
  height: number;
  bitDepth: BitDepth;
  palette: RGBColor[];
  indexedPixels: Uint8Array;
  rgbPixels: Uint8ClampedArray; // for preview canvas
  binaryBuffer: Uint8Array; // full binary with header
  headerDetails: HeaderDetails;
  dataStatements: string;
}
