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
import { ConfigItem } from '@/components/ui/config-item';
import { FloorPlanCanvas } from './components/floor-plan-canvas';
import { QuickTemplatesDialog } from '@/components/dialogs/planomesas-templates-dialog';
import { Settings, Copy, Download } from 'lucide-react';

// --- Constants ---

const statusConfig: Record<TableStatus, { color: string; icon: React.ElementType; bgColor: string }> = {
    'Libre': { color: 'green-500', icon: CheckSquare, bgColor: 'bg-green-500/10' },
    'Ocupada': { color: 'blue-500', icon: Users, bgColor: 'bg-blue-500/10' },
    'Reservada': { color: 'purple-500', icon: Clock, bgColor: 'bg-purple-500/10' },
    'Mantenimiento': { color: 'orange-500', icon: AlertTriangle, bgColor: 'bg-orange-500/10' },
    'Inactiva': { color: 'muted-foreground', icon: XSquare, bgColor: 'bg-muted' }
};

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

function EditTableDialog({ open, onOpenChange, editingTable, setEditingTable, onSave, onOpenQR }: any) {
    if (!editingTable) return null;
    const config = statusConfig[editingTable.status as TableStatus];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader icon={Settings} title={`Editar Mesa ${editingTable.number}`} description="Ajusta los parámetros físicos y operativos." />
                <DialogContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <TextXS className="font-bold uppercase tracking-wider text-muted-foreground ml-1">Número</TextXS>
                                <Input type="number" value={editingTable.number} className="rounded-xl h-12 bg-muted/50 border-none px-4 font-bold text-lg" onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <TextXS className="font-bold uppercase tracking-wider text-muted-foreground ml-1">Capacidad</TextXS>
                                <Input type="number" value={editingTable.capacity} className="rounded-xl h-12 bg-muted/50 border-none px-4 font-bold text-lg" onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <TextXS className="font-bold uppercase tracking-wider text-muted-foreground ml-1">Estado Operativo</TextXS>
                            <div className="p-1 bg-muted/30 rounded-2xl border">
                                <ConfigItem icon={config.icon} color={config.color} label="Estado Actual" description="Determina si la mesa está disponible.">
                                    <Select value={editingTable.status} onValueChange={(v) => setEditingTable({ ...editingTable, status: v as TableStatus })}>
                                        <SelectTrigger className="w-32 h-9 border-none bg-background shadow-sm rounded-lg"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            {Object.keys(statusConfig).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </ConfigItem>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter onCancel={() => onOpenChange(false)} onConfirm={onSave} actions={<Button variant="ghost" onClick={() => onOpenQR(editingTable)} startIcon={<QrCode />}>QR</Button>} />
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
    const [editingTable, setEditingTable] = React.useState<Partial<Table> | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = React.useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);

    const activeEnv = environments.find(e => e.id === activeEnvId);

    const updateTable = (tableId: number, updates: Partial<Table>) => {
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: env.tables.map(t => t.id === tableId ? { ...t, ...updates } : t) }
            : env
        ));
    };

    const removeTable = (tableId: number) => {
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: env.tables.filter(t => t.id !== tableId) }
            : env
        ));
    };

    const addTable = () => {
        if (!activeEnv) return;
        const newId = Date.now();
        setEnvironments(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: [...env.tables, { id: newId, number: env.tables.length + 1, x: 20, y: 20, width: 100, height: 80, capacity: 4, status: 'Libre' }] }
            : env
        ));
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
