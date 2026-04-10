import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const allowedUsers = (process.env.ALLOWED_USERS || "")
      .split(",")
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);

    const pageId = (req.query.pageId || "")
      .toString()
      .trim()
      .toLowerCase();

    const value = parseInt(req.query.value || "0", 10);

    if (!pageId || !allowedUsers.includes(pageId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    if (isNaN(value) || value < 0) {
      return res.status(400).json({ error: "Invalid value" });
    }

    await kv.set(`count:${pageId}`, String(value));

    return res.status(200).json({
      success: true,
      pageId,
      value,
      key: `count:${pageId}`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}