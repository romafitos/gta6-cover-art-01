// Vice Cover Studio — editor wiring: photo upload, layout / grade / size
// pickers, per-panel crop controls, caption + kicker, "Surprise me" seeded
// randomise, and PNG export at all three sizes. The preview canvas always
// renders through the same compositor as the export, so what you see is
// what the PNG holds.
import { drawCoverInto, renderCover } from './cover.js';
import { LAYOUTS, GRADES, SIZES, CAPTION_SAMPLES, surprisePick } from './presets.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

// --- State: one source of truth for preview and export. ---
const state = {
  photos: [],
  layout: 'hero-left',
  grade: 'sunset',
  size: 'landscape',
  caption: 'NEON BOULEVARD',
  kicker: 'VICE CITY AFTER DARK',
  seed: 42,
  panels: {},
};
let selectedPanel = 0;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + url));
    img.src = url;
  });
}

async function loadSamples(names) {
  const loaded = [];
  for (const n of names) {
    try { loaded.push(await loadImage(`samples/${n}.jpg`)); } catch (e) { /* skip */ }
  }
  if (loaded.length) state.photos = loaded;
  return loaded;
}

function fitPreview() {
  const size = SIZES[state.size];
  const wrap = $('preview-wrap');
  const shotCover = document.body.classList.contains('shot-cover');
  const maxW = Math.min(wrap.clientWidth || 960, 1920);
  const maxH = shotCover ? (wrap.clientHeight || 1080) : 560;
  const scale = Math.min(1, maxW / size.w, maxH / size.h);
  canvas.width = Math.max(2, Math.round(size.w * scale));
  canvas.height = Math.max(2, Math.round(size.h * scale));
}

function redraw() {
  fitPreview();
  const ctx = canvas.getContext('2d');
  // Draw the cover at the preview canvas's own size: same compositor.
  drawCoverInto(ctx, canvas.width, canvas.height, state);
  $('size-note').textContent = `Preview ${canvas.width} x ${canvas.height} — export ${SIZES[state.size].w} x ${SIZES[state.size].h}`;
}

function buildPickers() {
  const layoutBox = $('layout-picker');
  Object.entries(LAYOUTS).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === state.layout ? ' active' : '');
    b.textContent = def.label;
    b.dataset.layout = key;
    b.addEventListener('click', () => {
      state.layout = key;
      layoutBox.querySelectorAll('.pick').forEach((el) => el.classList.toggle('active', el.dataset.layout === key));
      buildPanelPicker();
      redraw();
    });
    layoutBox.appendChild(b);
  });
  const gradeBox = $('grade-picker');
  Object.entries(GRADES).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === state.grade ? ' active' : '');
    b.textContent = def.label;
    b.dataset.grade = key;
    b.addEventListener('click', () => {
      state.grade = key;
      gradeBox.querySelectorAll('.pick').forEach((el) => el.classList.toggle('active', el.dataset.grade === key));
      redraw();
    });
    gradeBox.appendChild(b);
  });
  const sizeBox = $('size-picker');
  Object.entries(SIZES).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === state.size ? ' active' : '');
    b.textContent = def.label;
    b.dataset.size = key;
    b.addEventListener('click', () => {
      state.size = key;
      sizeBox.querySelectorAll('.pick').forEach((el) => el.classList.toggle('active', el.dataset.size === key));
      redraw();
    });
    sizeBox.appendChild(b);
  });
}

function panelCount() {
  return LAYOUTS[state.layout].panels(100, 100).length;
}

function buildPanelPicker() {
  const box = $('panel-picker');
  box.innerHTML = '';
  const n = panelCount();
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (i === selectedPanel ? ' active' : '');
    b.textContent = `Panel ${i + 1}`;
    b.dataset.panel = String(i);
    b.addEventListener('click', () => {
      selectedPanel = i;
      box.querySelectorAll('.pick').forEach((el) => el.classList.toggle('active', Number(el.dataset.panel) === i));
      syncPanelSliders();
    });
    box.appendChild(b);
  }
  if (selectedPanel >= n) selectedPanel = 0;
  syncPanelSliders();
}

function panelAdj() {
  if (!state.panels[selectedPanel]) state.panels[selectedPanel] = { zoom: 1, ox: 0, oy: 0 };
  return state.panels[selectedPanel];
}

function syncPanelSliders() {
  const adj = panelAdj();
  $('zoom').value = String(adj.zoom);
  $('panx').value = String(adj.ox);
  $('pany').value = String(adj.oy);
  $('zoom-val').textContent = `${Math.round(adj.zoom * 100)}%`;
  $('panx-val').textContent = `${Math.round(adj.ox * 100)}`;
  $('pany-val').textContent = `${Math.round(adj.oy * 100)}`;
}

function wireControls() {
  $('photo').addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, 3);
    const loaded = [];
    for (const f of files) {
      try { loaded.push(await loadImage(URL.createObjectURL(f))); } catch (err) { /* skip bad file */ }
    }
    if (loaded.length) {
      state.photos = loaded;
      statusEl.textContent = `${loaded.length} photo${loaded.length > 1 ? 's' : ''} loaded.`;
      redraw();
    }
  });
  $('sample-btn').addEventListener('click', async () => {
    await loadSamples(['boulevard', 'pier']);
    statusEl.textContent = 'Sample photos loaded.';
    redraw();
  });
  $('caption').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
  $('kicker').addEventListener('input', (e) => { state.kicker = e.target.value; redraw(); });
  $('seed').addEventListener('input', (e) => { state.seed = Number(e.target.value) || 1; redraw(); });
  $('surprise').addEventListener('click', () => {
    const pick = surprisePick((Date.now() % 100000) + Math.floor(Math.random() * 997));
    state.layout = pick.layout;
    state.grade = pick.grade;
    state.caption = pick.sample.caption;
    state.kicker = pick.sample.kicker;
    state.seed = pick.seed;
    $('caption').value = state.caption;
    $('kicker').value = state.kicker;
    $('seed').value = String(state.seed);
    document.querySelectorAll('#layout-picker .pick').forEach((el) => el.classList.toggle('active', el.dataset.layout === state.layout));
    document.querySelectorAll('#grade-picker .pick').forEach((el) => el.classList.toggle('active', el.dataset.grade === state.grade));
    buildPanelPicker();
    statusEl.textContent = `Surprise me: ${LAYOUTS[state.layout].label} + ${GRADES[state.grade].label}.`;
    redraw();
  });
  $('zoom').addEventListener('input', (e) => { panelAdj().zoom = Number(e.target.value); syncPanelSliders(); redraw(); });
  $('panx').addEventListener('input', (e) => { panelAdj().ox = Number(e.target.value); syncPanelSliders(); redraw(); });
  $('pany').addEventListener('input', (e) => { panelAdj().oy = Number(e.target.value); syncPanelSliders(); redraw(); });
  $('export').addEventListener('click', () => {
    const size = SIZES[state.size];
    const out = renderCover(state, size.w, size.h);
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-cover-${size.w}x${size.h}.png`;
      a.click();
      statusEl.textContent = `Saved vice-cover-${size.w}x${size.h}.png`;
    }, 'image/png');
  });
  $('export-all').addEventListener('click', () => {
    Object.values(SIZES).forEach((size, i) => {
      setTimeout(() => {
        const out = renderCover(state, size.w, size.h);
        out.toBlob((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `vice-cover-${size.w}x${size.h}.png`;
          a.click();
        }, 'image/png');
      }, i * 250);
    });
    statusEl.textContent = 'Exported all 3 sizes.';
  });
}

/** Headless-test hook: renders the export at w x h and returns a PNG data URL. */
window.__viceExport = (w, h) => {
  const out = renderCover(state, w, h);
  return out.toDataURL('image/png');
};
window.__viceState = state;

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  buildPickers();
  buildPanelPicker();
  wireControls();
  runShot(shot, new URLSearchParams(location.search), {
    loadSamples,
    applyShot(opts) {
      state.layout = opts.layout;
      state.grade = opts.grade;
      state.size = opts.size;
      state.caption = opts.caption;
      state.kicker = opts.kicker;
      state.seed = opts.seed;
      $('caption').value = state.caption;
      $('kicker').value = state.kicker;
      $('seed').value = String(state.seed);
      document.querySelectorAll('#layout-picker .pick').forEach((el) => el.classList.toggle('active', el.dataset.layout === state.layout));
      document.querySelectorAll('#grade-picker .pick').forEach((el) => el.classList.toggle('active', el.dataset.grade === state.grade));
      document.querySelectorAll('#size-picker .pick').forEach((el) => el.classList.toggle('active', el.dataset.size === state.size));
      buildPanelPicker();
    },
    redraw,
  });
} else {
  buildPickers();
  buildPanelPicker();
  wireControls();
  loadSamples(['boulevard', 'pier']).then(redraw);
  redraw();
}
