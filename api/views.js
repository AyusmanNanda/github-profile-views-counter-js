import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");

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

    // fingerprint
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      "ip";

    const ua = req.headers["user-agent"] || "ua";

    const visitorKey = `v:${pageId}:${ip}:${ua}`;

    const TTL = 300;
    const seen = await kv.get(visitorKey);

    let count = await kv.get(`count:${pageId}`);
    if (count === null) count = 0;

    if (!seen) {
      count++;
      await kv.set(`count:${pageId}`, count);
      await kv.set(visitorKey, 1, { ex: TTL });
    }

    // customization
    const label = (req.query.label || "Profile Views").toString();
    const color = normalizeColor(req.query.color || "brightgreen");
    const labelColor = normalizeColor(req.query.labelColor || "555");
    const style = (req.query.style || "flat").toString();

    const formattedCount = formatNumber(count);

    return res
      .status(200)
      .send(svg(label, formattedCount, labelColor, color, style));

  } catch (err) {
    return res.status(200).send(svg("error", "0", "#555", "#e05d44", "flat"));
  }
}

// number formatting (1.2k, 3.4M)
function formatNumber(num) {
  if (num < 1000) return num;
  if (num < 1_000_000) return (num / 1000).toFixed(1) + "k";
  return (num / 1_000_000).toFixed(1) + "M";
}

// color presets like shields
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
  if (color.startsWith("#")) return color;
  return `#${color}`;
}

// SVG generator with styles
function svg(label, value, labelBg, valueBg, style) {
  const labelWidth = Math.max(60, label.length * 6.5 + 10);
  const valueWidth = Math.max(40, String(value).length * 7 + 10);
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
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>
`;
}