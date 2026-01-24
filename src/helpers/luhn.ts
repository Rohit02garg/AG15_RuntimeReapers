/**
 * Calculates the Luhn check digit for a given string of numbers.
 * @param input The numeric string to calculate the check digit for (without the check digit).
 * @returns The calculate check digit (0-9).
 */
export function calculateLuhn(input: string): number {
    let sum = 0;
    let isSecond = true; // We start doubling from the rightmost digit of the *payload*, so for check digit calculation, we treat it as if we are processing from right to left, but here we append.
    // Actually standard Luhn: 
    // 1. Drop check digit (if verifying). Here we are calculating, so 'input' is the payload.
    // 2. Iterate from right to left.
    // 3. Double every second digit.
    // 4. Sum digits.

    // Implementation for Calculation (appending the digit):
    // We effectively imagine the check digit is '0' at the end, then finding what creates a valid sum 0 mod 10?
    // Easier: Standard algorithm to compute check digit.

    // Clean non-numeric
    const cleanInput = input.replace(/\D/g, '');

    let tempSum = 0;
    let double = true; // For calculation, the rightmost digit of the payload is the "first" (not doubled) relative to the check digit position? No.
    // Standard: The check digit is at the right. The first digit to its left is doubled.

    for (let i = cleanInput.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanInput.charAt(i), 10);

        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        tempSum += digit;
        double = !double;
    }

    const mod = tempSum % 10;
    return mod === 0 ? 0 : 10 - mod;
}

/**
 * Validates a number string using Luhn algorithm.
 * @param input The full numeric string including the check digit.
 * @returns boolean True if valid.
 */
export function validateLuhn(input: string): boolean {
    const cleanInput = input.replace(/\D/g, '');
    if (cleanInput.length === 0) return false;

    let sum = 0;
    let double = false; // For validation, the check digit (rightmost) is NOT doubled.

    for (let i = cleanInput.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanInput.charAt(i), 10);

        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        double = !double;
    }

    return sum % 10 === 0;
}
