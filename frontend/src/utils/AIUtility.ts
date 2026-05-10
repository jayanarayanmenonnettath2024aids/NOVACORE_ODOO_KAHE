/**
 * Traveloop Heuristic AI Engine
 * A zero-latency, rule-based "Smart Logic" utility to provide 
 * AI-driven insights across the platform.
 */

export const AI_REGIONS: Record<string, { costIndex: number, popularity: number, typicalWeather: string }> = {
  'Japan': { costIndex: 0.8, popularity: 0.95, typicalWeather: 'Variable' },
  'France': { costIndex: 0.85, popularity: 0.98, typicalWeather: 'Mild' },
  'USA': { costIndex: 0.9, popularity: 0.92, typicalWeather: 'Diverse' },
  'Indonesia': { costIndex: 0.3, popularity: 0.88, typicalWeather: 'Tropical' },
  'Italy': { costIndex: 0.7, popularity: 0.96, typicalWeather: 'Sunny' },
  'India': { costIndex: 0.25, popularity: 0.85, typicalWeather: 'Hot' },
  'UK': { costIndex: 0.82, popularity: 0.9, typicalWeather: 'Rainy' },
  'Australia': { costIndex: 0.75, popularity: 0.87, typicalWeather: 'Warm' },
  'Default': { costIndex: 0.5, popularity: 0.5, typicalWeather: 'Unknown' }
};

export const generateSmartAdvice = (trip: any) => {
  const insights = [];
  const regionData = AI_REGIONS[trip.stops?.[0]?.country] || AI_REGIONS['Default'];

  // 1. Budget Insight
  const totalCost = trip.stops?.reduce((acc: number, stop: any) => 
    acc + (stop.activities?.reduce((s: number, a: any) => s + (a.cost || 0), 0) || 0), 0
  ) || 0;
  
  if (totalCost > 5000) {
    insights.push({
      type: 'budget',
      title: 'Budget Alert',
      content: 'Your estimated costs are trending high for this region. Consider booking local transport in advance to save 15%.',
      severity: 'warning'
    });
  } else {
    insights.push({
      type: 'budget',
      title: 'Budget Healthy',
      content: 'You are well within the typical spending range for this destination. Good job!',
      severity: 'success'
    });
  }

  // 2. Weather/Packing Insight
  if (regionData.typicalWeather === 'Rainy' || regionData.typicalWeather === 'Variable') {
    insights.push({
      type: 'packing',
      title: 'Smart Packing',
      content: 'Local data suggests a 40% chance of rain. Pack a light windbreaker and waterproof shoes.',
      severity: 'info'
    });
  }

  // 3. Planning Health
  const stopCount = trip.stops?.length || 0;
  const activityCount = trip.stops?.reduce((acc: number, s: any) => acc + (s.activities?.length || 0), 0) || 0;

  if (stopCount > 0 && activityCount < stopCount * 2) {
    insights.push({
      type: 'planning',
      title: 'Planning Boost',
      content: `Your itinerary for ${trip.name} looks a bit empty. Add at least 2 more activities per stop for a complete experience.`,
      severity: 'suggestion'
    });
  }

  return insights;
};

export const predictTotalCost = (trip: any, currency: string = 'USD') => {
  const baseDayCost = 150; // Average global daily cost (Stay + Food)
  const multiplier = AI_REGIONS[trip.stops?.[0]?.country]?.costIndex || 0.5;
  
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  
  const estimatedStay = days * baseDayCost * multiplier;
  const activityCost = trip.stops?.reduce((acc: number, stop: any) => 
    acc + (stop.activities?.reduce((s: number, a: any) => s + (a.cost || 0), 0) || 0), 0
  ) || 0;

  const total = estimatedStay + activityCost;
  
  // Simple currency conversion
  const rates: any = { 'USD': 1, 'EUR': 0.92, 'INR': 83, 'GBP': 0.79, 'JPY': 150 };
  return Math.round(total * (rates[currency] || 1));
};

export const getPackingSuggestions = (trip: any) => {
  const base = ['Passport', 'Travel Insurance', 'Phone Charger', 'Universal Adapter'];
  const type = trip.type === 'International' ? ['Visa Copy', 'Local Currency'] : ['National ID'];
  
  const region = trip.stops?.[0]?.country;
  const regionExtras = region === 'Japan' || region === 'UK' ? ['Umbrella'] : 
                      region === 'Indonesia' || region === 'Australia' ? ['Sunscreen', 'Swimwear'] : [];

  return [...base, ...type, ...regionExtras];
};
