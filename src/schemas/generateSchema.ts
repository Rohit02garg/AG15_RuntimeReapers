import { z } from 'zod';

export const generateSchema = z.object({
    type: z.enum(['UNIT', 'CASE', 'PALLET']),
    count: z.number().min(1).max(10000), // Max 10k per batch
    parentId: z.string().optional(), // If generating children for a specific parent
    prefix: z.string().optional() // Optional custom company prefix override
});

export type GenerateInput = z.infer<typeof generateSchema>;
