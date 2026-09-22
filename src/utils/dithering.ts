import { DitherAlgorithm, RGBColor } from '../types';

// Bayer 4x4 matrix normalized 0..15
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Bayer 8x8 matrix
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Finds the nearest palette color index using weighted perceptual distance.
 */
export function findNearestColor(
  r: number,
  g: number,
  b: number,
  palette: RGBColor[]
): { index: number; color: RGBColor } {
  let minDistance = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    // Redmean perceptual color difference formula
    const rMean = (r + c.r) / 2;
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;

    const weightR = 2 + rMean / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - rMean) / 256;

    const dist = weightR * dr * dr + weightG * dg * dg + weightB * db * db;

    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = i;
    }
  }

  return { index: bestIndex, color: palette[bestIndex] };
}

/**
 * Applies brightness, contrast, and gamma adjustments to an RGB component.
 */
function adjustColor(val: number, brightness: number, contrast: number, gamma: number): number {
  // 1. Brightness: -100 to 100
  let v = val + brightness * 2.55;

  // 2. Contrast: -100 to 100
  if (contrast !== 0) {
    const factor = (259 * (contrast + 100)) / (100 * (259 - contrast));
    v = factor * (v - 128) + 128;
  }

  // 3. Gamma: 0.2 to 3.0
  if (gamma !== 1.0) {
    const normalized = Math.max(0, Math.min(1, v / 255));
    v = Math.pow(normalized, 1 / gamma) * 255;
  }

  return Math.max(0, Math.min(255, v));
}

export interface DitherOptions {
  width: number;
  height: number;
  palette: RGBColor[];
  algorithm: DitherAlgorithm;
  strength: number; // 0..1
  brightness: number;
  contrast: number;
  gamma: number;
  serpentine: boolean;
}

/**
 * Quantizes and dithers RGBA pixels into indexed pixel indices and output RGB image.
 */
export function quantizeAndDither(
  sourceRgba: Uint8ClampedArray,
  opts: DitherOptions
): { indexed: Uint8Array; rgb: Uint8ClampedArray } {
  const { width, height, palette, algorithm, strength, brightness, contrast, gamma, serpentine } = opts;
  const numPixels = width * height;
  const indexed = new Uint8Array(numPixels);
  const rgb = new Uint8ClampedArray(numPixels * 4);

  // Error diffusion buffers (R, G, B channels as float32)
  const rBuf = new Float32Array(numPixels);
  const gBuf = new Float32Array(numPixels);
  const bBuf = new Float32Array(numPixels);

  // Pre-adjust input colors into working buffer
  for (let i = 0; i < numPixels; i++) {
    const srcIdx = i * 4;
    rBuf[i] = adjustColor(sourceRgba[srcIdx], brightness, contrast, gamma);
    gBuf[i] = adjustColor(sourceRgba[srcIdx + 1], brightness, contrast, gamma);
    bBuf[i] = adjustColor(sourceRgba[srcIdx + 2], brightness, contrast, gamma);
  }

  // Fast path for Ordered Dithering (Bayer)
  if (algorithm === 'bayer-4x4' || algorithm === 'bayer-8x8') {
    const is8x8 = algorithm === 'bayer-8x8';
    const matrix = is8x8 ? BAYER_8X8 : BAYER_4X4;
    const mSize = is8x8 ? 8 : 4;
    const maxVal = is8x8 ? 64 : 16;
    const spread = (48 * strength); // Spread threshold adjustment

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const threshold = (matrix[y % mSize][x % mSize] / maxVal - 0.5) * spread;

        const curR = Math.max(0, Math.min(255, rBuf[idx] + threshold));
        const curG = Math.max(0, Math.min(255, gBuf[idx] + threshold));
        const curB = Math.max(0, Math.min(255, bBuf[idx] + threshold));

        const match = findNearestColor(curR, curG, curB, palette);
        indexed[idx] = match.index;

        const outIdx = idx * 4;
        rgb[outIdx] = match.color.r;
        rgb[outIdx + 1] = match.color.g;
        rgb[outIdx + 2] = match.color.b;
        rgb[outIdx + 3] = 255;
      }
    }
    return { indexed, rgb };
  }

  // Fast path: No dithering (Direct Nearest Neighbor)
  if (algorithm === 'none' || strength <= 0) {
    for (let i = 0; i < numPixels; i++) {
      const match = findNearestColor(rBuf[i], gBuf[i], bBuf[i], palette);
      indexed[i] = match.index;

      const outIdx = i * 4;
      rgb[outIdx] = match.color.r;
      rgb[outIdx + 1] = match.color.g;
      rgb[outIdx + 2] = match.color.b;
      rgb[outIdx + 3] = 255;
    }
    return { indexed, rgb };
  }

  // Error Diffusion Algorithms (Floyd-Steinberg, Atkinson, Sierra-2, Burkes)
  for (let y = 0; y < height; y++) {
    const isLeftToRight = !serpentine || y % 2 === 0;
    const startX = isLeftToRight ? 0 : width - 1;
    const endX = isLeftToRight ? width : -1;
    const stepX = isLeftToRight ? 1 : -1;

    for (let x = startX; x !== endX; x += stepX) {
      const idx = y * width + x;

      const curR = Math.max(0, Math.min(255, rBuf[idx]));
      const curG = Math.max(0, Math.min(255, gBuf[idx]));
      const curB = Math.max(0, Math.min(255, bBuf[idx]));

      const match = findNearestColor(curR, curG, curB, palette);
      indexed[idx] = match.index;

      const outIdx = idx * 4;
      rgb[outIdx] = match.color.r;
      rgb[outIdx + 1] = match.color.g;
      rgb[outIdx + 2] = match.color.b;
      rgb[outIdx + 3] = 255;

      // Calculate quantization errors
      const errR = (curR - match.color.r) * strength;
      const errG = (curG - match.color.g) * strength;
      const errB = (curB - match.color.b) * strength;

      // Distribute error to neighbors
      const distribute = (dx: number, dy: number, factor: number) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          rBuf[nIdx] += errR * factor;
          gBuf[nIdx] += errG * factor;
          bBuf[nIdx] += errB * factor;
        }
      };

      const dir = isLeftToRight ? 1 : -1;

      if (algorithm === 'floyd-steinberg') {
        // Floyd-Steinberg:
        //      *   7/16
        // 3/16 5/16 1/16
        distribute(dir * 1, 0, 7 / 16);
        distribute(dir * -1, 1, 3 / 16);
        distribute(0, 1, 5 / 16);
        distribute(dir * 1, 1, 1 / 16);
      } else if (algorithm === 'atkinson') {
        // Atkinson (Macintosh classic - drops 2/8 of error, very crisp in 1-bit and 2-bit CGA):
        //   *  1/8 1/8
        // 1/8 1/8 1/8
        //     1/8
        distribute(dir * 1, 0, 1 / 8);
        distribute(dir * 2, 0, 1 / 8);
        distribute(dir * -1, 1, 1 / 8);
        distribute(0, 1, 1 / 8);
        distribute(dir * 1, 1, 1 / 8);
        distribute(0, 2, 1 / 8);
      } else if (algorithm === 'sierra-2') {
        // Two-row Sierra:
        //     *  4/16 3/16
        // 1/16 2/16 3/16 2/16 1/16
        distribute(dir * 1, 0, 4 / 16);
        distribute(dir * 2, 0, 3 / 16);
        distribute(dir * -2, 1, 1 / 16);
        distribute(dir * -1, 1, 2 / 16);
        distribute(0, 1, 3 / 16);
        distribute(dir * 1, 1, 2 / 16);
        distribute(dir * 2, 1, 1 / 16);
      } else if (algorithm === 'burkes') {
        // Burkes:
        //         *   8/32 4/32
        // 2/32 4/32 8/32 4/32 2/32
        distribute(dir * 1, 0, 8 / 32);
        distribute(dir * 2, 0, 4 / 32);
        distribute(dir * -2, 1, 2 / 32);
        distribute(dir * -1, 1, 4 / 32);
        distribute(0, 1, 8 / 32);
        distribute(dir * 1, 1, 4 / 32);
        distribute(dir * 2, 1, 2 / 32);
      }
    }
  }

  return { indexed, rgb };
}
