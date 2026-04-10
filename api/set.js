import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const { key, value } = req.query;

    if (!key || !value) {
      return res.status(400).send("Missing key/value");
    }

    await kv.set(key.toLowerCase(), parseInt(value, 10));

    return res.send("OK");

  } catch (err) {
    return res.status(500).send(err.toString());
  }
}