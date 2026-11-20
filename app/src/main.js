// Editor wiring: photo upload, sample loading, layout/grade/size pickers,
// word fields, per-panel crop controls, surprise-me, and PNG export.
// The preview canvas and every export render through the same compositor
// (cover.js), so the preview is the export. A headless hook,
// window.__renderExport(w, h), renders the current state at any size
// and returns a PNG data URL; window.__viceCoverState exposes the state
// for inspection.

import { drawCover, renderCover } from './cover.js';
import { GRADE_ORDER, GRADES, LAYOUT_ORDER, LAYOUTS, SIZES, defaultState } from './presets.js';
import { loadFontsExplicitly, runShot } from './shots.js';

const state = defaultState();
const photos = [null, null, null];
const canvas = document.getElementById('cover');
const status = document.getElementById('status');

function $(id) {
  return document.getElementById(id);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function currentSize() {
  return SIZES[state.size] || SIZES.landscape;
}

function redraw() {
  const { w, h } = currentSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state, photos);
  const note = $('sizeNote');
  if (note) note.textContent = `${w} × ${h} — ${LAYOUTS[state.layout].name} · ${GRADES[state.grade].name}`;
}

function setState(patch) {
  Object.assign(state, patch);
  syncControls();
  redraw();
}

function syncControls() {
  const set = (id, value) => {
    const el = $(id);
    if (el) el.value = value;
  };
  set('layout', state.layout);
  set('grade', state.grade);
  set('size', state.size);
  set('caption', state.caption);
  set('kicker', state.kicker);
  set('script', state.script);
  set('strip', state.strip);
  set('seed', String(state.seed));
}

async function loadSample(name, slot) {
  photos[slot] = await loadImage(`samples/${name}.jpg`);
}

function fillSelect(id, entries) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = '';
  for (const [value, label] of entries) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    el.appendChild(opt);
  }
}

function download(canvasEl, filename) {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

async function exportOne(sizeKey) {
  const { w, h } = SIZES[sizeKey];
  const out = renderCover(w, h, state, photos);
  await download(out, `palm-city-heat-${sizeKey}-${w}x${h}.png`);
  if (status) status.textContent = `Saved palm-city-heat-${sizeKey}-${w}x${h}.png`;
}

// --- Controls -------------------------------------------------------------

fillSelect('layout', LAYOUT_ORDER.map((id) => [id, LAYOUTS[id].name]));
fillSelect('grade', GRADE_ORDER.map((id) => [id, GRADES[id].name]));
fillSelect('size', Object.entries(SIZES).map(([id, s]) => [id, s.label]));

$('layout')?.addEventListener('change', (e) => setState({ layout: e.target.value }));
$('grade')?.addEventListener('change', (e) => setState({ grade: e.target.value }));
$('size')?.addEventListener('change', (e) => setState({ size: e.target.value }));
$('caption')?.addEventListener('input', (e) => setState({ caption: e.target.value }));
$('kicker')?.addEventListener('input', (e) => setState({ kicker: e.target.value }));
$('script')?.addEventListener('input', (e) => setState({ script: e.target.value }));
$('strip')?.addEventListener('input', (e) => setState({ strip: e.target.value }));
$('seed')?.addEventListener('change', (e) => setState({ seed: Number(e.target.value) || 0 }));

$('photo')?.addEventListener('change', async (e) => {
  const files = [...e.target.files].slice(0, 3);
  for (let i = 0; i < files.length; i++) {
    photos[i] = await loadImage(URL.createObjectURL(files[i]));
  }
  redraw();
  if (status) status.textContent = `${files.length} photo(s) loaded`;
});

$('loadSamples')?.addEventListener('click', async () => {
  await loadSample('boulevard', 0);
  await loadSample('pier', 1);
  redraw();
  if (status) status.textContent = 'Sample photos loaded';
});

// Per-panel crop: pick a photo slot, then zoom and pan it.
function cropTarget() {
  const sel = $('cropPhoto');
  return sel ? Number(sel.value) : 0;
}
function applyCrop() {
  const slot = cropTarget();
  const crop = state.crops[slot];
  crop.zoom = Math.max(0.5, Number($('zoom')?.value ?? 1));
  crop.panX = Number($('panX')?.value ?? 0);
  crop.panY = Number($('panY')?.value ?? 0);
  redraw();
}
for (const id of ['zoom', 'panX', 'panY']) {
  $(id)?.addEventListener('input', applyCrop);
}
$('cropPhoto')?.addEventListener('change', () => {
  const crop = state.crops[cropTarget()];
  if ($('zoom')) $('zoom').value = String(crop.zoom);
  if ($('panX')) $('panX').value = String(crop.panX);
  if ($('panY')) $('panY').value = String(crop.panY);
});

// Surprise-me: a seeded pick of layout, grade, and seed.
$('surprise')?.addEventListener('click', () => {
  let s = (state.seed * 2654435761 + 987654321) >>> 0;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  setState({
    layout: LAYOUT_ORDER[Math.floor(rnd() * LAYOUT_ORDER.length)],
    grade: GRADE_ORDER[Math.floor(rnd() * GRADE_ORDER.length)],
    seed: Math.floor(rnd() * 100000),
  });
  if (status) status.textContent = 'Surprise! A new seeded combination.';
});

$('export')?.addEventListener('click', () => exportOne(state.size));
$('exportAll')?.addEventListener('click', async () => {
  for (const key of Object.keys(SIZES)) await exportOne(key);
});

// --- Headless hook ----------------------------------------------------------
// Used by the screenshot pipeline and by the finalist review: renders the
// current state at any size and returns a PNG data URL. Fonts are loaded
// explicitly first, for the same lazy-font reason as in shots.js.

window.__viceCoverState = state;
window.__viceCoverPhotos = photos;
window.__renderExport = async function renderExport(width, height) {
  await loadFontsExplicitly();
  const out = renderCover(width, height, state, photos);
  return out.toDataURL('image/png');
};
window.__redraw = redraw;

// --- Boot -------------------------------------------------------------------

const query = new URLSearchParams(location.search);
const shot = query.get('shot');

const api = {
  setState,
  loadSample,
  redraw,
  fitCanvasToViewport() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  },
};

if (shot) {
  runShot(shot, query, api).catch((err) => {
    console.error(err);
    window.__shotError = String(err);
  });
} else {
  (async () => {
    await loadFontsExplicitly();
    try {
      await loadSample('boulevard', 0);
      await loadSample('pier', 1);
    } catch {
      // Samples are optional on first paint; the user can load them.
    }
    syncControls();
    redraw();
  })();
}
