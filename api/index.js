import WebSocket from 'ws';

export const config = {
  api: {
    bodyParser: true,
  },
};

const DERIV_WS_URL = 'wss://ws.binaryws.com/websockets/v3';
const DERIV_APP_ID = '1089'; // Public app ID for Deriv

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, granularity, count } = req.body;

    if (!symbol || !granularity || !count) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const candles = await fetchDerivCandles(symbol, granularity, count);
    return res.status(200).json(candles);
  } catch (error) {
    console.error('[ERROR]', error.message);
    return res.status(500).json({ error: error.message });
  }
}

function fetchDerivCandles(symbol, granularity, count) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${DERIV_WS_URL}?app_id=${DERIV_APP_ID}`);
    const candleData = [];

    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          ticks_history: symbol,
          end: 'latest',
          count,
          style: 'candles',
          granularity,
          subscribe: 0,
        })
      );
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);

      if (response.error) {
        ws.close();
        return reject(new Error(response.error.message));
      }

      if (response.candles) {
        const formatted = response.candles.map((c) => ({
          time: c.epoch,
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        }));
        ws.close();
        return resolve(formatted);
      }
    });

    ws.on('error', (err) => reject(err));
    ws.on('close', () => console.log('[WS CLOSED]'));
  });
}
