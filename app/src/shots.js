// Deterministic screenshot scenes: ?shot=cover renders one exported cover
// full-bleed; ?shot=editor shows the editor with a sample photo loaded.
// Query params: layout, grade, size (square|portrait|landscape), caption,
// kicker, photo (first sample), photo2 (second sample), seed.
// Sets window.__shotReady once fonts are loaded and the frame is painted.
export async function runShot(shot, query, ctrl) {
  const layout = query.get('layout') || 'hero-left';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || 'landscape';
  const caption = query.get('caption') || 'NEON BOULEVARD';
  const kicker = query.get('kicker') || 'VICE CITY AFTER DARK';
  const seed = Number(query.get('seed') || '42');
  const photo = query.get('photo') || 'boulevard';
  const photo2 = query.get('photo2') || 'pier';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await ctrl.loadSamples([photo, photo2]);
  ctrl.applyShot({ layout, grade, size, caption, kicker, seed });
  // Fonts must be in before the shot: the caption is the hero of the cover.
  try { await document.fonts.ready; } catch (e) { /* fall back to system fonts */ }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  ctrl.redraw();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
