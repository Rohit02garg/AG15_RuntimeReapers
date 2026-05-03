/**
 * itemHelper.ts — Centralized Item Lookup & History Aggregation
 *
 * Since SmartTrace uses separate MongoDB collections for Pallets, Cartons,
 * and Units (for performance and clear schema separation), several API routes
 * need to search across all three. This helper DRYs up that logic.
 */

import { Pallet, Carton, Unit } from '@/model/Item';

export type ItemType = 'PALLET' | 'CARTON' | 'UNIT';

export interface ItemLookupResult {
    item: any;
    type: ItemType;
}

/**
 * Searches for an item by serial across all three collections.
 * Returns the item and its type, or null if not found.
 */
export async function findItemBySerial(serial: string): Promise<ItemLookupResult | null> {
    // Use parallel queries for speed
    const [pallet, carton, unit] = await Promise.all([
        Pallet.findOne({ serial }).lean(),
        Carton.findOne({ serial }).lean(),
        Unit.findOne({ serial }).lean()
    ]);

    if (pallet) return { item: pallet, type: 'PALLET' };
    if (carton) return { item: carton, type: 'CARTON' };
    if (unit) return { item: unit, type: 'UNIT' };

    return null;
}

/**
 * Aggregates the full supply-chain history for an item by walking
 * up its hierarchy (Unit → Carton → Pallet) and merging events.
 *
 * This is the "Digital Red Thread" — showing every event that
 * touched this item or its container as it moved through the chain.
 */
export async function getAggregatedHistory(item: any, type: ItemType): Promise<any[]> {
    let finalHistory: any[] = [];

    if (type === 'PALLET') {
        finalHistory = item.history || [];
    }
    else if (type === 'CARTON') {
        finalHistory = [...(item.history || [])];
        if (item.parentId) {
            const parentPallet = await Pallet.findById(item.parentId).lean();
            if (parentPallet && parentPallet.history) {
                finalHistory = [...parentPallet.history, ...finalHistory];
            }
        }
    }
    else if (type === 'UNIT') {
        // Walk: Unit → Carton → Pallet
        if (item.parentId) {
            const parentCarton = await Carton.findById(item.parentId).lean();
            if (parentCarton) {
                if (parentCarton.history) {
                    finalHistory = [...parentCarton.history];
                }
                if (parentCarton.parentId) {
                    const grandParentPallet = await Pallet.findById(parentCarton.parentId).lean();
                    if (grandParentPallet && grandParentPallet.history) {
                        finalHistory = [...grandParentPallet.history, ...finalHistory];
                    }
                }
            }
        }
    }

    // Deduplicate
    const uniqueEvents = new Map();
    finalHistory.forEach(event => {
        let key = `${event.status}-${event.location}-${new Date(event.timestamp).getTime()}`;
        // Collapse multiple RECALLED events into one
        if (event.status?.trim().toUpperCase() === 'RECALLED') {
            key = 'RECALLED-EVENT';
        }
        if (!uniqueEvents.has(key)) {
            uniqueEvents.set(key, event);
        }
    });

    // Sort chronologically
    return Array.from(uniqueEvents.values())
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
