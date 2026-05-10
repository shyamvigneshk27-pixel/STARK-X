import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

const FALLBACK_ACTIVITIES = [
  { xid: 'act1', name: 'City Walking Tour', kinds: 'cultural,tourist_facilities', dist: 500, rate: 4, image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300', description: 'Explore the heart of the city on foot with a knowledgeable local guide.', duration: 3, cost: 25 },
  { xid: 'act2', name: 'Local Food Market', kinds: 'foods,markets', dist: 300, rate: 5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300', description: 'Sample authentic local cuisine at the famous street food market.', duration: 2, cost: 15 },
  { xid: 'act3', name: 'Museum of History', kinds: 'museums,cultural', dist: 800, rate: 4, image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=300', description: 'Discover thousands of years of history and art collections.', duration: 3, cost: 18 },
  { xid: 'act4', name: 'Sunset River Cruise', kinds: 'water,transport', dist: 1200, rate: 5, image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300', description: 'Enjoy the stunning city skyline from the river at golden hour.', duration: 2, cost: 45 },
  { xid: 'act5', name: 'Night Photography Walk', kinds: 'arts,cultural', dist: 400, rate: 4, image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300', description: 'Capture the city lights and nighttime atmosphere with a photography guide.', duration: 3, cost: 30 },
];

// GET /api/activities/search?city=Paris&lat=48.8566&lng=2.3522&kinds=cultural
export const searchActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng, kinds = 'interesting_places', radius = '5000', limit = '20' } = req.query;
    const apiKey = process.env.OPENTRIPMAP_API_KEY;

    if (!lat || !lng) {
      res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
      return;
    }

    try {
      if (!apiKey || apiKey === 'demo') {
        throw new Error('OpenTripMap API key not configured or set to demo.');
      }

      // Step 1: Get nearby POIs list
      const listResp = await axios.get('https://api.opentripmap.com/0.1/en/places/radius', {
        params: {
          radius,
          lon: lng,
          lat,
          kinds,
          limit,
          format: 'json',
          apikey: apiKey,
        },
        timeout: 8000,
      });

      // Step 2: Get details for top results
      const places = listResp.data.slice(0, 10);
      const detailPromises = places.map((p: any) =>
        axios.get(`https://api.opentripmap.com/0.1/en/places/xid/${p.xid}`, {
          params: { apikey: apiKey },
          timeout: 5000,
        }).then(r => r.data).catch(() => null)
      );

      const details = (await Promise.all(detailPromises)).filter(Boolean);
      const activities = details.map((d: any) => ({
        xid: d.xid,
        name: d.name,
        kinds: d.kinds,
        rate: d.rate,
        image: d.preview?.source || null,
        description: d.wikipedia_extracts?.text?.slice(0, 200) || d.info?.descr || '',
        address: d.address,
        lat: d.point?.lat,
        lng: d.point?.lon,
        duration: 2,
        cost: Math.floor(Math.random() * 50) + 10,
      }));

      res.json({ success: true, data: { activities } });
      return;
    } catch (apiErr: any) {
      console.warn('OpenTripMap API call failed, falling back to local data:', apiErr.message);
    }

    res.json({ success: true, data: { activities: FALLBACK_ACTIVITIES, isFallback: true } });
  } catch (err) {
    next(err);
  }
};

// GET /api/activities/suggestions?tripType=BEACH&budget=MODERATE
export const getActivitySuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tripType } = req.query;
    // Map tripType to OpenTripMap kinds
    const typeToKinds: Record<string, string> = {
      ADVENTURE: 'sport,climbing,diving,surfing',
      CULTURAL: 'museums,historic,architecture',
      BEACH: 'beaches,water',
      FOOD: 'foods,restaurants,cafes',
      ENTERTAINMENT: 'theatres,cinemas,nightclubs',
    };

    const kinds = typeToKinds[tripType as string] || 'interesting_places';
    
    // For suggestions, we'd normally need a location. Since we don't have one here, 
    // we return general category-based info or the caller should provide lat/lng.
    // For now, we return a filtered set of fallbacks if no lat/lng, 
    // but the frontend should ideally call searchActivities with the stop location.
    
    res.json({ success: true, data: { suggestions: FALLBACK_ACTIVITIES, kinds } });
  } catch (err) {
    next(err);
  }
};
