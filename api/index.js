export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

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
    res.status(200).json(json);

  } catch (error) {
    res.status(500).json({ error: error.message || "Unexpected error" });
  }
}
