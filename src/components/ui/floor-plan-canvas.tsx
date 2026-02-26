'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Maximize, CheckSquare, Users, Clock, AlertTriangle, XSquare, Settings, Copy, Trash2, Armchair, RotateCw, MoveDiagonal2 } from 'lucide-react';
import { type Table, type Environment, type TableStatus } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextSM } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

type RotateItem = {
    id: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
};

export function FloorPlanCanvas({ 
    activeEnv, 
    onUpdateTable, 
    onRemoveTable, 
    onOpenEdit,
    onOpenQR,
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
    const [activeRotate, setActiveRotate] = React.useState<RotateItem | null>(null);
    const [selectedTableId, setSelectedTableId] = React.useState<number | null>(null);
    const [interactionMode, setInteractionMode] = React.useState<'resize' | 'rotate' | null>(null);
    const [collidingTableId, setCollidingTableId] = React.useState<number | null>(null);
    const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const getTableBounds = (table: Table, customPos?: { x: number, y: number, w: number, h: number }) => {
        const CHAIR_SIZE = 26;
        const CHAIR_OFFSET = 6;
        const padding = CHAIR_SIZE + CHAIR_OFFSET;
        
        const x = customPos?.x ?? table.x;
        const y = customPos?.y ?? table.y;
        const w = customPos?.w ?? table.width;
        const h = customPos?.h ?? table.height;

        let bounds = { x, y, w, h };

        if (table.shape === 'round') {
            if (table.chairs?.round?.length) {
                bounds.x -= padding;
                bounds.y -= padding;
                bounds.w += padding * 2;
                bounds.h += padding * 2;
            }
        } else {
            if (table.chairs?.top?.length) { bounds.y -= padding; bounds.h += padding; }
            if (table.chairs?.bottom?.length) { bounds.h += padding; }
            if (table.chairs?.left?.length) { bounds.x -= padding; bounds.w += padding; }
            if (table.chairs?.right?.length) { bounds.w += padding; }
        }
        
        return bounds;
    };

    const isColliding = (rect1: { x: number, y: number, w: number, h: number }, rect2: { x: number, y: number, w: number, h: number }) => {
        return !(rect1.x + rect1.w < rect2.x || 
                 rect1.x > rect2.x + rect2.w || 
                 rect1.y + rect1.h < rect2.y || 
                 rect1.y > rect2.y + rect2.h);
    };

    const contentBounds = React.useMemo(() => {
        if (activeEnv.tables.length === 0) return { w: 0, h: 0 };
        let maxX = 0, maxY = 0;
        activeEnv.tables.forEach(table => {
            const bounds = getTableBounds(table);
            maxX = Math.max(maxX, bounds.x + bounds.w);
            maxY = Math.max(maxY, bounds.y + bounds.h);
        });
        return { w: maxX + 20, h: maxY + 20 };
    }, [activeEnv.tables]);

    const handleMouseDown = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        
        if (selectedTableId !== table.id) {
            setSelectedTableId(table.id);
            setInteractionMode(null);
        }

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

    const handleRotateStart = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = table.x + table.width / 2;
        const centerY = table.y + table.height / 2;
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;
        setActiveRotate({
            id: table.id,
            centerX,
            centerY,
            startAngle: Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI),
            startRotation: table.rotation || 0
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
                const table1Bounds = getTableBounds(currentTable, { x: nextX, y: nextY, w: currentTable.width, h: currentTable.height });
                const table2Bounds = getTableBounds(t);
                return isColliding(table1Bounds, table2Bounds);
            });
            setCollidingTableId(hasCollision ? activeDrag.id : null);
            onUpdateTable(activeDrag.id, { x: nextX, y: nextY });
        }

        if (activeResize) {
            const currentTable = activeEnv.tables.find(t => t.id === activeResize.id);
            const isRound = currentTable?.shape === 'round';
            const deltaX = Math.round((mouseX - activeResize.startX) / 10) * 10;
            const deltaY = Math.round((mouseY - activeResize.startY) / 10) * 10;
            let nextX = activeResize.startXPos;
            let nextY = activeResize.startYPos;
            let nextW = activeResize.startWidth;
            let nextH = activeResize.startHeight;
            const MIN_SIZE = 40;

            if (isRound) {
                const absX = Math.abs(deltaX);
                const absY = Math.abs(deltaY);
                let finalDelta = 0;
                if (activeResize.corner === 'se') finalDelta = (absX > absY ? deltaX : deltaY);
                else if (activeResize.corner === 'nw') finalDelta = -(absX > absY ? deltaX : deltaY);
                else if (activeResize.corner === 'ne') finalDelta = (absX > absY ? deltaX : -deltaY);
                else if (activeResize.corner === 'sw') finalDelta = (absX > absY ? -deltaX : deltaY);

                const newSize = Math.max(MIN_SIZE, activeResize.startWidth + finalDelta);
                nextW = newSize;
                nextH = newSize;
                if (activeResize.corner.includes('w')) nextX = activeResize.startXPos + (activeResize.startWidth - newSize);
                if (activeResize.corner.includes('n')) nextY = activeResize.startYPos + (activeResize.startHeight - newSize);
            } else {
                if (activeResize.corner.includes('e')) nextW = Math.max(MIN_SIZE, activeResize.startWidth + deltaX);
                if (activeResize.corner.includes('w')) {
                    const possibleW = activeResize.startWidth - deltaX;
                    if (possibleW >= MIN_SIZE) { nextW = possibleW; nextX = activeResize.startXPos + deltaX; }
                }
                if (activeResize.corner.includes('s')) nextH = Math.max(MIN_SIZE, activeResize.startHeight + deltaY);
                if (activeResize.corner.includes('n')) {
                    const possibleH = activeResize.startHeight - deltaY;
                    if (possibleH >= MIN_SIZE) { nextH = possibleH; nextY = activeResize.startYPos + deltaY; }
                }
            }
            onUpdateTable(activeResize.id, { x: nextX, y: nextY, width: nextW, height: nextH });
        }

        if (activeRotate) {
            const dx = mouseX - activeRotate.centerX;
            const dy = mouseY - activeRotate.centerY;
            const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            const deltaAngle = currentAngle - activeRotate.startAngle;
            let nextRotation = (activeRotate.startRotation + deltaAngle) % 360;
            if (!e.shiftKey) nextRotation = Math.round(nextRotation / 15) * 15;
            onUpdateTable(activeRotate.id, { rotation: nextRotation });
        }
    }, [activeDrag, activeResize, activeRotate, zoom, activeEnv.tables, onUpdateTable]);

    const handleMouseUp = React.useCallback(() => {
        setActiveDrag(null);
        setActiveResize(null);
        setActiveRotate(null);
        setCollidingTableId(null);
    }, []);

    React.useEffect(() => {
        if (activeDrag || activeResize || activeRotate) {
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
    }, [activeDrag, activeResize, activeRotate, handleMouseMove, handleMouseUp]);

    const handleFitContent = () => {
        if (!containerRef.current || activeEnv.tables.length === 0) {
            setZoom(1);
            return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        activeEnv.tables.forEach(table => {
            const bounds = getTableBounds(table);
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.w);
            maxY = Math.max(maxY, bounds.y + bounds.h);
        });
        const padding = 80;
        const contentWidth = (maxX - minX) + padding * 2;
        const contentHeight = (maxY - minY) + padding * 2;
        const zoomX = rect.width / contentWidth;
        const zoomY = rect.height / contentHeight;
        let newZoom = Math.min(Math.max(Math.round(Math.min(zoomX, zoomY) * 10) / 10, 0.2), 1.5);
        setZoom(newZoom);
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTo({
                    left: ((minX + maxX) / 2) * newZoom - rect.width / 2,
                    top: ((minY + maxY) / 2) * newZoom - rect.height / 2,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    return (
        <Card className="flex-none h-[600px] w-full border-none relative overflow-hidden group/canvas ring-1 ring-border/50 bg-white/50 dark:bg-black/50">
            <div 
                className="absolute inset-0 select-none text-zinc-400 dark:text-zinc-600"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                    opacity: 0.2
                }}
            />
            <div 
                ref={containerRef}
                className="relative h-full w-full overflow-auto custom-scrollbar"
                onClick={() => { setSelectedTableId(null); setInteractionMode(null); }}
            >
                <div style={{ 
                    width: Math.max(contentBounds.w * zoom, containerSize.width),
                    height: Math.max(contentBounds.h * zoom, containerSize.height),
                    position: 'relative'
                }}>
                    <div 
                        className="origin-top-left transition-transform duration-200 ease-out preserve-3d"
                        style={{ transform: `scale(${zoom})`, width: contentBounds.w, height: contentBounds.h }}
                    >
                        {activeEnv.tables.map(table => {
                            const isDragging = activeDrag?.id === table.id;
                            const isSelected = selectedTableId === table.id;
                            
                            const renderChairs = () => {
                                const chairs: React.ReactNode[] = [];
                                const CHAIR_SIZE = 26;
                                const CHAIR_OFFSET = 6;
                                const CHAIR_SPACING = 48;
                                const isEditing = editingChairsId === table.id;

                                const toggleChair = (side: any, index: number) => {
                                    const currentChairs = table.chairs || { top: [], bottom: [], left: [], right: [], round: [] };
                                    const sideIndices = [...(currentChairs[side] || [])];
                                    const exists = sideIndices.indexOf(index);
                                    if (exists > -1) sideIndices.splice(exists, 1);
                                    else sideIndices.push(index);
                                    onUpdateTable(table.id, { chairs: { ...currentChairs, [side]: sideIndices } });
                                };

                                if (table.shape === 'round') {
                                    const rx = table.width / 2, ry = table.height / 2;
                                    const circumference = Math.PI * (rx + ry);
                                    const maxChairs = Math.floor(circumference / 56);
                                    const activeIndices = table.chairs?.round || [];
                                    for (let i = 0; i < maxChairs; i++) {
                                        const isActive = activeIndices.includes(i);
                                        if (!isActive && !isEditing) continue;
                                        const t = (i / maxChairs) * 2 * Math.PI - Math.PI / 2;
                                        const x = rx + (rx + CHAIR_OFFSET + CHAIR_SIZE / 2) * Math.cos(t) - CHAIR_SIZE / 2;
                                        const y = ry + (ry + CHAIR_OFFSET + CHAIR_SIZE / 2) * Math.sin(t) - CHAIR_SIZE / 2;
                                        const alpha = Math.atan2(rx * Math.sin(t), ry * Math.cos(t));
                                        chairs.push(<div key={`round-${i}`} onClick={(e) => { if (isEditing) { e.stopPropagation(); toggleChair('round', i); } }} className={cn("absolute w-[26px] h-[26px] flex items-center justify-center transition-all duration-200 rounded-t-lg", isActive ? "bg-muted-foreground/30 border border-border/50 shadow-sm" : "bg-transparent border border-dashed border-muted-foreground/30 hover:bg-muted-foreground/10", isEditing && "cursor-pointer scale-110 z-50", isEditing && !isActive && "opacity-50 hover:opacity-100")} style={{ left: x, top: y, transform: `rotate(${(alpha * 180 / Math.PI) + 90}deg)` }} />);
                                    }
                                } else {
                                    ['top', 'bottom', 'left', 'right'].forEach((side: any) => {
                                        const isVertical = side === 'left' || side === 'right';
                                        const dim = isVertical ? table.height : table.width;
                                        const maxChairs = Math.floor(dim / CHAIR_SPACING);
                                        const activeIndices = table.chairs?.[side] || [];
                                        const startPos = (dim - (Math.max(0, maxChairs - 1)) * CHAIR_SPACING) / 2;
                                        for (let i = 0; i < maxChairs; i++) {
                                            const isActive = activeIndices.includes(i);
                                            if (!isActive && !isEditing) continue;
                                            const pos = startPos + i * CHAIR_SPACING - CHAIR_SIZE / 2;
                                            const style: any = {};
                                            if (side === 'top') { style.top = -(CHAIR_SIZE + CHAIR_OFFSET); style.left = pos; }
                                            if (side === 'bottom') { style.bottom = -(CHAIR_SIZE + CHAIR_OFFSET); style.left = pos; }
                                            if (side === 'left') { style.left = -(CHAIR_SIZE + CHAIR_OFFSET); style.top = pos; }
                                            if (side === 'right') { style.right = -(CHAIR_SIZE + CHAIR_OFFSET); style.top = pos; }
                                            chairs.push(<div key={`${side}-${i}`} onClick={(e) => { if (isEditing) { e.stopPropagation(); toggleChair(side, i); } }} className={cn("absolute w-[26px] h-[26px] flex items-center justify-center transition-all duration-200", isActive ? "bg-muted-foreground/30 border border-border/50 shadow-sm" : "bg-transparent border border-dashed border-muted-foreground/30 hover:bg-muted-foreground/10", side === 'top' && "rounded-t-lg", side === 'bottom' && "rounded-b-lg", side === 'left' && "rounded-l-lg", side === 'right' && "rounded-r-lg", isEditing && "cursor-pointer scale-110 z-50", isEditing && !isActive && "opacity-50 hover:opacity-100")} style={style} />);
                                        }
                                    });
                                }
                                return chairs;
                            };

                            return (
                                <div
                                    key={table.id}
                                    onMouseDown={(e) => handleMouseDown(e, table)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "absolute top-0 left-0 flex items-center justify-center border select-none group/table transition-colors duration-200",
                                        table.isObject ? "bg-muted" : "bg-background border-border",
                                        table.shape === 'round' ? "rounded-full" : (table.isObject ? "rounded-none" : "rounded-xl"),
                                        isSelected && !isDragging ? "ring-1 ring-primary z-40 cursor-grab" : "z-30 cursor-pointer",
                                        isDragging ? "z-50 cursor-grabbing shadow-xl ring-1 ring-primary" : "",
                                    )}
                                    style={{
                                        transform: `translate3d(${table.x}px, ${table.y}px, 0) rotate(${table.rotation || 0}deg)`,
                                        width: table.width, height: table.height,
                                    }}
                                >
                                    {!table.isObject && renderChairs()}

                                    {isSelected && !isDragging && interactionMode === 'resize' && (
                                        <>
                                            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 cursor-nw-resize z-50 bg-primary/20 rounded-full border border-primary/50" onMouseDown={(e) => handleResizeStart(e, table, 'nw')} />
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 cursor-ne-resize z-50 bg-primary/20 rounded-full border border-primary/50" onMouseDown={(e) => handleResizeStart(e, table, 'ne')} />
                                            <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 cursor-sw-resize z-50 bg-primary/20 rounded-full border border-primary/50" onMouseDown={(e) => handleResizeStart(e, table, 'sw')} />
                                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-se-resize z-50 bg-primary/20 rounded-full border border-primary/50" onMouseDown={(e) => handleResizeStart(e, table, 'se')} />
                                        </>
                                    )}

                                    {isSelected && !isDragging && interactionMode === 'rotate' && (
                                        <>
                                            <div className="absolute -top-7 -left-7 w-8 h-8 flex items-center justify-center cursor-crosshair z-50 group/rotate" onMouseDown={(e) => handleRotateStart(e, table)}><div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" /></div>
                                            <div className="absolute -top-7 -right-7 w-8 h-8 flex items-center justify-center cursor-crosshair z-50 group/rotate" onMouseDown={(e) => handleRotateStart(e, table)}><div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" /></div>
                                            <div className="absolute -bottom-7 -left-7 w-8 h-8 flex items-center justify-center cursor-crosshair z-50 group/rotate" onMouseDown={(e) => handleRotateStart(e, table)}><div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" /></div>
                                            <div className="absolute -bottom-7 -right-7 w-8 h-8 flex items-center justify-center cursor-crosshair z-50 group/rotate" onMouseDown={(e) => handleRotateStart(e, table)}><div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" /></div>
                                        </>
                                    )}

                                    {!table.isObject && (
                                        <div className="flex flex-col items-center justify-center gap-1 z-10" style={{ transform: `rotate(${-(table.rotation || 0)}deg)` }}>
                                            <span className={cn("font-medium text-lg", isDragging ? "text-muted-foreground" : "text-foreground")}>{table.number}</span>
                                            {table.status && statusConfig[table.status as TableStatus] && (
                                                <Badge variant={statusConfig[table.status as TableStatus].variant} size="sm" startIcon={React.createElement(statusConfig[table.status as TableStatus].icon)} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedTableId && (
                <div className="absolute top-6 right-6 flex items-center gap-1 p-1 bg-background border rounded-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
                    <TooltipProvider delayDuration={0}>
                        <div className="px-3 h-10 flex items-center">
                            {(() => {
                                const table = activeEnv.tables.find(t => t.id === selectedTableId);
                                return <TextSM>{table?.isObject ? (table.objectType || 'Objeto') : `Mesa ${table?.number}`}</TextSM>;
                            })()}
                        </div>
                        <Separator orientation="vertical" className="h-5 mx-1" />
                        {(() => {
                            const table = activeEnv.tables.find(t => t.id === selectedTableId);
                            if (!table) return null;
                            return (
                                <div className="flex items-center gap-1">
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button variant={interactionMode === 'resize' ? "secondary" : "ghost"} size="md" onClick={() => setInteractionMode(prev => prev === 'resize' ? null : 'resize')}><MoveDiagonal2 className="h-4 w-4" /></Button>
                                    </TooltipTrigger><TooltipContent>Estirar / Contraer</TooltipContent></Tooltip>
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button variant={interactionMode === 'rotate' ? "secondary" : "ghost"} size="md" onClick={() => setInteractionMode(prev => prev === 'rotate' ? null : 'rotate')}><RotateCw className="h-4 w-4" /></Button>
                                    </TooltipTrigger><TooltipContent>Rotar</TooltipContent></Tooltip>
                                    <Separator orientation="vertical" className="h-5 mx-1" />
                                    {!table.isObject && (
                                        <><Tooltip><TooltipTrigger asChild>
                                            <Button variant={editingChairsId === table.id ? "secondary" : "ghost"} size="md" onClick={() => onEditChairs(table)}><Armchair  /></Button>
                                        </TooltipTrigger><TooltipContent>Sillas</TooltipContent></Tooltip>
                                        <Tooltip><TooltipTrigger asChild>
                                            <Button variant="ghost" size="md" onClick={() => onOpenEdit(table)}><Settings  /></Button>
                                        </TooltipTrigger><TooltipContent>Configuración</TooltipContent></Tooltip></>
                                    )}
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button variant="ghost" size="md" onClick={() => onDuplicateTable(table)}><Copy /></Button>
                                    </TooltipTrigger><TooltipContent>Duplicar</TooltipContent></Tooltip>
                                    <Separator orientation="vertical" className="h-5 mx-1" />
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button variant="ghost" size="md" onClick={() => { onRemoveTable(table.id); setSelectedTableId(null); }}><Trash2 className="h-4 w-4" /></Button>
                                    </TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
                                </div>
                            );
                        })()}
                    </TooltipProvider>
                </div>
            )}

            <div className="absolute bottom-6 right-6 flex items-center gap-1 p-1 bg-background border rounded-xl z-40 shadow-sm">
                <Button variant="ghost" size="md" onClick={() => setZoom(prev => Math.max(0.2, Math.round((prev - 0.1) * 10) / 10))}><Minus className="h-4 w-4" /></Button>
                <div className="px-2 min-w-[50px] text-center"><TextSM className="font-bold tabular-nums">{Math.round(zoom * 100)}%</TextSM></div>
                <Button variant="ghost" size="md" onClick={() => setZoom(prev => Math.min(2, Math.round((prev + 0.1) * 10) / 10))}><Plus className="h-4 w-4" /></Button>
                <Separator orientation="verticmd" />
                <Button variant="ghost" size="md" onClick={handleFitContent} title="Ajustar zoom"><Maximize className="h-4 w-4" /></Button>
            </div>
        </Card>
    );
}
