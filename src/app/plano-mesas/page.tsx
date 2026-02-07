
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, QrCode, Trash, Users, Plus, Square, CheckSquare, Clock, AlertTriangle, XSquare, Power, Minus, ZoomIn, MoreVertical, FileText, Printer as PrinterIcon, Undo2, Redo2, Copy, Download, MessageSquare, Settings, Save, FolderOpen, Globe, Activity, MapPin } from 'lucide-react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"
import { Hash } from "lucide-react";
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';

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
    const [qrKey, setQrKey] = React.useState(0); // Para forzar regeneración
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
            <DialogContent className="sm:max-w-xl overflow-hidden border-none shadow-2xl p-6">
                <DialogHeader>
                    <DialogTitle icon={QrCode}>
                        Configurar QR - Mesa {table.number}
                    </DialogTitle>
                    <DialogDescription>
                        Configura el código QR para que los clientes accedan al menú vía WhatsApp.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[55vh] -mx-6">
                    <div className="space-y-6 px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {/* QR Preview Column */}
                            <div className="md:col-span-2 flex flex-col items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl border shadow-sm group/qr relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={qrImageUrl} 
                                        alt={`QR Mesa ${table.number}`} 
                                        width={180} 
                                        height={180}
                                        className="rounded-lg transition-transform group-hover/qr:scale-105 duration-300"
                                    />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <Button variant="outline" size="sm" onClick={handleRegenerate} className="rounded-xl w-full">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Regenerar Firma
                                </Button>
                            </div>
                            
                            {/* Config Column */}
                            <div className="md:col-span-3 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url-base" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                                        URL de Acceso
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 rounded-lg group-focus-within:bg-primary/20 transition-colors">
                                            <Globe className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <Input 
                                            id="url-base"
                                            value={qrConfig.baseUrl}
                                            onChange={(e) => setQrConfig(p => ({ ...p, baseUrl: e.target.value }))}
                                            placeholder="https://mirestaurante.com"
                                            className="pl-10 h-10 rounded-xl"
                                        />
                                    </div>
                                </div>
                                
                                <ConfigToggle
                                    id="include-env"
                                    icon={MapPin}
                                    label="Incluir ambiente"
                                    description="Añade el ambiente a la URL del QR."
                                    iconClassName="text-purple-500"
                                    iconContainerClassName="bg-purple-500/10"
                                    checked={qrConfig.includeEnv}
                                    onCheckedChange={(v) => setQrConfig(p => ({ ...p, includeEnv: v }))}
                                />
                                
                                <div className="space-y-2">
                                    <Label htmlFor="mensaje" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                                        Mensaje de Bienvenida
                                    </Label>
                                    <Textarea
                                        id="mensaje"
                                        value={qrConfig.customMessage}
                                        onChange={(e) => setQrConfig(p => ({ ...p, customMessage: e.target.value }))}
                                        rows={3}
                                        placeholder="¡Hola! Bienvenidos a Camarai..."
                                        className="text-sm rounded-xl resize-none p-3"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* URL Preview */}
                        <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-primary/10 rounded-md">
                                    <FileText className="h-3 w-3 text-primary" />
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">URL Generada para el cliente</p>
                            </div>
                            <p className="text-xs font-mono break-all text-primary/80 leading-relaxed bg-background/50 p-2 rounded-lg border">
                                {getQRUrl()}
                            </p>
                        </div>
                    </div>
                </ScrollArea>
                
                <DialogFooter>
                    <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground max-w-[150px] leading-tight">
                            El QR se actualiza automáticamente al cambiar los parámetros.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={handleCopyLink} className="rounded-xl">
                            <Copy className="mr-2 h-4 w-4" />
                            Enlace
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl">
                            <Download className="mr-2 h-4 w-4" />
                            Imagen
                        </Button>
                        <Button variant="brand" size="sm" onClick={() => { handleDownload(); onOpenChange(false); }} className="rounded-xl px-6">
                            <PrinterIcon className="mr-2 h-4 w-4" />
                            Imprimir QR
                        </Button>
                    </div>
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
                    <DialogTitle icon={FolderOpen}>Plantillas de Plano</DialogTitle>
                    <DialogDescription>Selecciona una plantilla para configurar rápidamente tu ambiente.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {floorPlanTemplates.map(template => (
                        <ConfigItem
                            key={template.id}
                            icon={FolderOpen}
                            label={template.name}
                            description={`${template.description} (${template.tables} mesas)`}
                            onClick={() => onApplyTemplate(template.id)}
                        >
                            <Button variant="ghost" size="sm">
                                Aplicar
                            </Button>
                        </ConfigItem>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}



// Reusable Edit Table Dialog Content Component
function EditTableDialogContent({
    editingTable,
    setEditingTable,
    handleSaveChanges,
    openQRDialog,
    config,
}: {
    editingTable: Partial<Table> | null;
    setEditingTable: (table: Partial<Table> | null) => void;
    handleSaveChanges: () => void;
    openQRDialog: (table: Table) => void;
    config: any;
}) {
    return (
        <DialogContent className="sm:max-w-xl overflow-hidden border-none shadow-2xl p-6">
            <DialogHeader>
                <DialogTitle icon={Settings}>
                    Editar Mesa {editingTable?.number}
                </DialogTitle>
                <DialogDescription>
                    Ajusta los detalles físicos y el estado operativo de la mesa.
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] -mx-6">
                <div className="space-y-6 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* QR Preview Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <QrCode className="h-3 w-3" /> Acceso Digital
                            </h4>
                            <div className="relative group/qr-container">
                                <div className="p-8 bg-white rounded-3xl border shadow-sm flex flex-col items-center justify-center transition-all group-hover/qr-container:bg-slate-50">
                                    <QrCode className="w-24 h-24 text-slate-800" />
                                    <p className="mt-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center">Digital Menu Ready</p>
                                </div>
                                <div className="absolute inset-0 bg-primary/0 group-hover/qr-container:bg-primary/5 rounded-3xl transition-colors pointer-events-none" />
                            </div>
                        </div>

                        {/* Basic Config Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Settings className="h-3 w-3" /> Parámetros
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1.5 px-1">
                                    <Label htmlFor="table-number" className="text-xs font-semibold">Número Identificador</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <Input 
                                            id="table-number" 
                                            type="number"
                                            value={editingTable?.number || ''} 
                                            className="pl-9 h-10 rounded-xl bg-muted/50 focus:bg-background border-none ring-offset-background"
                                            onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) || 0 })} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 px-1">
                                    <Label htmlFor="table-capacity" className="text-xs font-semibold">Capacidad (Comensales)</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <Input 
                                            id="table-capacity" 
                                            type="number" 
                                            value={editingTable?.capacity || ''} 
                                            className="pl-9 h-10 rounded-xl bg-muted/50 focus:bg-background border-none ring-offset-background"
                                            onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 0 })} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Status Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Estado Operativo
                        </h4>
                        <div className="grid gap-3">
                            <ConfigItem
                                icon={config.icon}
                                label="Situación Actual"
                                description="Cambia manualmente el estado de la mesa."
                                iconClassName={config.color.replace('dark:', '')}
                                iconContainerClassName={cn(config.bgColor, "opacity-100 border-none")}
                            >
                                <Select value={editingTable?.status} onValueChange={(value: TableStatus) => setEditingTable({ ...editingTable, status: value })}>
                                    <SelectTrigger className="w-32 h-9 rounded-lg border-none bg-muted/50 group-hover:bg-muted transition-colors">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="Libre" className="rounded-lg">Libre</SelectItem>
                                        <SelectItem value="Ocupada" className="rounded-lg">Ocupada</SelectItem>
                                        <SelectItem value="Reservada" className="rounded-lg">Reservada</SelectItem>
                                        <SelectItem value="Mantenimiento" className="rounded-lg">Mantenimiento</SelectItem>
                                        <SelectItem value="Inactiva" className="rounded-lg">Inactiva</SelectItem>
                                    </SelectContent>
                                </Select>
                            </ConfigItem>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <DialogFooter>
                <div className="hidden sm:block">
                    <p className="text-[10px] text-muted-foreground max-w-[150px] leading-tight text-left">
                        Los cambios se guardarán permanentemente al confirmar.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="ghost" className="flex-1 sm:flex-none rounded-xl" onClick={() => { if (editingTable) openQRDialog(editingTable as Table); }}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Configurar QR
                    </Button>
                    <Button variant="brand" className="flex-1 sm:flex-none rounded-xl px-8" onClick={handleSaveChanges}>
                        Guardar Cambios
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
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

const statusConfig: Record<TableStatus, { color: string; bgColor: string; icon: React.ElementType, badgeVariant: any }> = {
    'Libre': { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100/50 border-green-400 dark:bg-green-900/30 dark:border-green-600', icon: CheckSquare, badgeVariant: 'success' },
    'Ocupada': { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100/50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600', icon: Users, badgeVariant: 'info' },
    'Reservada': { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100/50 border-purple-400 dark:bg-purple-900/30 dark:border-purple-600', icon: Clock, badgeVariant: 'warning' },
    'Mantenimiento': { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100/50 border-red-400 dark:bg-red-900/30 dark:border-red-600', icon: AlertTriangle, badgeVariant: 'danger' },
    'Inactiva': { color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-100/50 border-gray-300 opacity-60 dark:bg-gray-800/30 dark:border-gray-600', icon: XSquare, badgeVariant: 'neutral' },
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
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

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


    if (!isMounted) return null;

    return (
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title="Plano de Mesas" />
            <main className="flex-grow flex flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
                <Tabs value={activeEnvironmentId} onValueChange={setActiveEnvironmentId} className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <TabsList className="inline-flex w-auto shrink-0">
                            {environments.map(env => (
                                <TabsTrigger key={env.id} value={env.id} className="whitespace-nowrap">{env.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        <Button size="icon" variant="outline" onClick={addEnvironment} className="shrink-0 h-9 w-9">
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
                                                    <Badge variant={env.status === 'Abierto' ? 'completed' : 'neutral'}>{env.status}</Badge>
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
                                                                <Card className="p-4 relative overflow-hidden group/mobile-card hover:shadow-lg transition-all duration-300 border shadow-sm hover:border-primary/50 bg-card active:scale-[0.98]" onClick={() => handleDoubleClick(table)}>
                                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                                                    <div className="flex justify-between items-start relative z-10">
                                                                        <div className="flex gap-3">
                                                                            <div className={cn("p-3 rounded-2xl", config.bgColor, "border-none shadow-sm flex items-center justify-center")}>
                                                                                <config.icon className={cn("h-5 w-5", config.color.replace('dark:', ''))} />
                                                                            </div>
                                                                            <div>
                                                                                <CardTitle className="text-lg font-bold tracking-tight">Mesa {table.number}</CardTitle>
                                                                                <CardDescription className="flex items-center gap-1.5 mt-0.5 font-medium text-muted-foreground/80">
                                                                                    <Users className="h-3.5 w-3.5" /> {table.capacity} personas
                                                                                </CardDescription>
                                                                            </div>
                                                                        </div>
                                                                        <Badge variant={config.badgeVariant}>{table.status}</Badge>
                                                                    </div>
                                                                    <div className="flex justify-end mt-4 gap-2 relative z-10">
                                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors bg-muted/20" onClick={(e) => { e.stopPropagation(); openQRDialog(table); }}>
                                                                            <QrCode className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 transition-colors bg-muted/20" onClick={(e) => { e.stopPropagation(); removeTable(e, table.id); }}>
                                                                            <Trash className="h-4 w-4 text-muted-foreground" />
                                                                        </Button>
                                                                    </div>
                                                                </Card>
                                                            </DialogTrigger>
                                                            <EditTableDialogContent 
                                                                editingTable={editingTable}
                                                                setEditingTable={setEditingTable}
                                                                handleSaveChanges={handleSaveChanges}
                                                                openQRDialog={openQRDialog}
                                                                config={config}
                                                            />
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
                                                                                "absolute p-2 border-2 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 group/table",
                                                                                config.bgColor,
                                                                                "backdrop-blur-sm",
                                                                                table.status !== 'Inactiva' && 'cursor-grab active:cursor-grabbing hover:shadow-xl hover:scale-[1.02]',
                                                                                activeDragItem?.id === table.id && activeDragItem.type === 'drag' && "opacity-50 z-50 scale-110",
                                                                                activeDragItem?.id === table.id && activeDragItem.type === 'resize' && "z-50"
                                                                            )}
                                                                            style={{
                                                                                left: table.x,
                                                                                top: table.y,
                                                                                width: table.width,
                                                                                height: table.height
                                                                            }}
                                                                        >
                                                                            {/* Visual embellishment for better feel */}
                                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                                                            
                                                                            <div className={cn("font-bold tracking-tight", config.color, isSmall ? 'text-sm' : 'text-xl')}>
                                                                                Mesa {table.number}
                                                                            </div>
                                                                            <div className={cn("flex items-center mt-1 font-medium", config.color, isSmall ? 'text-[10px]' : 'text-sm')}>
                                                                                <Users className={cn("mr-1", isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
                                                                                <span>{table.capacity}p</span>
                                                                            </div>

                                                                            {/* Contextual Info */}
                                                                            {(() => {
                                                                                const info = getTableCenterInfo(table);
                                                                                if (info && info.value) {
                                                                                    return (
                                                                                        <div className={cn("absolute bottom-2 left-2 right-2", isSmall && "bottom-1")}>
                                                                                            <div className={cn("text-[10px] uppercase tracking-tighter opacity-70 leading-none", config.color)}>{info.label}</div>
                                                                                            <div className={cn("text-xs font-bold leading-none mt-0.5", config.color)} suppressHydrationWarning>{info.value}</div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return (
                                                                                    <Badge 
                                                                                        variant={config.badgeVariant} 
                                                                                        size={isSmall ? "sm" : "default"}
                                                                                        className="absolute bottom-2 left-2"
                                                                                    >
                                                                                        {table.status}
                                                                                    </Badge>
                                                                                );
                                                                            })()}

                                                                            {/* Action Menu */}
                                                                            <div className="absolute top-1 right-1 opacity-0 group-hover/table:opacity-100 transition-opacity">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/5", config.color)}>
                                                                                            <MoreVertical className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4")} />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end" className="w-48 p-1">
                                                                                        <DropdownMenuItem className="rounded-lg py-2">
                                                                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                            <span>Leer Comanda</span>
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem className="rounded-lg py-2">
                                                                                            <PrinterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                            <span>Reimprimir Comanda</span>
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => openQRDialog(table)} className="rounded-lg py-2">
                                                                                            <QrCode className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                            <span>Configurar QR</span>
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem className="rounded-lg py-2" onClick={(e) => removeTable(e, table.id)}>
                                                                                            <Trash className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                            <span>Eliminar Mesa</span>
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </div>

                                                                            {/* Resize Handle */}
                                                                            <div
                                                                                onMouseDown={(e) => handleMouseDown(e, table.id, 'resize')}
                                                                                className="absolute bottom-1 right-1 w-3 h-3 cursor-se-resize bg-black/10 dark:bg-white/10 rounded-full opacity-0 group-hover/table:opacity-100 transition-all hover:bg-primary hover:scale-125"
                                                                            />
                                                                        </div>
                                                                    </DialogTrigger>
                                                                    
                                                                    <EditTableDialogContent 
                                                                        editingTable={editingTable}
                                                                        setEditingTable={setEditingTable}
                                                                        handleSaveChanges={handleSaveChanges}
                                                                        openQRDialog={openQRDialog}
                                                                        config={config}
                                                                    />
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
                                                <DialogTitle icon={Settings}>Mesas Inactivas en {env.name}</DialogTitle>
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
