// Grades (colour palettes + photo treatments) and layouts (panel maps) for
// the cover maker. Every number here comes from the round-2 design brief:
// the champion layout is vice-hero, the champion grade is vivid, and the
// other four grades and five layouts stay selectable in the editor.

export const GRADES = {
  vivid: {
    id: 'vivid', name: 'Vivid Sunset', treatment: 'vivid',
    sky: [[0, '#2b1055'], [0.40, '#a4137a'], [0.70, '#ff5e3a'], [1.00, '#ffc46b']],
    sun: '#ffe9a8', glow: 'rgba(255,140,60,0.6)',
    far: '#3d1658', near: '#160a28', windows: '#ffd166', dots: '#ff9e6b',
    duoDark: '#2b1030', duoLight: '#ffb36b',
    caption: '#ffffff', outline: '#1c0b2e', kicker: '#ffd166', accent: '#ff2e88',
    scrim: 'rgba(10,6,18,0.8)',
  },
  duotone: {
    id: 'duotone', name: 'Duotone Dusk', treatment: 'duotone',
    sky: [[0, '#1a1030'], [0.45, '#5c2358'], [0.75, '#b34a5e'], [1.00, '#e08a5a']],
    sun: '#ffd9a0', glow: 'rgba(200,110,80,0.5)',
    far: '#2e1745', near: '#120a20', windows: '#e8b25a', dots: '#c97e5a',
    duoDark: '#241533', duoLight: '#ffb36b',
    caption: '#ffffff', outline: '#1a0b26', kicker: '#ffd166', accent: '#ff5e8a',
    scrim: 'rgba(12,7,20,0.8)',
  },
  halftone: {
    id: 'halftone', name: 'Halftone Pop', treatment: 'halftone',
    sky: [[0, '#12082e'], [0.40, '#7a1e6e'], [0.70, '#ff7e47'], [1.00, '#ffc46b']],
    sun: '#fff3c4', glow: 'rgba(255,120,60,0.55)',
    far: '#33124e', near: '#140a26', windows: '#ffd166', dots: '#ff9e6b',
    duoDark: '#20102e', duoLight: '#ffb36b',
    caption: '#ffffff', outline: '#1c0b2e', kicker: '#ffd166', accent: '#ff2e88',
    scrim: 'rgba(10,6,18,0.8)',
  },
  clean: {
    id: 'clean', name: 'Clean Coast', treatment: 'clean',
    sky: [[0, '#1b2a52'], [0.45, '#3a6ea5'], [0.75, '#e08a5a'], [1.00, '#f2c078']],
    sun: '#fff6d8', glow: 'rgba(255,190,110,0.5)',
    far: '#2c3a5e', near: '#141c30', windows: '#ffe9a8', dots: '#f2b078',
    duoDark: '#1c2440', duoLight: '#f2c078',
    caption: '#ffffff', outline: '#14203a', kicker: '#ffe9a8', accent: '#ff7e47',
    scrim: 'rgba(10,14,28,0.8)',
  },
  grain: {
    id: 'grain', name: 'Grain Reel', treatment: 'grain',
    sky: [[0, '#241031'], [0.40, '#8a2f6d'], [0.70, '#ff8a4a'], [1.00, '#ffc46b']],
    sun: '#ffe9a8', glow: 'rgba(255,140,60,0.55)',
    far: '#38164e', near: '#150a24', windows: '#ffd166', dots: '#ff9e6b',
    duoDark: '#261230', duoLight: '#ffb36b',
    caption: '#ffffff', outline: '#1c0b2e', kicker: '#ffd166', accent: '#ff2e88',
    scrim: 'rgba(10,6,18,0.8)',
  },
};

export const GRADE_ORDER = ['vivid', 'duotone', 'halftone', 'clean', 'grain'];

// Face anchors, measured from the kit samples: the boulevard face zone
// runs y 0.03–0.35 and the pier face zone y 0.02–0.42, so the anchors sit
// just below the top of each face and keep every head inside its panel
// at landscape, portrait, and square alike.
// A panel: fractions of the cover, a photo slot (0/1/2) or a drawn scene,
// an anchor point (fractions of the photo) that the crop centres on, and
// its label lines. Photo slots: 0 = first photo, 1 = second photo.
function panel(x, y, w, h, photo, anchor, label, sub, scene = null) {
  return { x, y, w, h, photo, anchor, label, sub, scene };
}

export const LAYOUTS = {
  'vice-hero': {
    id: 'vice-hero', name: 'Vice Hero + Story',
    panels: [
      panel(0, 0, 0.52, 0.70, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
      panel(0.535, 0, 0.465, 0.3425, 1, [0.40, 0.22], 'PIER 26', '5:30 AM — GONE FISHING'),
      panel(0.535, 0.3575, 0.465, 0.3425, null, null, 'MARINA DEL SOL', '7:48 PM — NO WITNESSES', 'marina'),
    ],
  },
  single: {
    id: 'single', name: 'Single Hero',
    panels: [
      panel(0, 0, 1, 0.70, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
    ],
  },
  duo: {
    id: 'duo', name: 'Duo Split',
    panels: [
      panel(0, 0, 0.4925, 0.70, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
      panel(0.5075, 0, 0.4925, 0.70, 1, [0.40, 0.22], 'PIER 26', '5:30 AM — GONE FISHING'),
    ],
  },
  filmstrip: {
    id: 'filmstrip', name: 'Filmstrip',
    panels: [
      panel(0, 0, 0.58, 0.70, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
      panel(0.595, 0, 0.405, 0.2233, 1, [0.40, 0.22], 'PIER 26', '5:30 AM — GONE FISHING'),
      panel(0.595, 0.2383, 0.405, 0.2233, null, null, 'MARINA DEL SOL', '7:48 PM — NO WITNESSES', 'marina'),
      panel(0.595, 0.4767, 0.405, 0.2233, 0, [0.46, 0.19], 'PALM ROW', '9:15 PM — LIGHTS OUT'),
    ],
  },
  grid: {
    id: 'grid', name: 'Four Corners',
    panels: [
      panel(0, 0, 0.4925, 0.3425, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
      panel(0.5075, 0, 0.4925, 0.3425, 1, [0.40, 0.22], 'PIER 26', '5:30 AM — GONE FISHING'),
      panel(0, 0.3575, 0.4925, 0.3425, null, null, 'MARINA DEL SOL', '7:48 PM — NO WITNESSES', 'marina'),
      panel(0.5075, 0.3575, 0.4925, 0.3425, null, null, 'SKYLINE', '8:30 PM — BIG MONEY', 'backdrop'),
    ],
  },
  trio: {
    id: 'trio', name: 'Three Columns',
    panels: [
      panel(0, 0, 0.3233, 0.70, 0, [0.46, 0.19], 'OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'),
      panel(0.3383, 0, 0.3233, 0.70, 1, [0.40, 0.22], 'PIER 26', '5:30 AM — GONE FISHING'),
      panel(0.6767, 0, 0.3233, 0.70, null, null, 'MARINA DEL SOL', '7:48 PM — NO WITNESSES', 'marina'),
    ],
  },
};

export const LAYOUT_ORDER = ['vice-hero', 'single', 'duo', 'filmstrip', 'grid', 'trio'];

export const SIZES = {
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
};

export function defaultState() {
  return {
    layout: 'vice-hero',
    grade: 'vivid',
    caption: 'PALM CITY HEAT',
    kicker: 'SUMMER NEVER ENDS',
    script: 'Every light a story',
    strip: 'SUMMER NEVER ENDS — SHOT ON YOUR OWN CAMERA',
    seed: 42,
    size: 'landscape',
    // Per photo slot: zoom (never below 0.5) and pan offsets in photo fractions.
    crops: [
      { zoom: 1, panX: 0, panY: 0 },
      { zoom: 1, panX: 0, panY: 0 },
      { zoom: 1, panX: 0, panY: 0 },
    ],
  };
}
