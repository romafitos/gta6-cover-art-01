// The compositor: paints one cover onto a canvas from the shared
// state and the loaded photos. The preview canvas and the PNG export
// both go through this one function, so what is seen is what the
// file holds.
//
// Paint order: photos (or drawn scenes) first, then panel borders
// and labels, then the title band, the badges, and the bottom strip.
// Every photograph draw uses anchor cropping: the photo's anchor
// point lands at the panel centre, then the draw is clamped so the
// panel stays fully covered, which keeps faces whole at every size.
import { layoutFor, gradeFor } from './presets.js';
import { drawBackdrop, drawMarinaScene, drawSkylineScene } from './skyline.js';
import { drawTitleBand, drawPanelLabel, drawBadges, drawStrip } from './lettering.js';
import { makeRng } from './halftone.js';

// Anchor crop: returns the draw offset for an image of (iw, ih)
// cover-fitted into a panel of (pw, ph), with the anchor point
// (ax, ay, fractions of the image) placed at the panel centre,
// clamped so no edge of the panel shows through. `zoom` scales
// the fitted image (>= 0.5); `pan` shifts it in fractions of the
// panel after the anchor is placed.
export function anchorOffset(iw, ih, pw, ph, ax, ay, zoom = 1, panX = 0, panY = 0) {
  const base = Math.max(pw / iw, ph / ih);
  const scale = base * Math.max(0.5, zoom);
  const dw = iw * scale;
  const dh = ih * scale;
  let ox = pw / 2 - ax * dw + panX * pw;
  let oy = ph / 2 - ay * dh + panY * ph;
  ox = Math.min(0, Math.max(pw - dw, ox));
  oy = Math.min(0, Math.max(ph - dh, oy));
  return { ox, oy, dw, dh };
}

// The vivid treatment, in order: a saturating filter, a warm
// split-tone overlay, a soft-light teal shadow lift, and a radial
// vignette. Drawn onto an offscreen canvas the size of the panel.
function vividLayer(ctx, img, pw, ph, off, grade) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(pw));
  c.height = Math.max(1, Math.round(ph));
  const g = c.getContext('2d');
  g.filter = 'saturate(1.62) contrast(1.20) brightness(1.04)';
  g.drawImage(img, off.ox, off.oy, off.dw, off.dh);
  g.filter = 'none';
  // Warm split-tone: orange at the top fading out by mid-height,
  // pink at the foot, overlay blend.
  const warm = g.createLinearGradient(0, 0, 0, ph);
  warm.addColorStop(0, 'rgba(255,140,60,0.16)');
  warm.addColorStop(0.55, 'rgba(255,140,60,0.02)');
  warm.addColorStop(1, 'rgba(255,46,136,0.18)');
  g.globalCompositeOperation = 'overlay';
  g.fillStyle = warm;
  g.fillRect(0, 0, pw, ph);
  // Teal shadow lift, soft-light.
  g.globalCompositeOperation = 'soft-light';
  g.fillStyle = 'rgba(0,229,255,0.10)';
  g.fillRect(0, 0, pw, ph);
  g.globalCompositeOperation = 'source-over';
  // Radial vignette, darkening the panel edges.
  const vig = g.createRadialGradient(pw / 2, ph / 2, 0.42 * Math.min(pw, ph), pw / 2, ph / 2, 0.75 * Math.max(pw, ph));
  vig.addColorStop(0, 'rgba(10,6,18,0)');
  vig.addColorStop(1, 'rgba(10,6,18,0.20)');
  g.fillStyle = vig;
  g.fillRect(0, 0, pw, ph);
  ctx.drawImage(c, 0, 0);
}

// Duotone: the photo is drawn with the same anchor crop into an
// offscreen canvas, converted to grey, then tinted between the
// grade's dark and light pair.
function duotoneLayer(ctx, img, pw, ph, off, grade) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(pw));
  c.height = Math.max(1, Math.round(ph));
  const g = c.getContext('2d');
  g.drawImage(img, off.ox, off.oy, off.dw, off.dh);
  const data = g.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  const dark = hexRgb(grade.duoDark);
  const light = hexRgb(grade.duoLight);
  for (let i = 0; i < px.length; i += 4) {
    const grey = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
    px[i] = dark[0] + (light[0] - dark[0]) * grey;
    px[i + 1] = dark[1] + (light[1] - dark[1]) * grey;
    px[i + 2] = dark[2] + (light[2] - dark[2]) * grey;
  }
  g.putImageData(data, 0, 0);
  ctx.drawImage(c, 0, 0);
}

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Halftone treatment: the photo, then a dot field over the sky
// band; grain: the photo plus seeded monochrome speckle.
function halftoneLayer(ctx, img, pw, ph, off, grade, seed) {
  ctx.drawImage(img, off.ox, off.oy, off.dw, off.dh);
  const rng = makeRng(seed + 53);
  ctx.save();
  ctx.fillStyle = grade.dots;
  for (let gy = 4; gy < ph * 0.4; gy += 9) {
    for (let gx = 4; gx < pw; gx += 9) {
      ctx.beginPath();
      ctx.arc(gx + (rng() - 0.5) * 3, gy + (rng() - 0.5) * 3, 1 + rng() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function grainLayer(ctx, img, pw, ph, off, seed) {
  ctx.drawImage(img, off.ox, off.oy, off.dw, off.dh);
  const rng = makeRng(seed + 97);
  ctx.save();
  for (let i = 0; i < pw * ph * 0.0006; i++) {
    const v = rng() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},0.08)`;
    ctx.fillRect(rng() * pw, rng() * ph, 1.5, 1.5);
  }
  ctx.restore();
}

// Draws one photo panel with its treatment, then its border.
function drawPhotoPanel(ctx, img, panel, W, H, grade, seed, crop) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  const zoom = crop?.zoom ?? 1;
  const panX = crop?.panX ?? 0;
  const panY = crop?.panY ?? 0;
  const off = anchorOffset(img.naturalWidth, img.naturalHeight, pw, ph, panel.anchor[0], panel.anchor[1], zoom, panX, panY);
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.translate(px, py);
  const treatment = panel.treatment || 'clean';
  if (treatment === 'vivid') vividLayer(ctx, img, pw, ph, off, grade);
  else if (treatment === 'duotone') duotoneLayer(ctx, img, pw, ph, off, grade);
  else if (treatment === 'halftone') halftoneLayer(ctx, img, pw, ph, off, grade, seed);
  else if (treatment === 'grain') grainLayer(ctx, img, pw, ph, off, seed);
  else ctx.drawImage(img, off.ox, off.oy, off.dw, off.dh);
  ctx.restore();
  // Panel border: a dark outer line plus a thin bright inner line.
  ctx.save();
  ctx.strokeStyle = 'rgba(10,6,18,0.9)';
  ctx.lineWidth = Math.max(3, 0.005 * W);
  ctx.strokeRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(255,243,214,0.55)';
  ctx.lineWidth = Math.max(1, 0.0012 * W);
  ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
  ctx.restore();
}

// Draws one procedural scene panel with its border.
function drawScenePanel(ctx, panel, W, H, grade, seed) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  if (panel.scene === 'marina') drawMarinaScene(ctx, px, py, pw, ph, grade, seed);
  else drawSkylineScene(ctx, px, py, pw, ph, grade, seed);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(10,6,18,0.9)';
  ctx.lineWidth = Math.max(3, 0.005 * W);
  ctx.strokeRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(255,243,214,0.55)';
  ctx.lineWidth = Math.max(1, 0.0012 * W);
  ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
  ctx.restore();
}

// The single entry point for preview and export alike.
// `photos` is an array of loaded images indexed by photo slot;
// missing slots fall back to the drawn backdrop.
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = gradeFor(state.grade);
  const layout = layoutFor(state.layout);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  // Backdrop behind everything (visible only in gaps, if any).
  drawBackdrop(ctx, 0, 0, W, H * 0.70, grade, state.seed);
  // Panels first, labels second so no label is ever painted over.
  for (const panel of layout.panels) {
    if (panel.scene) {
      drawScenePanel(ctx, panel, W, H, grade, state.seed);
    } else {
      const img = photos?.[panel.photo];
      if (img) drawPhotoPanel(ctx, img, panel, W, H, grade, state.seed, state.crops?.[panel.photo]);
      else drawScenePanel(ctx, { ...panel, scene: 'skyline' }, W, H, grade, state.seed);
    }
  }
  for (const panel of layout.panels) drawPanelLabel(ctx, panel, W, H, grade);
  drawTitleBand(ctx, W, H, state, grade);
  if (layout.badges) drawBadges(ctx, W, H, state, grade);
  drawStrip(ctx, W, H, state, grade);
  ctx.restore();
}

// Pixel rectangles of a layout's panels at a given cover size, for
// the editor's crop controls and for headless verification.
export function panelRects(state, W, H) {
  return layoutFor(state.layout).panels.map((p) => ({
    label: p.label,
    x: Math.round(p.x * W),
    y: Math.round(p.y * H),
    w: Math.round(p.w * W),
    h: Math.round(p.h * H),
  }));
}
