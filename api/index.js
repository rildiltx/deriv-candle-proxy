export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, granularity, count } = req.body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const response = await fetch('https://api.deriv.com/api/v1/ohlc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticks_history: symbol,
        style: 'candles',
        adjust_start_time: 1,
        count: count,
        granularity: granularity,
        end: 'latest',
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Proxy Error]', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
