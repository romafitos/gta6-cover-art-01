// Grades and layouts for the cover maker.
// A grade is a palette: sky stops for drawn scenes, sun and skyline
// colours, the duotone pair, and the lettering colours. A layout is a
// list of panels plus the shared title-band and strip wording slots.
// Panel geometry is in fractions of the cover (x, y, w, h). A panel
// names a photo slot (0, 1 or 2), a treatment, a face anchor point
// (fractions of the photo), and its label lines; a panel with
// scene: 'marina' is drawn procedurally instead of from a photo.

export const GRADES = {
  vivid: {
    name: 'Vivid Sunset',
    sky: [[0, '#2b1055'], [0.40, '#a4137a'], [0.70, '#ff5e3a'], [1.00, '#ffc46b']],
    sun: '#ffe9a8',
    sunGlow: 'rgba(255,140,60,0.6)',
    farSkyline: '#3d1658',
    nearSkyline: '#160a28',
    windows: '#ffd166',
    dots: '#ff9e6b',
    duoDark: '#2b1030',
    duoLight: '#ffb36b',
    caption: '#ffffff',
    outline: '#1c0b2e',
    kicker: '#ffd166',
    accent: '#ff2e88',
    scrim: 'rgba(10,6,18,0.8)',
  },
  duotone: {
    name: 'Sepia Duotone',
    sky: [[0, '#241428'], [0.55, '#5c2a3a'], [1.00, '#c98a4b']],
    sun: '#f2d8a0',
    sunGlow: 'rgba(220,150,70,0.5)',
    farSkyline: '#3a2030',
    nearSkyline: '#180e18',
    windows: '#e8b96a',
    dots: '#c98a4b',
    duoDark: '#241428',
    duoLight: '#e8b96a',
    caption: '#f5ead6',
    outline: '#1c0b14',
    kicker: '#e8b96a',
    accent: '#c94b6b',
    scrim: 'rgba(16,8,14,0.8)',
  },
  halftone: {
    name: 'Halftone Pop',
    sky: [[0, '#101c4a'], [0.5, '#7a2a8a'], [1.00, '#ff7e47']],
    sun: '#ffe066',
    sunGlow: 'rgba(255,200,60,0.55)',
    farSkyline: '#232a5e',
    nearSkyline: '#0d1030',
    windows: '#ffe066',
    dots: '#ff7e47',
    duoDark: '#101c4a',
    duoLight: '#ffe066',
    caption: '#ffffff',
    outline: '#0d1030',
    kicker: '#ffe066',
    accent: '#ff2e88',
    scrim: 'rgba(8,8,24,0.8)',
  },
  clean: {
    name: 'Clean Daylight',
    sky: [[0, '#1d4a6b'], [0.55, '#3a7a9e'], [1.00, '#ffd9a0']],
    sun: '#fff3c4',
    sunGlow: 'rgba(255,220,140,0.5)',
    farSkyline: '#2a4a5e',
    nearSkyline: '#122636',
    windows: '#ffd166',
    dots: '#7ec8e3',
    duoDark: '#122636',
    duoLight: '#ffd9a0',
    caption: '#ffffff',
    outline: '#122636',
    kicker: '#ffd166',
    accent: '#ff5e7a',
    scrim: 'rgba(10,20,30,0.8)',
  },
  grain: {
    name: 'Grain Noir',
    sky: [[0, '#14101c'], [0.5, '#3c2438'], [1.00, '#8a4a5e']],
    sun: '#e8d8c0',
    sunGlow: 'rgba(200,160,120,0.45)',
    farSkyline: '#241a2c',
    nearSkyline: '#0e0a12',
    windows: '#d8b878',
    dots: '#8a6a72',
    duoDark: '#14101c',
    duoLight: '#d8b878',
    caption: '#f0e8e0',
    outline: '#0e0a12',
    kicker: '#d8b878',
    accent: '#b85e7a',
    scrim: 'rgba(10,8,12,0.8)',
  },
};

// Every layout's panels carry label/sub text, an anchor, and a
// treatment so the compositor stays uniform across layouts.
export const LAYOUTS = {
  'vice-hero': {
    name: 'Vice Hero + Story',
    panels: [
      { x: 0, y: 0, w: 0.52, h: 0.70, photo: 0, treatment: 'vivid', anchor: [0.46, 0.19],
        label: 'OCEAN DRIVE', sub: '6:42 PM — LOOKING FOR TROUBLE' },
      { x: 0.535, y: 0, w: 0.465, h: 0.3425, photo: 1, treatment: 'vivid', anchor: [0.40, 0.22],
        label: 'PIER 26', sub: '5:30 AM — GONE FISHING' },
      { x: 0.535, y: 0.3575, w: 0.465, h: 0.3425, scene: 'marina',
        label: 'MARINA DEL SOL', sub: '7:48 PM — NO WITNESSES' },
    ],
    badges: true,
  },
  'hero-left': {
    name: 'Hero Left',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 0.70, photo: 0, treatment: 'vivid', anchor: [0.46, 0.19],
        label: 'OCEAN DRIVE', sub: '6:42 PM — LOOKING FOR TROUBLE' },
      { x: 0.595, y: 0, w: 0.405, h: 0.3425, photo: 1, treatment: 'vivid', anchor: [0.40, 0.22],
        label: 'PIER 26', sub: '5:30 AM — GONE FISHING' },
      { x: 0.595, y: 0.3575, w: 0.405, h: 0.3425, scene: 'skyline',
        label: 'MARINA DEL SOL', sub: '7:48 PM — NO WITNESSES' },
    ],
    badges: true,
  },
  filmstrip: {
    name: 'Filmstrip',
    panels: [
      { x: 0, y: 0, w: 1.0, h: 0.42, photo: 0, treatment: 'vivid', anchor: [0.46, 0.25],
        label: 'OCEAN DRIVE', sub: '6:42 PM — LOOKING FOR TROUBLE' },
      { x: 0, y: 0.435, w: 0.4925, h: 0.265, photo: 1, treatment: 'clean', anchor: [0.40, 0.22],
        label: 'PIER 26', sub: '5:30 AM — GONE FISHING' },
      { x: 0.5075, y: 0.435, w: 0.4925, h: 0.265, scene: 'marina',
        label: 'MARINA DEL SOL', sub: '7:48 PM — NO WITNESSES' },
    ],
    badges: true,
  },
  grid: {
    name: 'Four Corners',
    panels: [
      { x: 0, y: 0, w: 0.4925, h: 0.3425, photo: 0, treatment: 'vivid', anchor: [0.46, 0.19],
        label: 'OCEAN DRIVE', sub: '6:42 PM — LOOKING FOR TROUBLE' },
      { x: 0.5075, y: 0, w: 0.4925, h: 0.3425, photo: 1, treatment: 'vivid', anchor: [0.40, 0.22],
        label: 'PIER 26', sub: '5:30 AM — GONE FISHING' },
      { x: 0, y: 0.3575, w: 0.4925, h: 0.3425, scene: 'skyline',
        label: 'PALM ROW', sub: '9:15 PM — LIGHTS OUT' },
      { x: 0.5075, y: 0.3575, w: 0.4925, h: 0.3425, scene: 'marina',
        label: 'MARINA DEL SOL', sub: '7:48 PM — NO WITNESSES' },
    ],
    badges: true,
  },
  poster: {
    name: 'Single Poster',
    panels: [
      { x: 0, y: 0, w: 1.0, h: 0.70, photo: 0, treatment: 'vivid', anchor: [0.46, 0.30],
        label: 'OCEAN DRIVE', sub: '6:42 PM — LOOKING FOR TROUBLE' },
    ],
    badges: true,
  },
};

export const SIZES = {
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
};

export const CHAMPION = {
  layout: 'vice-hero',
  grade: 'vivid',
  size: 'landscape',
  caption: 'PALM CITY HEAT',
  kicker: 'SUMMER NEVER ENDS',
  script: 'Every light a story',
  strip: 'SUMMER NEVER ENDS — SHOT ON YOUR OWN CAMERA',
  seed: 42,
  photo1: 'boulevard',
  photo2: 'pier',
};

// Lookups with a safe fallback so a stale saved state can never
// crash the compositor: unknown keys resolve to the champion.
export function gradeFor(key) { return GRADES[key] ?? GRADES.vivid; }
export function layoutFor(key) { return LAYOUTS[key] ?? LAYOUTS['vice-hero']; }
export function sizeFor(key) { return SIZES[key] ?? SIZES.landscape; }
