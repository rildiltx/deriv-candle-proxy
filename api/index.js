export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Parse body if needed
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const { symbol, granularity, count } = body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const derivRes = await fetch('https://api.deriv.com/api/ticks_history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticks_history: symbol,
        style: 'candles',
        adjust_start_time: 1,
        count,
        granularity,
        end: 'latest'
      })
    });

    const data = await derivRes.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Deriv API error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[Proxy Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
