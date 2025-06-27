import { z } from 'zod';

export const LlmModelPostValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    name: z.string().min(1, 'Name is required'),
    price: z.number().min(0, 'Price must be a positive number'),
    description: z.string().optional(),
    provider: z.string()
  })
});


export const LlmModelUpdateValidation = LlmModelPostValidation.partial();
