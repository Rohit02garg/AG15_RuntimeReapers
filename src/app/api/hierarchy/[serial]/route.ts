import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Item from '@/model/Item';

// Helper to build tree from flat list
function buildTree(root: any, allItems: any[]) {
    const tree = { ...root.toObject(), children: [] };
    const children = allItems.filter(item => item.parentId && item.parentId.toString() === root._id.toString());

    if (children.length > 0) {
        tree.children = children.map(child => buildTree(child, allItems));
    }

    return tree;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { serial: string } }
) {
    try {
        const { serial } = params;
        await dbConnect();

        // 1. Find the requested item
        const targetItem = await Item.findOne({ serial });

        if (!targetItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // 2. Strategy: Fetch "Linked" family items
        // If it's a PALLET (Top level), fetch all descendants.
        // If it's a CASE (Mid level), fetch Parent (Pallet) and Children (Units).
        // If it's a UNIT (Leaf), fetch Parent (Case) and Grandparent (Pallet).

        // Optimization: Materialized Path allows finding ALL descendants effectively.
        // Descendants have "path" containing targetItem._id

        // We want to visualize the whole tree regardless of where we scanned.
        // So ideally we find the "Root" of this item, then fetch the whole tree of that root.

        let rootItem = targetItem;

        // Trace up to finding the absolute root (Pallet)
        // Detailed Path is like ",PALLET_ID,CASE_ID,".
        // We can extract PALLET_ID from it.
        if (targetItem.path && targetItem.path !== ',') {
            const ids = targetItem.path.split(',').filter(Boolean);
            const rootId = ids[0]; // The first one is the root
            if (rootId) {
                rootItem = await Item.findById(rootId) || targetItem;
            }
        }

        // Now fetch ALL items that belong to this Root (descendants)
        // Query: Any item whose path contains rootItem._id OR is the rootItem itself
        const family = await Item.find({
            $or: [
                { _id: rootItem._id },
                { path: { $regex: rootItem._id.toString() } }
            ]
        });

        // 3. Construct Tree Structure for UI
        const tree = buildTree(rootItem, family);

        return NextResponse.json({
            success: true,
            scannedItem: targetItem,
            tree: tree,
            totalNodes: family.length
        });

    } catch (error: any) {
        console.error('Hierarchy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
