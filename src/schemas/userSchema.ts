import { z } from 'zod';

export const userRegistrationSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .trim(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER']).optional()
});

export const distributorRegistrationSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .trim(),
    businessId: z.string()
        .min(5, "Business ID must be at least 5 characters")
        .trim()
        .toUpperCase(), // Normalize to uppercase
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    city: z.string().min(2, "City is required"),
    pincode: z.string().min(4, "Invalid Pincode").max(10),
    gps: z.string()
        .regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, "Invalid GPS format. Expected 'lat, lng' (e.g. 28.7041, 77.1025)")
});
