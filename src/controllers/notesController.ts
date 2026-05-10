import { Request, Response } from 'express';
import prisma from '../prisma';

export const getNotes = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const notes = await prisma.note.findMany({
      where: { tripId },
      orderBy: { timestamp: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { content, stopId } = req.body;
    const userId = req.user!.userId;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const note = await prisma.note.create({
      data: {
        tripId,
        stopId: stopId || null,
        content
      }
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { content }
    });

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    await prisma.note.delete({ where: { id: noteId } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
