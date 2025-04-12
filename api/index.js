import WebSocket from 'ws';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol = 'R_75', granularity = 60, count = 100 } = req.body;
    const candles = await fetchDerivCandles(symbol, granularity, count);
    return res.status(200).json(candles);
  } catch (error) {
    console.error('[ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
}

function fetchDerivCandles(symbol, granularity, count) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    ws.on('open', () => {
      const payload = {
        ticks_history: symbol,
        end: 'latest',
        count,
        style: 'candles',
        granularity
      };
      ws.send(JSON.stringify(payload));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);

      if (response.error) {
        ws.close();
        return reject(new Error(response.error.message));
      }

      const rawCandles = response?.candles || response?.history?.candles;

      if (rawCandles && rawCandles.length) {
        const candles = rawCandles.map(c => ({
          time: c.epoch,
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        }));
        ws.close();
        return resolve(candles);
      }

      ws.close();
      return reject(new Error('No candle data found'));
    });

    ws.on('error', (err) => reject(err));
    ws.on('close', () => console.log('[WS CLOSED]'));
  });
}
