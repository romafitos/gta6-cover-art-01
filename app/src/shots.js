// Deterministic screenshot scenes, driven by query parameters:
// ?shot=cover|editor&layout=&grade=&size=&caption=&kicker=&script=&strip=
// &photo1=&photo2=&seed=
//
// The trap this file exists to avoid: document.fonts.ready alone does
// NOT load a font that has never been used. A lazy font is only fetched
// on first use, so the ready promise can resolve before it was ever
// requested, and measureText then measures the fallback. Every font is
// therefore requested explicitly by name before anything is measured
// or drawn, and the ready flag is only set after two painted frames
// plus a final redraw.

const FONT_REQUESTS = [
  '400 40px Anton',
  '400 40px "Archivo Black"',
  '400 40px Pacifico',
];

export async function loadFontsExplicitly() {
  await Promise.all(FONT_REQUESTS.map((spec) => document.fonts.load(spec)));
  await document.fonts.ready;
}

export async function runShot(shot, query, api) {
  await loadFontsExplicitly();
  if (shot === 'cover') document.body.classList.add('shot-cover');

  const patch = {};
  const layout = query.get('layout');
  const grade = query.get('grade');
  const size = query.get('size');
  const caption = query.get('caption');
  const kicker = query.get('kicker');
  const script = query.get('script');
  const strip = query.get('strip');
  const seed = query.get('seed');
  if (layout) patch.layout = layout;
  if (grade) patch.grade = grade;
  if (size) patch.size = size;
  if (caption !== null) patch.caption = caption;
  if (kicker !== null) patch.kicker = kicker;
  if (script !== null) patch.script = script;
  if (strip !== null) patch.strip = strip;
  if (seed !== null) patch.seed = Number(seed) || 0;
  api.setState(patch);

  const photo1 = query.get('photo1') || query.get('photo') || 'boulevard';
  const photo2 = query.get('photo2') || 'pier';
  await api.loadSample(photo1, 0);
  await api.loadSample(photo2, 1);

  // Size the preview canvas to the viewport in shot mode so a cover shot
  // fills the frame edge to edge.
  api.fitCanvasToViewport();
  api.redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await loadFontsExplicitly();
  api.redraw();
  window.__shotReady = true;
}
