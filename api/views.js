import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .toLowerCase()
      .split(",")
      .map(u => u.trim())
      .filter(Boolean);

    const pageId = (req.query.pageId || "").toString().toLowerCase();

    if (!pageId || !allowedUsers.includes(pageId)) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.status(404).send("Not found");
    }

    let count = await kv.get(pageId);
    if (!count) count = 0;

    count++;
    await kv.set(pageId, count);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20">
  <rect width="100%" height="100%" fill="#2C3E50"/>
  <text x="50%" y="50%" fill="white" font-size="12"
        text-anchor="middle" dominant-baseline="middle">
    Profile Views: ${count}
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(svg);

  } catch (err) {
    return res.status(500).send(err.toString());
  }
}
