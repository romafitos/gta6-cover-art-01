// Deterministic screenshot scenes, driven by query parameters:
// ?shot=cover|editor&layout=&grade=&size=&caption=&kicker=&script=&strip=
// &photo1=&photo2=&seed=
//
// The trap this file exists to avoid: document.fonts.ready alone does
// not load a font that has never been used — a lazy font is only
// requested on first use, so the ready promise can resolve before
// the font has even been fetched, and measureText then measures the
// fallback. The runner therefore requests each of the three fonts
// by name first, waits for the ready promise, paints two animation
// frames, redraws once more, and only then sets the ready flag.

export async function loadFonts() {
  await Promise.all([
    document.fonts.load('16px Anton'),
    document.fonts.load('16px "Archivo Black"'),
    document.fonts.load('16px Pacifico'),
  ]);
  await document.fonts.ready;
}

export async function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await loadFonts();
  await apply({
    layout: query.get('layout') ?? 'vice-hero',
    grade: query.get('grade') ?? 'vivid',
    size: query.get('size') ?? 'landscape',
    caption: query.get('caption') ?? 'PALM CITY HEAT',
    kicker: query.get('kicker') ?? 'SUMMER NEVER ENDS',
    script: query.get('script') ?? 'Every light a story',
    strip: query.get('strip') ?? 'SUMMER NEVER ENDS — SHOT ON YOUR OWN CAMERA',
    photo1: query.get('photo1') ?? 'boulevard',
    photo2: query.get('photo2') ?? 'pier',
    seed: Number(query.get('seed') ?? 42),
  });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await apply(null); // redraw once more with fonts genuinely loaded
  window.__shotReady = true;
}

// The same explicit loads for the interactive path, so a user's
// first paint cannot race the fonts either.
export async function ensureFontsForEditor() {
  await loadFonts();
}
