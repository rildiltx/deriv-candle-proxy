export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.deriv.com/api/ticks_history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy failed", message: err.message });
  }
}
