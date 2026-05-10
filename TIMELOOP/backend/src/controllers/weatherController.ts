import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

// GET /api/weather?lat=48.8566&lng=2.3522
export const getWeather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lng) {
      res.status(400).json({ success: false, message: 'lat and lng query params are required.' });
      return;
    }

    if (!apiKey || apiKey === 'demo') {
      res.status(503).json({ success: false, message: 'Weather service not configured.' });
      return;
    }

    // Current weather
    const currentResp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon: lng, appid: apiKey, units: 'metric' },
    });

    // 5-day / 3-hour forecast
    const forecastResp = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { lat, lon: lng, appid: apiKey, units: 'metric', cnt: 40 },
    });

    const current = {
      temp: currentResp.data.main.temp,
      feelsLike: currentResp.data.main.feels_like,
      humidity: currentResp.data.main.humidity,
      description: currentResp.data.weather?.[0]?.description,
      icon: currentResp.data.weather?.[0]?.icon,
      windSpeed: currentResp.data.wind?.speed,
      city: currentResp.data.name,
    };

    // Aggregate forecast into daily summaries
    const dailyMap: Record<string, any> = {};
    for (const item of forecastResp.data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          description: item.weather?.[0]?.description,
          icon: item.weather?.[0]?.icon,
        };
      } else {
        dailyMap[date].tempMin = Math.min(dailyMap[date].tempMin, item.main.temp_min);
        dailyMap[date].tempMax = Math.max(dailyMap[date].tempMax, item.main.temp_max);
      }
    }
    const forecast = Object.values(dailyMap).slice(0, 5);

    res.json({ success: true, data: { current, forecast } });
  } catch (err) {
    next(err);
  }
};
