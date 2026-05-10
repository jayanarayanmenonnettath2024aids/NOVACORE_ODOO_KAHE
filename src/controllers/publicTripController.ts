import { Request, Response } from 'express';
import prisma from '../prisma';

export const getPublicTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id, isPublic: true },
      include: {
        user: { select: { name: true, photoUrl: true } },
        stops: {
          include: { activities: { orderBy: { startTime: 'asc' } } },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Public trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public trip' });
  }
};

export const copyTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const originalTrip = await prisma.trip.findFirst({
      where: { id, isPublic: true },
      include: {
        stops: { include: { activities: true } },
        packingItems: true
      }
    });

    if (!originalTrip) {
      return res.status(404).json({ error: 'Public trip not found' });
    }

    // Deep copy
    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: `Copy of ${originalTrip.name}`,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        description: originalTrip.description,
        coverPhotoUrl: originalTrip.coverPhotoUrl,
        isPublic: false,
        
        stops: {
          create: originalTrip.stops.map(stop => ({
            cityName: stop.cityName,
            country: stop.country,
            startDate: stop.startDate,
            endDate: stop.endDate,
            orderIndex: stop.orderIndex,
            activities: {
              create: stop.activities.map(act => ({
                name: act.name,
                description: act.description,
                cost: act.cost,
                duration: act.duration,
                type: act.type,
                startTime: act.startTime
              }))
            }
          }))
        },

        packingItems: {
          create: originalTrip.packingItems.map(item => ({
            name: item.name,
            category: item.category,
            isPacked: false
          }))
        }
      }
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error copying trip:', error);
    res.status(500).json({ error: 'Failed to copy trip' });
  }
};
