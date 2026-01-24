import { calculateLuhn } from './luhn';

const GS1_COMPANY_PREFIX = '1234567'; // Example Prefix
const EXTENSION_DIGIT = '0'; // For SSCC

/**
 * Generates a GS1-Compliant SSCC-18 Code.
 * Structure: (00) Application Identifier (Implied)
 *            Extension Digit (1 char)
 *            GS1 Company Prefix (7-10 chars)
 *            Serial Reference (6-9 chars)
 *            Check Digit (1 char)
 * Total: 18 digits.
 */
export function generateSSCC(counter: number): string {
    // Pad the counter to fit the Serial Reference space.
    // Assuming 7-digit Company Prefix -> 18 - 1 (Ext) - 7 (Prefix) - 1 (Check) = 9 chars for Serial.
    const serialRef = counter.toString().padStart(9, '0');

    const payload = `${EXTENSION_DIGIT}${GS1_COMPANY_PREFIX}${serialRef}`;
    const checkDigit = calculateLuhn(payload);

    return `${payload}${checkDigit}`;
}

/**
 * Generates a Unique Serial Number using the Custom "Formula".
 * Formula: [CompanyPrefix][Timestamp][Counter][CheckDigit]
 * Used for Units and Cases.
 */
export function generateCustomSerial(counter: number): string {
    // Timestamp: Unix Epoch (seconds) or shortened hex? 
    // Requirement says "timestamp". Let's use Date.now() in milliseconds but maybe shortened?
    // Let's use full milliseconds for uniqueness, sliced to last 10 digits to keep length manageable?
    // Or just Date.now().
    const timestamp = Date.now().toString();

    // Pad counter
    const paddedCounter = counter.toString().padStart(6, '0');

    const payload = `${GS1_COMPANY_PREFIX}${timestamp}${paddedCounter}`;

    const checkDigit = calculateLuhn(payload);

    return `${payload}${checkDigit}`;
}

/**
 * In-Memory Batch Generator.
 * Creates an array of Item objects for bulk insertion.
 */
export function generateBatch(
    count: number,
    type: 'UNIT' | 'CASE' | 'PALLET',
    startIndex: number
) {
    const batch = [];

    for (let i = 0; i < count; i++) {
        const currentIndex = startIndex + i;
        let serial = '';
        let sscc = undefined;

        if (type === 'PALLET') {
            // For Pallet, serial can be the SSCC itself or the custom internal ID?
            // Usually SSCC IS the ID.
            sscc = generateSSCC(currentIndex);
            serial = sscc;
        } else {
            serial = generateCustomSerial(currentIndex);
        }

        batch.push({
            serial,
            sscc,
            type
        });
    }

    return batch;
}
