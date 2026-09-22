import { BitDepth, HeaderDetails, HeaderFormat } from '../types';

export interface EncodeOptions {
  width: number;
  height: number;
  bitDepth: BitDepth;
  indexedPixels: Uint8Array;
  format: HeaderFormat;
  wordAlignScanlines: boolean;
  fourBitFormat: 'planar' | 'packed';
}

/**
 * Encodes indexed pixel data into a binary buffer with QBasic GET/PUT or custom IMG header.
 */
export function encodeQBasicImage(opts: EncodeOptions): {
  buffer: Uint8Array;
  headerDetails: HeaderDetails;
} {
  const { width, height, bitDepth, indexedPixels, format, wordAlignScanlines, fourBitFormat } = opts;

  let widthInBits = 0;
  let bytesPerScanline = 0;
  let payloadBytes = 0;
  let headerSize = 0;
  let payload: Uint8Array;

  if (format === 'qbasic-get-put') {
    headerSize = 4; // Word 0: width in bits (or bpp * width), Word 1: height

    if (bitDepth === 1) {
      widthInBits = width * 1;
      const rawBytesPerRow = Math.ceil(width / 8);
      bytesPerScanline = wordAlignScanlines ? Math.ceil(width / 16) * 2 : rawBytesPerRow;
      payloadBytes = bytesPerScanline * height;
      payload = new Uint8Array(payloadBytes);

      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          const pixel = indexedPixels[y * width + x] & 1;
          const byteOffset = rowStart + Math.floor(x / 8);
          const bitPos = 7 - (x % 8);
          if (pixel) {
            payload[byteOffset] |= (1 << bitPos);
          }
        }
      }
    } else if (bitDepth === 2) {
      widthInBits = width * 2;
      const rawBytesPerRow = Math.ceil(width / 4);
      // Word align: 16 bits = 8 pixels = 2 bytes
      bytesPerScanline = wordAlignScanlines ? Math.ceil((width * 2) / 16) * 2 : rawBytesPerRow;
      payloadBytes = bytesPerScanline * height;
      payload = new Uint8Array(payloadBytes);

      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          const pixel = indexedPixels[y * width + x] & 3;
          const byteOffset = rowStart + Math.floor(x / 4);
          const shift = 6 - (x % 4) * 2;
          payload[byteOffset] |= (pixel << shift);
        }
      }
    } else if (bitDepth === 4) {
      widthInBits = width * 4;

      if (fourBitFormat === 'planar') {
        // Standard QBasic SCREEN 7/9/12 4-plane format
        // In QBasic GET arrays, each scanline has 4 separate bitplanes
        const bytesPerPlaneRow = wordAlignScanlines ? Math.ceil(width / 16) * 2 : Math.ceil(width / 8);
        bytesPerScanline = bytesPerPlaneRow * 4;
        payloadBytes = bytesPerScanline * height;
        payload = new Uint8Array(payloadBytes);

        for (let y = 0; y < height; y++) {
          const lineStart = y * bytesPerScanline;
          for (let plane = 0; plane < 4; plane++) {
            const planeOffset = lineStart + plane * bytesPerPlaneRow;
            for (let x = 0; x < width; x++) {
              const pixel = indexedPixels[y * width + x] & 15;
              const bit = (pixel >> plane) & 1;
              if (bit) {
                const byteOffset = planeOffset + Math.floor(x / 8);
                const bitPos = 7 - (x % 8);
                payload[byteOffset] |= (1 << bitPos);
              }
            }
          }
        }
      } else {
        // Packed 4-bit nibbles: 2 pixels per byte (MSN = pixel 0, LSN = pixel 1)
        const rawBytesPerRow = Math.ceil(width / 2);
        bytesPerScanline = wordAlignScanlines ? Math.ceil(width / 4) * 2 : rawBytesPerRow;
        payloadBytes = bytesPerScanline * height;
        payload = new Uint8Array(payloadBytes);

        for (let y = 0; y < height; y++) {
          const rowStart = y * bytesPerScanline;
          for (let x = 0; x < width; x++) {
            const pixel = indexedPixels[y * width + x] & 15;
            const byteOffset = rowStart + Math.floor(x / 2);
            if (x % 2 === 0) {
              payload[byteOffset] |= (pixel << 4);
            } else {
              payload[byteOffset] |= pixel;
            }
          }
        }
      }
    } else {
      // 8-bit (SCREEN 13)
      widthInBits = width * 8;
      bytesPerScanline = wordAlignScanlines ? Math.ceil(width / 2) * 2 : width;
      payloadBytes = bytesPerScanline * height;
      payload = new Uint8Array(payloadBytes);

      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          payload[rowStart + x] = indexedPixels[y * width + x] & 255;
        }
      }
    }

    // Construct full buffer: 4 header bytes + payload
    const totalSizeBytes = headerSize + payloadBytes;
    const buffer = new Uint8Array(totalSizeBytes);

    // Word 0: width in bits (Little Endian)
    buffer[0] = widthInBits & 0xff;
    buffer[1] = (widthInBits >> 8) & 0xff;

    // Word 1: height in pixels (Little Endian)
    buffer[2] = height & 0xff;
    buffer[3] = (height >> 8) & 0xff;

    // Pixel data
    buffer.set(payload, headerSize);

    // QBasic Integer Array DIM calculation:
    // QBasic arrays: DIM arr%(N) allocates indices 0 to N (N + 1 elements, each 2 bytes)
    // Total words = Math.ceil(totalSizeBytes / 2)
    // So DIM statement: DIM img%(INT((totalBytes - 1) / 2))
    const totalWords = Math.ceil(totalSizeBytes / 2);
    const dimMaxIndex = totalWords - 1;
    const dimStatement = `DIM img%(0 TO ${dimMaxIndex})  ' ${totalWords} integers = ${totalSizeBytes} bytes`;

    const hexPreview = generateHexDump(buffer.subarray(0, Math.min(64, totalSizeBytes)));

    const headerDetails: HeaderDetails = {
      format,
      headerSizeBytes: headerSize,
      widthInBits,
      widthInPixels: width,
      heightInPixels: height,
      bpp: bitDepth,
      bytesPerScanline,
      pixelDataSizeBytes: payloadBytes,
      totalSizeBytes,
      dimIntegerElements: totalWords,
      dimStatement,
      hexPreview,
    };

    return { buffer, headerDetails };
  } else {
    // Custom .IMG binary format
    // [0..1: Magic "QB" (0x51, 0x42), 2..3: Width UINT16 LE, 4..5: Height UINT16 LE, 6: BPP UINT8, 7: Flags UINT8]
    headerSize = 8;
    widthInBits = width * bitDepth;

    if (bitDepth === 1) {
      bytesPerScanline = Math.ceil(width / 8);
    } else if (bitDepth === 2) {
      bytesPerScanline = Math.ceil(width / 4);
    } else if (bitDepth === 4) {
      bytesPerScanline = Math.ceil(width / 2);
    } else {
      bytesPerScanline = width;
    }

    payloadBytes = bytesPerScanline * height;
    payload = new Uint8Array(payloadBytes);

    if (bitDepth === 1) {
      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          const pixel = indexedPixels[y * width + x] & 1;
          const byteOffset = rowStart + Math.floor(x / 8);
          const bitPos = 7 - (x % 8);
          if (pixel) payload[byteOffset] |= (1 << bitPos);
        }
      }
    } else if (bitDepth === 2) {
      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          const pixel = indexedPixels[y * width + x] & 3;
          const byteOffset = rowStart + Math.floor(x / 4);
          const shift = 6 - (x % 4) * 2;
          payload[byteOffset] |= (pixel << shift);
        }
      }
    } else if (bitDepth === 4) {
      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          const pixel = indexedPixels[y * width + x] & 15;
          const byteOffset = rowStart + Math.floor(x / 2);
          if (x % 2 === 0) {
            payload[byteOffset] |= (pixel << 4);
          } else {
            payload[byteOffset] |= pixel;
          }
        }
      }
    } else {
      for (let y = 0; y < height; y++) {
        const rowStart = y * bytesPerScanline;
        for (let x = 0; x < width; x++) {
          payload[rowStart + x] = indexedPixels[y * width + x];
        }
      }
    }

    const totalSizeBytes = headerSize + payloadBytes;
    const buffer = new Uint8Array(totalSizeBytes);
    buffer[0] = 0x51; // 'Q'
    buffer[1] = 0x42; // 'B'
    buffer[2] = width & 0xff;
    buffer[3] = (width >> 8) & 0xff;
    buffer[4] = height & 0xff;
    buffer[5] = (height >> 8) & 0xff;
    buffer[6] = bitDepth;
    buffer[7] = 0; // Flags

    buffer.set(payload, headerSize);

    const totalWords = Math.ceil(totalSizeBytes / 2);
    const dimStatement = `DIM imgBuffer%(${totalWords - 1})  ' ${totalSizeBytes} bytes binary payload`;
    const hexPreview = generateHexDump(buffer.subarray(0, Math.min(64, totalSizeBytes)));

    const headerDetails: HeaderDetails = {
      format,
      headerSizeBytes: headerSize,
      widthInBits,
      widthInPixels: width,
      heightInPixels: height,
      bpp: bitDepth,
      bytesPerScanline,
      pixelDataSizeBytes: payloadBytes,
      totalSizeBytes,
      dimIntegerElements: totalWords,
      dimStatement,
      hexPreview,
    };

    return { buffer, headerDetails };
  }
}

function generateHexDump(bytes: Uint8Array): string[] {
  const lines: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.subarray(i, Math.min(i + 16, bytes.length));
    const offset = i.toString(16).padStart(4, '0').toUpperCase();
    const hexParts: string[] = [];
    let asciiPart = '';

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        hexParts.push(chunk[j].toString(16).padStart(2, '0').toUpperCase());
        asciiPart += chunk[j] >= 32 && chunk[j] <= 126 ? String.fromCharCode(chunk[j]) : '.';
      } else {
        hexParts.push('  ');
        asciiPart += ' ';
      }
    }

    lines.push(`${offset}: ${hexParts.slice(0, 8).join(' ')}  ${hexParts.slice(8).join(' ')}  |${asciiPart}|`);
  }
  return lines;
}
