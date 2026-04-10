import { kv } from '@vercel/kv';

const BOT_PATTERNS = /bot|crawler|spider|crawling|facebook|twitter|linkedin|whatsapp|telegram|discord|slack|preview|fetch|curl|wget|python|java|ruby|php|go-http|axios|node-fetch/i;

function isBot(ua) {
  if (!ua) return true;
  return BOT_PATTERNS.test(ua);
}

function getIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  if (Array.isArray(ip)) ip = ip[0];
  if (typeof ip === "string") ip = ip.split(",")[0].trim();
  return ip.replace(/[^a-zA-Z0-9._:-]/g, "_");
}

function getDateKeys() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm   = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd   = String(now.getUTCDate()).padStart(2, "0");
  const week = getISOWeek(now);
  return {
    day:   `${yyyy}-${mm}-${dd}`,
    week:  `${yyyy}-W${week}`,
    month: `${yyyy}-${mm}`,
  };
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, "0");
}

function formatNumber(num) {
  if (num < 1000) return String(num);
  if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
}

function normalizeColor(color) {
  const colors = {
    // greens
    brightgreen:  "#4c1",
    green:        "#97ca00",
    yellowgreen:  "#a4a61d",
    lightgreen:   "#90ee90",
    darkgreen:    "#006400",
    lime:         "#00e676",
    mint:         "#3eb489",
    emerald:      "#50c878",
    teal:         "#008080",
    // blues
    blue:         "#007ec6",
    brightblue:   "#0cf",
    darkblue:     "#00008b",
    navy:         "#001f5b",
    skyblue:      "#87ceeb",
    cyan:         "#17a2b8",
    aqua:         "#00ffff",
    steelblue:    "#4682b4",
    royalblue:    "#4169e1",
    cornflower:   "#6495ed",
    // purples
    purple:       "#7b68ee",
    violet:       "#ee82ee",
    indigo:       "#4b0082",
    lavender:     "#967bb6",
    magenta:      "#ff00ff",
    orchid:       "#da70d6",
    plum:         "#dda0dd",
    // reds / pinks
    red:          "#e05d44",
    brightred:    "#ff0000",
    crimson:      "#dc143c",
    pink:         "#e83e8c",
    hotpink:      "#ff69b4",
    salmon:       "#fa8072",
    coral:        "#ff7f50",
    tomato:       "#ff6347",
    rose:         "#ff007f",
    // oranges / yellows
    orange:       "#fe7d37",
    darkorange:   "#ff8c00",
    amber:        "#ffbf00",
    yellow:       "#dfb317",
    gold:         "#ffd700",
    lightyellow:  "#ffffe0",
    // browns
    brown:        "#a52a2a",
    chocolate:    "#d2691e",
    sienna:       "#a0522d",
    tan:          "#d2b48c",
    // greys / blacks / whites
    grey:         "#555",
    gray:         "#555",
    lightgrey:    "#9f9f9f",
    darkgrey:     "#333",
    black:        "#333",
    white:        "#fff",
    silver:       "#c0c0c0",
    // special
    success:      "#28a745",
    warning:      "#ffc107",
    danger:       "#dc3545",
    info:         "#17a2b8",
    critical:     "#e3000f",
    blueviolet:   "#8a2be2",
    turquoise:    "#40e0d0",
    slategray:    "#708090",
    peru:         "#cd853f",
  };
  if (colors[color]) return colors[color];
  if (color.startsWith("#")) return color;
  return `#${color}`;
}

function svg(label, value, labelBg, valueBg, style, logo) {
  const safeLabel = String(label || "views");
  const safeValue = String(value || "0");

  const logoWidth  = logo ? 14 : 0;
  const logoPad    = logo ? 4  : 0;
  const labelWidth = Math.max(60, safeLabel.length * 6.5 + 16 + logoWidth + logoPad);
  const valueWidth = Math.max(40, safeValue.length * 7.5 + 16);
  const width      = labelWidth + valueWidth;
  const radius     = style === "flat-square" ? 0 : 3;
  const isSocial   = style === "social";
  const isPlastic  = style === "plastic";

  const labelX = logo
    ? (5 + logoWidth + logoPad + (labelWidth - 5 - logoWidth - logoPad) / 2)
    : labelWidth / 2;

  const font = isSocial
    ? "Helvetica Neue,Helvetica,Arial,sans-serif"
    : "Verdana,Geneva,DejaVu Sans,sans-serif";

  const gradientDef = isPlastic ? `
    <linearGradient id="g" x2="0" y2="100%">
      <stop offset="0"  stop-color="#fff" stop-opacity=".7"/>
      <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
      <stop offset=".9" stop-opacity=".3"/>
      <stop offset="1"  stop-opacity=".5"/>
    </linearGradient>` : "";

  const logoEl = logo
    ? `<image href="${logo}" x="5" y="3" width="14" height="14"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <defs>${gradientDef}</defs>
  <mask id="m">
    <rect width="${width}" height="20" rx="${radius}" fill="#fff"/>
  </mask>
  <g mask="url(#m)">
    <rect width="${labelWidth}" height="20" fill="${isSocial ? "#555" : labelBg}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueBg}"/>
    ${isPlastic ? `<rect width="${width}" height="20" fill="url(#g)"/>` : ""}
  </g>
  ${logoEl}
  <g fill="#fff" text-anchor="middle" font-family="${font}" font-size="11">
    <text x="${labelX}"                          y="14" fill-opacity=".4">${safeLabel}</text>
    <text x="${labelX}"                          y="13">${safeLabel}</text>
    <text x="${labelWidth + valueWidth / 2}"     y="14" fill-opacity=".4">${safeValue}</text>
    <text x="${labelWidth + valueWidth / 2}"     y="13">${safeValue}</text>
  </g>
</svg>`;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .split(",").map(u => u.trim().toLowerCase()).filter(Boolean);

    const pageId = (req.query.pageId || "").toString().trim().toLowerCase();

    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(200).send(svg("views", "NA", "#555", "#999", "flat"));
    }

    const label      = String(req.query.label      || "Profile Views");
    const color      = normalizeColor(String(req.query.color      || "brightgreen"));
    const labelColor = normalizeColor(String(req.query.labelColor || "555"));
    const style      = String(req.query.style      || "flat");
    const logo       = req.query.logo ? String(req.query.logo) : null;
    const mode       = String(req.query.mode       || "total");

    const countKey  = `count:${pageId}`;
    const { day, week, month } = getDateKeys();
    const dayKey    = `day:${pageId}:${day}`;
    const weekKey   = `week:${pageId}:${week}`;
    const monthKey  = `month:${pageId}:${month}`;
    const uniqueKey = `unique:${pageId}`;

    const ua = req.headers["user-agent"] || "";

    if (isBot(ua)) {
      const raw = await kv.get(countKey);
      const count = parseInt(raw ?? "0", 10) || 0;
      return res.status(200).send(svg(label, formatNumber(count), labelColor, color, style, logo));
    }

    const safeIp     = getIp(req);
    const visitorKey = `visitor:${pageId}:${safeIp}`;
    const TTL        = 300;

    const seen = await kv.get(visitorKey);

    if (!seen) {
      await Promise.all([
        kv.incr(countKey),
        kv.incr(dayKey),
        kv.incr(weekKey),
        kv.incr(monthKey),
        kv.sadd(uniqueKey, safeIp),
      ]);

      await kv.set(visitorKey, "1");
      await kv.expire(visitorKey, TTL);
      await kv.expire(dayKey,    90000);
      await kv.expire(weekKey,   691200);
      await kv.expire(monthKey,  2764800);
    }

    let displayCount;
    if (mode === "today") {
      displayCount = parseInt((await kv.get(dayKey))   ?? "0", 10) || 0;
    } else if (mode === "week") {
      displayCount = parseInt((await kv.get(weekKey))  ?? "0", 10) || 0;
    } else if (mode === "month") {
      displayCount = parseInt((await kv.get(monthKey)) ?? "0", 10) || 0;
    } else if (mode === "unique") {
      displayCount = (await kv.scard(uniqueKey)) || 0;
    } else {
      displayCount = parseInt((await kv.get(countKey)) ?? "0", 10) || 0;
    }

    return res.status(200).send(
      svg(label, formatNumber(displayCount), labelColor, color, style, logo)
    );

  } catch (err) {
    return res.status(200).send(svg("error", err.message.slice(0, 20), "#555", "#e05d44", "flat"));
  }
}