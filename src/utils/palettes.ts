import { PalettePreset, RGBColor } from '../types';

export const PALETTE_PRESETS: PalettePreset[] = [
  // ----------------------------------------------------
  // 1-BIT PALETTES (2 colors - SCREEN 2 / SCREEN 11)
  // ----------------------------------------------------
  {
    id: '1bit-bw',
    name: 'Monochrome B&W',
    bitDepth: 1,
    description: 'Classic Black & White for QBasic SCREEN 2 (640x200) or SCREEN 11 (640x480)',
    screenMode: 'SCREEN 2',
    qbasicScreenCmd: 'SCREEN 2',
    qbasicPaletteCode: "' Default Monochrome: 0=Black, 1=Bright White",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 255, g: 255, b: 255, name: 'White', index: 1 },
    ],
  },
  {
    id: '1bit-amber',
    name: 'Amber Phosphor CRT',
    bitDepth: 1,
    description: 'Warm amber monochrome terminal display',
    screenMode: 'SCREEN 2',
    qbasicScreenCmd: 'SCREEN 2',
    qbasicPaletteCode: "' Amber phosphor CRT emulation (SCREEN 2)",
    colors: [
      { r: 16, g: 12, b: 0, name: 'Dark Amber', index: 0 },
      { r: 255, g: 176, b: 0, name: 'Bright Amber', index: 1 },
    ],
  },
  {
    id: '1bit-green',
    name: 'Green Phosphor (P1)',
    bitDepth: 1,
    description: 'Classic retro green screen monitor (IBM 5151 / MDA)',
    screenMode: 'SCREEN 2',
    qbasicScreenCmd: 'SCREEN 2',
    qbasicPaletteCode: "' Green phosphor CRT emulation (SCREEN 2)",
    colors: [
      { r: 4, g: 20, b: 4, name: 'Dark Green', index: 0 },
      { r: 51, g: 255, b: 51, name: 'Phosphor Green', index: 1 },
    ],
  },

  // ----------------------------------------------------
  // 2-BIT PALETTES (4 colors - SCREEN 1 CGA)
  // ----------------------------------------------------
  {
    id: '2bit-cga1-high',
    name: 'CGA Pal 1 High (Cyan/Magenta/White)',
    bitDepth: 2,
    description: 'Iconic 1980s PC gaming palette: Black, Cyan, Light Magenta, Bright White (SCREEN 1, COLOR 0, 1)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1: COLOR 0, 1',
    qbasicPaletteCode: "SCREEN 1\nCOLOR 0, 1   ' Background=Black, Palette 1 High Intensity",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 85, g: 255, b: 255, name: 'Cyan', index: 1 },
      { r: 255, g: 85, b: 255, name: 'Light Magenta', index: 2 },
      { r: 255, g: 255, b: 255, name: 'Bright White', index: 3 },
    ],
  },
  {
    id: '2bit-cga1-low',
    name: 'CGA Pal 1 Low (Dark Cyan/Magenta/Gray)',
    bitDepth: 2,
    description: 'Standard intensity CGA Palette 1: Black, Dark Cyan, Dark Magenta, Light Gray (SCREEN 1, COLOR 0, 1)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1: COLOR 0, 1',
    qbasicPaletteCode: "SCREEN 1\nCOLOR 0, 1   ' Palette 1 standard intensity",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 0, g: 170, b: 170, name: 'Dark Cyan', index: 1 },
      { r: 170, g: 0, b: 170, name: 'Magenta', index: 2 },
      { r: 170, g: 170, b: 170, name: 'Light Gray', index: 3 },
    ],
  },
  {
    id: '2bit-cga0-high',
    name: 'CGA Pal 0 High (Green/Red/Yellow)',
    bitDepth: 2,
    description: 'CGA Palette 0 High Intensity: Black, Light Green, Light Red, Bright Yellow (SCREEN 1, COLOR 0, 0)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1: COLOR 0, 0',
    qbasicPaletteCode: "SCREEN 1\nCOLOR 0, 0   ' Background=Black, Palette 0 High Intensity",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 85, g: 255, b: 85, name: 'Light Green', index: 1 },
      { r: 255, g: 85, b: 85, name: 'Light Red', index: 2 },
      { r: 255, g: 255, b: 85, name: 'Yellow', index: 3 },
    ],
  },
  {
    id: '2bit-cga0-low',
    name: 'CGA Pal 0 Low (Dark Green/Red/Brown)',
    bitDepth: 2,
    description: 'CGA Palette 0 Low: Black, Dark Green, Dark Red, Brown (SCREEN 1, COLOR 0, 0)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1: COLOR 0, 0',
    qbasicPaletteCode: "SCREEN 1\nCOLOR 0, 0   ' Palette 0 low intensity",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 0, g: 170, b: 0, name: 'Green', index: 1 },
      { r: 170, g: 0, b: 0, name: 'Red', index: 2 },
      { r: 170, g: 85, b: 0, name: 'Brown', index: 3 },
    ],
  },
  {
    id: '2bit-cga1-blue',
    name: 'CGA Pal 1 (Blue BG)',
    bitDepth: 2,
    description: 'CGA Palette 1 with Blue background (SCREEN 1, COLOR 1, 1)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1: COLOR 1, 1',
    qbasicPaletteCode: "SCREEN 1\nCOLOR 1, 1   ' Background=Blue (Color 1), Palette 1",
    colors: [
      { r: 0, g: 0, b: 170, name: 'Blue', index: 0 },
      { r: 85, g: 255, b: 255, name: 'Cyan', index: 1 },
      { r: 255, g: 85, b: 255, name: 'Light Magenta', index: 2 },
      { r: 255, g: 255, b: 255, name: 'Bright White', index: 3 },
    ],
  },
  {
    id: '2bit-gray4',
    name: '4-Shade Grayscale',
    bitDepth: 2,
    description: 'Clean 4-level linear brightness ramp (0%, 33%, 66%, 100%)',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1',
    qbasicPaletteCode: "' 4-level grayscale for SCREEN 1 or DAC custom setup",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 85, g: 85, b: 85, name: 'Dark Gray', index: 1 },
      { r: 170, g: 170, b: 170, name: 'Light Gray', index: 2 },
      { r: 255, g: 255, b: 255, name: 'White', index: 3 },
    ],
  },
  {
    id: '2bit-gameboy',
    name: 'Game Boy Classic (DMG-01)',
    bitDepth: 2,
    description: 'Authentic 4-shade greenish LCD matrix tones',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1',
    qbasicPaletteCode: "' 4-shade LCD Game Boy palette",
    colors: [
      { r: 15, g: 56, b: 15, name: 'Deep Olive', index: 0 },
      { r: 48, g: 98, b: 48, name: 'Dark Green', index: 1 },
      { r: 139, g: 172, b: 15, name: 'Light Olive', index: 2 },
      { r: 155, g: 188, b: 15, name: 'Pale LCD Green', index: 3 },
    ],
  },
  {
    id: '2bit-amber4',
    name: '4-Shade Amber Plasma',
    bitDepth: 2,
    description: 'Retro gas-plasma laptop / amber CRT 4 shades',
    screenMode: 'SCREEN 1',
    qbasicScreenCmd: 'SCREEN 1',
    qbasicPaletteCode: "' Amber plasma 4-level display",
    colors: [
      { r: 20, g: 10, b: 0, name: 'Dark Background', index: 0 },
      { r: 110, g: 60, b: 0, name: 'Dim Amber', index: 1 },
      { r: 200, g: 120, b: 0, name: 'Medium Amber', index: 2 },
      { r: 255, g: 185, b: 0, name: 'Bright Amber', index: 3 },
    ],
  },

  // ----------------------------------------------------
  // 4-BIT PALETTES (16 colors - SCREEN 7 / 9 / 12)
  // ----------------------------------------------------
  {
    id: '4bit-ega-vga',
    name: 'IBM EGA/VGA Standard 16 Colors',
    bitDepth: 4,
    description: 'The definitive 16-color PC palette used by QBasic SCREEN 7, 8, 9, 12, 13',
    screenMode: 'SCREEN 12',
    qbasicScreenCmd: 'SCREEN 12',
    qbasicPaletteCode: "' Standard 16-color QBasic palette (SCREEN 12 / SCREEN 7 / SCREEN 9)",
    colors: [
      { r: 0, g: 0, b: 0, name: '0: Black', index: 0 },
      { r: 0, g: 0, b: 170, name: '1: Blue', index: 1 },
      { r: 0, g: 170, b: 0, name: '2: Green', index: 2 },
      { r: 0, g: 170, b: 170, name: '3: Cyan', index: 3 },
      { r: 170, g: 0, b: 0, name: '4: Red', index: 4 },
      { r: 170, g: 0, b: 170, name: '5: Magenta', index: 5 },
      { r: 170, g: 85, b: 0, name: '6: Brown', index: 6 },
      { r: 170, g: 170, b: 170, name: '7: Light Gray', index: 7 },
      { r: 85, g: 85, b: 85, name: '8: Dark Gray', index: 8 },
      { r: 85, g: 85, b: 255, name: '9: Light Blue', index: 9 },
      { r: 85, g: 255, b: 85, name: '10: Light Green', index: 10 },
      { r: 85, g: 255, b: 255, name: '11: Light Cyan', index: 11 },
      { r: 255, g: 85, b: 85, name: '12: Light Red', index: 12 },
      { r: 255, g: 85, b: 255, name: '13: Light Magenta', index: 13 },
      { r: 255, g: 255, b: 85, name: '14: Yellow', index: 14 },
      { r: 255, g: 255, b: 255, name: '15: Bright White', index: 15 },
    ],
  },
  {
    id: '4bit-c64',
    name: 'Commodore 64 16 Colors',
    bitDepth: 4,
    description: 'Iconic warm analog palette of the VIC-II graphics chip',
    screenMode: 'SCREEN 7',
    qbasicScreenCmd: 'SCREEN 7',
    qbasicPaletteCode: "' C64 palette mapped to QBasic SCREEN 7 with PALETTE statements",
    colors: [
      { r: 0, g: 0, b: 0, name: 'Black', index: 0 },
      { r: 255, g: 255, b: 255, name: 'White', index: 1 },
      { r: 136, g: 0, b: 0, name: 'Red', index: 2 },
      { r: 170, g: 255, b: 238, name: 'Cyan', index: 3 },
      { r: 204, g: 68, b: 204, name: 'Purple', index: 4 },
      { r: 0, g: 204, b: 85, name: 'Green', index: 5 },
      { r: 0, g: 0, b: 170, name: 'Blue', index: 6 },
      { r: 238, g: 238, b: 119, name: 'Yellow', index: 7 },
      { r: 221, g: 136, b: 85, name: 'Orange', index: 8 },
      { r: 102, g: 68, b: 0, name: 'Brown', index: 9 },
      { r: 255, g: 119, b: 119, name: 'Light Red', index: 10 },
      { r: 51, g: 51, b: 51, name: 'Dark Gray', index: 11 },
      { r: 119, g: 119, b: 119, name: 'Medium Gray', index: 12 },
      { r: 170, g: 255, b: 102, name: 'Light Green', index: 13 },
      { r: 0, g: 136, b: 255, name: 'Light Blue', index: 14 },
      { r: 187, g: 187, b: 187, name: 'Light Gray', index: 15 },
    ],
  },
  {
    id: '4bit-gray16',
    name: '16-Shade Grayscale',
    bitDepth: 4,
    description: '16 linear grayscale levels from black to white',
    screenMode: 'SCREEN 12',
    qbasicScreenCmd: 'SCREEN 12',
    qbasicPaletteCode: "' 16-level grayscale for SCREEN 12",
    colors: Array.from({ length: 16 }, (_, i) => {
      const v = Math.round((i / 15) * 255);
      return { r: v, g: v, b: v, name: `Gray ${i}`, index: i };
    }),
  },

  // ----------------------------------------------------
  // 8-BIT PALETTES (256 colors - SCREEN 13 VGA Mode 13h)
  // ----------------------------------------------------
  {
    id: '8bit-vga-default',
    name: 'VGA Mode 13h Default (SCREEN 13)',
    bitDepth: 8,
    description: 'The standard 256-color VGA hardware palette in QBasic SCREEN 13 (320x200)',
    screenMode: 'SCREEN 13',
    qbasicScreenCmd: 'SCREEN 13',
    qbasicPaletteCode: "' Default VGA 256-color palette (SCREEN 13)",
    colors: generateVGA256Palette(),
  },
  {
    id: '8bit-gray256',
    name: '256-Level Linear Grayscale',
    bitDepth: 8,
    description: '256-shade smooth grayscale ramp (ideal for photographic rendering in Mode 13h)',
    screenMode: 'SCREEN 13',
    qbasicScreenCmd: 'SCREEN 13',
    qbasicPaletteCode: "' Set 256 grayscale palette in SCREEN 13:\nFOR i% = 0 TO 255\n  v% = INT(i% * 63 / 255)\n  OUT &H3C8, i%\n  OUT &H3C9, v%: OUT &H3C9, v%: OUT &H3C9, v%\nNEXT i%",
    colors: Array.from({ length: 256 }, (_, i) => ({
      r: i,
      g: i,
      b: i,
      name: `Gray ${i}`,
      index: i,
    })),
  },
];

/**
 * Generates the authentic standard VGA 256-color palette as used by Mode 13h / QBasic SCREEN 13.
 * - 0..15: Standard 16 EGA colors
 * - 16..31: 16 shades of gray
 * - 32..247: 216 color ramp (combinations of hues and luminance)
 * - 248..255: Black
 */
function generateVGA256Palette(): RGBColor[] {
  const colors: RGBColor[] = [];

  // 0..15 standard EGA colors
  const ega16: [number, number, number][] = [
    [0, 0, 0],
    [0, 0, 170],
    [0, 170, 0],
    [0, 170, 170],
    [170, 0, 0],
    [170, 0, 170],
    [170, 85, 0],
    [170, 170, 170],
    [85, 85, 85],
    [85, 85, 255],
    [85, 255, 85],
    [85, 255, 255],
    [255, 85, 85],
    [255, 85, 255],
    [255, 255, 85],
    [255, 255, 255],
  ];

  for (let i = 0; i < 16; i++) {
    colors.push({
      r: ega16[i][0],
      g: ega16[i][1],
      b: ega16[i][2],
      name: `EGA ${i}`,
      index: i,
    });
  }

  // 16..31 16-level grayscale
  for (let i = 0; i < 16; i++) {
    const val = Math.round((i / 15) * 255);
    colors.push({
      r: val,
      g: val,
      b: val,
      name: `Gray ${i}`,
      index: 16 + i,
    });
  }

  // 32..247: Standard VGA color cube / wheel
  // Standard VGA uses 72 hues with 3 levels of saturation/intensity
  const hues = [
    [255, 0, 0],
    [255, 64, 0],
    [255, 128, 0],
    [255, 191, 0],
    [255, 255, 0],
    [191, 255, 0],
    [128, 255, 0],
    [64, 255, 0],
    [0, 255, 0],
    [0, 255, 64],
    [0, 255, 128],
    [0, 255, 191],
    [0, 255, 255],
    [0, 191, 255],
    [0, 128, 255],
    [0, 64, 255],
    [0, 0, 255],
    [64, 0, 255],
    [128, 0, 255],
    [191, 0, 255],
    [255, 0, 255],
    [255, 0, 191],
    [255, 0, 128],
    [255, 0, 64],
  ];

  // 3 groups of 24 hues, each with 3 luminance steps
  const factors = [
    [1.0, 0.7, 0.4],
    [0.7, 0.5, 0.3],
    [0.4, 0.3, 0.2],
  ];

  for (let g = 0; g < 3; g++) {
    for (let h = 0; h < 24; h++) {
      const base = hues[h];
      const factor = factors[g][0];
      const idx = 32 + g * 24 + h;
      colors.push({
        r: Math.min(255, Math.round(base[0] * factor)),
        g: Math.min(255, Math.round(base[1] * factor)),
        b: Math.min(255, Math.round(base[2] * factor)),
        name: `Color ${idx}`,
        index: idx,
      });
    }
  }

  // Next 72 hues with white tint
  for (let g = 0; g < 3; g++) {
    for (let h = 0; h < 24; h++) {
      const base = hues[h];
      const factor = factors[g][1];
      const whiteAdd = Math.round(70 * (1 - factor));
      const idx = 104 + g * 24 + h;
      colors.push({
        r: Math.min(255, Math.round(base[0] * factor + whiteAdd)),
        g: Math.min(255, Math.round(base[1] * factor + whiteAdd)),
        b: Math.min(255, Math.round(base[2] * factor + whiteAdd)),
        name: `Color ${idx}`,
        index: idx,
      });
    }
  }

  // Next 72 pastel / darker hues
  for (let g = 0; g < 3; g++) {
    for (let h = 0; h < 24; h++) {
      const base = hues[h];
      const factor = factors[g][2];
      const idx = 176 + g * 24 + h;
      colors.push({
        r: Math.min(255, Math.round(base[0] * factor)),
        g: Math.min(255, Math.round(base[1] * factor)),
        b: Math.min(255, Math.round(base[2] * factor)),
        name: `Color ${idx}`,
        index: idx,
      });
    }
  }

  // Fill up to 256 with black if not 256
  while (colors.length < 256) {
    colors.push({
      r: 0,
      g: 0,
      b: 0,
      name: `Black ${colors.length}`,
      index: colors.length,
    });
  }

  return colors;
}

export function rgbToHex(c: RGBColor): string {
  const r = c.r.toString(16).padStart(2, '0');
  const g = c.g.toString(16).padStart(2, '0');
  const b = c.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}
