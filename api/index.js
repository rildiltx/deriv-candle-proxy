export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { symbol, granularity, count } = req.body;

      if (!symbol || !granularity || !count) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const response = await fetch("https://api.deriv.com/api/ticks_history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticks_history: symbol,
          adjust_start_time: 1,
          count: count,
          end: "latest",
          start: 1,
          style: "candles",
          granularity: granularity
        })
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
