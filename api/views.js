import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");

  try {
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .split(",")
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);

    const pageId = (req.query.pageId || "")
      .toString()
      .trim()
      .toLowerCase();

    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(200).send(svg("views", "NA", "#555", "#999", "flat"));
    }

    let count = await kv.get(`count:${pageId}`);
    count = parseInt(count ?? "0", 10);
    if (isNaN(count)) count = 0;

    count++;
    await kv.set(`count:${pageId}`, String(count));

    const label = String(req.query.label || "Profile Views");
    const color = normalizeColor(String(req.query.color || "brightgreen"));
    const labelColor = normalizeColor(String(req.query.labelColor || "555"));
    const style = String(req.query.style || "flat");

    return res.status(200).send(svg(label, String(count), labelColor, color, style));

  } catch (err) {
    return res.status(200).send(svg("error", "0", "#555", "#e05d44", "flat"));
  }
}

function normalizeColor(color) {
  const colors = {
    brightgreen: "#4c1",
    green: "#97ca00",
    yellow: "#dfb317",
    yellowgreen: "#a4a61d",
    orange: "#fe7d37",
    red: "#e05d44",
    blue: "#007ec6",
    grey: "#555",
    gray: "#555",
  };
  if (colors[color]) return colors[color];
  if (color.startsWith("#")) return color;
  return `#${color}`;
}

function svg(label, value, labelBg, valueBg, style) {
  const safeLabel = String(label || "views");
  const safeValue = String(value || "0");

  const labelWidth = Math.max(60, safeLabel.length * 6.5 + 10);
  const valueWidth = Math.max(40, safeValue.length * 7 + 10);
  const width = labelWidth + valueWidth;
  const radius = style === "flat-square" ? 0 : 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <mask id="m">
    <rect width="${width}" height="20" rx="${radius}" fill="#fff"/>
  </mask>
  <g mask="url(#m)">
    <rect width="${labelWidth}" height="20" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueBg}"/>
  </g>
  <g fill="#fff" text-anchor="middle"
     font-family="Verdana, Geneva, DejaVu Sans, sans-serif"
     font-size="11">
    <text x="${labelWidth / 2}" y="14">${safeLabel}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${safeValue}</text>
  </g>
</svg>`;
}