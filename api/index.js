export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol, granularity, count } = req.body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const payload = {
      ticks_history: symbol,
      adjust_start_time: 1,
      count,
      end: "latest",
      start: 1,
      style: "candles",
      granularity,
      subscribe: 0,
    };

    const response = await fetch("https://api.deriv.com/api/ticks_history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.candles) {
      return res.status(500).json({ error: "Failed to retrieve candles" });
    }

    return res.status(200).json(data.candles);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
