
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, QrCode, Trash2, Users, Plus, Square, CheckSquare, Clock, AlertTriangle, XSquare, Power, Minus, ZoomIn, MoreVertical, FileText, Printer as PrinterIcon, Undo2, Redo2, Copy, Download, MessageSquare, Settings, Save, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEnvironments, type Table, type TableStatus, type EnvironmentStatus, type Environment } from '@/data/mock-data';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';

// Templates for quick floor plan setup
const floorPlanTemplates = [
    { id: 'restaurant-small', name: 'Restaurante Pequeño', description: '8-10 mesas', tables: 8 },
    { id: 'restaurant-medium', name: 'Restaurante Mediano', description: '15-20 mesas', tables: 16 },
    { id: 'bar', name: 'Bar / Tapas', description: 'Barra + mesas', tables: 10 },
    { id: 'terraza', name: 'Terraza', description: 'Exterior', tables: 12 },
];

// QR Configuration Dialog Component
function QRConfigDialog({ 
    open, 
    onOpenChange, 
    table, 
    environmentName 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    table: Table | null;
    environmentName: string;
}) {
    const { toast } = useToast();
    const [qrKey, setQrKey] = React.useState(Date.now()); // Para forzar regeneración
    const [qrConfig, setQrConfig] = React.useState({
        baseUrl: 'https://mirestaurante.com',
        includeEnv: true,
        customMessage: '¡Bienvenido! Escanea para ver nuestro menú y hacer tu pedido.',
    });
    
    const getQRUrl = () => {
        if (!table) return '';
        let url = `${qrConfig.baseUrl}/mesa/${table.number}`;
        if (qrConfig.includeEnv) {
            url += `?env=${encodeURIComponent(environmentName)}`;
        }
        return url;
    };
    
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQRUrl())}&t=${qrKey}`;
    
    const handleRegenerate = () => {
        setQrKey(Date.now());
        toast({ title: 'QR Regenerado', description: 'Se ha generado un nuevo código QR.' });
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `qr-mesa-${table?.number}.png`;
        link.click();
        toast({ title: 'QR Descargado', description: `El código QR de la Mesa ${table?.number} ha sido descargado.` });
    };
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(getQRUrl());
        toast({ title: 'Enlace copiado', description: 'El enlace de la mesa ha sido copiado al portapapeles.' });
    };

    if (!table) return null;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Configurar QR - Mesa {table.number}</DialogTitle>
                    <DialogDescription>
                        Configura el código QR para que los clientes accedan al menú vía WhatsApp.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* QR Preview Column */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white rounded-lg border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={qrImageUrl} 
                                alt={`QR Mesa ${table.number}`} 
                                width={160} 
                                height={160}
                                className="rounded"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRegenerate}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Regenerar QR
                        </Button>
                    </div>
                    
                    {/* Config Column */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url-base">URL Base</Label>
                            <Input 
                                id="url-base"
                                value={qrConfig.baseUrl}
                                onChange={(e) => setQrConfig(p => ({ ...p, baseUrl: e.target.value }))}
                                placeholder="https://mirestaurante.com"
                            />
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Incluir ambiente</Label>
                                <p className="text-xs text-muted-foreground">Añade el ambiente a la URL</p>
                            </div>
                            <Switch 
                                checked={qrConfig.includeEnv}
                                onCheckedChange={(v) => setQrConfig(p => ({ ...p, includeEnv: v }))}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="mensaje">Mensaje bienvenida</Label>
                            <Textarea
                                id="mensaje"
                                value={qrConfig.customMessage}
                                onChange={(e) => setQrConfig(p => ({ ...p, customMessage: e.target.value }))}
                                rows={2}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>
                
                {/* URL Preview */}
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">URL generada:</p>
                    <p className="text-sm font-mono break-all text-primary">{getQRUrl()}</p>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Enlace
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar QR
                    </Button>
                    <Button onClick={() => { handleDownload(); onOpenChange(false); }}>
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Templates Dialog
function TemplatesDialog({
    open,
    onOpenChange,
    onApplyTemplate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyTemplate: (templateId: string) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Plantillas de Plano</DialogTitle>
                    <DialogDescription>Selecciona una plantilla para configurar rápidamente tu ambiente.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {floorPlanTemplates.map(template => (
                        <div 
                            key={template.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => onApplyTemplate(template.id)}
                        >
                            <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.description} ({template.tables} mesas)</p>
                            </div>
                            <Button variant="ghost" size="sm">
                                Aplicar
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}


type DragItem = {
    id: number;
    type: 'drag' | 'resize';
    offsetX: number;
    offsetY: number;
    initialWidth?: number;
    initialHeight?: number;
};

const statusConfig: Record<TableStatus, { color: string; bgColor: string; icon: React.ElementType, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'Libre': { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100/50 border-green-400 dark:bg-green-900/30 dark:border-green-600', icon: CheckSquare, badgeVariant: 'outline' },
    'Ocupada': { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100/50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600', icon: Users, badgeVariant: 'default' },
    'Reservada': { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100/50 border-purple-400 dark:bg-purple-900/30 dark:border-purple-600', icon: Clock, badgeVariant: 'secondary' },
    'Mantenimiento': { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100/50 border-red-400 dark:bg-red-900/30 dark:border-red-600', icon: AlertTriangle, badgeVariant: 'destructive' },
    'Inactiva': { color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-100/50 border-gray-300 opacity-60 dark:bg-gray-800/30 dark:border-gray-600', icon: XSquare, badgeVariant: 'secondary' },
};

// Helper para formatear diferencia de tiempo
function formatTimeDiff(isoTimestamp: string): string {
    const diff = Date.now() - new Date(isoTimestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
}

// Helper para obtener info contextual del centro de mesa
function getTableCenterInfo(table: Table): { label: string; value: string } | null {
    switch (table.status) {
        case 'Ocupada':
            return table.occupiedSince 
                ? { label: 'Ocupada', value: formatTimeDiff(table.occupiedSince) }
                : null;
        case 'Reservada':
            if (table.reservedFor) {
                const reserveTime = new Date(table.reservedFor);
                const now = new Date();
                const diffMs = reserveTime.getTime() - now.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                
                if (diffMins > 0) {
                    return { 
                        label: table.reservedName || 'Reserva', 
                        value: `en ${diffMins}m` 
                    };
                } else {
                    return { 
                        label: table.reservedName || 'Reserva', 
                        value: reserveTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
                    };
                }
            }
            return table.reservedName ? { label: table.reservedName, value: '' } : null;
        case 'Mantenimiento':
            return table.maintenanceSince
                ? { label: 'Mantenim.', value: formatTimeDiff(table.maintenanceSince) }
                : null;
        default:
            return null;
    }
}

const calculateCapacity = (width: number, height: number): number => {
    const area = width * height;
    return Math.max(2, Math.floor(area / 6000));
};

export default function PlanoMesasPage() {
    const { toast } = useToast();
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const [activeEnvironmentId, setActiveEnvironmentId] = React.useState<string>(environments[0]?.id || '');
    const [activeDragItem, setActiveDragItem] = React.useState<DragItem | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [editingTable, setEditingTable] = React.useState<Partial<Table> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isInactiveTablesDialogOpen, setIsInactiveTablesDialogOpen] = React.useState(false);
    const [zoomLevels, setZoomLevels] = React.useState<Record<string, number>>({});
    const { isMobile, isTablet } = useIsMobile();
    
    // Undo/Redo state
    const [history, setHistory] = React.useState<Environment[][]>([mockEnvironments]);
    const [historyIndex, setHistoryIndex] = React.useState(0);
    
    // QR and Templates dialogs
    const [isQRDialogOpen, setIsQRDialogOpen] = React.useState(false);
    const [qrTable, setQrTable] = React.useState<Table | null>(null);
    const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = React.useState(false);

    const currentZoom = zoomLevels[activeEnvironmentId] || 1;

    const activeEnvironment = environments.find(env => env.id === activeEnvironmentId);
    
    // Undo/Redo functions
    const saveToHistory = (newEnvironments: Environment[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newEnvironments);
        // Keep max 50 history items
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };
    
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    
    const handleUndo = () => {
        if (canUndo) {
            setHistoryIndex(prev => prev - 1);
            setEnvironments(history[historyIndex - 1]);
            toast({ title: 'Deshacer', description: 'Acción deshecha.' });
        }
    };
    
    const handleRedo = () => {
        if (canRedo) {
            setHistoryIndex(prev => prev + 1);
            setEnvironments(history[historyIndex + 1]);
            toast({ title: 'Rehacer', description: 'Acción rehecha.' });
        }
    };
    
    // Override setEnvironments to save history
    const setEnvironmentsWithHistory = (updater: React.SetStateAction<Environment[]>) => {
        setEnvironments(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            saveToHistory(newState);
            return newState;
        });
    };
    
    // Open QR dialog for a table
    const openQRDialog = (table: Table) => {
        setQrTable(table);
        setIsQRDialogOpen(true);
    };
    
    // Apply template
    const applyTemplate = (templateId: string) => {
        if (!activeEnvironmentId) return;
        
        const template = floorPlanTemplates.find(t => t.id === templateId);
        if (!template) return;
        
        const newTables: Table[] = [];
        const cols = Math.ceil(Math.sqrt(template.tables));
        const spacing = 150;
        
        for (let i = 0; i < template.tables; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            newTables.push({
                id: i + 1,
                number: i + 1,
                x: 50 + col * spacing,
                y: 50 + row * spacing,
                width: 120,
                height: 90,
                capacity: 4,
                status: 'Libre' as TableStatus,
            });
        }
        
        setEnvironmentsWithHistory(prev => prev.map(env => 
            env.id === activeEnvironmentId ? { ...env, tables: newTables } : env
        ));
        
        setIsTemplatesDialogOpen(false);
        toast({ title: 'Plantilla aplicada', description: `Se han creado ${template.tables} mesas.` });
    };

    React.useEffect(() => {
        // Initialize zoom levels for all environments
        if (Object.keys(zoomLevels).length === 0 && environments.length > 0) {
            const initialZooms: Record<string, number> = {};
            environments.forEach(env => {
                initialZooms[env.id] = 1;
            });
            setZoomLevels(initialZooms);
        }
    }, [environments, zoomLevels]);

    const setZoom = (value: number | ((prev: number) => number)) => {
        if (!activeEnvironmentId) return;
        setZoomLevels(prev => ({
            ...prev,
            [activeEnvironmentId]: typeof value === 'function' ? value(prev[activeEnvironmentId] || 1) : value
        }));
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2));
    const resetZoom = () => setZoom(1);

    const getTableStats = (envId: string) => {
        const environment = environments.find(env => env.id === envId);
        if (!environment) {
            return { total: 0, libre: 0, ocupada: 0, reservada: 0, mantenimiento: 0, inactiva: 0 };
        }
        return {
            total: environment.tables.length,
            libre: environment.tables.filter(t => t.status === 'Libre').length,
            ocupada: environment.tables.filter(t => t.status === 'Ocupada').length,
            reservada: environment.tables.filter(t => t.status === 'Reservada').length,
            mantenimiento: environment.tables.filter(t => t.status === 'Mantenimiento').length,
            inactiva: environment.tables.filter(t => t.status === 'Inactiva').length,
        };
    };

    React.useEffect(() => {
        if (!activeEnvironmentId && environments.length > 0) {
            setActiveEnvironmentId(environments[0].id);
        }
    }, [environments, activeEnvironmentId]);

    // --- Local State Management Helpers ---

    const updateEnvironment = (id: string, updates: Partial<Environment>) => {
        setEnvironments(prev => prev.map(env => env.id === id ? { ...env, ...updates } : env));
    };

    const updateTable = (envId: string, tableId: number, updates: Partial<Table>) => {
        setEnvironments(prev => prev.map(env => {
            if (env.id !== envId) return env;
            return {
                ...env,
                tables: env.tables.map(t => t.id === tableId ? { ...t, ...updates } : t)
            };
        }));
    };

    const addNewEnvironment = () => {
        const newId = `env-${Date.now()}`;
        const newEnv: Environment = {
            id: newId,
            name: `Nuevo Ambiente ${environments.length + 1}`,
            tables: [],
            status: 'Abierto',
            icon: 'Utensils',
            color: '#78A3ED' // Default blue
        };
        setEnvironments(prev => [...prev, newEnv]);
        return newId;
    };

    const addNewTable = (envId: string) => {
        setEnvironments(prev => prev.map(env => {
            if (env.id !== envId) return env;
            const newId = Math.max(0, ...env.tables.map(t => t.id)) + 1;
            const newTable: Table = {
                id: newId,
                number: newId,
                x: 50, y: 50,
                width: 128, height: 96,
                capacity: calculateCapacity(128, 96),
                status: 'Libre'
            };
            return { ...env, tables: [...env.tables, newTable] };
        }));
    };

    const removeTableFromEnv = (envId: string, tableId: number) => {
        setEnvironments(prev => prev.map(env => {
            if (env.id !== envId) return env;
            return { ...env, tables: env.tables.filter(t => t.id !== tableId) };
        }));
    };

    // --- End Local State Helpers ---


    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: number, type: 'drag' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();
        if (!activeEnvironment) return;

        const table = activeEnvironment.tables.find(t => t.id === id);
        if (!table) return;

        const initialX = e.clientX;
        const initialY = e.clientY;

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        if (type === 'drag') {
            const target = e.currentTarget as HTMLDivElement;
            const rect = target.getBoundingClientRect();
            setActiveDragItem({
                id,
                type,
                offsetX: (e.clientX - rect.left) / currentZoom,
                offsetY: (e.clientY - rect.top) / currentZoom,
            });
        } else { // resize
            setActiveDragItem({
                id,
                type,
                offsetX: initialX,
                offsetY: initialY,
                initialWidth: table.width,
                initialHeight: table.height,
            });
        }
    };


    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!activeDragItem || !containerRef.current || !activeEnvironment) return;
        e.preventDefault();

        const containerRect = containerRef.current.getBoundingClientRect();
        const zoom = zoomLevels[activeEnvironmentId] || 1;

        if (activeDragItem.type === 'drag') {
            let x = (e.clientX - containerRect.left) / zoom - activeDragItem.offsetX;
            let y = (e.clientY - containerRect.top) / zoom - activeDragItem.offsetY;

            const table = activeEnvironment.tables.find(t => t.id === activeDragItem.id);
            if (!table) return;

            const canvasWidth = containerRect.width / zoom;
            const canvasHeight = containerRect.height / zoom;

            x = Math.max(0, Math.min(x, canvasWidth - table.width));
            y = Math.max(0, Math.min(y, canvasHeight - table.height));

            updateTable(activeEnvironment.id, activeDragItem.id, { x, y });

        } else { // resize
            const { id, offsetX, offsetY, initialWidth, initialHeight } = activeDragItem;
            if (initialWidth === undefined || initialHeight === undefined) return;

            const dx = (e.clientX - offsetX) / zoom;
            const dy = (e.clientY - offsetY) / zoom;

            let newWidth = initialWidth + dx;
            let newHeight = initialHeight + dy;

            newWidth = Math.max(120, Math.min(newWidth, 400));
            newHeight = Math.max(90, Math.min(newHeight, 200));

            // Recalculate capacity based on new size
            const newCapacity = calculateCapacity(newWidth, newHeight);

            updateTable(activeEnvironment.id, id, { width: newWidth, height: newHeight, capacity: newCapacity });
        }
    }, [activeDragItem, activeEnvironment, zoomLevels, activeEnvironmentId]);

    const handleMouseUp = React.useCallback(() => {
        setActiveDragItem(null);
    }, []);

    React.useEffect(() => {
        if (activeDragItem) {
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
    }, [activeDragItem, handleMouseMove, handleMouseUp]);


    const addTable = () => {
        if (!activeEnvironment) return;
        addNewTable(activeEnvironment.id);
    };

    const removeTable = (e: React.MouseEvent, idToRemove: number) => {
        e.stopPropagation();
        if (!activeEnvironment) return;
        removeTableFromEnv(activeEnvironment.id, idToRemove);
    };

    const addEnvironment = () => {
        const newEnvId = addNewEnvironment();
        setActiveEnvironmentId(newEnvId);
    }

    const handleDoubleClick = (table: Table) => {
        setEditingTable(table);
        setIsDialogOpen(true);
    }

    const handleSaveChanges = () => {
        if (!activeEnvironment || !editingTable || !editingTable.id) return;
        updateTable(activeEnvironment.id, editingTable.id, editingTable);
        setIsDialogOpen(false);
        setEditingTable(null);
    };

    const handleReactivateTable = (tableId: number) => {
        if (!activeEnvironment) return;
        updateTable(activeEnvironment.id, tableId, { status: 'Mantenimiento' });
    };

    const handleStatusChange = (envId: string, checked: boolean) => {
        const newStatus: EnvironmentStatus = checked ? 'Abierto' : 'Cerrado';
        updateEnvironment(envId, { status: newStatus });
    };


    return (
        <div className="flex flex-1 flex-col h-full">
            <header className="p-4 md:p-6 pb-0">
                <PageHeader title="Plano de Mesas" />
            </header>
            <main className="flex-grow flex flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
                <Tabs value={activeEnvironmentId} onValueChange={setActiveEnvironmentId} className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mt-4 overflow-x-auto custom-scrollbar pb-2">
                        <TabsList>
                            {environments.map(env => (
                                <TabsTrigger key={env.id} value={env.id}>{env.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        <Button size="icon" variant="outline" onClick={addEnvironment}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {environments.map(env => {
                        const stats = getTableStats(env.id);
                        const activeTables = env.tables.filter(t => t.status !== 'Inactiva');
                        const inactiveTables = env.tables.filter(t => t.status === 'Inactiva');

                        return (
                            <TabsContent key={env.id} value={env.id} className="m-0 flex-grow">
                                <Card
                                    className="bg-card flex flex-col h-full relative"
                                >
                                    <CardHeader>
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border rounded-lg p-2 bg-background/50">
                                            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                                                <div className="flex items-center gap-2">
                                                    <Power className="h-5 w-5" />
                                                    <Label htmlFor={`env-status-${env.id}`} className="hidden sm:inline">Estado:</Label>
                                                    <Switch
                                                        id={`env-status-${env.id}`}
                                                        checked={env.status === 'Abierto'}
                                                        onCheckedChange={(checked) => handleStatusChange(env.id, checked)}
                                                    />
                                                    <Badge variant={env.status === 'Abierto' ? 'default' : 'secondary'}>{env.status}</Badge>
                                                </div>
                                                <div className="h-6 border-l mx-2 hidden md:block"></div>
                                                <div className="flex gap-2 flex-wrap justify-center">
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg">{stats.total}</p>
                                                        <p className="text-xs text-muted-foreground">Total</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg text-green-500">{stats.libre}</p>
                                                        <p className="text-xs text-muted-foreground">Libres</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg text-blue-500">{stats.ocupada}</p>
                                                        <p className="text-xs text-muted-foreground">Ocupadas</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg text-purple-500">{stats.reservada}</p>
                                                        <p className="text-xs text-muted-foreground">Reservadas</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg text-red-500">{stats.mantenimiento}</p>
                                                        <p className="text-xs text-muted-foreground">Mantenim.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
                                                {/* Undo/Redo */}
                                                <div className="flex gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={handleUndo} disabled={!canUndo} className="h-8 w-8">
                                                                    <Undo2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={handleRedo} disabled={!canRedo} className="h-8 w-8">
                                                                    <Redo2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                
                                                <Button variant="outline" size="sm" onClick={() => setIsTemplatesDialogOpen(true)} className="w-full sm:w-auto">
                                                    <FolderOpen className="mr-2 h-4 w-4" />
                                                    Plantillas
                                                </Button>
                                                <Button variant="outline" onClick={() => setIsInactiveTablesDialogOpen(true)} size="sm" className="w-full sm:w-auto" disabled={inactiveTables.length === 0}>
                                                    <XSquare className="mr-2 h-4 w-4" />
                                                    Inactivas
                                                </Button>
                                                <Button onClick={addTable} size="sm" className="w-full sm:w-auto">
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Añadir Mesa
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow p-0">
                                        {isMobile ? (
                                            <div className="p-4 space-y-4">
                                                {activeTables.map((table) => {
                                                    const config = statusConfig[table.status];
                                                    return (
                                                        <Dialog key={table.id} open={isDialogOpen && editingTable?.id === table.id} onOpenChange={(open) => {
                                                            if (!open) {
                                                                setIsDialogOpen(false);
                                                                setEditingTable(null);
                                                            }
                                                        }}>
                                                            <DialogTrigger asChild>
                                                                <Card className="p-4" onClick={() => handleDoubleClick(table)}>
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                                                                            <CardDescription className="flex items-center gap-1 mt-1"><Users className="h-4 w-4" /> {table.capacity} personas</CardDescription>
                                                                        </div>
                                                                        <Badge variant={config.badgeVariant}>{table.status}</Badge>
                                                                    </div>
                                                                    <div className="flex justify-end mt-2">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => removeTable(e, table.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </Card>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Editar Mesa {editingTable?.number}</DialogTitle>
                                                                    <DialogDescription>Ajusta los detalles de la mesa.</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="grid gap-6 py-4">
                                                                    <div className="grid grid-cols-2 items-center gap-4">
                                                                        <Label htmlFor="table-number" className="text-left">Número</Label>
                                                                        <Input id="table-number" value={editingTable?.number || ''} onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) || 0 })} />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 items-center gap-4">
                                                                        <Label htmlFor="table-capacity" className="text-left">Capacidad</Label>
                                                                        <Input id="table-capacity" type="number" value={editingTable?.capacity || ''} onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 0 })} />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 items-center gap-4">
                                                                        <Label htmlFor="table-status" className="text-left">Estado</Label>
                                                                        <Select value={editingTable?.status} onValueChange={(value: TableStatus) => setEditingTable({ ...editingTable, status: value })}>
                                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Libre">Libre</SelectItem>
                                                                                <SelectItem value="Ocupada">Ocupada</SelectItem>
                                                                                <SelectItem value="Reservada">Reservada</SelectItem>
                                                                                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                                                                                <SelectItem value="Inactiva">Inactiva</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                                                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => { if (editingTable) openQRDialog(editingTable as Table); }}>
                                                                        <QrCode className="mr-2 h-4 w-4" />Configurar QR
                                                                    </Button>
                                                                    <Button type="submit" onClick={handleSaveChanges} className="w-full sm:w-auto">Guardar Cambios</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative overflow-hidden">
                                                <div
                                                    ref={containerRef}
                                                    className="w-full h-full bg-background dark:bg-zinc-800/20 rounded-lg border border-dashed relative select-none"
                                                >
                                                    <div style={{ transform: `scale(${currentZoom})`, transformOrigin: 'top left', width: '100%', height: '100%' }}>
                                                        {activeTables.length === 0 && (
                                                            <p className="text-center text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                Añade tu primera mesa a este ambiente para empezar a organizarlo.
                                                            </p>
                                                        )}
                                                        {activeTables.map((table) => {
                                                            const config = statusConfig[table.status];
                                                            const isSmall = currentZoom < 0.6 || isTablet;
                                                            return (
                                                                <Dialog key={table.id} open={isDialogOpen && editingTable?.id === table.id} onOpenChange={(open) => {
                                                                    if (!open) {
                                                                        setIsDialogOpen(false);
                                                                        setEditingTable(null);
                                                                    }
                                                                }}>
                                                                    <DialogTrigger asChild>
                                                                        <div
                                                                            onMouseDown={(e) => table.status !== 'Inactiva' && handleMouseDown(e, table.id, 'drag')}
                                                                            onDoubleClick={() => handleDoubleClick(table)}
                                                                            className={cn(
                                                                                "absolute p-2 border-2 rounded-lg shadow-md flex flex-col items-center justify-center transition-all",
                                                                                config.bgColor,
                                                                                table.status !== 'Inactiva' && 'cursor-grab active:cursor-grabbing',
                                                                                activeDragItem?.id === table.id && activeDragItem.type === 'drag' && "opacity-50 z-10",
                                                                                activeDragItem?.id === table.id && activeDragItem.type === 'resize' && "z-10"
                                                                            )}
                                                                            style={{
                                                                                left: table.x,
                                                                                top: table.y,
                                                                                width: table.width,
                                                                                height: table.height
                                                                            }}
                                                                        >
                                                                            <div className={cn("font-bold", config.color, isSmall ? 'text-sm' : 'text-xl')}>Mesa {table.number}</div>
                                                                            <div className={cn("flex items-center mt-1", config.color, isSmall ? 'text-xs' : 'text-sm')}>
                                                                                <Users className={cn("mr-1", isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
                                                                                <span>{table.capacity}p</span>
                                                                            </div>
                                                                            {/* Contador contextual o Badge según estado */}
                                                                            {(() => {
                                                                                const info = getTableCenterInfo(table);
                                                                                if (info && info.value) {
                                                                                    return (
                                                                                        <div className={cn("absolute bottom-1 left-1 md:bottom-2 md:left-2", isSmall && "text-[10px]")}>
                                                                                            <div className={cn("text-xs font-medium", config.color)}>{info.label}</div>
                                                                                            <div className={cn("text-sm font-bold", config.color)}>{info.value}</div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return (
                                                                                    <Badge variant={config.badgeVariant} className={cn("absolute bottom-1 left-1 md:bottom-2 md:left-2", isSmall && "text-[10px] px-1 py-0 h-4")}>{table.status}</Badge>
                                                                                );
                                                                            })()}
                                                                            <div className="absolute top-1 right-1">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-muted-foreground", config.color)}>
                                                                                            <MoreVertical className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent onClick={e => e.stopPropagation()}>
                                                                                        <DropdownMenuItem>
                                                                                            <FileText className="mr-2 h-4 w-4" />
                                                                                            Leer Comanda
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem>
                                                                                            <PrinterIcon className="mr-2 h-4 w-4" />
                                                                                            Reimprimir Comanda
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => openQRDialog(table)}>
                                                                                            <QrCode className="mr-2 h-4 w-4" />
                                                                                            Configurar QR
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => removeTable(e, table.id)}>
                                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                                            Eliminar Mesa
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </div>
                                                                            <div
                                                                                onMouseDown={(e) => handleMouseDown(e, table.id, 'resize')}
                                                                                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary/50 rounded-full border-2 border-background"
                                                                            />
                                                                        </div>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-md">
                                                                        <DialogHeader>
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <DialogTitle>Editar Mesa {editingTable?.number}</DialogTitle>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Ajusta los detalles de la mesa y gestiona su código QR.</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        </DialogHeader>
                                                                        <div className="grid gap-6 py-4">
                                                                            <div className="flex justify-center items-center">
                                                                                <div className="p-4 bg-white rounded-lg">
                                                                                    <QrCode className="w-32 h-32 text-primary" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 items-center gap-4">
                                                                                <Label htmlFor="table-number" className="text-left">Número</Label>
                                                                                <Input id="table-number" value={editingTable?.number || ''} onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) || 0 })} />
                                                                            </div>
                                                                            <div className="grid grid-cols-2 items-center gap-4">
                                                                                <Label htmlFor="table-capacity" className="text-left">Capacidad</Label>
                                                                                <Input id="table-capacity" type="number" value={editingTable?.capacity || ''} onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 0 })} />
                                                                            </div>
                                                                            <div className="grid grid-cols-2 items-center gap-4">
                                                                                <Label htmlFor="table-status" className="text-left">Estado</Label>
                                                                                <Select value={editingTable?.status} onValueChange={(value: TableStatus) => setEditingTable({ ...editingTable, status: value })}>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Selecciona un estado" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="Libre">Libre</SelectItem>
                                                                                        <SelectItem value="Ocupada">Ocupada</SelectItem>
                                                                                        <SelectItem value="Reservada">Reservada</SelectItem>
                                                                                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                                                                                        <SelectItem value="Inactiva">Inactiva</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        </div>
                                                                        <DialogFooter className="gap-2">
                                                                            <Button type="button" variant="outline" onClick={() => { if (editingTable) openQRDialog(editingTable as Table); }}>
                                                                                <QrCode className="mr-2 h-4 w-4" />Configurar QR
                                                                            </Button>
                                                                            <Button type="submit" onClick={handleSaveChanges}>Guardar Cambios</Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-2">
                                                    <Button size="icon" variant="outline" onClick={handleZoomIn}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button size="sm" variant="outline" onClick={resetZoom} className="w-12">
                                                                    {Math.round(currentZoom * 100)}%
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Restablecer zoom</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <Button size="icon" variant="outline" onClick={handleZoomOut}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <Dialog open={isInactiveTablesDialogOpen} onOpenChange={setIsInactiveTablesDialogOpen}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Mesas Inactivas en {env.name}</DialogTitle>
                                                <DialogDescription>
                                                    Estas mesas están ocultas del plano principal. Puedes reactivarlas aquí para que vuelvan al estado de &quot;Mantenimiento&quot;.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="max-h-80 overflow-y-auto p-1 space-y-2">
                                                {inactiveTables.length > 0 ? (
                                                    inactiveTables.map(table => (
                                                        <div key={table.id} className="flex items-center justify-between p-3 border rounded-md">
                                                            <div>
                                                                <p className="font-semibold">Mesa {table.number}</p>
                                                                <p className="text-sm text-muted-foreground">Capacidad: {table.capacity} personas</p>
                                                            </div>
                                                            <Button size="sm" onClick={() => handleReactivateTable(table.id)}>Reactivar</Button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-sm text-muted-foreground py-4">No hay mesas inactivas en este ambiente.</p>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="secondary">Cerrar</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </Card>
                            </TabsContent>
                        )
                    })}
                    {environments.length === 0 && (
                        <Card className="flex items-center justify-center h-48 border-dashed">
                            <p className="text-muted-foreground">No hay ambientes creados. ¡Añade uno para empezar!</p>
                        </Card>
                    )}
                </Tabs>
                
                {/* QR Config Dialog */}
                <QRConfigDialog 
                    open={isQRDialogOpen}
                    onOpenChange={setIsQRDialogOpen}
                    table={qrTable}
                    environmentName={activeEnvironment?.name || ''}
                />
                
                {/* Templates Dialog */}
                <TemplatesDialog
                    open={isTemplatesDialogOpen}
                    onOpenChange={setIsTemplatesDialogOpen}
                    onApplyTemplate={applyTemplate}
                />
            </main>
        </div>
    );
}
