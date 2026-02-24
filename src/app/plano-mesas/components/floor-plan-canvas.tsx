'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Maximize, CheckSquare, Users, Clock, AlertTriangle, XSquare, Settings } from 'lucide-react';
import { type Table, type Environment, type TableStatus } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextXS } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FloorPlanCanvasProps {
    activeEnv: Environment;
    onUpdateTable: (id: number, updates: Partial<Table>) => void;
    onRemoveTable: (id: number) => void;
    onOpenEdit: (table: Table) => void;
    onOpenQR: (table: Table) => void;
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
    const [collidingTableId, setCollidingTableId] = React.useState<number | null>(null);

    const isColliding = (rect1: { x: number, y: number, w: number, h: number }, rect2: { x: number, y: number, w: number, h: number }) => {
        return !(rect1.x + rect1.w < rect2.x || 
                 rect1.x > rect2.x + rect2.w || 
                 rect1.y + rect1.h < rect2.y || 
                 rect1.y > rect2.y + rect2.h);
    };

    const handleMouseDown = (e: React.MouseEvent, table: Table) => {
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
                        return (
                            <div
                                key={table.id}
                                onMouseDown={(e) => handleMouseDown(e, table)}
                                className={cn(
                                    "absolute top-0 left-0 flex items-center justify-center bg-background border rounded-xl select-none transition-colors duration-200 group/table",
                                    isDragging ? "z-50 cursor-grabbing border-muted-foreground shadow-xl scale-[1.02]" : "cursor-grab hover:border-muted-foreground/30",
                                    collidingTableId === table.id && "border-destructive bg-destructive/5"
                                )}
                                style={{
                                    transform: `translate3d(${table.x}px, ${table.y}px, 0)`,
                                    width: table.width,
                                    height: table.height,
                                    willChange: isDragging || activeResize?.id === table.id ? 'transform, width, height' : 'auto',
                                    borderColor: collidingTableId === table.id ? undefined : isDragging ? undefined : 'rgba(var(--border), 0.5)'
                                }}
                            >
                                {/* Resize Handles */}
                                {!isDragging && (
                                    <>
                                        <div 
                                            className="absolute -top-1.5 -left-1.5 w-5 h-5 cursor-nw-resize z-50" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'nw')}
                                        />
                                        <div 
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 cursor-ne-resize z-50" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'ne')}
                                        />
                                        <div 
                                            className="absolute -bottom-1.5 -left-1.5 w-5 h-5 cursor-sw-resize z-50" 
                                            onMouseDown={(e) => handleResizeStart(e, table, 'sw')}
                                        />
                                        <div 
                                            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-se-resize z-50" 
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

                                {/* Edit Properties Button */}
                                {!isDragging && (
                                    <div className="absolute bottom-1 left-1 opacity-0 group-hover/table:opacity-100 transition-opacity z-30">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 rounded-md hover:bg-muted"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={() => onOpenEdit(table)}
                                        >
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Status Indicator Badge */}
                                {table.status && statusConfig[table.status as TableStatus] && (
                                    <Badge 
                                        variant={statusConfig[table.status as TableStatus].variant}
                                        size="xs"
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

            {/* Zoom HUD - Abajo a la derecha */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 p-1 bg-background border rounded-xl z-40">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                
                <div className="px-2 min-w-[50px] text-center">
                    <TextXS className="font-bold tabular-nums">{Math.round(zoom * 100)}%</TextXS>
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
