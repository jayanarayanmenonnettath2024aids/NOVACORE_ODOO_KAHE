import { Request, Response } from 'express';

// Mock data for hackathon
const MOCK_CITIES = [
  { id: 'c1', name: 'Paris', country: 'France', popularity: 98, costIndex: '$$$' },
  { id: 'c2', name: 'Rome', country: 'Italy', popularity: 95, costIndex: '$$' },
  { id: 'c3', name: 'Tokyo', country: 'Japan', popularity: 99, costIndex: '$$$' },
  { id: 'c4', name: 'Kyoto', country: 'Japan', popularity: 90, costIndex: '$$$' },
  { id: 'c5', name: 'Bali', country: 'Indonesia', popularity: 92, costIndex: '$' },
];

const MOCK_ACTIVITIES = [
  { id: 'a1', cityId: 'c1', name: 'Eiffel Tower Tour', type: 'Sightseeing', cost: 30, duration: 120 },
  { id: 'a2', cityId: 'c1', name: 'Seine River Cruise', type: 'Relaxation', cost: 15, duration: 60 },
  { id: 'a3', cityId: 'c2', name: 'Colosseum Entry', type: 'Sightseeing', cost: 20, duration: 180 },
  { id: 'a4', cityId: 'c3', name: 'Tsukiji Fish Market', type: 'Food', cost: 50, duration: 120 },
];

export const searchCities = (req: Request, res: Response) => {
  const { q } = req.query;
  let results = MOCK_CITIES;
  
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    results = MOCK_CITIES.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.country.toLowerCase().includes(query)
    );
  }

  res.json(results);
};

export const searchActivities = (req: Request, res: Response) => {
  const { cityId, type } = req.query;
  let results = MOCK_ACTIVITIES;

  if (cityId) {
    results = results.filter(a => a.cityId === cityId);
  }
  
  if (type) {
    results = results.filter(a => a.type.toLowerCase() === (type as string).toLowerCase());
  }

  res.json(results);
};
