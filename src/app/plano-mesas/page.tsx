'use client';
import * as React from 'react';
import { 
    PlusCircle, Trash, Users, CheckSquare, 
    Clock, AlertTriangle, FolderOpen, LayoutGrid, Power,
    ChevronLeft, ChevronRight, Utensils, Building,
    Lock, Unlock, Loader2, QrCode, MoreVertical, Edit
} from 'lucide-react';

// UI Components
import { TextXS, TextSM } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { QuickTemplatesDialog, type QuickTemplate } from '@/components/dialogs/planomesas-templates-dialog';
import { EditTableDialog } from '@/components/dialogs/planomesas-config-dialog';
import { QRConfigDialog } from '@/components/dialogs/planomesas-qr-dialog';

// Convex
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useEstablishments } from '@/hooks/useEstablishments';

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
    Utensils, Building, Users,
    PlusCircle, CheckSquare, Clock, AlertTriangle
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
    const { activeEstablishment } = useEstablishments();

    // Convex queries and mutations
    const convexEnvironments = useQuery(
        api.environments.getEnvironmentsByEstablishment, 
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
    );
    const createTableMutation = useMutation(api.environments.createTable);
    const updateTableMutation = useMutation(api.environments.updateTable);
    const deleteTableMutation = useMutation(api.environments.deleteTable);
    const updateEnvironmentMutation = useMutation(api.environments.updateEnvironment);
    const syncEnvironmentCapacityMutation = useMutation(api.environments.syncEnvironmentCapacityFromPlan);

    // Local state (Convex es fuente de verdad para existencia; local preserva ediciones en curso)
    const [environments, setEnvironments] = React.useState<Environment[]>([]);
    const [activeEnvId, setActiveEnvId] = React.useState<string>('');
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

        setEnvironments(
            convexEnvironments.map(env => ({
                id: env.id,
                name: env.name,
                capacity: env.capacity ?? 0,
                status: env.status as 'Abierto' | 'Cerrado',
                icon: env.icon || 'Building',
                color: env.color || '#9B6EFD',
                tables: env.tables.map(table => ({
                    id: table.id,
                    number: table.number,
                    x: table.x,
                    y: table.y,
                    width: table.width,
                    height: table.height,
                    rotation: table.rotation,
                    capacity: table.capacity,
                    status: (CONVEX_STATUS_TO_UI[table.status] || 'Libre') as TableStatus,
                    shape: table.shape === 'circle' ? 'round' : 'rectangle',
                    chairs: table.chairs,
                    isObject: table.is_object,
                    objectType: table.object_type,
                })),
            }))
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
    const [isLocked, setIsLocked] = React.useState(false);

    const activeEnv = environments.find(e => e.id === activeEnvId);

    // --- Table operations ---



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



    return (
        <PageContainer>
            <PageHeader 
                title="Plano de Mesas" 
                subtitle="Diseña y organiza la disposición de tu salón"
                actions={
                    <div className="flex items-center w-full gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                        <Button 
                            variant="outline" 
                            className="h-10 w-10 shrink-0 p-0 sm:w-auto sm:px-4" 
                            onClick={() => router.push('/ambientes')}
                        >
                            <ChevronLeft className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Volver a Ambientes</span>
                        </Button>

                        <Button 
                            variant={isLocked ? "secondary" : "outline"} 
                            className="h-10 w-10 shrink-0 p-0" 
                            onClick={() => setIsLocked(!isLocked)} 
                            title={isLocked ? 'Desbloquear edición' : 'Bloquear edición'}
                        >
                            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-10 w-10 shrink-0 p-0 sm:w-auto sm:px-4" 
                            onClick={() => setIsTemplatesOpen(true)} 
                            disabled={isLocked}
                        >
                            <FolderOpen className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Plantillas</span>
                        </Button>

                        {activeEnv && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant={activeEnv.status === 'Abierto' ? "ghost-success" : "ghost-destructive"}
                                            className="h-10 w-10 shrink-0 p-0"
                                            onClick={async () => {
                                                const newStatus = activeEnv.status === 'Abierto' ? 'Cerrado' : 'Abierto';
                                                setEnvironments(prev => prev.map(e => e.id === activeEnvId ? { ...e, status: newStatus as 'Abierto' | 'Cerrado' } : e));
                                                await updateEnvironmentMutation({
                                                    environmentId: activeEnvId as Id<'environments'>,
                                                    status: newStatus === 'Abierto' ? 'active' : 'inactive',
                                                }).catch(console.error);
                                            }}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Ambiente {activeEnv.status}</span>
                                            <span className="text-xs text-muted-foreground">Haz clic para {activeEnv.status === 'Abierto' ? 'cerrar' : 'abrir'}</span>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <Button
                            size="md"
                            startIcon={<PlusCircle />}
                            disabled={isLocked || !activeEnv}
                            onClick={() => addTable()}
                            className="flex-1 shrink-0 whitespace-nowrap"
                        >
                            Añadir Mesa
                        </Button>
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
                        <div className="flex w-full lg:w-[60vw]">
                            <Tabs value={activeEnvId} onValueChange={setActiveEnvId} className="w-full">
                                <TabsList className="w-full justify-start">
                                    {environments.map(env => {
                                        const Icon = iconMap[env.icon || 'Building'] || Building;
                                        const isHex = env.color?.startsWith('#');
                                        
                                        const ColoredIcon = (props: any) => (
                                            <Icon 
                                                {...props}
                                                className={cn(props.className, !isHex && `text-${env.color}`)} 
                                                style={{...props.style, ...(isHex ? { color: env.color } : {})}}
                                            />
                                        );

                                        return (
                                            <TabsTrigger 
                                                key={env.id} 
                                                value={env.id}
                                                icon={ColoredIcon}
                                            >
                                                {env.name}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </Tabs>
                        </div>

                        {activeEnv && (
                            <div className="flex items-center gap-6">

                                <div className="flex items-center w-full gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" size="md" className="flex-1 justify-center px-1 sm:px-4" startIcon={<LayoutGrid />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject).length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Total Mesas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="success" size="md" className="flex-1 justify-center px-1 sm:px-4" startIcon={<CheckSquare />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Libre').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Libres</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="info" size="md" className="flex-1 justify-center px-1 sm:px-4" startIcon={<Users />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Ocupada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Ocupadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="purple" size="md" className="flex-1 justify-center px-1 sm:px-4" startIcon={<Clock />}>
                                                    <span>{activeEnv.tables.filter(t => !t.isObject && t.status === 'Reservada').length}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <TextXS>Mesas Reservadas</TextXS>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="warning" size="md" className="flex-1 justify-center px-1 sm:px-4" startIcon={<AlertTriangle />}>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {activeEnv.tables
                                .filter(t => !t.isObject)
                                .sort((a, b) => a.number - b.number)
                                .map(table => (
                                <Card key={table.id} className="relative group hover:border-primary transition-all duration-300">
                                    <CardHeader className="pb-3" compact>
                                        <div className="flex items-center justify-between gap-4">
                                            <CardTitle className="text-xl font-bold truncate flex-1" title={`Mesa ${table.number}`}>
                                                Mesa {table.number}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isLocked ? (
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        onClick={() => { setEditingTable(table); setIsQRDialogOpen(true); }}
                                                        title="Código QR"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="secondary" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                            <DropdownMenuItem onClick={() => { setEditingTable(table); setIsEditDialogOpen(true); }}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar Mesa
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setEditingTable(table); setIsQRDialogOpen(true); }}>
                                                                <QrCode className="h-4 w-4 mr-2" />
                                                                Código QR
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => duplicateTable(table)}>
                                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                                Duplicar
                                                            </DropdownMenuItem>
                                                            <Separator className="my-1" />
                                                            <DropdownMenuItem 
                                                                onClick={() => removeTable(table.id)}
                                                            >
                                                                <Trash className="h-4 w-4 mr-2" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0" compact>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                                <Users className="h-4 w-4" />
                                                <span className="text-sm font-medium">{table.capacity} pers.</span>
                                            </div>
                                            <Badge variant={
                                                table.status === 'Libre' ? 'success' :
                                                table.status === 'Ocupada' ? 'info' :
                                                table.status === 'Reservada' ? 'purple' :
                                                table.status === 'Inactiva' ? 'neutral' : 'warning'
                                            } size="default" className="truncate">
                                                {table.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
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
