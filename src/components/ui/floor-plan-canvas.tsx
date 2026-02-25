'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Maximize, CheckSquare, Users, Clock, AlertTriangle, XSquare, Settings, Copy, Trash2, Armchair } from 'lucide-react';
import { type Table, type Environment, type TableStatus } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextSM } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

        if (table.chairs?.top?.length) { bounds.y -= padding; bounds.h += padding; }
        if (table.chairs?.bottom?.length) { bounds.h += padding; }
        if (table.chairs?.left?.length) { bounds.x -= padding; bounds.w += padding; }
        if (table.chairs?.right?.length) { bounds.w += padding; }
        
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
        // Añadimos un pequeño margen de seguridad de 20px
        return { w: maxX + 20, h: maxY + 20 };
    }, [activeEnv.tables, getTableBounds]);

    const handleMouseDown = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        
        // Siempre seleccionamos al hacer click
        setSelectedTableId(table.id);

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
                // Proportional resize for round tables
                const absX = Math.abs(deltaX);
                const absY = Math.abs(deltaY);
                const useDelta = absX > absY ? deltaX : deltaY;
                
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
    }, [activeDrag, activeResize, activeRotate, zoom, activeEnv.tables, onUpdateTable, getTableBounds]);

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
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        activeEnv.tables.forEach(table => {
            const bounds = getTableBounds(table);
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.w);
            maxY = Math.max(maxY, bounds.y + bounds.h);
        });

        // Añadir un margen alrededor del contenido
        const padding = 80;
        const contentWidth = (maxX - minX) + padding * 2;
        const contentHeight = (maxY - minY) + padding * 2;

        const zoomX = containerWidth / contentWidth;
        const zoomY = containerHeight / contentHeight;
        
        let newZoom = Math.min(zoomX, zoomY);
        // Redondear al múltiplo de 0.1 (10%) más cercano
        newZoom = Math.round(newZoom * 10) / 10;
        // Limitar el zoom entre 0.2 y 1.5 para que no se vea excesivamente grande o pequeño
        newZoom = Math.min(Math.max(newZoom, 0.2), 1.5);

        setZoom(newZoom);

        // Centrar el scroll después de aplicar el zoom
        setTimeout(() => {
            if (containerRef.current) {
                const centerX = ((minX + maxX) / 2) * newZoom;
                const centerY = ((minY + maxY) / 2) * newZoom;
                
                containerRef.current.scrollTo({
                    left: centerX - containerWidth / 2,
                    top: centerY - containerHeight / 2,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    return (
        <Card className="flex-none h-[600px] w-full border-none shadow-2xl relative overflow-hidden group/canvas ring-1 ring-border/50 bg-white/50 dark:bg-black/50">
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
                        width: (contentBounds.w * zoom) > containerSize.width ? contentBounds.w * zoom : '100%', 
                        height: (contentBounds.h * zoom) > containerSize.height ? contentBounds.h * zoom : '100%',
                        minWidth: '100%',
                        minHeight: '100%',
                        position: 'relative'
                    }}
                >
                    <div 
                        className="origin-top-left transition-transform duration-200 ease-out preserve-3d will-change-transform"
                        style={{ 
                            transform: `scale(${zoom})`,
                            width: contentBounds.w,
                            height: contentBounds.h
                        }}
                    >
                        {activeEnv.tables.map(table => {
                            const isDragging = activeDrag?.id === table.id;
                            
                            const renderChairs = () => {
                                const chairs: React.ReactNode[] = [];
                                const CHAIR_SIZE = 26;
                                const CHAIR_OFFSET = 6;
                                const CHAIR_SPACING = 48;
                                const isEditing = editingChairsId === table.id;

                                const toggleChair = (side: 'top' | 'bottom' | 'left' | 'right' | 'round', index: number) => {
                                    const currentChairs = table.chairs || { top: [], bottom: [], left: [], right: [], round: [] };
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

                                 const renderRoundChairs = () => {
                                    if (table.shape !== 'round') return;
                                    const rx = table.width / 2;
                                    const ry = table.height / 2;
                                    const circumference = Math.PI * (rx + ry);
                                    const ROUND_CHAIR_SPACING = 56;
                                    const maxChairs = Math.floor(circumference / ROUND_CHAIR_SPACING);
                                    const activeIndices = table.chairs?.round || [];

                                    for (let i = 0; i < maxChairs; i++) {
                                        const isActive = activeIndices.includes(i);
                                        if (!isActive && !isEditing) continue;

                                        const t = (i / maxChairs) * 2 * Math.PI - Math.PI / 2;
                                        const x = rx + (rx + CHAIR_OFFSET + CHAIR_SIZE / 2) * Math.cos(t) - CHAIR_SIZE / 2;
                                        const y = ry + (ry + CHAIR_OFFSET + CHAIR_SIZE / 2) * Math.sin(t) - CHAIR_SIZE / 2;

                                        // Normal angle of ellipse
                                        const alpha = Math.atan2(rx * Math.sin(t), ry * Math.cos(t));
                                        const rotation = (alpha * 180 / Math.PI) + 90;

                                        chairs.push(
                                            <div 
                                                key={`round-${i}`}
                                                onClick={(e) => {
                                                    if (isEditing) {
                                                        e.stopPropagation();
                                                        toggleChair('round', i);
                                                    }
                                                }}
                                                className={cn(
                                                    "absolute w-[26px] h-[26px] flex items-center justify-center transition-all duration-200 rounded-t-lg",
                                                    isActive 
                                                        ? "bg-muted-foreground/30 border border-border/50 shadow-sm" 
                                                        : "bg-transparent border border-dashed border-muted-foreground/30 hover:bg-muted-foreground/10",
                                                    isEditing && "cursor-pointer scale-110 z-50",
                                                    isEditing && !isActive && "opacity-50 hover:opacity-100"
                                                )}
                                                style={{ 
                                                    left: x, 
                                                    top: y, 
                                                    width: CHAIR_SIZE, 
                                                    height: CHAIR_SIZE,
                                                    transform: `rotate(${rotation}deg)`
                                                }}
                                            />
                                        );
                                    }
                                };

                                if (table.shape === 'round') {
                                    renderRoundChairs();
                                } else {
                                    renderSide('top');
                                    renderSide('bottom');
                                    renderSide('left');
                                    renderSide('right');
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
                                        table.isObject 
                                            ? "bg-muted" 
                                            : "bg-background border-border",
                                        table.shape === 'round' 
                                            ? "rounded-full" 
                                            : (table.isObject ? "rounded-none" : "rounded-xl"),
                                        selectedTableId === table.id && !isDragging ? "ring-1 ring-primary z-40 cursor-grab" : "z-30 cursor-pointer",
                                        isDragging ? "z-50 cursor-grabbing shadow-xl ring-1 ring-primary" : "",
                                        
                                    )}
                                    style={{
                                        transform: `translate3d(${table.x}px, ${table.y}px, 0) rotate(${table.rotation || 0}deg)`,
                                        width: table.width,
                                        height: table.height,
                                        willChange: isDragging || activeResize?.id === table.id || activeRotate?.id === table.id ? 'transform, width, height' : 'auto',
                                    }}
                                >
                                    {/* Chairs - Only for tables */}
                                    {!table.isObject && renderChairs()}

                                     {/* Interaction Handles - Only visible when selected */}
                                    {selectedTableId === table.id && !isDragging && (table.shape !== 'round' || table.isObject) && (
                                        <>
                                            {/* Resize Pins */}
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
 
                                            {/* Rotation Handles (Outer Corners) */}
                                            <div 
                                                className="absolute -top-7 -left-7 w-6 h-6 flex items-center justify-center cursor-crosshair z-50"
                                                onMouseDown={(e) => handleRotateStart(e, table)}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            </div>
                                            <div 
                                                className="absolute -top-7 -right-7 w-6 h-6 flex items-center justify-center cursor-crosshair z-50"
                                                onMouseDown={(e) => handleRotateStart(e, table)}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            </div>
                                            <div 
                                                className="absolute -bottom-7 -left-7 w-6 h-6 flex items-center justify-center cursor-crosshair z-50"
                                                onMouseDown={(e) => handleRotateStart(e, table)}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            </div>
                                            <div 
                                                className="absolute -bottom-7 -right-7 w-6 h-6 flex items-center justify-center cursor-crosshair z-50"
                                                onMouseDown={(e) => handleRotateStart(e, table)}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            </div>
                                        </>
                                    )}

                                    {/* Interaction Handles for Round Tables (Only Resize - Positioned on the circle border) */}
                                    {selectedTableId === table.id && !isDragging && table.shape === 'round' && (
                                        <>
                                            <div 
                                                className="absolute w-5 h-5 cursor-nw-resize z-50 flex items-center justify-center group/handle" 
                                                style={{ top: '14.6%', left: '14.6%', transform: 'translate(-50%, -50%)' }}
                                                onMouseDown={(e) => handleResizeStart(e, table, 'nw')}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                                            </div>
                                            <div 
                                                className="absolute w-5 h-5 cursor-ne-resize z-50 flex items-center justify-center group/handle" 
                                                style={{ top: '14.6%', right: '14.6%', transform: 'translate(50%, -50%)' }}
                                                onMouseDown={(e) => handleResizeStart(e, table, 'ne')}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                                            </div>
                                            <div 
                                                className="absolute w-5 h-5 cursor-sw-resize z-50 flex items-center justify-center group/handle" 
                                                style={{ bottom: '14.6%', left: '14.6%', transform: 'translate(-50%, 50%)' }}
                                                onMouseDown={(e) => handleResizeStart(e, table, 'sw')}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                                            </div>
                                            <div 
                                                className="absolute w-5 h-5 cursor-se-resize z-50 flex items-center justify-center group/handle" 
                                                style={{ bottom: '14.6%', right: '14.6%', transform: 'translate(50%, 50%)' }}
                                                onMouseDown={(e) => handleResizeStart(e, table, 'se')}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                                            </div>
                                        </>
                                    )}

                                    {!table.isObject && (
                                        <div 
                                            className="flex flex-col items-center justify-center gap-1 z-10"
                                            style={{ transform: `rotate(${-(table.rotation || 0)}deg)` }}
                                        >
                                            <span className={cn(
                                                "font-medium text-lg transition-all duration-200",
                                                isDragging ? "text-muted-foreground" : "text-foreground"
                                            )}>
                                                {table.number}
                                            </span>

                                            {/* Status Indicator Badge */}
                                            {table.status && statusConfig[table.status as TableStatus] && (
                                                <Badge 
                                                    variant={statusConfig[table.status as TableStatus].variant}
                                                    size="sm"
                                                    className="transition-transform duration-200"
                                                    startIcon={React.createElement(statusConfig[table.status as TableStatus].icon)}
                                                />
                                            )}
                                        </div>
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
                                    <TextSM>{table.isObject ? (table.objectType || 'Objeto') : `Mesa ${table.number}`}</TextSM>
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
                                
                                {!table.isObject && (
                                    <>
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
                                    </>
                                )}

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
                    className="h-10 w-10 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(prev => Math.max(0.2, Math.round((prev - 0.1) * 10) / 10))}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                
                <div className="px-2 min-w-[50px] text-center">
                    <TextSM className="font-bold tabular-nums">{Math.round(zoom * 100)}%</TextSM>
                </div>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 rounded-xl p-0 hover:bg-muted" 
                    onClick={() => setZoom(prev => Math.min(2, Math.round((prev + 0.1) * 10) / 10))}
                >
                    <Plus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1" />

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 rounded-xl p-0 hover:bg-muted" 
                    onClick={handleFitContent}
                    title="Ajustar zoom al contenido"
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
