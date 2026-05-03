import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Pallet, Carton, Unit } from '@/model/Item';

// Helper to build tree from flat list
function buildTree(root: any, allItems: any[]) {
    const tree = { ...root, children: [] as any[] };
    const children = allItems.filter(item => item.parentId && item.parentId.toString() === root._id.toString());

    if (children.length > 0) {
        tree.children = children.map((child: any) => buildTree(child, allItems));
    }

    return tree;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;
        await dbConnect();

        // 1. Find the requested item (search across all collections)
        let targetItem: any =
            await Pallet.findOne({ serial }).lean() ||
            await Carton.findOne({ serial }).lean() ||
            await Unit.findOne({ serial }).lean();

        if (!targetItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // 2. Find root Pallet by tracing parentId upwards
        let rootItem = targetItem;

        // If it's a Unit, find its Carton parent, then Pallet grandparent
        if (targetItem.parentId) {
            const parent = await Carton.findById(targetItem.parentId).lean() ||
                           await Pallet.findById(targetItem.parentId).lean();
            if (parent) {
                if ((parent as any).parentId) {
                    const grandparent = await Pallet.findById((parent as any).parentId).lean();
                    if (grandparent) rootItem = grandparent;
                } else {
                    rootItem = parent;
                }
            }
        }

        // 3. Fetch all descendants of the root
        const palletId = rootItem._id;
        const cartons = await Carton.find({ parentId: palletId }).lean();
        const cartonIds = cartons.map((c: any) => c._id);
        const units = await Unit.find({ parentId: { $in: cartonIds } }).lean();

        const family = [rootItem, ...cartons, ...units];

        // 4. Construct Tree Structure for UI
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
