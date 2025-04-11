export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { symbol, granularity, count } = req.body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const response = await fetch("https://api.deriv.com/api/ticks_history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticks_history: symbol,
        style: "candles",
        granularity,
        count,
        end: "latest",
        adjust_start_time: 1,
        subscribe: 0,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
