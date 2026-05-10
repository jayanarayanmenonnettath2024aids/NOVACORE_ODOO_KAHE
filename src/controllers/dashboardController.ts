import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [trips, user, publicTrips] = await Promise.all([
      prisma.trip.findMany({
        where: { userId },
        orderBy: { startDate: 'asc' },
        include: { stops: true, expenses: true, packingItems: true, notes: true }
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.trip.findMany({ where: { isPublic: true }, take: 5, include: { stops: true } })
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

    res.json({
      userName: user?.name,
      upcomingTrips: upcomingTrips.slice(0, 3),
      recentTrips: recentTrips.slice(0, 3),
      ongoingTrips,
      userStats: {
        totalTrips: trips.length,
        countriesPlanned: uniqueCountries.size,
        itemsPacked: packingItems.filter(i => i.isPacked).length,
        totalItems: packingItems.length
      },
      budgetHighlights: {
        totalUpcomingBudget,
        currency: 'USD'
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
