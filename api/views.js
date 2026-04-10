import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");

  try {
    // allowed users
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

    // safe IP extraction
    let ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      "ip";

    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === "string") ip = ip.split(",")[0].trim();

    // safe user-agent
    const ua = (req.headers["user-agent"] || "ua").slice(0, 50);

    const visitorKey = `v:${pageId}:${ip}:${ua}`;

    // cooldown (5 min)
    const TTL = 300;

    const seen = await kv.get(visitorKey);

    // safe count parsing
    let count = await kv.get(`count:${pageId}`);
    count = parseInt(count || "0", 10);

    if (!seen) {
      count++;
      await kv.set(`count:${pageId}`, count);
      await kv.set(visitorKey, 1, { ex: TTL });
    }

    // customization
    const label = String(req.query.label || "Profile Views");
    const color = normalizeColor(req.query.color || "brightgreen");
    const labelColor = normalizeColor(req.query.labelColor || "555");
    const style = String(req.query.style || "flat");

    const formattedCount = formatNumber(count);

    return res
      .status(200)
      .send(svg(label, formattedCount, labelColor, color, style));

  } catch (err) {
    return res
      .status(200)
      .send(svg("error", "0", "#555", "#e05d44", "flat"));
  }
}

// number formatting
function formatNumber(num) {
  if (num < 1000) return num;
  if (num < 1_000_000) return (num / 1000).toFixed(1) + "k";
  return (num / 1_000_000).toFixed(1) + "M";
}

// color normalization
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
    gray: "#555"
  };

  if (colors[color]) return colors[color];
  if (typeof color === "string" && color.startsWith("#")) return color;
  return `#${color}`;
}

// SVG generator
function svg(label, value, labelBg, valueBg, style) {
  const safeLabel = String(label || "views");
  const safeValue = String(value || "0");

  const labelWidth = Math.max(60, safeLabel.length * 6.5 + 10);
  const valueWidth = Math.max(40, safeValue.length * 7 + 10);
  const width = labelWidth + valueWidth;

  const radius = style === "flat-square" ? 0 : 3;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <linearGradient id="g" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
    <stop offset=".9" stop-opacity=".3"/>
    <stop offset="1" stop-opacity=".5"/>
  </linearGradient>

  <mask id="m">
    <rect width="${width}" height="20" rx="${radius}" fill="#fff"/>
  </mask>

  <g mask="url(#m)">
    <rect width="${labelWidth}" height="20" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueBg}"/>
    ${style === "plastic" ? `<rect width="${width}" height="20" fill="url(#g)"/>` : ""}
  </g>

  <g fill="#fff" text-anchor="middle"
     font-family="Verdana, Geneva, DejaVu Sans, sans-serif"
     font-size="11">
    <text x="${labelWidth / 2}" y="14">${safeLabel}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${safeValue}</text>
  </g>
</svg>
`;
}