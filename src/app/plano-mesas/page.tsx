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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Layout Components
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';

// Data & Helpers
import { mockEnvironments, type Table, type TableStatus, type Environment } from '@/data/mock-data';
import { FloorPlanCanvas } from '../../components/ui/floor-plan-canvas';
import { QuickTemplatesDialog } from '@/components/dialogs/planomesas-templates-dialog';
import { Settings, Copy, Download, Armchair, Minus, Globe, MapPin, FileText, Printer as PrinterIcon, Undo2, Redo2 } from 'lucide-react';
import { ActionTile } from '@/components/ui/action-tile';
import { EditTableDialog } from '@/components/dialogs/planomesas-config-dialog';


// --- Constants & Helpers ---
const CHAIR_SPACING = 48;

const generateAllChairs = (width: number, height: number) => {
    const getIndices = (dim: number) => Array.from({ length: Math.floor(dim / CHAIR_SPACING) }, (_, i) => i);
    return {
        top: getIndices(width),
        bottom: getIndices(width),
        left: getIndices(height),
        right: getIndices(height),
    };
};

function QRConfigDialog({ 
    open, 
    onOpenChange, 
    table, 
    activeEnv 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    table: Table | null;
    activeEnv?: Environment;
}) {
    const { toast } = useToast();
    const [qrKey, setQrKey] = React.useState(0);
    const [qrConfig, setQrConfig] = React.useState({
        baseUrl: 'https://camarai.app',
        includeEnv: true,
        customMessage: '¡Bienvenido! Escanea para ver nuestro menú.',
    });

    if (!table) return null;

    const getQRUrl = () => {
        let url = `${qrConfig.baseUrl}/t/${table.number}`;
        if (qrConfig.includeEnv && activeEnv) {
            url += `?env=${encodeURIComponent(activeEnv.name)}`;
        }
        return url;
    };

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQRUrl())}&t=${qrKey}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(getQRUrl());
        toast({ title: "Enlace Copiado", description: "El enlace de la mesa ha sido copiado al portapapeles." });
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `qr-mesa-${table.number}.png`;
        link.click();
        toast({ title: "Descargando QR", description: `El código de la Mesa ${table.number} se está descargando.` });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="lg">
                <DialogHeader 
                    icon={QrCode} 
                    title={`Configurar QR - Mesa ${table.number}`} 
                    description="Personaliza el acceso digital y el mensaje de bienvenida para tus clientes." 
                />
                <DialogContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                        {/* Previsualización */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="p-8 bg-foreground rounded-[2.5rem] shadow-2xl group/qr relative overflow-hidden transition-transform hover:scale-[1.02] duration-300">
                                <img src={qrImageUrl} alt="QR Preview" className="w-48 h-48 rounded-xl" />
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <Button 
                                variant="outline" 
                                size="md" 
                                onClick={() => { setQrKey(Date.now()); toast({ title: "QR Regenerado" }); }} 
                                startIcon={<Activity />}
                                className="w-full max-w-[200px]"
                            >
                                Regenerar Firma
                            </Button>
                        </div>

                        {/* Configuración */}
                        <div className="flex flex-col gap-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">URL de Acceso</Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 rounded-lg">
                                        <Globe className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <Input 
                                        value={qrConfig.baseUrl}
                                        onChange={(e) => setQrConfig(p => ({ ...p, baseUrl: e.target.value }))}
                                        className="pl-10"
                                        placeholder="https://tu-restaurante.com"
                                    />
                                </div>
                            </div>

                            <ActionTile
                                icon={MapPin}
                                title="Incluir Ambiente"
                                description="Añade el nombre del salón al enlace."
                                rightContentType="switch"
                                switchId="include-env"
                                switchChecked={qrConfig.includeEnv}
                                onSwitchChange={(v) => setQrConfig(p => ({ ...p, includeEnv: v }))}
                            />

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Mensaje de Bienvenida</Label>
                                <Textarea 
                                    value={qrConfig.customMessage}
                                    onChange={(e) => setQrConfig(p => ({ ...p, customMessage: e.target.value }))}
                                    placeholder="¡Hola! Bienvenidos..."
                                    className="resize-none h-24"
                                />
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">URL Generada</span>
                                </div>
                                <TextXS className="font-mono break-all opacity-70 line-clamp-2">
                                    {getQRUrl()}
                                </TextXS>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="ghost" onClick={handleCopy} startIcon={<Copy />}>Copiar Enlace</Button>
                        <Button variant="outline" onClick={handleDownload} startIcon={<Download />}>Descargar</Button>
                        <Button variant="brand" onClick={() => { handleDownload(); onOpenChange(false); }} startIcon={<PrinterIcon />}>Imprimir Código</Button>
                    </div>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}


// --- Main Page Component ---

export default function PlanoMesasPage() {
    const { toast } = useToast();
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const [activeEnvId, setActiveEnvId] = React.useState<string>(mockEnvironments[0]?.id || '');

    // Undo/Redo state
    const [history, setHistory] = React.useState<Environment[][]>([mockEnvironments]);
    const [historyIndex, setHistoryIndex] = React.useState(0);

    const saveToHistory = (newEnvironments: Environment[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newEnvironments);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const setEnvironmentsWithHistory = (updater: React.SetStateAction<Environment[]>) => {
        setEnvironments(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            saveToHistory(newState);
            return newState;
        });
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = () => {
        if (canUndo) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setEnvironments(history[prevIndex]);
            toast({ title: 'Deshacer', description: 'Acción deshecha.' });
        }
    };

    const handleRedo = () => {
        if (canRedo) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setEnvironments(history[nextIndex]);
            toast({ title: 'Rehacer', description: 'Acción rehecha.' });
        }
    };

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
        setEnvironmentsWithHistory(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: env.tables.map(t => t.id === tableId ? { ...t, ...updates } : t) }
            : env
        ));
    };

    const removeTable = (tableId: number) => {
        const table = activeEnv?.tables.find(t => t.id === tableId);
        setEnvironmentsWithHistory(prev => prev.map(env => env.id === activeEnvId 
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
        const width = 100;
        const height = 80;
        setEnvironmentsWithHistory(prev => prev.map(env => env.id === activeEnvId 
            ? { ...env, tables: [...env.tables, { 
                id: newId, 
                number: env.tables.length + 1, 
                x: 20, 
                y: 20, 
                width, 
                height, 
                capacity: 4, 
                status: 'Libre',
                chairs: generateAllChairs(width, height)
            }] }
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
        
        setEnvironmentsWithHistory(prev => {
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
        
        setEnvironmentsWithHistory(prev => prev.map(env => 
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
                        <Button variant="outline" size="md" onClick={handleUndo} disabled={!canUndo} title="Deshacer">
                            <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="md" onClick={handleRedo} disabled={!canRedo} title="Rehacer">
                            <Redo2 className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-8 mx-1" />
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
                                                        setEnvironmentsWithHistory(prev => prev.map(e => e.id === activeEnvId ? { ...e, status: newStatus } : e));
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
