import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, photoUrl: true, language: true, createdAt: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, photoUrl, language } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, photoUrl, language },
      select: { id: true, email: true, name: true, photoUrl: true, language: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Saved Destinations
export const getSavedDestinations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const dests = await prisma.savedDestination.findMany({ where: { userId } });
    res.json(dests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved destinations' });
  }
};

export const addSavedDestination = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { cityName, country } = req.body;
    
    const dest = await prisma.savedDestination.create({
      data: { userId, cityName, country }
    });
    
    res.status(201).json(dest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save destination' });
  }
};
