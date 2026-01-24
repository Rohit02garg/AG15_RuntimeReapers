import { z } from 'zod';

export const scanSchema = z.object({
    serial: z.string(),
    location: z.string(), // Human readable: "Warehouse A" or "New York"
    lat: z.number().optional(),
    long: z.number().optional(),
    stage: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER']).optional(),
    hashFragment: z.string().optional() // For Smart QR Verification
});

export type ScanInput = z.infer<typeof scanSchema>;
