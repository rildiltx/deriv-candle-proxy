export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawData = Buffer.concat(chunks).toString();
    const { symbol, granularity, count } = JSON.parse(rawData);

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
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
