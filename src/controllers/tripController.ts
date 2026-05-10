import { Request, Response } from 'express';
import prisma from '../prisma';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { 
      name, slug, startDate, endDate, description, coverPhotoUrl, 
      type, companionType, currency, budgetEstimate, 
      travelPace, mood, transportType, visibility, invitees 
    } = req.body;
    const userId = req.user!.userId;

    // Auto-generate slug if not provided
    const tripSlug = slug || `${name.toLowerCase().replace(/ /g, '-')}-${Date.now().toString().slice(-4)}`;

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        slug: tripSlug,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        coverPhotoUrl,
        type: type || "National",
        companionType: companionType || "Solo",
        currency: currency || "INR",
        budgetEstimate: budgetEstimate ? parseFloat(budgetEstimate) : null,
        travelPace: travelPace || "Moderate",
        mood,
        transportType,
        visibility: visibility || "Private",
        invitees,
        isPublic: visibility === "Public",
      }
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        _count: {
          select: { stops: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        stops: {
          include: {
            activities: {
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        expenses: true,
        packingItems: true,
        notes: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ error: 'Failed to fetch trip details' });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { 
      name, slug, startDate, endDate, description, coverPhotoUrl, 
      type, companionType, currency, budgetEstimate, 
      travelPace, mood, transportType, visibility, invitees 
    } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        name,
        slug,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description,
        coverPhotoUrl,
        type,
        companionType,
        currency,
        budgetEstimate: budgetEstimate ? parseFloat(budgetEstimate) : undefined,
        travelPace,
        mood,
        transportType,
        visibility,
        invitees,
        isPublic: visibility === "Public"
      }
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    await prisma.trip.delete({ where: { id } });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

// Stops and Activities
export const addStop = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;
    
    // Verify ownership
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const { cityName, country, startDate, endDate, orderIndex } = req.body;
    
    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityName,
        country,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        orderIndex
      }
    });

    res.status(201).json(stop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stop' });
  }
};

export const addActivity = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;
    const { name, description, cost, duration, type, startTime } = req.body;

    const activity = await prisma.activity.create({
      data: {
        stopId,
        name,
        description,
        cost: cost || 0,
        duration,
        type,
        startTime: startTime ? new Date(startTime) : null
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

// Budget Summary
export const getBudget = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;
    
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        stops: { include: { activities: true } },
        expenses: true
      }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Calculate sum
    let totalActivities = 0;
    trip.stops.forEach(stop => {
      stop.activities.forEach(act => {
        totalActivities += act.cost;
      });
    });

    const expensesByCategory = trip.expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    expensesByCategory['Activities'] = (expensesByCategory['Activities'] || 0) + totalActivities;

    res.json({
      totalCost: Object.values(expensesByCategory).reduce((a, b) => a + b, 0),
      breakdown: expensesByCategory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget' });
  }
};

// --- Packing Checklist ---

export const addPackingItem = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { name, category } = req.body;
    const item = await prisma.packingItem.create({
      data: { tripId, name, category }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add packing item' });
  }
};

export const togglePackingItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.packingItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const updated = await prisma.packingItem.update({
      where: { id: itemId },
      data: { isPacked: !item.isPacked }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle packing item' });
  }
};

export const deletePackingItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.packingItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove packing item' });
  }
};

export const resetPackingItems = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    await prisma.packingItem.updateMany({
      where: { tripId },
      data: { isPacked: false }
    });
    res.json({ message: 'Checklist reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset checklist' });
  }
};

// --- Public Access & Cloning ---

export const getPublicTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findFirst({
      where: { id, isPublic: true },
      include: {
        stops: {
          include: { activities: { orderBy: { startTime: 'asc' } } },
          orderBy: { orderIndex: 'asc' }
        },
        user: { select: { name: true, photoUrl: true } }
      }
    });

    if (!trip) return res.status(404).json({ error: 'Public trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public trip' });
  }
};

export const cloneTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const sourceTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: { include: { activities: true } },
        packingItems: true
      }
    });

    if (!sourceTrip) return res.status(404).json({ error: 'Source trip not found' });

    // Create a deep copy
    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: `Copy of ${sourceTrip.name}`,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        type: sourceTrip.type,
        coverPhotoUrl: sourceTrip.coverPhotoUrl,
        isPublic: false,
        stops: {
          create: sourceTrip.stops.map(stop => ({
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
                type: act.type
              }))
            }
          }))
        },
        packingItems: {
          create: sourceTrip.packingItems.map(item => ({
            name: item.name,
            category: item.category,
            isPacked: false
          }))
        }
      }
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Cloning error:', error);
    res.status(500).json({ error: 'Failed to clone trip' });
  }
};

export const addContribution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;
    const userId = req.user!.userId;
    
    // Get user name and trip for validation
    const [user, trip] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.trip.findUnique({ where: { id } })
    ]);

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const newTotal = (trip.currentSavings || 0) + parseFloat(amount);
    if (newTotal > (trip.budgetEstimate || 0)) {
      return res.status(400).json({ error: `Contribution exceeds the remaining budget of ${(trip.budgetEstimate || 0) - (trip.currentSavings || 0)}` });
    }

    const [contribution] = await prisma.$transaction([
      prisma.contribution.create({
        data: {
          tripId: id,
          userId,
          userName: user?.name || 'Anonymous',
          amount: parseFloat(amount),
          message
        }
      }),
      prisma.trip.update({
        where: { id },
        data: {
          currentSavings: { increment: parseFloat(amount) }
        }
      })
    ]);

    res.status(201).json(contribution);
  } catch (error) {
    console.error('Contribution error:', error);
    res.status(500).json({ error: 'Failed to add contribution' });
  }
};

export const getContributions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contributions = await prisma.contribution.findMany({
      where: { tripId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
};

