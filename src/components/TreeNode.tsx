import { Package, Box, Container, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'PALLET': return <Container className="text-blue-500" />;
        case 'CASE': return <Box className="text-orange-500" />;
        default: return <Package className="text-emerald-500" />;
    }
};

export function TreeNode({ node, level = 0 }: { node: any, level?: number }) {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="relative ml-6">
            {/* Connector Line */}
            {level > 0 && (
                <div className="absolute -left-6 top-6 w-6 h-px bg-neutral-700"></div>
            )}
            {level > 0 && (
                <div className="absolute -left-6 -top-4 bottom-6 w-px bg-neutral-700"></div>
            )}

            <div className="mb-2">
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg border ${node.status === 'SOLD' ? 'bg-red-950/30 border-red-900' : 'bg-neutral-900 border-neutral-800'
                        } hover:border-neutral-600 transition-colors cursor-pointer w-fit pr-8`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {hasChildren ? (
                        isOpen ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : <ChevronRight className="h-4 w-4 text-neutral-500" />
                    ) : <span className="w-4" />}

                    <TypeIcon type={node.type} />

                    <div className="flex flex-col">
                        <span className="text-sm font-mono text-white">{node.serial}</span>
                        <span className="text-xs text-neutral-500">{node.type} • {node.status}</span>
                    </div>
                </div>
            </div>

            {/* Children */}
            {isOpen && hasChildren && (
                <div className="pl-6 border-l border-neutral-800 ml-3">
                    {node.children.map((child: any) => (
                        <TreeNode key={child.serial} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
