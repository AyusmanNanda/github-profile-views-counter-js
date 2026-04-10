import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");

  try {
    // 🔐 Restrict users
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .toLowerCase()
      .split(",")
      .map(u => u.trim())
      .filter(Boolean);

    const pageId = (req.query.pageId || "").toString().toLowerCase();

    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(404).send(svg("Not found"));
    }

    // 📊 Base count support
    const base = parseInt(req.query.base || "0", 10);

    let count = await kv.get(pageId);

    if (!count) {
      count = base;
    }

    count++;
    await kv.set(pageId, count);

    return res.status(200).send(svg(`Profile Views: ${count}`));

  } catch (err) {
    return res.status(500).send(svg("Error"));
  }
}

// 🎨 SVG generator
function svg(text) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20">
  <rect width="100%" height="100%" fill="#2C3E50"/>
  <text x="50%" y="50%" fill="white" font-size="12"
        text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
</svg>
`;
}