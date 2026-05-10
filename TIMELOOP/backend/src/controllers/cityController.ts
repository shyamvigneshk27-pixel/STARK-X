import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

// Fallback cities — used ONLY when the live API call fails (network error, quota exceeded, etc.)
const FALLBACK_CITIES = [
  { id: 'paris', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { id: 'rome', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964 },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3851, lng: 2.1734 },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  { id: 'new-york', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
  { id: 'london', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278 },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018 },
  { id: 'bali', city: 'Bali', country: 'Indonesia', countryCode: 'ID', lat: -8.3405, lng: 115.0920 },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },
  { id: 'sydney', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  { id: 'istanbul', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lng: 28.9784 },
];

// GET /api/cities/search?q=paris&limit=10
export const searchCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q = '', limit = '10', minPopulation = '10000' } = req.query;
    const apiKey = process.env.GEODB_API_KEY;
    const apiHost = process.env.GEODB_API_HOST || 'wft-geo-db.p.rapidapi.com';

    // Always try the live API first
    try {
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
        params: {
          namePrefix: q,
          limit,
          minPopulation,
          sort: '-population',
          types: 'CITY',
        },
        headers: {
          'X-RapidAPI-Key': apiKey || '',
          'X-RapidAPI-Host': apiHost,
        },
        timeout: 8000,
      });

      const cities = response.data.data.map((c: any) => ({
        id: c.id,
        city: c.city,
        country: c.country,
        countryCode: c.countryCode,
        region: c.region,
        lat: c.latitude,
        lng: c.longitude,
      }));

      res.json({ success: true, data: { cities } });
      return;
    } catch (apiErr: any) {
      console.warn('GeoDB API call failed, falling back to local data:', apiErr.message);
    }

    // Fallback: filter local data
    const query = (q as string).toLowerCase();
    const filtered = query
      ? FALLBACK_CITIES.filter(c => c.city.toLowerCase().includes(query) || c.country.toLowerCase().includes(query))
      : FALLBACK_CITIES.slice(0, parseInt(limit as string));

    res.json({ success: true, data: { cities: filtered.slice(0, parseInt(limit as string)), isFallback: true } });
  } catch (err) {
    next(err);
  }
};

// GET /api/cities/popular
export const getPopularCities = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = process.env.GEODB_API_KEY;
    const apiHost = process.env.GEODB_API_HOST || 'wft-geo-db.p.rapidapi.com';

    try {
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
        params: { limit: 12, minPopulation: '5000000', sort: '-population', types: 'CITY' },
        headers: { 'X-RapidAPI-Key': apiKey || '', 'X-RapidAPI-Host': apiHost },
        timeout: 8000,
      });

      const cities = response.data.data.map((c: any) => ({
        id: c.id, city: c.city, country: c.country,
        countryCode: c.countryCode, lat: c.latitude, lng: c.longitude,
      }));

      res.json({ success: true, data: { cities } });
      return;
    } catch (apiErr: any) {
      console.warn('GeoDB popular cities API failed, using fallback:', apiErr.message);
    }

    res.json({ success: true, data: { cities: FALLBACK_CITIES.slice(0, 12), isFallback: true } });
  } catch (err) {
    next(err);
  }
};

// GET /api/cities/regions
export const getCityRegions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const regions = [
      { name: 'Europe', emoji: '🏰', cities: ['Paris', 'Rome', 'Barcelona', 'London', 'Amsterdam', 'Prague'] },
      { name: 'Asia', emoji: '🏯', cities: ['Tokyo', 'Bangkok', 'Bali', 'Singapore', 'Istanbul'] },
      { name: 'Americas', emoji: '🗽', cities: ['New York', 'Miami', 'Mexico City', 'Buenos Aires'] },
      { name: 'Middle East & Africa', emoji: '🕌', cities: ['Dubai', 'Cairo', 'Marrakech', 'Cape Town'] },
      { name: 'Oceania', emoji: '🦘', cities: ['Sydney', 'Melbourne', 'Auckland', 'Fiji'] },
    ];
    res.json({ success: true, data: { regions } });
  } catch (err) {
    next(err);
  }
};
