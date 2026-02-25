'use client';

import * as React from 'react';
import { 
    PlusCircle, Trash, Users, CheckSquare, 
    Clock, AlertTriangle, XSquare, FolderOpen, LayoutGrid, Power,
    ChevronLeft, ChevronRight, Utensils, Sun, Beer, Wine, Coffee, Building,
    Square, Circle, MoreHorizontal
} from 'lucide-react';

// UI Components
import { TextXS, TextSM } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Layout Components
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { initialEnvironments, type Table, type TableStatus, type Environment } from '@/data/environments';
import { FloorPlanCanvas } from '../../components/ui/floor-plan-canvas';
import { QuickTemplatesDialog } from '@/components/dialogs/planomesas-templates-dialog';
import { EditTableDialog } from '@/components/dialogs/planomesas-config-dialog';
import { QRConfigDialog } from '@/components/dialogs/planomesas-qr-dialog';

// Mapeo de iconos para una renderización dinámica.
const iconMap: { [key: string]: React.ElementType } = {
    Utensils,
    Wine,
    Coffee,
    Beer,
    Sun,
    Building,
    Users,
    PlusCircle,
    CheckSquare,
    Clock,
    AlertTriangle,
    XSquare
};


// --- Constants & Helpers ---
const CHAIR_SPACING = 48;

const generateAllChairs = (width: number, height: number, shape: 'rectangle' | 'round' = 'rectangle') => {
    if (shape === 'round') {
        const radius = Math.min(width, height) / 2;
        const circumference = 2 * Math.PI * radius;
        const maxChairs = Math.floor(circumference / CHAIR_SPACING);
        return {
            top: [], bottom: [], left: [], right: [],
            round: Array.from({ length: maxChairs }, (_, i) => i)
        };
    }
    const getIndices = (dim: number) => Array.from({ length: Math.floor(dim / CHAIR_SPACING) }, (_, i) => i);
    return {
        top: getIndices(width),
        bottom: getIndices(width),
        left: getIndices(height),
        right: getIndices(height),
    };
};



// --- Main Page Component ---

export default function PlanoMesasPage() {
    const { toast } = useToast();
    const [environments, setEnvironments] = React.useState<Environment[]>(initialEnvironments);
    const [activeEnvId, setActiveEnvId] = React.useState<string>(initialEnvironments[0]?.id || '');


    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = React.useState(false);
    const [showRightArrow, setShowRightArrow] = React.useState(false);

    const checkScroll = React.useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [checkScroll, environments]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    const [editingTable, setEditingTable] = React.useState<Table | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = React.useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);
    const [editingChairsId, setEditingChairsId] = React.useState<number | null>(null);

    const activeEnv = environments.find(e => e.id === activeEnvId);

    const updateTable = (tableId: number, updates: Partial<Table>) => {
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: env.tables.map(t => t.id === tableId ? { ...t, ...updates } : t) }
            : env
        ));
    };

    const removeTable = (tableId: number) => {
        const table = activeEnv?.tables.find(t => t.id === tableId);
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: env.tables.filter(t => t.id !== tableId) }
            : env
        ));
        toast({ 
            title: "Mesa Eliminada", 
            description: `Se ha eliminado la mesa ${table?.number || ''} correctamente.`,
            variant: "destructive"
        });
    };

    const addTable = (shape: 'rectangle' | 'round' = 'rectangle') => {
        if (!activeEnv) return;
        const newId = Date.now();
        const width = shape === 'round' ? 90 : 100;
        const height = shape === 'round' ? 90 : 80;
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: [...env.tables, { 
                id: newId, 
                number: env.tables.length + 1, 
                x: 20, 
                y: 20, 
                width, 
                height, 
                capacity: shape === 'round' ? 4 : 4, 
                status: 'Libre',
                shape,
                chairs: generateAllChairs(width, height, shape)
            }] }
            : env
        ));
        toast({ 
            title: "Mesa Añadida", 
            description: `Se ha añadido una mesa ${shape === 'round' ? 'circular' : 'rectangular'} correctamente.` 
        });
    };

    const duplicateTable = (table: Table) => {
        if (!activeEnv) return;
        
        const newId = Date.now() + Math.floor(Math.random() * 1000);
        const maxNumber = activeEnv.tables.reduce((max, t) => Math.max(max, t.number), 0);
        
        const newTable: Table = {
            ...table,
            id: newId,
            number: maxNumber + 1,
            x: table.x + 20,
            y: table.y + 20
        };
        
        setEnvironments(prev => {
            return prev.map(env => 
                env.id === activeEnvId 
                    ? { ...env, tables: [...env.tables, newTable] }
                    : env
            );
        });

        toast({ 
            title: "Mesa Duplicada", 
            description: `Se ha creado una copia de la Mesa ${table.number} como Mesa ${newTable.number}` 
        });
    };

    const editChairs = (table: Table) => {
        setEditingChairsId(table.id === editingChairsId ? null : table.id);
    };

    const applyTemplate = (template: { id: string, name: string, tables: number }) => {
        if (!activeEnvId) return;
        
        const newTables: Table[] = [];
        const cols = Math.ceil(Math.sqrt(template.tables));
        const spacing = 150;
        
        for (let i = 0; i < template.tables; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const width = 100;
            const height = 80;
            newTables.push({
                id: Date.now() + i,
                number: i + 1,
                x: 50 + col * spacing,
                y: 50 + row * spacing,
                width,
                height,
                capacity: 4,
                status: 'Libre' as TableStatus,
                chairs: generateAllChairs(width, height)
            });
        }
        
        setEnvironments(prev => prev.map(env => 
            env.id === activeEnvId ? { ...env, tables: newTables } : env
        ));
        
        setIsTemplatesOpen(false);
        toast({ title: 'Plantilla aplicada', description: `Se han creado ${template.tables} mesas.` });
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Plano de Mesas" 
                subtitle="Diseña y organiza la disposición de tu salón"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="md" onClick={() => setIsTemplatesOpen(true)} startIcon={<FolderOpen />}>
                            Plantillas
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="md" startIcon={<PlusCircle />}>
                                    Añadir Mesa
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => addTable('rectangle')}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Mesa Rectangular
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addTable('round')}>
                                    <Circle className="mr-2 h-4 w-4" />
                                    Mesa Circular
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            <PageContent>
                <div className="flex flex-col gap-6 h-full min-h-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                        <div className="flex items-center gap-1">
                            <div className="relative flex items-center group/nav">
                                {showLeftArrow && (
                                    <Button 
                                        variant="ghost" 
                                        size="md" 
                                        onClick={() => scroll('left')}
                                        startIcon={<ChevronLeft />}
                                    />
                                )}

                                <div 
                                    ref={scrollContainerRef}
                                    className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-[60vw]"
                                >
                                    {environments.map(env => {
                                        const Icon = iconMap[env.icon || 'Building'] || Building;
                                        const isActive = activeEnvId === env.id;
                                        const isHex = env.color?.startsWith('#');
                                        return (
                                            <Button 
                                                key={env.id}
                                                variant={isActive ? "secondary" : "ghost"}
                                                size="md"
                                                onClick={() => setActiveEnvId(env.id)}
                                                startIcon={
                                                    <Icon 
                                                        className={cn("h-4 w-4", !isHex && `text-${env.color}`)} 
                                                        style={isHex ? { color: env.color } : undefined}
                                                    />
                                                }
                                            >
                                                {env.name}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {showRightArrow && (
                                    <Button 
                                        variant="ghost" 
                                        size="md" 
                                        onClick={() => scroll('right')}
                                        startIcon={<ChevronRight />}
                                    />
                                )}
                            </div>
                        </div>

                        {activeEnv && (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 pr-6 border-r">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant={activeEnv.status === 'Abierto' ? "ghost-success" : "ghost-destructive"}
                                                    size="md"
                                                    onClick={() => {
                                                        const newStatus = activeEnv.status === 'Abierto' ? 'Cerrado' : 'Abierto';
                                                        setEnvironments(prev => prev.map(e => e.id === activeEnvId ? { ...e, status: newStatus } : e));
                                                    }}
                                                    startIcon={<Power/>}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextSM>Ambiente {activeEnv.status}</TextSM>
                                                <TextXS className="text-muted-foreground">Haz clic para {activeEnv.status === 'Abierto' ? 'cerrar' : 'abrir'}</TextXS>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>


                                </div>
                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" size="md" startIcon={<LayoutGrid />}>
                                                    <span>{activeEnv.tables.length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Total Mesas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="success" size="md" startIcon={<CheckSquare />}>
                                                    <span>{activeEnv.tables.filter(t => t.status === 'Libre').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Libres</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="info" size="md" startIcon={<Users />}>
                                                    <span>{activeEnv.tables.filter(t => t.status === 'Ocupada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Ocupadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="purple" size="md" startIcon={<Clock />}>
                                                    <span>{activeEnv.tables.filter(t => t.status === 'Reservada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Reservadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="warning" size="md" startIcon={<AlertTriangle />}>
                                                    <span>{activeEnv.tables.filter(t => t.status === 'Mantenimiento').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mantenimiento</TextXS>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        )}
                    </div>

                    {activeEnv && (
                        <FloorPlanCanvas 
                            activeEnv={activeEnv}
                            onUpdateTable={updateTable}
                            onRemoveTable={removeTable}
                            onOpenEdit={(t) => { setEditingTable(t); setIsEditDialogOpen(true); }}
                            onOpenQR={(t) => { setEditingTable(t); setIsQRDialogOpen(true); }}
                            onDuplicateTable={duplicateTable}
                            onEditChairs={editChairs}
                            editingChairsId={editingChairsId}
                        />
                    )}
                </div>
            </PageContent>

            <EditTableDialog 
                open={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
                editingTable={editingTable}
                setEditingTable={setEditingTable}
                onSave={() => { if (editingTable) updateTable(editingTable.id!, editingTable); setIsEditDialogOpen(false); }}
                onOpenQR={(t: any) => { setEditingTable(t); setIsQRDialogOpen(true); }}
            />

            <QRConfigDialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen} table={editingTable} activeEnv={activeEnv} />

            <QuickTemplatesDialog 
                open={isTemplatesOpen} 
                onOpenChange={setIsTemplatesOpen} 
                onApply={applyTemplate} 
            />
        </PageContainer>
    );
}
