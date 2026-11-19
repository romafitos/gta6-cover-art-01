// Poster lettering: display-font caption with auto-fit, hard outline and
// drop shadow, plus an optional kicker line above it. Text is measured and
// shrunk to fit, never clipped, never wrapped mid-word badly.
export const DISPLAY_FONT = '"Anton", "Archivo Black", sans-serif';
export const BODY_FONT = '"Archivo Black", "Anton", sans-serif';

/** Largest font size (px) whose text fits maxWidth, starting from start. */
export function fitSize(ctx, text, fontFamily, start, maxWidth, weight) {
  let size = start;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
  }
  return size;
}

/**
 * Draws the caption block at the foot of the cover: kicker (small, tracked
 * caps) above the big caption, both centred, with outline + shadow so the
 * type stays readable over any photo or skyline.
 */
export function drawCaptionBlock(ctx, w, h, caption, kicker, colors) {
  const text = (caption || '').trim().toUpperCase();
  const kick = (kicker || '').trim().toUpperCase();
  if (!text && !kick) return;
  const bandH = h * 0.2;
  const bandY = h - bandH;
  // Scrim: dark gradient rising from the bottom so type always lands on ink.
  const scrim = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  scrim.addColorStop(0, 'rgba(10,6,18,0)');
  scrim.addColorStop(0.45, 'rgba(10,6,18,0.55)');
  scrim.addColorStop(1, 'rgba(10,6,18,0.85)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY - h * 0.06, w, bandH + h * 0.06);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let captionBaseline = h - h * 0.045;
  if (kick) {
    const kickSize = fitSize(ctx, kick, BODY_FONT, Math.round(h * 0.032), w * 0.86, '400');
    ctx.font = `${kickSize}px ${BODY_FONT}`;
    ctx.fillStyle = colors.kicker;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = kickSize * 0.3;
    ctx.shadowOffsetY = 2;
    // Letter-track the kicker by drawing it spaced.
    const spaced = kick.split('').join('\u2009');
    ctx.fillText(spaced, w / 2, h - h * 0.165);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    captionBaseline = h - h * 0.035;
  }
  if (text) {
    const size = fitSize(ctx, text, DISPLAY_FONT, Math.round(h * 0.095), w * 0.92, '400');
    ctx.font = `${size}px ${DISPLAY_FONT}`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(text, w / 2, captionBaseline);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = colors.caption;
    ctx.fillText(text, w / 2, captionBaseline);
  }
}

/** Small corner badge: own mark, drawn as a bordered pill (never a logo). */
export function drawBadge(ctx, w, h, label, colors) {
  const pad = Math.round(h * 0.012);
  const fs = Math.round(h * 0.02);
  ctx.font = `${fs}px ${BODY_FONT}`;
  const tw = ctx.measureText(label).width;
  const bw = tw + pad * 3;
  const bh = fs + pad * 1.8;
  const x = w - bw - pad * 2;
  const y = pad * 2;
  ctx.save();
  ctx.fillStyle = 'rgba(10,6,18,0.72)';
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, bh / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + bw / 2, y + bh / 2 + 1);
  ctx.restore();
}
