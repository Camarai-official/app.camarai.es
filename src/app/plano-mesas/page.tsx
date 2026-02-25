'use client';

import * as React from 'react';
import { 
    PlusCircle, QrCode, Trash, Users, Plus, CheckSquare, 
    Clock, AlertTriangle, XSquare, FolderOpen, Activity, LayoutGrid, Power,
    ChevronLeft, ChevronRight
} from 'lucide-react';

// UI Components
import { H3, TextXS, TextSM } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, IconBadge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Layout Components
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';

// Data & Helpers
import { mockEnvironments, type Table, type TableStatus, type Environment } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { FloorPlanCanvas } from '../../components/ui/floor-plan-canvas';
import { QuickTemplatesDialog } from '@/components/dialogs/planomesas-templates-dialog';
import { Settings, Copy, Download, Armchair, Minus } from 'lucide-react';
import { EditTableDialog } from '@/components/dialogs/planomesas-config-dialog';


// --- Sub-Components ---

function QRConfigDialog({ open, onOpenChange, table }: { open: boolean; onOpenChange: (open: boolean) => void; table: Table | null; }) {
    const { toast } = useToast();
    if (!table) return null;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://camarai.app/t/${table.number}`)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader icon={QrCode} title={`Configurar QR - Mesa ${table.number}`} description="Los clientes podrán escanear este código para ver el menú digital." />
                <DialogContent>
                    <div className="flex flex-col items-center gap-8 py-4">
                        <div className="p-6 bg-foreground rounded-[2rem] shadow-2xl">
                            <img src={qrImageUrl} alt="QR" className="w-48 h-48 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button variant="outline" onClick={() => toast({ title: "Enlace Copiado" })} startIcon={<Copy />}>Enlace</Button>
                            <Button variant="outline" onClick={() => toast({ title: "Descargando..." })} startIcon={<Download />}>Imagen</Button>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter onCancel={() => onOpenChange(false)} onConfirm={() => { toast({ title: "Enviado a imprimir" }); onOpenChange(false); }} confirmText="Imprimir Código" />
            </DialogWindow>
        </Dialog>
    );
}


// --- Main Page Component ---

export default function PlanoMesasPage() {
    const { toast } = useToast();
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const [activeEnvId, setActiveEnvId] = React.useState<string>(mockEnvironments[0]?.id || '');

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

    const addTable = () => {
        if (!activeEnv) return;
        const newId = Date.now();
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: [...env.tables, { id: newId, number: env.tables.length + 1, x: 20, y: 20, width: 100, height: 80, capacity: 4, status: 'Libre' }] }
            : env
        ));
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
                        <Button size="md" onClick={addTable} startIcon={<PlusCircle />}>
                            Añadir Mesa
                        </Button>
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
                                    {environments.map(env => (
                                        <Button 
                                            key={env.id}
                                            variant={activeEnvId === env.id ? "secondary" : "ghost"}
                                            size="md"
                                            onClick={() => setActiveEnvId(env.id)}
                                        >
                                            {env.name}
                                        </Button>
                                    ))}
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

            <QRConfigDialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen} table={editingTable as Table} />

            <QuickTemplatesDialog 
                open={isTemplatesOpen} 
                onOpenChange={setIsTemplatesOpen} 
                onApply={(template) => {
                    // Aquí se puede añadir lógica adicional al aplicar plantilla si fuera necesario
                }} 
            />
        </PageContainer>
    );
}
