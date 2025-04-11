export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol, granularity, count } = req.body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const response = await fetch("https://api.deriv.com/api/ticks/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticks_history: symbol,
        style: "candles",
        adjust_start_time: 1,
        count: count,
        granularity: granularity,
        start: 1
      })
    });

    const data = await response.json();

    if (!data.candles) {
      return res.status(500).json({ error: "No candle data returned" });
    }

    return res.status(200).json({ candles: data.candles });

  } catch (error) {
    console.error("Error fetching Deriv data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
