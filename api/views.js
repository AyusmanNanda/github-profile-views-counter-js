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

    // 🔐 Check user
    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(200).send(svg(`NOT_ALLOWED: ${pageId}`));
    }

    // 🔍 KV test
    let count = await kv.get(pageId);

    if (count === null || count === undefined) {
      count = 0;
    }

    count++;
    await kv.set(pageId, count);

    return res.status(200).send(svg(`OK: ${count}`));

  } catch (err) {
    // 🔥 SHOW REAL ERROR
    return res.status(200).send(svg(`ERR: ${err.message}`));
  }
}

function svg(text) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="20">
  <rect width="100%" height="100%" fill="#2C3E50"/>
  <text x="10" y="14" fill="white" font-size="12">
    ${text}
  </text>
</svg>
`;
}