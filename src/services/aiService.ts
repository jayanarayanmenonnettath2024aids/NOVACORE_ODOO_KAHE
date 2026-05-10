import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIService {
  /**
   * Simulates a Deep Thinking LLM (Gemini-style) to analyze trip data
   */
  static async analyzeTrip(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: true }
    });

    if (!trip) return null;

    const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const budget = trip.budgetEstimate || 0;
    const perDayBudget = budget / duration;
    
    // Estimate companion count from companionType or invitees
    let companionCount = 1;
    if (trip.companionType === 'Couple') companionCount = 2;
    if (trip.companionType === 'Group' || trip.companionType === 'Family') {
      companionCount = trip.invitees ? trip.invitees.split(',').length + 1 : 3;
    }

    let budgetReasoning = "";
    let budgetSuggestion = budget;

    // AI Logic for Budget
    if (perDayBudget < 2000) {
      budgetReasoning = "Critically low budget detected for the duration. Typical daily minimum for comfortable travel is ₹3,500.";
      budgetSuggestion = duration * 3500;
    } else if (perDayBudget > 20000) {
      budgetReasoning = "High-tier luxury budget detected. Opportunities for private charters and exclusive 'Skip-the-line' experiences identified.";
      budgetSuggestion = budget; // Keep it, but add luxury tags
    } else {
      budgetReasoning = "Balanced budget for the selected duration and pace.";
    }

    // AI Logic for Packing
    const packingSuggestions = [
      "Lightweight breathable fabrics (based on pace)",
      "Universal power adapter",
      "Digital copies of travel insurance",
      trip.type === 'International' ? "Offline translation pack" : "Local UPI/Digital wallet setup"
    ];

    return {
      reasoning: {
        budget: budgetReasoning,
        suggestedAmount: budgetSuggestion,
        status: perDayBudget < 2000 ? 'UNDERESTIMATED' : perDayBudget > 20000 ? 'OVERESTIMATED' : 'OPTIMIZED'
      },
      recommendations: {
        packing: packingSuggestions,
        paceAdvice: trip.travelPace === 'Packed' ? "Incorporate 2-hour 'Buffer Zones' every afternoon to prevent burnout." : "Stable pace detected."
      },
      model: "Gemini-1.5-Pro-Travel-Spec",
      confidence: 0.92
    };
  }

  /**
   * Global Manifestation Analysis
   */
  static async analyzeManifest(goalId: string) {
    const goal = await prisma.manifestGoal.findUnique({ where: { id: goalId } });
    if (!goal) return null;

    const remaining = goal.targetAmount - goal.savedAmount;
    const daysSinceCreated = Math.ceil((new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const dailyRate = goal.savedAmount / daysSinceCreated;

    return {
      forecast: {
        daysToComplete: dailyRate > 0 ? Math.ceil(remaining / dailyRate) : Infinity,
        velocity: dailyRate,
        reasoning: dailyRate < (goal.targetAmount / 180) ? "Savings velocity is below the 6-month target threshold." : "On track for early completion."
      },
      strategy: "Micro-contribution strategy recommended: Save 5% extra on weekends."
    };
  }
}
