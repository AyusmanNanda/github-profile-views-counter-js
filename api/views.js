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
      return res.status(200).send(svg("Not allowed"));
    }

    const url = `${process.env.UPSTASH_REDIS_REST_URL}/incr/${pageId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      }
    });

    const data = await response.json();
    const count = data.result;

    return res.status(200).send(svg(`Profile Views: ${count}`));

  } catch (err) {
    return res.status(200).send(svg(`ERR: ${err.message}`));
  }
}

function svg(text) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="20">
  <rect width="100%" height="100%" fill="#2C3E50"/>
  <text x="50%" y="50%" fill="white" font-size="12"
        text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
</svg>
`;
}