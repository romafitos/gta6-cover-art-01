// Presets: the five panel layouts, four colour grades, three export sizes
// and the caption samples. Layouts are functions of (w, h) returning panel
// rects {x, y, w, h, photo, treatment, rotate} in fractions of the cover,
// so one layout works at every export size.

// --- Grades: sky stops, sun, skyline, duotone pair, caption colours. ---
export const GRADES = {
  sunset: {
    label: 'Sunset',
    sky: [[0, '#2b1055'], [0.45, '#b83280'], [0.75, '#ff7e47'], [1, '#ffc46b']],
    sun: '#ffe9a8', sunGlow: 'rgba(255,170,90,0.55)',
    far: '#4a1e63', near: '#1c0b2e', windows: '#ffd166', dots: '#ff9e6b',
    dark: '#2b1030', light: '#ffb36b',
    caption: '#ffffff', outline: '#1c0b2e', kicker: '#ffd166', accent: '#ff7e47',
    scrim: 'rgba(10,6,18,0.8)',
  },
  neon: {
    label: 'Neon',
    sky: [[0, '#0d0221'], [0.45, '#4b0f70'], [0.75, '#c2188b'], [1, '#ff2e88']],
    sun: '#7df9ff', sunGlow: 'rgba(255,46,136,0.6)',
    far: '#2a0a4a', near: '#0d0221', windows: '#7df9ff', dots: '#ff2e88',
    dark: '#0a1030', light: '#ff5fd0',
    caption: '#ffffff', outline: '#0d0221', kicker: '#7df9ff', accent: '#ff2e88',
    scrim: 'rgba(10,6,18,0.8)',
  },
  nights: {
    label: 'Vice Nights',
    sky: [[0, '#050914'], [0.5, '#16224d'], [0.8, '#3a2a6e'], [1, '#7a3fa0']],
    sun: '#e8ecff', sunGlow: 'rgba(140,170,255,0.5)',
    far: '#141a38', near: '#070a18', windows: '#9db8ff', dots: '#8fb7ff',
    dark: '#0a0a24', light: '#8fb7ff',
    caption: '#f2f5ff', outline: '#070a18', kicker: '#9db8ff', accent: '#7df9ff',
    scrim: 'rgba(10,6,18,0.8)',
  },
  dawn: {
    label: 'Pastel Dawn',
    sky: [[0, '#5b4a8a'], [0.45, '#c98bb0'], [0.75, '#ffb08a'], [1, '#ffe3b3']],
    sun: '#fff6d8', sunGlow: 'rgba(255,200,150,0.55)',
    far: '#6a4a7a', near: '#33244d', windows: '#ffe3b3', dots: '#ffb08a',
    dark: '#3a2a4a', light: '#ffd9c2',
    caption: '#ffffff', outline: '#33244d', kicker: '#ffe3b3', accent: '#ffb08a',
    scrim: 'rgba(10,6,18,0.8)',
  },
};

// --- Layouts: panel rects as fractions of the cover. ---
// photo: index into the photo list. treatment: per-panel photo treatment.
// rotate: degrees on the accent panel only.
export const LAYOUTS = {
  'hero-left': {
    label: 'Hero + 3-Strip',
    panels(w, h) {
      const g = 0.018; // gutter, fraction of width
      const heroW = 0.6;
      const stripX = heroW + g;
      const stripW = 1 - stripX;
      const stripH = (1 - 0.22 - g * 2) / 3;
      return [
        { x: 0, y: 0, w: heroW, h: 0.78, photo: 0, treatment: 'duotone', rotate: 0 },
        { x: stripX, y: 0, w: stripW, h: stripH, photo: 1, treatment: 'halftone', rotate: 0 },
        { x: stripX, y: stripH + g, w: stripW, h: stripH, photo: 0, treatment: 'clean', rotate: 0 },
        { x: stripX, y: (stripH + g) * 2, w: stripW, h: stripH, photo: 1, treatment: 'grain', rotate: 0 },
      ];
    },
  },
  'hero-strip': {
    label: 'Full-Bleed Hero + Strip',
    panels(w, h) {
      const g = 0.018;
      const heroH = 0.66;
      const stripY = heroH + g;
      const stripH = 0.78 - stripY - g;
      const stripW = (1 - g * 2) / 3;
      return [
        { x: 0, y: 0, w: 1, h: heroH, photo: 0, treatment: 'duotone', rotate: 0 },
        { x: 0, y: stripY, w: stripW, h: stripH, photo: 1, treatment: 'halftone', rotate: 0 },
        { x: stripW + g, y: stripY, w: stripW, h: stripH, photo: 0, treatment: 'clean', rotate: 0 },
        { x: (stripW + g) * 2, y: stripY, w: stripW, h: stripH, photo: 1, treatment: 'grain', rotate: 0 },
      ];
    },
  },
  diagonal: {
    label: 'Diagonal Split',
    panels(w, h) {
      return [
        { x: 0, y: 0, w: 1, h: 0.78, photo: 0, treatment: 'duotone', rotate: 0, clip: 'diag-a' },
        { x: 0, y: 0, w: 1, h: 0.78, photo: 1, treatment: 'halftone', rotate: 0, clip: 'diag-b' },
        { x: 0.68, y: 0.52, w: 0.3, h: 0.26, photo: 0, treatment: 'clean', rotate: -3 },
      ];
    },
  },
  grid: {
    label: '2 x 2 Grid',
    panels(w, h) {
      const g = 0.018;
      const cw = (1 - g) / 2;
      const ch = (0.78 - g) / 2;
      return [
        { x: 0, y: 0, w: cw, h: ch, photo: 0, treatment: 'duotone', rotate: 0 },
        { x: cw + g, y: 0, w: cw, h: ch, photo: 1, treatment: 'halftone', rotate: 0 },
        { x: 0, y: ch + g, w: cw, h: ch, photo: 1, treatment: 'clean', rotate: 0 },
        { x: cw + g, y: ch + g, w: cw, h: ch, photo: 0, treatment: 'grain', rotate: 0 },
      ];
    },
  },
  'center-hero': {
    label: 'Center Hero + Flanks',
    panels(w, h) {
      const g = 0.018;
      const flankW = 0.22;
      const heroX = flankW + g;
      const heroW = 1 - flankW * 2 - g * 2;
      return [
        { x: 0, y: 0, w: flankW, h: 0.78, photo: 1, treatment: 'halftone', rotate: 0 },
        { x: heroX, y: 0, w: heroW, h: 0.78, photo: 0, treatment: 'duotone', rotate: 0 },
        { x: heroX + heroW + g, y: 0, w: flankW, h: 0.78, photo: 1, treatment: 'clean', rotate: 0 },
      ];
    },
  },
};

// --- Export sizes. ---
export const SIZES = {
  square: { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  landscape: { label: 'Landscape 1920 x 1080', w: 1920, h: 1080 },
};

// --- Caption samples (own words; never the game's title). ---
export const CAPTION_SAMPLES = [
  { caption: 'NEON BOULEVARD', kicker: 'VICE CITY AFTER DARK' },
  { caption: 'SUNSET HEIST', kicker: 'ONE LAST SCORE' },
  { caption: 'PALM CITY HEAT', kicker: 'SUMMER NEVER ENDS' },
  { caption: 'BOULEVARD QUEEN', kicker: 'SHE RUNS THIS TOWN' },
  { caption: 'MIDNIGHT PIER', kicker: 'EVERY LIGHT A STORY' },
];

/** Seeded pick of layout + grade + caption for "Surprise me". */
export function surprisePick(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const layouts = Object.keys(LAYOUTS);
  const grades = Object.keys(GRADES);
  return {
    layout: layouts[Math.floor(next() * layouts.length)],
    grade: grades[Math.floor(next() * grades.length)],
    sample: CAPTION_SAMPLES[Math.floor(next() * CAPTION_SAMPLES.length)],
    seed: Math.floor(next() * 100000),
  };
}
