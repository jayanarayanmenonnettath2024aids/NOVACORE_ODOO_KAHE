import { Request, Response } from 'express';
import prisma from '../prisma';

export const getChecklist = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: { category: 'asc' }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
};

export const addChecklistItem = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { name, category } = req.body;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const item = await prisma.packingItem.create({
      data: {
        tripId,
        name,
        category,
        isPacked: false
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' });
  }
};

export const updateChecklistItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { isPacked } = req.body;

    const item = await prisma.packingItem.update({
      where: { id: itemId },
      data: { isPacked }
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
};

export const deleteChecklistItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.packingItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

export const resetChecklist = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    await prisma.packingItem.updateMany({
      where: { tripId },
      data: { isPacked: false }
    });

    res.json({ message: 'Checklist reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset checklist' });
  }
};
