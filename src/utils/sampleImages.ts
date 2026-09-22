export interface SampleImage {
  id: string;
  name: string;
  category: string;
  generate: (width: number, height: number) => ImageData;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'synthwave-sunset',
    name: '80s Synthwave Grid',
    category: 'Retro Scenery',
    generate: (w: number, h: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Dark purple sky to orange horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      skyGrad.addColorStop(0, '#0f051d');
      skyGrad.addColorStop(0.5, '#401347');
      skyGrad.addColorStop(0.85, '#9d174d');
      skyGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.65);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 997) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 331) * 0.5 + 0.5) * (h * 0.5);
        const sr = (i % 3 === 0) ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Giant Glowing Sun
      const sunY = h * 0.52;
      const sunR = Math.min(w, h) * 0.28;
      const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sunGrad.addColorStop(0, '#fde047');
      sunGrad.addColorStop(0.4, '#f97316');
      sunGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Sun horizontal blind slices
      ctx.fillStyle = '#401347';
      for (let i = 0; i < 6; i++) {
        const sliceY = sunY + (i / 6) * sunR * 0.9;
        const sliceH = 1 + i * 1.2;
        ctx.fillRect(w / 2 - sunR, sliceY, sunR * 2, sliceH);
      }

      // Distant mountain silhouettes
      ctx.fillStyle = '#1e0524';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      const peaks = [
        [0.15, 0.45],
        [0.28, 0.52],
        [0.4, 0.42],
        [0.6, 0.48],
        [0.75, 0.43],
        [0.9, 0.53],
        [1.0, 0.65],
      ];
      peaks.forEach(([px, py]) => ctx.lineTo(px * w, py * h));
      ctx.lineTo(w, h * 0.65);
      ctx.closePath();
      ctx.fill();

      // Perspective Grid Floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      floorGrad.addColorStop(0, '#11052c');
      floorGrad.addColorStop(1, '#050212');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      // Perspective grid lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      const horizonY = h * 0.65;
      const numLines = 14;

      for (let i = -numLines; i <= numLines; i++) {
        const bottomX = w / 2 + (i / numLines) * (w * 1.2);
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(bottomX, h);
        ctx.stroke();
      }

      // Horizontal grid lines with perspective spacing
      for (let i = 1; i <= 10; i++) {
        const t = Math.pow(i / 10, 1.8);
        const y = horizonY + t * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      return ctx.getImageData(0, 0, w, h);
    },
  },
  {
    id: 'retro-pixel-portrait',
    name: 'Cyberpunk Portrait',
    category: 'Character',
    generate: (w: number, h: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#181824');
      bgGrad.addColorStop(1, '#2c1e3d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Neon rim circle
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.45, Math.min(w, h) * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Stylized head & visor
      const cx = w / 2;
      const cy = h * 0.45;
      const scale = Math.min(w, h) / 200;

      // Face silhouette
      ctx.fillStyle = '#d1d5db';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32 * scale, 45 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cybernetic high-tech Visor (neon magenta / cyan)
      const visorGrad = ctx.createLinearGradient(cx - 30 * scale, cy, cx + 30 * scale, cy);
      visorGrad.addColorStop(0, '#ec4899');
      visorGrad.addColorStop(0.5, '#f43f5e');
      visorGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = visorGrad;
      ctx.fillRect(cx - 32 * scale, cy - 8 * scale, 64 * scale, 16 * scale);

      // Hair silhouette
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(cx - 36 * scale, cy - 10 * scale);
      ctx.lineTo(cx - 40 * scale, cy - 45 * scale);
      ctx.lineTo(cx - 10 * scale, cy - 50 * scale);
      ctx.lineTo(cx + 20 * scale, cy - 48 * scale);
      ctx.lineTo(cx + 42 * scale, cy - 15 * scale);
      ctx.lineTo(cx + 30 * scale, cy - 30 * scale);
      ctx.lineTo(cx, cy - 35 * scale);
      ctx.closePath();
      ctx.fill();

      // Collar / shoulders
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(cx - 50 * scale, h);
      ctx.lineTo(cx - 25 * scale, cy + 50 * scale);
      ctx.lineTo(cx + 25 * scale, cy + 50 * scale);
      ctx.lineTo(cx + 50 * scale, h);
      ctx.closePath();
      ctx.fill();

      return ctx.getImageData(0, 0, w, h);
    },
  },
  {
    id: 'smpte-test-pattern',
    name: 'Hardware Test Pattern & Gradient',
    category: 'Calibration',
    generate: (w: number, h: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // 7 Color bars top 50%
      const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
      const barW = w / bars.length;
      bars.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(i * barW, 0, barW + 1, h * 0.45);
      });

      // Smooth grayscale gradient in middle
      const grayGrad = ctx.createLinearGradient(0, 0, w, 0);
      grayGrad.addColorStop(0, '#000000');
      grayGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grayGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.25);

      // Bottom section: radial sphere on left, fine grating lines on right
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      // Shaded 3D Sphere for dithering curve tests
      const sphX = w * 0.25;
      const sphY = h * 0.85;
      const sphR = Math.min(w, h) * 0.12;
      const sphereGrad = ctx.createRadialGradient(
        sphX - sphR * 0.3,
        sphY - sphR * 0.3,
        sphR * 0.05,
        sphX,
        sphY,
        sphR
      );
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.3, '#38bdf8');
      sphereGrad.addColorStop(0.7, '#1e3a8a');
      sphereGrad.addColorStop(1, '#020617');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(sphX, sphY, sphR, 0, Math.PI * 2);
      ctx.fill();

      // High-frequency alternating vertical stripes
      const stripeStartX = w * 0.55;
      const stripeW = w * 0.4;
      for (let x = 0; x < stripeW; x += 4) {
        ctx.fillStyle = (x % 8 === 0) ? '#ffffff' : '#000000';
        ctx.fillRect(stripeStartX + x, h * 0.75, 4, h * 0.2);
      }

      return ctx.getImageData(0, 0, w, h);
    },
  },
];
