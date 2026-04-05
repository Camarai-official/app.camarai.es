'use client';

import * as React from 'react';
import { 
    PlusCircle, Trash, Users, CheckSquare, 
    Clock, AlertTriangle, XSquare, FolderOpen, LayoutGrid, Power,
    ChevronLeft, ChevronRight, Utensils, Sun, Beer, Wine, Coffee, Building,
    Square, Circle, Lock, Unlock, Save, Loader2
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
import { useSearchParams, useRouter } from 'next/navigation';

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { type Table, type TableStatus, type Environment } from '@/data/environments';
import { FloorPlanCanvas } from '../../components/ui/floor-plan-canvas';
import { QuickTemplatesDialog, type QuickTemplate } from '@/components/dialogs/planomesas-templates-dialog';
import { EditTableDialog } from '@/components/dialogs/planomesas-config-dialog';
import { QRConfigDialog } from '@/components/dialogs/planomesas-qr-dialog';

// Convex
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { HARDCODED_ESTABLISHMENT_ID } from '@/lib/hardcoded-establishment';

// --- Constants & Helpers ---

const CHAIR_SPACING = 48;

const UI_STATUS_TO_CONVEX: Record<string, 'free' | 'occupied' | 'reserved' | 'dirty'> = {
    'Libre': 'free',
    'Ocupada': 'occupied',
    'Reservada': 'reserved',
    'Mantenimiento': 'dirty',
    'Inactiva': 'free',
};

const CONVEX_STATUS_TO_UI: Record<string, TableStatus> = {
    'free': 'Libre',
    'occupied': 'Ocupada',
    'reserved': 'Reservada',
    'dirty': 'Mantenimiento',
};

const iconMap: { [key: string]: React.ElementType } = {
    Utensils, Wine, Coffee, Beer, Sun, Building, Users,
    PlusCircle, CheckSquare, Clock, AlertTriangle, XSquare
};

const generateAllChairs = (width: number, height: number, shape: 'rectangle' | 'round' = 'rectangle') => {
    if (shape === 'round') {
        const ROUND_CHAIR_SPACING = 56;
        const rx = width / 2;
        const ry = height / 2;
        const circumference = Math.PI * (rx + ry);
        const maxChairs = Math.floor(circumference / ROUND_CHAIR_SPACING);
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

const computeCapacity = (chairs?: Table['chairs']) => (
    (chairs?.top?.length || 0) +
    (chairs?.bottom?.length || 0) +
    (chairs?.left?.length || 0) +
    (chairs?.right?.length || 0) +
    (chairs?.round?.length || 0)
);

function nextNonObjectTableNumber(tables: Table[]): number {
    return tables.filter(t => !t.isObject).reduce((m, t) => Math.max(m, t.number), 0) + 1;
}

// --- Main Page Component ---

function PlanoMesasContent() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const envIdParam = searchParams.get('envId');

    // Convex queries and mutations
    const convexEnvironments = useQuery(api.environments.getEnvironmentsByEstablishment, {
        establishmentId: HARDCODED_ESTABLISHMENT_ID,
    });
    const createTableMutation = useMutation(api.environments.createTable);
    const updateTableMutation = useMutation(api.environments.updateTable);
    const deleteTableMutation = useMutation(api.environments.deleteTable);
    const updateEnvironmentMutation = useMutation(api.environments.updateEnvironment);
    const syncEnvironmentCapacityMutation = useMutation(api.environments.syncEnvironmentCapacityFromPlan);

    // Local state (Convex es fuente de verdad para existencia; local preserva ediciones en curso)
    const [environments, setEnvironments] = React.useState<Environment[]>([]);
    const [activeEnvId, setActiveEnvId] = React.useState<string>('');
    const [isSaving, setIsSaving] = React.useState(false);
    const deletingTableIdsRef = React.useRef(new Set<string>());
    const [pendingDeleteTableId, setPendingDeleteTableId] = React.useState<string | null>(null);

    const syncEnvCapacityFromPlan = React.useCallback(async () => {
        if (!activeEnvId) return;
        try {
            await syncEnvironmentCapacityMutation({ environmentId: activeEnvId as Id<'environments'> });
        } catch (e) {
            console.error(e);
        }
    }, [activeEnvId, syncEnvironmentCapacityMutation]);

    // Sync reactivo: corre en cada actualización de Convex.
    // Merge: Convex determina qué elementos existen (altas/bajas en tiempo real),
    // el estado local se preserva para ediciones no guardadas (drag, resize, diálogo abierto).
    React.useEffect(() => {
        if (!convexEnvironments) return;

        setEnvironments(prev =>
            convexEnvironments.map(env => {
                const localEnv = prev.find(e => e.id === env.id);
                return {
                    id: env.id,
                    name: env.name,
                    capacity: env.capacity ?? 0,
                    status: localEnv?.status ?? (env.status as 'Abierto' | 'Cerrado'),
                    icon: env.icon || 'Building',
                    color: env.color || '#9B6EFD',
                    tables: env.tables.map(table => {
                        const local = localEnv?.tables.find(t => t.id === table.id);
                        return {
                            id: table.id,
                            number: local?.number ?? table.number,
                            x: local?.x ?? table.x,
                            y: local?.y ?? table.y,
                            width: local?.width ?? table.width,
                            height: local?.height ?? table.height,
                            capacity: table.capacity,
                            status: local?.status ?? (CONVEX_STATUS_TO_UI[table.status] || 'Libre') as TableStatus,
                            shape: table.shape === 'circle' ? 'round' : 'rectangle',
                            rotation: local?.rotation ?? (table.rotation ?? 0),
                            chairs: local?.chairs ?? table.chairs,
                            isObject: table.is_object,
                            objectType: table.object_type,
                        };
                    }),
                };
            })
        );
    }, [convexEnvironments]);

    // Inicializa activeEnvId la primera vez y lo corrige si el ambiente activo fue eliminado.
    React.useEffect(() => {
        if (!convexEnvironments || convexEnvironments.length === 0) return;
        setActiveEnvId(prev => {
            if (prev && convexEnvironments.find(e => e.id === prev)) return prev;
            return (envIdParam && convexEnvironments.find(e => e.id === envIdParam))
                ? envIdParam
                : convexEnvironments[0].id;
        });
    }, [convexEnvironments, envIdParam]);

    // --- Scroll logic for environment tabs ---
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
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -200 : 200,
                behavior: 'smooth'
            });
        }
    };

    // --- Dialog and interaction state ---
    const [editingTable, setEditingTable] = React.useState<Table | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = React.useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);
    const [editingChairsId, setEditingChairsId] = React.useState<string | null>(null);
    const [isLocked, setIsLocked] = React.useState(false);

    const activeEnv = environments.find(e => e.id === activeEnvId);

    // --- Table operations ---

    // Updates local state only (used for live drag/resize/rotate feedback)
    const updateTable = (tableId: string, updates: Partial<Table>) => {
        setEnvironments(prev => prev.map(env => {
            if (env.id !== activeEnvId) return env;
            return {
                ...env,
                tables: env.tables.map(t => {
                    if (t.id !== tableId) return t;
                    const newTable = { ...t, ...updates };
                    if (updates.width !== undefined || updates.height !== undefined || updates.chairs) {
                        if (newTable.chairs) {
                            const ROUND_CHAIR_SPACING = 56;
                            if (newTable.shape === 'round') {
                                const rx = newTable.width / 2;
                                const ry = newTable.height / 2;
                                const circumference = Math.PI * (rx + ry);
                                const maxRound = Math.floor(circumference / ROUND_CHAIR_SPACING);
                                newTable.chairs.round = (newTable.chairs.round || []).filter(i => i < maxRound);
                            } else {
                                const maxTopBottom = Math.floor(newTable.width / CHAIR_SPACING);
                                const maxLeftRight = Math.floor(newTable.height / CHAIR_SPACING);
                                newTable.chairs.top = (newTable.chairs.top || []).filter(i => i < maxTopBottom);
                                newTable.chairs.bottom = (newTable.chairs.bottom || []).filter(i => i < maxTopBottom);
                                newTable.chairs.left = (newTable.chairs.left || []).filter(i => i < maxLeftRight);
                                newTable.chairs.right = (newTable.chairs.right || []).filter(i => i < maxLeftRight);
                            }
                        }
                        newTable.capacity = computeCapacity(newTable.chairs);
                    }
                    return newTable;
                })
            };
        }));

        // Persist chair changes immediately to Convex (non-positional)
        const isPositional = 'x' in updates || 'y' in updates || 'width' in updates || 'height' in updates || 'rotation' in updates;
        if (!isPositional && updates.chairs !== undefined) {
            updateTableMutation({
                tableId: tableId as Id<'tables'>,
                chairs: updates.chairs,
                capacity: computeCapacity(updates.chairs),
            })
                .then(() => syncEnvCapacityFromPlan())
                .catch(console.error);
        }
    };

    // Saves table edits from dialog to Convex
    const saveTableFromDialog = async () => {
        if (!editingTable) return;
        // Update local state with all dialog changes
        setEnvironments(prev => prev.map(env => {
            if (env.id !== activeEnvId) return env;
            return { ...env, tables: env.tables.map(t => t.id === editingTable.id ? { ...t, ...editingTable } : t) };
        }));
        try {
            await updateTableMutation({
                tableId: editingTable.id as Id<'tables'>,
                number: editingTable.number,
                status: UI_STATUS_TO_CONVEX[editingTable.status] || 'free',
                capacity: editingTable.capacity,
            });
            await syncEnvCapacityFromPlan();
            toast({ title: "Mesa Guardada", description: `La mesa ${editingTable.number} ha sido actualizada.` });
            setIsEditDialogOpen(false);
        } catch {
            toast({ title: "Error", description: "No se pudieron guardar los cambios de la mesa.", variant: "destructive" });
        }
    };

    // Adds a new table to Convex and updates local state
    const addTable = async (shape: 'rectangle' | 'round' = 'rectangle', isObject = false, objectType?: string) => {
        if (!activeEnv) return;

        let width = shape === 'round' ? 90 : 100;
        let height = shape === 'round' ? 90 : 80;
        if (isObject) { width = 60; height = 60; }

        const chairs = isObject ? undefined : generateAllChairs(width, height, shape);
        const capacity = computeCapacity(chairs);
        const tableNumber = isObject ? 0 : nextNonObjectTableNumber(activeEnv.tables);

        try {
            const newId = await createTableMutation({
                environmentId: activeEnvId as Id<'environments'>,
                number: tableNumber,
                capacity,
                x: 20, y: 20, width, height,
                rotation: 0,
                shape: shape === 'round' ? 'circle' : 'rectangle',
                chairs,
                is_object: isObject || undefined,
                object_type: objectType,
                status: 'free',
            });

            setEnvironments(prev => prev.map(env => env.id === activeEnvId
                ? { ...env, tables: [...env.tables, {
                    id: newId,
                    number: tableNumber,
                    x: 20, y: 20, width, height,
                    capacity,
                    status: 'Libre' as TableStatus,
                    shape,
                    rotation: 0,
                    chairs,
                    isObject,
                    objectType,
                }] }
                : env
            ));

            await syncEnvCapacityFromPlan();

            toast({
                title: isObject ? "Objeto Añadido" : "Mesa Añadida",
                description: `Se ha añadido ${isObject ? `un(a) ${objectType}` : `una mesa ${shape === 'round' ? 'circular' : 'rectangular'}`} correctamente.`
            });
        } catch {
            toast({ title: "Error", description: "No se pudo añadir la mesa.", variant: "destructive" });
        }
    };

    // Removes a table from Convex; la UI se actualiza al reconciliar con Convex
    const removeTable = async (tableId: string) => {
        if (deletingTableIdsRef.current.has(tableId)) return;
        deletingTableIdsRef.current.add(tableId);
        setPendingDeleteTableId(tableId);
        const table = activeEnv?.tables.find(t => t.id === tableId);
        try {
            await deleteTableMutation({ tableId: tableId as Id<'tables'> });
            await syncEnvCapacityFromPlan();
            const label = table?.isObject ? (table.objectType || 'Objeto') : `la mesa ${table?.number || ''}`;
            toast({
                title: table?.isObject ? "Objeto Eliminado" : "Mesa Eliminada",
                description: `Se ha eliminado ${label} correctamente.`,
                variant: "destructive"
            });
        } catch {
            toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
        } finally {
            deletingTableIdsRef.current.delete(tableId);
            setPendingDeleteTableId((prev) => (prev === tableId ? null : prev));
        }
    };

    // Duplicates a table in Convex and local state
    const duplicateTable = async (table: Table) => {
        if (!activeEnv) return;

        const tableNumber = table.isObject ? 0 : nextNonObjectTableNumber(activeEnv.tables);

        try {
            const newId = await createTableMutation({
                environmentId: activeEnvId as Id<'environments'>,
                number: tableNumber,
                capacity: table.capacity,
                x: table.x + 20, y: table.y + 20,
                width: table.width, height: table.height,
                rotation: table.rotation || 0,
                shape: table.shape === 'round' ? 'circle' : 'rectangle',
                chairs: table.chairs,
                is_object: table.isObject || undefined,
                object_type: table.objectType,
                status: 'free',
            });

            setEnvironments(prev => prev.map(env => env.id === activeEnvId
                ? { ...env, tables: [...env.tables, {
                    ...table,
                    id: newId,
                    number: tableNumber,
                    x: table.x + 20,
                    y: table.y + 20,
                }] }
                : env
            ));

            await syncEnvCapacityFromPlan();

            const label = table.isObject ? (table.objectType || 'Objeto') : `la Mesa ${table.number}`;
            toast({
                title: table.isObject ? "Objeto Duplicado" : "Mesa Duplicada",
                description: `Se ha creado una copia de ${label}.`
            });
        } catch {
            toast({ title: "Error", description: "No se pudo duplicar.", variant: "destructive" });
        }
    };

    const editChairs = (table: Table) => {
        setEditingChairsId(table.id === editingChairsId ? null : table.id);
    };

    // Applies a quick template: deletes existing tables, creates new ones in Convex
    const applyTemplate = async (template: QuickTemplate) => {
        if (!activeEnvId || !activeEnv) return;

        try {
            for (const t of activeEnv.tables) {
                await deleteTableMutation({ tableId: t.id as Id<'tables'> });
            }

            const newTables: Table[] = [];
            const cols = Math.ceil(Math.sqrt(template.tables));
            const spacing = 200;

            for (let i = 0; i < template.tables; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const width = 100, height = 80;
                const chairs = generateAllChairs(width, height);
                const capacity = computeCapacity(chairs);
                const x = 50 + col * spacing;
                const y = 50 + row * spacing;

                const newId = await createTableMutation({
                    environmentId: activeEnvId as Id<'environments'>,
                    number: i + 1,
                    capacity,
                    x, y, width, height,
                    rotation: 0,
                    shape: 'rectangle',
                    chairs,
                    status: 'free',
                });

                newTables.push({
                    id: newId,
                    number: i + 1,
                    x, y, width, height,
                    capacity,
                    status: 'Libre' as TableStatus,
                    chairs,
                });
            }

            setEnvironments(prev => prev.map(env =>
                env.id === activeEnvId ? { ...env, tables: newTables } : env
            ));
            await syncEnvCapacityFromPlan();
            toast({ title: 'Plantilla aplicada', description: `Se han creado ${template.tables} mesas.` });
        } catch (e) {
            toast({ title: "Error", description: "No se pudo aplicar la plantilla.", variant: "destructive" });
            throw e;
        }
    };

    // Saves current table positions/sizes/rotations to Convex
    const savePlan = async () => {
        if (!activeEnv || isSaving) return;
        setIsSaving(true);
        try {
            await Promise.all(activeEnv.tables.map(table =>
                updateTableMutation({
                    tableId: table.id as Id<'tables'>,
                    x: table.x,
                    y: table.y,
                    width: table.width,
                    height: table.height,
                    rotation: table.rotation || 0,
                    chairs: table.chairs,
                    capacity: table.capacity,
                })
            ));
            await syncEnvCapacityFromPlan();
            toast({ title: "Plano Guardado", description: "La disposición de mesas ha sido guardada correctamente." });
        } catch {
            toast({ title: "Error al guardar", description: "No se pudieron guardar los cambios.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Plano de Mesas" 
                subtitle="Diseña y organiza la disposición de tu salón"
                actions={
                    <div className="flex gap-2">
                        <Button 
                            variant={isLocked ? "secondary" : "outline"} 
                            size="md" 
                            onClick={() => setIsLocked(!isLocked)} 
                            title={isLocked ? 'Desbloquear edición' : 'Bloquear edición'}
                        >
                            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>

                        <Button variant="outline" size="md" onClick={() => router.push('/ambientes')} startIcon={<ChevronLeft />}>
                            Volver a Ambientes
                        </Button>
                        <Button 
                            variant="outline" 
                            size="md" 
                            onClick={() => setIsTemplatesOpen(true)} 
                            startIcon={<FolderOpen />}
                            disabled={isLocked}
                        >
                            Plantillas
                        </Button>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={savePlan}
                            disabled={isSaving || isLocked || !activeEnv}
                            startIcon={isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        >
                            Guardar Plano
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="md" startIcon={<PlusCircle />} disabled={isLocked}>
                                    Añadir
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Mesas</div>
                                <DropdownMenuItem onClick={() => addTable('rectangle')}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Mesa Rectangular
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addTable('round')}>
                                    <Circle className="mr-2 h-4 w-4" />
                                    Mesa Circular
                                </DropdownMenuItem>
                                <Separator className="my-1" />
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Objetos</div>
                                <DropdownMenuItem onClick={() => addTable('rectangle', true, 'Objeto Rectangular')}>
                                    <Square className="mr-2 h-4 w-4 fill-muted-foreground/20" />
                                    Objeto Rectangular
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addTable('round', true, 'Objeto Circular')}>
                                    <Circle className="mr-2 h-4 w-4 fill-muted-foreground/20" />
                                    Objeto Circular
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            <PageContent>
                {convexEnvironments === undefined ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin opacity-60" />
                        <p className="text-sm">Cargando ambientes…</p>
                    </div>
                ) : (
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
                                                    onClick={async () => {
                                                        const newStatus = activeEnv.status === 'Abierto' ? 'Cerrado' : 'Abierto';
                                                        setEnvironments(prev => prev.map(e => e.id === activeEnvId ? { ...e, status: newStatus as 'Abierto' | 'Cerrado' } : e));
                                                        await updateEnvironmentMutation({
                                                            environmentId: activeEnvId as Id<'environments'>,
                                                            status: newStatus === 'Abierto' ? 'active' : 'inactive',
                                                        }).catch(console.error);
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
                                                    <span>{activeEnv.tables.filter(t => !t.isObject).length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Total Mesas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="success" size="md" startIcon={<CheckSquare />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Libre').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Libres</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="info" size="md" startIcon={<Users />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Ocupada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Ocupadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="purple" size="md" startIcon={<Clock />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Reservada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Reservadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="warning" size="md" startIcon={<AlertTriangle />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Mantenimiento').length}</span>
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
                            isLocked={isLocked}
                            pendingDeleteTableId={pendingDeleteTableId}
                        />
                    )}

                    {!activeEnv && convexEnvironments !== undefined && environments.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                            <LayoutGrid className="h-12 w-12 opacity-20" />
                            <p className="text-sm">No hay ambientes configurados. Crea uno desde la vista de Ambientes.</p>
                            <Button variant="outline" size="md" onClick={() => router.push('/ambientes')} startIcon={<ChevronLeft />}>
                                Ir a Ambientes
                            </Button>
                        </div>
                    )}
                </div>
                )}
            </PageContent>

            <EditTableDialog 
                open={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
                editingTable={editingTable}
                setEditingTable={setEditingTable}
                onSave={saveTableFromDialog}
                onOpenQR={(t) => { setEditingTable(t); setIsQRDialogOpen(true); }}
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

export default function PlanoMesasPage() {
    return (
        <React.Suspense fallback={<PageContainer><PageHeader title="Plano de Mesas" /></PageContainer>}>
            <PlanoMesasContent />
        </React.Suspense>
    );
}
