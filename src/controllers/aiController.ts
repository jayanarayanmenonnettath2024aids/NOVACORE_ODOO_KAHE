import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAIReasoning = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [trips, goals, user] = await Promise.all([
      prisma.trip.findMany({ 
        where: { userId },
        include: { stops: true, expenses: true, packingItems: true }
      }),
      prisma.manifestGoal.findMany({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } })
    ]);

    // Simulated ML Logic Engine
    const totalSpent = trips.reduce((acc, t) => acc + (t.currentSavings || 0), 0);
    const avgBudget = trips.length > 0 ? trips.reduce((acc, t) => acc + (t.budgetEstimate || 0), 0) / trips.length : 50000;
    const completedGoals = goals.filter(g => g.isCompleted).length;
    
    const insights = [
      {
        id: 1,
        type: 'BUDGET',
        title: 'Financial Manifestation reasoning',
        reasoning: [
          `Detected savings velocity of ${Math.round(totalSpent / (trips.length || 1))} per trip.`,
          `High correlation between 'Solo' trips and 20% budget overruns.`,
          `Goal completion rate is ${Math.round((completedGoals / (goals.length || 1)) * 100)}%.`
        ],
        recommendation: 'Shift 15% of flight budget to local experiences for better ROI on adventure.',
        confidence: 94
      },
      {
        id: 2,
        type: 'DESTINATION',
        title: 'Adventure Density Analysis',
        reasoning: [
          `Past 3 trips were in high-pace urban areas (Tokyo, NYC).`,
          `Recent 'Relaxed' preference detected in creation wizard.`,
          `Atmospheric analysis suggests seasonal preference for temperate climates.`
        ],
        recommendation: 'Consider Bali or Amalfi Coast for your next manifestation. Better alignment with your current recovery profile.',
        confidence: 88
      },
      {
        id: 3,
        type: 'PACKING',
        title: 'Efficiency Heuristics',
        reasoning: [
          `Over-packing detected in 'Clothing' category for 80% of trips.`,
          `Correlation between 'Rainy' destinations and missing essential gear.`,
          `Last trip to ${trips[0]?.name || 'a new city'} had 3 emergency purchases.`
        ],
        recommendation: 'Use a modular packing system. Focus on waterproof outer layers and reduced base layers.',
        confidence: 91
      }
    ];

    res.json({
      userName: user?.name,
      lastAnalyzed: new Date(),
      insights,
      userProfile: {
        archetype: trips.length > 5 ? 'Elite Nomad' : 'Dreamer Explorer',
        bias: 'High-Value/Low-Effort Planning'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'AI reasoning engine failed' });
  }
};
