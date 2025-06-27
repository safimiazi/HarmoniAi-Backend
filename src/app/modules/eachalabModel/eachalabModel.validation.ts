import { z } from 'zod';
    
    export const eachalabModelPostValidation = z.object({

        body: z.object({
          id: z.string().optional(),
            title: z.string().min(1, 'Title is required'),
            name: z.string().min(1, 'Name is required'),
            price: z.number().min(0, 'Price must be a positive number'),
            intend: z.string().min(1, 'Intend is required'),
        })

    });
    
    
    export const eachalabModelUpdateValidation = eachalabModelPostValidation.partial();
    