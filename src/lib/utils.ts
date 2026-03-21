import { z } from 'zod';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const healthLogSchema = z.object({
  type: z.enum(['medication', 'mood', 'symptom', 'appointment', 'note', 'meal']),
  notes: z.string().min(1),
  photoUrl: z.string().url().optional(),
});

export const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.enum(['daily', 'twice_daily', 'weekly', 'as_needed', 'custom']),
  scheduleTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
  prescriber: z.string().optional(),
  notes: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDateTime: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const helpRequestSchema = z.object({
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  description: z.string().min(1),
  duration: z.string().min(1),
  location: z.string().optional(),
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
