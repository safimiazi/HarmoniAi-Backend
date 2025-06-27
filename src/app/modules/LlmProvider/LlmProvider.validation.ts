import { z } from 'zod';
    
    export const LlmProviderPostValidation = z.object({
      body: z.object({
        name: z.string().min(1, { message: "Name is required" }),
      })
    });
    
    
    export const LlmProviderUpdateValidation = LlmProviderPostValidation.partial();
    