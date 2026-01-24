import crypto from 'crypto';

/**
 * Generates a SHA256 hash based on the SmartTrace anti-counterfeit formula.
 * Formula: SHA256(Serial + Timestamp + ProductCode + SecretSalt)
 * @param serial The unique serial number.
 * @param timestamp The creation timestamp (ISO string or timestamp).
 * @param productCode The product type/code (e.g., 'UNIT', 'CASE').
 * @returns The full 64-character hex hash.
 */
export function generateHash(serial: string, timestamp: string | number, productCode: string): string {
    const salt = process.env.SECRET_SALT || 'default_insecure_salt'; // Fallback for dev only
    const input = `${serial}${timestamp}${productCode}${salt}`;

    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Helper to get the short verification code for the label.
 * @param fullHash The full 64-char hash.
 * @returns The first 8 characters.
 */
export function getShortHash(fullHash: string): string {
    return fullHash.substring(0, 8);
}
