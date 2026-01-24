import { z } from 'zod';

export const userRegistrationSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .trim(),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
    role: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER']).optional()
});

export const distributorRegistrationSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .trim(),
    email: z.string().email("Invalid email format").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal('')),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
    city: z.string().min(2, "City is required"),
    pincode: z.string().min(4, "Invalid Pincode").max(10),
    gps: z.string()
        .regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, "Invalid GPS format. Expected 'lat, lng' (e.g. 28.7041, 77.1025)")
});
