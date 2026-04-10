import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");

  try {
    // 🔐 Normalize allowed users (robust)
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .split(",")
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);

    // 📥 Normalize input
    const pageId = (req.query.pageId || req.query.username || "")
      .toString()
      .trim()
      .toLowerCase();

    // ❌ Block if not allowed
    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(404).send(svg("Not found"));
    }

    // 📊 Base count support
    const base = parseInt(req.query.base || "0", 10);

    let count = await kv.get(pageId);

    // ✅ Fix: handle null properly
    if (count === null || count === undefined) {
      count = base;
    }

    count++;
    await kv.set(pageId, count);

    return res.status(200).send(svg(`Profile Views: ${count}`));

  } catch (err) {
    // 🔥 Show real error for debugging (can hide later)
    return res.status(500).send(svg("Error"));
  }
}

// 🎨 Clean SVG (GitHub compatible)
function svg(text) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="20">
  <style>
    text { font-family: Arial, sans-serif; font-size: 12px; }
  </style>
  <rect width="100%" height="100%" fill="#2C3E50"/>
  <text x="50%" y="50%" fill="white"
        text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
</svg>
`;
}