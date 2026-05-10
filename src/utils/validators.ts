import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});

export const createTripSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Trip name must be at least 3 characters'),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string().optional(),
    coverPhotoUrl: z.string().optional(),
    type: z.string().optional(),
    isPublic: z.boolean().optional(),
    primaryDestination: z.string().optional(),
    discoveryStrategy: z.string().optional(),
    mood: z.string().optional(),
    budgetEstimate: z.number().optional(),
    currency: z.string().optional(),
    visibility: z.string().optional()
  })
});

export const addStopSchema = z.object({
  body: z.object({
    cityName: z.string().min(1, 'City name is required'),
    country: z.string().min(1, 'Country is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    orderIndex: z.number().int().min(0)
  })
});

export const addActivitySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Activity name is required'),
    description: z.string().optional(),
    cost: z.number().min(0).optional(),
    duration: z.number().int().min(0).optional(),
    type: z.string().optional(),
    startTime: z.string().optional()
  })
});

export const expenseSchema = z.object({
  body: z.object({
    category: z.enum(['Transport', 'Stay', 'Activities', 'Meals', 'Other']),
    amount: z.number().min(0),
    currency: z.string().length(3).optional()
  })
});

export const packingItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Item name is required'),
    category: z.string().min(1, 'Category is required')
  })
});

export const noteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Note content cannot be empty'),
    stopId: z.string().uuid().optional()
  })
});
