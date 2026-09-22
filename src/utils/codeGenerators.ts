import { BitDepth, ConversionOutput, PalettePreset } from '../types';

export interface CodeGenParams {
  conversion: ConversionOutput;
  palette: PalettePreset;
  fileName: string;
}

export function generateBloadPutCode(params: CodeGenParams): string {
  const { conversion, palette, fileName } = params;
  const { width, height, bitDepth, headerDetails } = conversion;
  const binFile = fileName.replace(/\.[^/.]+$/, '') + '.BIN';

  return `' ============================================================
' QBASIC / QUICKBASIC IMAGE LOADER (BLOAD & PUT METHOD)
' Target Format: ${bitDepth}-bit (${width}x${height})
' Screen Mode:   ${palette.screenMode}
' Total Bytes:   ${headerDetails.totalSizeBytes} bytes (${headerDetails.dimIntegerElements} integers)
' ============================================================

DEFINT A-Z
CLS

' 1. Initialize Screen Mode
${palette.qbasicScreenCmd}

' 2. Configure Hardware Palette
${palette.qbasicPaletteCode}

' 3. Allocate Array for QBasic GET/PUT Graphics
' Header = 4 bytes (Word 0: width in bits = ${headerDetails.widthInBits}, Word 1: height = ${height})
' Payload = ${headerDetails.pixelDataSizeBytes} bytes
${headerDetails.dimStatement}

' 4. Load Binary Graphic from Disk via BLOAD
' Note: In classic QuickBASIC, BSAVE/BLOAD files start with a 7-byte header (&HFD + Segment + Offset + Length).
' If loading raw QBasic array bytes without DOS BSAVE header, use the Binary Reader below,
' or load into array memory as shown:
OPEN "${binFile}" FOR BINARY AS #1
IF LOF(1) = 0 THEN
    CLOSE #1: KILL "${binFile}"
    PRINT "Error: File ${binFile} not found!"
    END
END IF

' Read binary image directly into the integer array buffer
GET #1, , img%
CLOSE #1

' 5. Draw Image to Screen using PUT
' Syntax: PUT (X, Y), Array, [PSET | PRESET | AND | OR | XOR]
PUT (10, 10), img%, PSET

' 6. Wait for user keypress then reset screen
LOCATE 23, 1: PRINT "Press any key to exit...";
WHILE INKEY$ = "": WEND

SCREEN 0
WIDTH 80
CLS
END
`;
}

export function generateBinaryReaderCode(params: CodeGenParams): string {
  const { conversion, palette, fileName } = params;
  const { width, height, bitDepth } = conversion;
  const binFile = fileName.replace(/\.[^/.]+$/, '') + '.BIN';

  let unpackSnippet = '';

  if (bitDepth === 1) {
    unpackSnippet = `    ' Unpack 8 pixels from byte (MSB first)
    byteVal% = ASC(b$)
    FOR bit% = 7 TO 0 STEP -1
        IF px% < w% THEN
            c% = (byteVal% \\ (2 ^ bit%)) AND 1
            PSET (destX% + px%, destY% + y%), c%
            px% = px% + 1
        END IF
    NEXT bit%`;
  } else if (bitDepth === 2) {
    unpackSnippet = `    ' Unpack 4 pixels from byte (2-bit CGA: bits 7-6, 5-4, 3-2, 1-0)
    byteVal% = ASC(b$)
    FOR shift% = 6 TO 0 STEP -2
        IF px% < w% THEN
            c% = (byteVal% \\ (2 ^ shift%)) AND 3
            PSET (destX% + px%, destY% + y%), c%
            px% = px% + 1
        END IF
    NEXT shift%`;
  } else if (bitDepth === 4) {
    unpackSnippet = `    ' Unpack 2 pixels from byte (4-bit nibbles: high & low)
    byteVal% = ASC(b$)
    IF px% < w% THEN
        c% = (byteVal% \\ 16) AND 15
        PSET (destX% + px%, destY% + y%), c%
        px% = px% + 1
    END IF
    IF px% < w% THEN
        c% = byteVal% AND 15
        PSET (destX% + px%, destY% + y%), c%
        px% = px% + 1
    END IF`;
  } else {
    unpackSnippet = `    ' 8-bit: 1 byte = 1 pixel
    c% = ASC(b$)
    PSET (destX% + px%, destY% + y%), c%
    px% = px% + 1`;
  }

  return `' ============================================================
' UNIVERSAL QBASIC BINARY FILE LOADER & PARSER
' Reads width, height, and raw pixels directly using OPEN FOR BINARY
' Works in MS-DOS QBasic 1.1, QuickBASIC 4.5, QB64, FreeBASIC
' ============================================================

DEFINT A-Z
CLS

' 1. Set Screen Mode
${palette.qbasicScreenCmd}
${palette.qbasicPaletteCode}

' 2. Open Binary File
f$ = "${binFile}"
OPEN f$ FOR BINARY AS #1
IF LOF(1) = 0 THEN
    CLOSE #1: KILL f$
    PRINT "File not found: "; f$
    END
END IF

' 3. Read 4-Byte QBasic Header
' Word 0: Width in bits (2 bytes, little-endian)
' Word 1: Height in scanlines (2 bytes, little-endian)
hWInBits% = 0: hHeight% = 0
GET #1, 1, hWInBits%
GET #1, 3, hHeight%

' Calculate actual pixel width
bpp% = ${bitDepth}
w% = hWInBits% \\ bpp%
h% = hHeight%

LOCATE 1, 1
PRINT "Loaded: "; w%; "x"; h%; " ("; bpp%; "-bit)"

' 4. Read and Draw Pixels
destX% = 10: destY% = 20
b$ = " "

FOR y% = 0 TO h% - 1
    px% = 0
    bytesInRow% = ${conversion.headerDetails.bytesPerScanline}
    FOR byteIdx% = 1 TO bytesInRow%
        GET #1, , b$
${unpackSnippet}
    NEXT byteIdx%
NEXT y%

CLOSE #1

' 5. Finished
LOCATE 23, 1: PRINT "Done! Press any key...";
WHILE INKEY$ = "": WEND
SCREEN 0: WIDTH 80: CLS: END
`;
}

export function generateBsaveCode(params: CodeGenParams): string {
  const { conversion, palette, fileName } = params;
  const { width, height, bitDepth, headerDetails } = conversion;
  const binFile = fileName.replace(/\.[^/.]+$/, '') + '.BIN';

  return `' ============================================================
' QBASIC IMAGE SAVER (BSAVE ROUTINE)
' Captures any screen area into an integer array and writes to disk
' ============================================================

DEFINT A-Z
CLS

' 1. Set Mode
${palette.qbasicScreenCmd}
${palette.qbasicPaletteCode}

' 2. Target dimensions
w% = ${width}
h% = ${height}
bpp% = ${bitDepth}

' 3. Calculate array size needed for GET
' Total bytes = 4 (header) + bytes per scanline * height
totalBytes& = ${headerDetails.totalSizeBytes}
arrayElements% = INT((totalBytes& - 1) / 2)

${headerDetails.dimStatement}

' 4. Example: Draw something to save, or capture an existing graphic
' In your game/tool:
LINE (0, 0)-(w% - 1, h% - 1), 1, BF
CIRCLE (w% \\ 2, h% \\ 2), w% \\ 4, 2
PAINT (w% \\ 2, h% \\ 2), 3, 2

' 5. Capture graphics into array with GET
GET (0, 0)-(w% - 1, h% - 1), img%

' 6. Save array to disk using standard binary write
' (BSAVE adds a 7-byte segment header; using OPEN FOR BINARY produces a clean raw file)
OPEN "${binFile}" FOR BINARY AS #1
PUT #1, , img%
CLOSE #1

PRINT "Saved ${binFile} successfully!"
PRINT "Total size: "; totalBytes&; " bytes"
WHILE INKEY$ = "": WEND
SCREEN 0: WIDTH 80: END
`;
}

export function generateStandaloneDataCode(params: CodeGenParams): string {
  const { conversion, palette } = params;
  const { width, height, bitDepth, indexedPixels } = conversion;

  // Generate compact DATA lines (hex strings or decimal bytes)
  const dataLines: string[] = [];
  const bytesPerRow = 16;
  const totalPixels = width * height;

  // Pack data into bytes depending on bit depth
  const packedBytes: number[] = [];

  if (bitDepth === 1) {
    for (let i = 0; i < totalPixels; i += 8) {
      let b = 0;
      for (let bit = 0; bit < 8; bit++) {
        if (i + bit < totalPixels && indexedPixels[i + bit] === 1) {
          b |= (1 << (7 - bit));
        }
      }
      packedBytes.push(b);
    }
  } else if (bitDepth === 2) {
    for (let i = 0; i < totalPixels; i += 4) {
      let b = 0;
      for (let p = 0; p < 4; p++) {
        if (i + p < totalPixels) {
          b |= ((indexedPixels[i + p] & 3) << (6 - p * 2));
        }
      }
      packedBytes.push(b);
    }
  } else if (bitDepth === 4) {
    for (let i = 0; i < totalPixels; i += 2) {
      const p0 = indexedPixels[i] & 15;
      const p1 = i + 1 < totalPixels ? (indexedPixels[i + 1] & 15) : 0;
      packedBytes.push((p0 << 4) | p1);
    }
  } else {
    // 8-bit: limit to first 2000 pixels if very large to prevent giant code files, or note it
    const maxExport = Math.min(packedBytes.length || totalPixels, 4096);
    for (let i = 0; i < maxExport; i++) {
      packedBytes.push(indexedPixels[i]);
    }
  }

  // Create DATA lines
  const displayBytes = packedBytes.slice(0, 1024); // Cap preview to 1024 bytes for fast rendering
  for (let i = 0; i < displayBytes.length; i += bytesPerRow) {
    const chunk = displayBytes.slice(i, i + bytesPerRow);
    const hexValues = chunk.map((v) => '&H' + v.toString(16).padStart(2, '0').toUpperCase());
    dataLines.push(`DATA ${hexValues.join(',')}`);
  }

  const isTruncated = packedBytes.length > 1024;

  let unpackSnippet = '';
  if (bitDepth === 1) {
    unpackSnippet = `        READ byteVal%
        FOR bit% = 7 TO 0 STEP -1
            IF px% < w% THEN
                c% = (byteVal% \\ (2 ^ bit%)) AND 1
                PSET (destX% + px%, destY% + y%), c%
                px% = px% + 1
            END IF
        NEXT bit%`;
  } else if (bitDepth === 2) {
    unpackSnippet = `        READ byteVal%
        FOR shift% = 6 TO 0 STEP -2
            IF px% < w% THEN
                c% = (byteVal% \\ (2 ^ shift%)) AND 3
                PSET (destX% + px%, destY% + y%), c%
                px% = px% + 1
            END IF
        NEXT shift%`;
  } else if (bitDepth === 4) {
    unpackSnippet = `        READ byteVal%
        IF px% < w% THEN
            c% = (byteVal% \\ 16) AND 15
            PSET (destX% + px%, destY% + y%), c%
            px% = px% + 1
        END IF
        IF px% < w% THEN
            c% = byteVal% AND 15
            PSET (destX% + px%, destY% + y%), c%
            px% = px% + 1
        END IF`;
  } else {
    unpackSnippet = `        READ byteVal%
        PSET (destX% + px%, destY% + y%), byteVal%
        px% = px% + 1`;
  }

  return `' ============================================================
' SELF-CONTAINED QBASIC PROGRAM WITH INLINE DATA STATEMENTS
' No external binary files needed! Run directly in DOSBox or QBasic 1.1
' Resolution: ${width}x${height} | Format: ${bitDepth}-bit
' ============================================================

DEFINT A-Z
CLS

${palette.qbasicScreenCmd}
${palette.qbasicPaletteCode}

w% = ${width}
h% = ${height}
destX% = 20: destY% = 20

RESTORE ImageData
FOR y% = 0 TO h% - 1
    px% = 0
    WHILE px% < w%
${unpackSnippet}
    WEND
NEXT y%

LOCATE 23, 1: PRINT "Render complete! Press any key...";
WHILE INKEY$ = "": WEND
SCREEN 0: WIDTH 80: CLS: END

' --- EMBEDDED GRAPHICS DATA (${packedBytes.length} bytes total) ---
ImageData:
${dataLines.join('\n')}${isTruncated ? `\n' [Remaining ${packedBytes.length - 1024} bytes truncated in web preview]` : ''}
`;
}
