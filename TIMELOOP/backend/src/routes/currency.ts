import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/rates', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const apiKey = process.env.EXCHANGERATE_API_KEY;

    if (!apiKey || apiKey === 'demo') {
      // Static mock rates
      const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.4, INR: 83.5, AED: 3.67, THB: 36.1, AUD: 1.52, CAD: 1.37, SGD: 1.34, TRY: 32.5 };
      res.json({ success: true, data: { base, rates, isMock: true } });
      return;
    }

    const resp = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
    res.json({ success: true, data: { base, rates: resp.data.conversion_rates } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Currency service unavailable.' });
  }
});

export default router;
