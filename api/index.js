export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', async () => {
    try {
      const body = JSON.parse(data);
      const { symbol, granularity, count } = body;

      if (!symbol || !granularity || !count) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const response = await fetch("https://api.deriv.com/api/ticks_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticks_history: symbol,
          style: "candles",
          granularity: granularity,
          count: count,
          subscribe: 0,
        }),
      });

      const json = await response.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
}
