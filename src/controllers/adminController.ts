import { Request, Response } from 'express';
import prisma from '../prisma';

export const getStats = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    console.log('Admin Stats Request by user:', userId);
    const admin = await prisma.user.findUnique({ where: { id: userId } });
    console.log('Admin Role Check:', admin?.role);
    if (admin?.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalStops = await prisma.stop.count();
    const totalActivities = await prisma.activity.count();

    // Top cities
    const stops = await prisma.stop.groupBy({
      by: ['cityName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // Recent user growth (simplified)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { name: true, email: true, createdAt: true }
    });

    res.json({
      overview: { totalUsers, totalTrips, totalStops, totalActivities },
      popularCities: stops,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const admin = await prisma.user.findUnique({ where: { id: userId } });
    if (admin?.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
