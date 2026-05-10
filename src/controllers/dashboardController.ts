import { Request, Response } from 'express';
import prisma from '../prisma';
import { AIService } from '../services/aiService';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [trips, user, publicTrips, manifestGoals] = await Promise.all([
      prisma.trip.findMany({
        where: { userId },
        orderBy: { startDate: 'asc' },
        include: { stops: true, expenses: true, packingItems: true, notes: true }
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.trip.findMany({ where: { isPublic: true }, take: 5, include: { stops: true } }),
      prisma.manifestGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    ]);

    const packingItems = trips.flatMap(t => t.packingItems);

    const now = new Date();
    const upcomingTrips = trips.filter(t => t.startDate > now);
    const recentTrips = trips.filter(t => t.endDate < now);
    const ongoingTrips = trips.filter(t => t.startDate <= now && t.endDate >= now);

    // Budget highlights
    let totalUpcomingBudget = 0;
    upcomingTrips.forEach(trip => {
      totalUpcomingBudget += trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    });

    // Recent activities (Mock combined for demo)
    const recentActivities = [
      { id: 1, type: 'trip', action: 'Created', target: 'Summer in Japan', date: new Date() },
      { id: 2, type: 'note', action: 'Added note to', target: 'Tokyo Stop', date: new Date(Date.now() - 3600000) },
      { id: 3, type: 'packing', action: 'Updated checklist for', target: 'Greece Trip', date: new Date(Date.now() - 7200000) }
    ];

    const uniqueCountries = new Set(trips.flatMap(t => t.stops.map(s => s.country)));

    // Fetch persistent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // AI Dynamic Reminders and reasoning based on upcoming trips
    const next = upcomingTrips[0];
    let aiTripAnalysis = null;
    const reminders = [];

    if (next) {
      const days = Math.ceil((next.startDate.getTime() - Date.now()) / (1000 * 3600 * 24));
      if (days <= 7) reminders.push({ id: 'r1', title: 'Final Packing', message: `Your trip to ${next.name} starts in ${days} days! Time to finalize your checklist.`, type: 'alert' });
      if (days <= 30) reminders.push({ id: 'r2', title: 'Local Insights', message: `Don't forget to check the weather for your ${next.stops[0]?.cityName || 'destination'} stops.`, type: 'info' });
      
      aiTripAnalysis = await AIService.analyzeTrip(next.id);
    }

    // AI reasoning for goals
    let manifestAnalysis = [];
    try {
      manifestAnalysis = await Promise.all(
        manifestGoals.slice(0, 2).map(g => AIService.analyzeManifest(g.id))
      );
    } catch (err) {
      console.error('Manifest analysis failed:', err);
    }

    res.json({
      userName: user?.name,
      upcomingTrips: upcomingTrips.slice(0, 3),
      recentTrips: recentTrips.slice(0, 3),
      ongoingTrips,
      notifications,
      manifestGoals,
      manifestAnalysis,
      aiTripAnalysis,
      aiReminders: reminders,
      userStats: {
        totalTrips: trips.length,
        countriesPlanned: uniqueCountries.size,
        itemsPacked: packingItems.filter(i => i.isPacked).length,
        totalItems: packingItems.length
      },
      budgetHighlights: {
        totalUpcomingBudget,
        currency: upcomingTrips[0]?.currency || 'INR'
      },
      recentActivities,
      publicTrips: publicTrips.filter(t => t.userId !== userId),
      recommendedDestinations: [
        { name: 'Kyoto', country: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e' },
        { name: 'Santorini', country: 'Greece', imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e' },
        { name: 'Banff', country: 'Canada', imageUrl: 'https://images.unsplash.com/photo-1544413660-299165566b1d' }
      ]
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const createManifestGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, targetAmount, currency } = req.body;
    
    const goal = await prisma.manifestGoal.create({
      data: {
        userId,
        title,
        targetAmount: parseFloat(targetAmount),
        currency: currency || 'INR'
      }
    });
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create manifestation goal' });
  }
};

export const updateManifestGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { addAmount } = req.body;
    
    const currentGoal = await prisma.manifestGoal.findUnique({ where: { id } });
    if (!currentGoal) return res.status(404).json({ error: 'Goal not found' });
    
    const newAmount = currentGoal.savedAmount + parseFloat(addAmount);
    if (newAmount > currentGoal.targetAmount) {
      return res.status(400).json({ error: `Contribution exceeds the remaining target of ${currentGoal.targetAmount - currentGoal.savedAmount}` });
    }
    
    const isCompleted = newAmount >= currentGoal.targetAmount;
    
    const goal = await prisma.manifestGoal.update({
      where: { id },
      data: { 
        savedAmount: newAmount,
        isCompleted
      }
    });

    if (isCompleted && !currentGoal.isCompleted) {
      // Create notification for reaching the goal
      await prisma.notification.create({
        data: {
          userId: currentGoal.userId,
          title: '🎯 Goal Achieved!',
          message: `Congratulations! You've successfully manifested your budget for "${currentGoal.title}". Time to book your adventure!`,
          type: 'success'
        }
      });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update manifestation goal' });
  }
};
