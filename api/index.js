// api/index.js

export default async function handler(req, res) {
  const { symbol = "R_75", granularity = 3600, count = 100 } = req.query;

  const payload = {
    ticks_history: symbol,
    adjust_start_time: 1,
    count,
    end: "latest",
    start: 1,
    style: "candles",
    granularity,
    req_id: 1
  };

  try {
    const response = await fetch("https://api.deriv.com/api/ticks_history", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
