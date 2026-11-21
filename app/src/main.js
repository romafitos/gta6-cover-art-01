// Editor wiring: photo upload, sample loading, layout/grade/size
// pickers, word fields, per-panel crop controls, surprise-me, and
// PNG export. The preview canvas and every export render through
// the same compositor (cover.js), so the preview is the export.
// A headless hook, window.__renderExport(w, h), renders the current
// state at any size and returns a PNG data URL, and window.__state
// exposes the state for inspection.
import { drawCover, panelRects } from './cover.js';
import { runShot, ensureFontsForEditor } from './shots.js';
import { GRADES, LAYOUTS, SIZES, CHAMPION } from './presets.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const sizeNote = document.getElementById('size-note');

export const state = {
  layout: CHAMPION.layout,
  grade: CHAMPION.grade,
  size: CHAMPION.size,
  caption: CHAMPION.caption,
  kicker: CHAMPION.kicker,
  script: CHAMPION.script,
  strip: CHAMPION.strip,
  seed: CHAMPION.seed,
  crops: { 0: { zoom: 1, panX: 0, panY: 0 }, 1: { zoom: 1, panX: 0, panY: 0 }, 2: { zoom: 1, panX: 0, panY: 0 } },
};
window.__state = state;

const photos = [null, null, null];
window.__photos = photos;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  const size = SIZES[state.size] ?? SIZES.landscape;
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state, photos);
  if (sizeNote) sizeNote.textContent = `${size.label} — preview matches the export exactly.`;
}

function fillSelect(select, entries, current) {
  select.innerHTML = '';
  for (const [key, value] of Object.entries(entries)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value.name ?? value.label ?? key;
    if (key === current) option.selected = true;
    select.appendChild(option);
  }
}

function bindText(id, key) {
  const el = document.getElementById(id);
  el.value = state[key];
  el.addEventListener('input', () => { state[key] = el.value; redraw(); });
}

function bindCrop(slot) {
  const zoom = document.getElementById(`zoom${slot}`);
  const panX = document.getElementById(`panx${slot}`);
  const panY = document.getElementById(`pany${slot}`);
  if (!zoom || !panX || !panY) return;
  const apply = () => {
    state.crops[slot] = {
      zoom: Math.max(0.5, Number(zoom.value)),
      panX: Number(panX.value),
      panY: Number(panY.value),
    };
    redraw();
  };
  zoom.addEventListener('input', apply);
  panX.addEventListener('input', apply);
  panY.addEventListener('input', apply);
}

async function loadSample(slot, name) {
  photos[slot] = await loadImage(`samples/${name}.jpg`);
  redraw();
}

function download(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Headless hook: render the current state at any size, PNG data URL.
window.__renderExport = function renderExport(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state, photos);
  return off.toDataURL('image/png');
};
window.__panelRects = (w, h) => panelRects(state, w, h);

async function init() {
  fillSelect(document.getElementById('layout'), LAYOUTS, state.layout);
  fillSelect(document.getElementById('grade'), GRADES, state.grade);
  fillSelect(document.getElementById('size'), SIZES, state.size);
  document.getElementById('layout').addEventListener('change', (e) => { state.layout = e.target.value; redraw(); });
  document.getElementById('grade').addEventListener('change', (e) => { state.grade = e.target.value; redraw(); });
  document.getElementById('size').addEventListener('change', (e) => { state.size = e.target.value; redraw(); });
  bindText('caption', 'caption');
  bindText('kicker', 'kicker');
  bindText('script', 'script');
  bindText('strip', 'strip');
  const seedEl = document.getElementById('seed');
  seedEl.value = String(state.seed);
  seedEl.addEventListener('input', () => { state.seed = Number(seedEl.value) || 0; redraw(); });
  bindCrop(0);
  bindCrop(1);

  document.getElementById('sample-boulevard').addEventListener('click', () => loadSample(0, 'boulevard'));
  document.getElementById('sample-pier').addEventListener('click', () => loadSample(1, 'pier'));
  for (let slot = 0; slot < 3; slot++) {
    const input = document.getElementById(`photo${slot}`);
    if (!input) continue;
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      photos[slot] = await loadImage(URL.createObjectURL(file));
      redraw();
    });
  }

  document.getElementById('surprise').addEventListener('click', () => {
    const layouts = Object.keys(LAYOUTS);
    const grades = Object.keys(GRADES);
    state.layout = layouts[Math.floor(Math.random() * layouts.length)];
    state.grade = grades[Math.floor(Math.random() * grades.length)];
    state.seed = Math.floor(Math.random() * 10000);
    document.getElementById('layout').value = state.layout;
    document.getElementById('grade').value = state.grade;
    seedEl.value = String(state.seed);
    redraw();
  });

  document.getElementById('export').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      download(URL.createObjectURL(blob), `palm-city-heat-${canvas.width}x${canvas.height}.png`);
      status.textContent = `Saved palm-city-heat-${canvas.width}x${canvas.height}.png`;
    }, 'image/png');
  });

  document.getElementById('export-all').addEventListener('click', () => {
    for (const [key, size] of Object.entries(SIZES)) {
      download(window.__renderExport(size.w, size.h), `palm-city-heat-${size.w}x${size.h}.png`);
    }
    status.textContent = 'Saved all three sizes.';
  });

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, async (scene) => {
      if (!scene) { redraw(); return; }
      state.layout = scene.layout;
      state.grade = scene.grade;
      state.size = scene.size;
      state.caption = scene.caption;
      state.kicker = scene.kicker;
      state.script = scene.script;
      state.strip = scene.strip;
      state.seed = scene.seed;
      document.getElementById('layout').value = state.layout;
      document.getElementById('grade').value = state.grade;
      document.getElementById('size').value = state.size;
      document.getElementById('caption').value = state.caption;
      document.getElementById('kicker').value = state.kicker;
      document.getElementById('script').value = state.script;
      document.getElementById('strip').value = state.strip;
      document.getElementById('seed').value = String(state.seed);
      await loadSample(0, scene.photo1);
      await loadSample(1, scene.photo2);
      redraw();
    });
  } else {
    await ensureFontsForEditor();
    await loadSample(0, 'boulevard');
    await loadSample(1, 'pier');
    redraw();
  }
}

init();
