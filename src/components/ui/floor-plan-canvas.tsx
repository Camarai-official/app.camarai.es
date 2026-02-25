'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Maximize, CheckSquare, Users, Clock, AlertTriangle, XSquare, Settings, Copy, Trash2, Armchair, MoreVertical } from 'lucide-react';
import { type Table, type Environment, type TableStatus } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextSM } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FloorPlanCanvasProps {
    activeEnv: Environment;
    onUpdateTable: (id: number, updates: Partial<Table>) => void;
    onRemoveTable: (id: number) => void;
    onOpenEdit: (table: Table) => void;
    onOpenQR: (table: Table) => void;
    onDuplicateTable: (table: Table) => void;
    onEditChairs: (table: Table) => void;
    editingChairsId: number | null;
}

type DragItem = {
    id: number;
    offsetX: number;
    offsetY: number;
};

type ResizeItem = {
    id: number;
    corner: 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startXPos: number;
    startYPos: number;
};

export function FloorPlanCanvas({ 
    activeEnv, 
    onUpdateTable, 
    onRemoveTable, 
    onOpenEdit,
    onDuplicateTable,
    onEditChairs,
    editingChairsId
}: FloorPlanCanvasProps) {
    const statusConfig: Record<TableStatus, { variant: any; icon: React.ElementType }> = {
        'Libre': { variant: 'success', icon: CheckSquare },
        'Ocupada': { variant: 'info', icon: Users },
        'Reservada': { variant: 'purple', icon: Clock },
        'Mantenimiento': { variant: 'warning', icon: AlertTriangle },
        'Inactiva': { variant: 'neutral', icon: XSquare }
    };

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = React.useState(1);
    const [activeDrag, setActiveDrag] = React.useState<DragItem | null>(null);
    const [activeResize, setActiveResize] = React.useState<ResizeItem | null>(null);
    const [selectedTableId, setSelectedTableId] = React.useState<number | null>(null);
    const [collidingTableId, setCollidingTableId] = React.useState<number | null>(null);

    const isColliding = (rect1: { x: number, y: number, w: number, h: number }, rect2: { x: number, y: number, w: number, h: number }) => {
        return !(rect1.x + rect1.w < rect2.x || 
                 rect1.x > rect2.x + rect2.w || 
                 rect1.y + rect1.h < rect2.y || 
                 rect1.y > rect2.y + rect2.h);
    };

    const handleMouseDown = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        
        // Si no estaba seleccionada, la seleccionamos y salimos (no arrastramos aún)
        if (selectedTableId !== table.id) {
            setSelectedTableId(table.id);
            return;
        }

        // Si ya estaba seleccionada, iniciamos el arrastre
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;

        setActiveDrag({
            id: table.id,
            offsetX: mouseX - table.x,
            offsetY: mouseY - table.y
        });
    };

    const handleResizeStart = (e: React.MouseEvent, table: Table, corner: ResizeItem['corner']) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        setActiveResize({
            id: table.id,
            corner,
            startX: (e.clientX - rect.left) / zoom,
            startY: (e.clientY - rect.top) / zoom,
            startWidth: table.width,
            startHeight: table.height,
            startXPos: table.x,
            startYPos: table.y
        });
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;

        if (activeDrag) {
            const currentTable = activeEnv.tables.find(t => t.id === activeDrag.id);
            if (!currentTable) return;

            const nextX = Math.round((mouseX - activeDrag.offsetX) / 10) * 10;
            const nextY = Math.round((mouseY - activeDrag.offsetY) / 10) * 10;

            const hasCollision = activeEnv.tables.some(t => {
                if (t.id === activeDrag.id) return false;
                return isColliding(
                    { x: nextX, y: nextY, w: currentTable.width, h: currentTable.height },
                    { x: t.x, y: t.y, w: t.width, h: t.height }
                );
            });

            setCollidingTableId(hasCollision ? activeDrag.id : null);
            onUpdateTable(activeDrag.id, { x: nextX, y: nextY });
        }

        if (activeResize) {
            const deltaX = Math.round((mouseX - activeResize.startX) / 10) * 10;
            const deltaY = Math.round((mouseY - activeResize.startY) / 10) * 10;
            
            let nextX = activeResize.startXPos;
            let nextY = activeResize.startYPos;
            let nextW = activeResize.startWidth;
            let nextH = activeResize.startHeight;

            const MIN_SIZE = 40;

            if (activeResize.corner.includes('e')) nextW = Math.max(MIN_SIZE, activeResize.startWidth + deltaX);
            if (activeResize.corner.includes('w')) {
                const possibleW = activeResize.startWidth - deltaX;
                if (possibleW >= MIN_SIZE) {
                    nextW = possibleW;
                    nextX = activeResize.startXPos + deltaX;
                }
            }
            if (activeResize.corner.includes('s')) nextH = Math.max(MIN_SIZE, activeResize.startHeight + deltaY);
            if (activeResize.corner.includes('n')) {
                const possibleH = activeResize.startHeight - deltaY;
                if (possibleH >= MIN_SIZE) {
                    nextH = possibleH;
                    nextY = activeResize.startYPos + deltaY;
                }
            }

            onUpdateTable(activeResize.id, { x: nextX, y: nextY, width: nextW, height: nextH });
        }
    }, [activeDrag, activeResize, zoom, activeEnv.tables, onUpdateTable]);

    const handleMouseUp = React.useCallback(() => {
        setActiveDrag(null);
        setActiveResize(null);
        setCollidingTableId(null);
    }, []);

    React.useEffect(() => {
        if (activeDrag || activeResize) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [activeDrag, activeResize, handleMouseMove, handleMouseUp]);

    return (
        <Card className="flex-1 min-h-[600px] border-none shadow-2xl relative overflow-hidden group/canvas ring-1 ring-border/50 bg-white/50 dark:bg-black/50">
            {/* Patron de Puntos Background */}
            <div 
                className="absolute inset-0 select-none text-zinc-400 dark:text-zinc-600"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                    opacity: 0.2
                }}
            />
            
            {/* Contenedor con Zoom */}
            <div 
                ref={containerRef}
                className="relative h-full w-full overflow-auto custom-scrollbar"
                onClick={() => setSelectedTableId(null)}
            >
                <div 
                    style={{ 
                        width: zoom > 1 ? `${100 * zoom}%` : '100%', 
                        height: zoom > 1 ? `${100 * zoom}%` : '100%',
                        minWidth: '100%',
                        minHeight: '100%'
                    }}
                >
                    <div 
                        className="h-full w-full origin-top-left transition-transform duration-200 ease-out will-change-transform"
                        style={{ transform: `scale(${zoom})` }}
                    >
                    {activeEnv.tables.map(table => {
                        const isDragging = activeDrag?.id === table.id;
                        
                        const renderChairs = () => {
                            const chairs: React.ReactNode[] = [];
                            const CHAIR_SIZE = 26;
                            const CHAIR_OFFSET = 6;
                            const CHAIR_SPACING = 48;
                            const isEditing = editingChairsId === table.id;

                            const toggleChair = (side: 'top' | 'bottom' | 'left' | 'right', index: number) => {
                                const currentChairs = table.chairs || { top: [], bottom: [], left: [], right: [] };
                                const sideIndices = [...(currentChairs[side] || [])];
                                const exists = sideIndices.indexOf(index);
                                
                                if (exists > -1) sideIndices.splice(exists, 1);
                                else sideIndices.push(index);

                                onUpdateTable(table.id, { 
                                    chairs: { ...currentChairs, [side]: sideIndices } 
                                });
                            };

                            const renderSide = (side: 'top' | 'bottom' | 'left' | 'right') => {
                                const isVertical = side === 'left' || side === 'right';
                                const dimension = isVertical ? table.height : table.width;
                                const maxChairs = Math.floor(dimension / CHAIR_SPACING);
                                if (maxChairs <= 0) return;

                                const startPos = (dimension - (maxChairs - 1) * CHAIR_SPACING) / 2;
                                const activeIndices = table.chairs?.[side] || [];

                                for (let i = 0; i < maxChairs; i++) {
                                    const isActive = activeIndices.includes(i);
                                    if (!isActive && !isEditing) continue;

                                    const pos = startPos + i * CHAIR_SPACING - CHAIR_SIZE / 2;
                                    
                                    const style: React.CSSProperties = {};
                                    if (side === 'top') { style.top = -(CHAIR_SIZE + CHAIR_OFFSET); style.left = pos; }
                                    if (side === 'bottom') { style.bottom = -(CHAIR_SIZE + CHAIR_OFFSET); style.left = pos; }
                                    if (side === 'left') { style.left = -(CHAIR_SIZE + CHAIR_OFFSET); style.top = pos; }
                                    if (side === 'right') { style.right = -(CHAIR_SIZE + CHAIR_OFFSET); style.top = pos; }

                                    chairs.push(
                                        <div 
                                            key={`${side}-${i}`}
                                            onClick={(e) => {
                                                if (isEditing) {
                                                    e.stopPropagation();
                                                    toggleChair(side, i);
                                                }
                                            }}
                                            className={cn(
                                                "absolute w-[26px] h-[26px] flex items-center justify-center transition-all duration-200",
                                                isActive 
                                                    ? "bg-muted-foreground/30 border border-border/50 shadow-sm" 
                                                    : "bg-transparent border border-dashed border-muted-foreground/30 hover:bg-muted-foreground/10",
                                                side === 'top' && "rounded-t-lg",
                                                side === 'bottom' && "rounded-b-lg",
                                                side === 'left' && "rounded-l-lg",
                                                side === 'right' && "rounded-r-lg",
                                                isEditing && "cursor-pointer scale-110 z-50",
                                                isEditing && !isActive && "opacity-50 hover:opacity-100"
                                            )}
                                            style={{ ...style, width: CHAIR_SIZE, height: CHAIR_SIZE }}
                                        />
                                    );
                                }
                            };

                            renderSide('top');
                            renderSide('bottom');
                            renderSide('left');
                            renderSide('right');
                            
                            return chairs;
                        };

                        return (
                            <div
                                key={table.id}
                                onMouseDown={(e) => handleMouseDown(e, table)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    "absolute top-0 left-0 flex items-center justify-center bg-background border select-none group/table border-border rounded-xl transition-colors duration-200",
                                    selectedTableId === table.id && !isDragging ? "ring-1 ring-primary z-40 cursor-grab" : "z-30 cursor-pointer",
                                    isDragging ? "z-50 cursor-grabbing shadow-xl ring-1 ring-primary" : "",
                                    collidingTableId === table.id && "border-destructive bg-destructive/5"
                                )}
                                style={{
                                    transform: `translate3d(${table.x}px, ${table.y}px, 0)`,
                                    width: table.width,
                                    height: table.height,
                                    willChange: isDragging || activeResize?.id === table.id ? 'transform, width, height' : 'auto',
                                }}
                            >
                                {/* Chairs */}
                                {renderChairs()}

                                {/* Resize Handles - Only visible when selected */}
                                {selectedTableId === table.id && !isDragging && (
                                    <>
                                        <div 
                                            className="absolute -top-1.5 -left-1.5 w-5 h-5 cursor-nw-resize z-50 hover:bg-primary/20 rounded-full" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'nw')}
                                        />
                                        <div 
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 cursor-ne-resize z-50 hover:bg-primary/20 rounded-full" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'ne')}
                                        />
                                        <div 
                                            className="absolute -bottom-1.5 -left-1.5 w-5 h-5 cursor-sw-resize z-50 hover:bg-primary/20 rounded-full" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'sw')}
                                        />
                                        <div 
                                            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-se-resize z-50 hover:bg-primary/20 rounded-full" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'se')}
                                        />
                                    </>
                                )}
                                <span className={cn(
                                    "text-base transition-colors",
                                    isDragging ? "text-muted-foreground" : "text-muted-foreground/50"
                                )}>
                                    {table.number}
                                </span>

                                {/* No longer using dropdown inside table */}

                                {/* Status Indicator Badge */}
                                {table.status && statusConfig[table.status as TableStatus] && (
                                    <Badge 
                                        variant={statusConfig[table.status as TableStatus].variant}
                                        size="sm"
                                        className="absolute top-1 right-1 z-10"
                                        startIcon={React.createElement(statusConfig[table.status as TableStatus].icon)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

            {/* Table Selection HUD - Arriba a la derecha */}
            {selectedTableId && (
                <div className="absolute top-6 right-6 flex items-center gap-1 p-1 bg-background border rounded-xl z-40 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {(() => {
                        const table = activeEnv.tables.find(t => t.id === selectedTableId);
                        if (!table) return null;
                        return (
                            <div className="flex items-center gap-2">
                                <div className="px-3 h-10 flex items-center">
                                    <TextSM >Mesa {table.number}</TextSM>
                                </div>

                                <Separator orientation="vertical" className="h-5 mx-1" />
                                
                                <Button 
                                    variant="ghost" 
                                    size="md" 
                                    startIcon={<Copy />} 
                                    onClick={() => onDuplicateTable(table)}
                                >
                                    Duplicar
                                </Button>
                                
                                <Button 
                                    variant={editingChairsId === table.id ? "secondary" : "ghost"} 
                                    size="md" 
                                    startIcon={<Armchair />} 
                                    onClick={() => onEditChairs(table)}
                                    className={cn(editingChairsId === table.id && "bg-primary/10 text-primary hover:bg-primary/20")}
                                >
                                    {editingChairsId === table.id ? "Listo" : "Sillas"}
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    size="md" 
                                    startIcon={<Settings />} 
                                    onClick={() => onOpenEdit(table)}
                                >
                                    Configurar
                                </Button>

                                <Separator orientation="vertical" className="h-5 mx-1" />

                                <Button 
                                    variant="ghost" 
                                    size="md" 
                                    startIcon={<Trash2 />} 
                                    onClick={() => {
                                        onRemoveTable(table.id);
                                        setSelectedTableId(null);
                                    }}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Zoom HUD - Abajo a la derecha */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 p-1 bg-background border rounded-xl z-40 shadow-sm">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                
                <div className="px-2 min-w-[50px] text-center">
                    <TextSM className="font-bold tabular-nums">{Math.round(zoom * 100)}%</TextSM>
                </div>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                >
                    <Plus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1" />

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(1)}
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
