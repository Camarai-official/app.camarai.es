'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer, Trash, Users, Pencil, Utensils, Activity, Sun, Wine, Coffee, Beer, Building, Plus, Power, Percent, QrCode, Download, Copy, Check, Filter, LayoutGrid, Maximize, FileType, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockEnvironments } from '@/data/mock-data';
import type { Environment, EnvironmentStatus } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { PageContent } from '@/components/layout/page-content';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';
import { ColorPicker } from '@/components/ui/color-picker';


/**
 * @fileoverview Página para la gestión de ambientes del restaurante (ej. Salón, Terraza).
 * ✅ Versión desacoplada: Utiliza mock data y gestión de estado local.
 */


// Mapeo de iconos para una renderización dinámica.
const iconMap: { [key: string]: React.ElementType } = {
    Utensils,
    Wine,
    Coffee,
    Beer,
    Sun,
    Building,
    Users,
    Activity,
    PlusCircle,
    Printer,
    Trash,
    Pencil,
    Percent
};

const availableIcons = ['Utensils', 'Wine', 'Coffee', 'Beer', 'Sun', 'Building'];
const availableColors = ['blue-400', 'violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];

import { ActionTile } from '@/components/ui/action-tile';
import { EnvironmentCard } from '@/components/ui/environment-card';

/**
 * @fileoverview Página para la gestión de ambientes del restaurante (ej. Salón, Terraza).
 * ✅ Versión desacoplada: Utiliza mock data y gestión de estado local.
 */

export default function AmbientesPage() {
    // Estado local inicializado con mock data
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const { toast } = useToast();

    // QR Dialog state
    const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
    const [selectedEnvForQR, setSelectedEnvForQR] = React.useState<Environment | null>(null);
    const [qrFormat, setQrFormat] = React.useState<'png' | 'svg'>('png');
    const [qrSize, setQrSize] = React.useState<'small' | 'medium' | 'large'>('medium');
    const [copiedTable, setCopiedTable] = React.useState<string | null>(null);
    const [selectedTables, setSelectedTables] = React.useState<Set<string>>(new Set());
    const [qrVersions, setQrVersions] = React.useState<Map<string, number>>(new Map());
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentQRPage, setCurrentQRPage] = React.useState(1);
    const QR_PER_PAGE = 8;

    const toggleTableSelection = (tableId: string) => {
        const newSelection = new Set(selectedTables);
        if (newSelection.has(tableId)) {
            newSelection.delete(tableId);
        } else {
            newSelection.add(tableId);
        }
        setSelectedTables(newSelection);
    };

    const toggleAllTables = () => {
        if (!selectedEnvForQR) return;
        if (selectedTables.size === selectedEnvForQR.tables.length) {
            setSelectedTables(new Set());
        } else {
            setSelectedTables(new Set(selectedEnvForQR.tables.map(t => String(t.id))));
        }
    };

    const regenerateQR = () => {
        if (selectedTables.size === 0) {
            toast({
                variant: "destructive",
                title: "Selección requerida",
                description: "Debes seleccionar al menos una mesa para regenerar sus códigos QR." });
            return;
        }

        const newVersions = new Map(qrVersions);
        selectedTables.forEach(tableId => {
            const current = newVersions.get(tableId) || 0;
            newVersions.set(tableId, current + 1);
        });
        setQrVersions(newVersions);

        toast({
            title: "QRs Regenerados",
            description: `Se han actualizado ${selectedTables.size} código${selectedTables.size > 1 ? 's' : ''} QR con una nueva firma de seguridad.` });
    };

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addEnvironment = () => {
        const newEnv: Environment = {
            id: `env-${generateId()}`,
            name: 'Nuevo Ambiente',
            tables: [],
            status: 'Cerrado',
            icon: 'Building',
            color: '#78A3ED'
        };
        setEnvironments([...environments, newEnv]);
        toast({
            title: "Ambiente Creado",
            description: "Se ha creado un nuevo ambiente. ¡Personalízalo a tu gusto!" });
    };

    const removeEnvironment = (id: string, name: string) => {
        setEnvironments(environments.filter(env => env.id !== id));
        toast({
            variant: "destructive",
            title: "Ambiente Eliminado",
            description: `El ambiente "${name}" ha sido eliminado correctamente.` });
    };

    const updateEnvironment = (id: string, updates: Partial<Environment>) => {
        setEnvironments(environments.map(env =>
            env.id === id ? { ...env, ...updates } : env
        ));
    };

    const calculateStats = (environment: Environment) => {
        const totalCapacity = environment.tables.reduce((acc, table) => acc + table.capacity, 0);
        const activeTables = environment.tables.filter(table => table.status === 'Ocupada').length;
        const occupiedCapacity = environment.tables
            .filter(table => table.status === 'Ocupada')
            .reduce((acc, table) => acc + table.capacity, 0);
        const occupancyPercentage = totalCapacity === 0 ? 0 : Math.round((occupiedCapacity / totalCapacity) * 100);
        
        return { totalCapacity, activeTables, occupancyPercentage };
    }

    const openQRDialog = (env: Environment) => {
        setSelectedEnvForQR(env);
        setQrDialogOpen(true);
        setSelectedTables(new Set()); // Reset selection when opening
    };

    const generateQRUrl = (tableId: string, text: string, size: number = 200) => {
        const version = qrVersions.get(tableId) || 0;
        const textWithVersion = `${text}${version > 0 ? `&v=${version}` : ''}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(textWithVersion)}&format=${qrFormat}`;
    };

    const getMenuUrl = (envId: string, tableNumber: string) => {
        return `https://camarai.app/m/${envId}/${tableNumber}`;
    };

    const copyToClipboard = async (text: string, tableId: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedTable(tableId);
        setTimeout(() => setCopiedTable(null), 2000);
        toast({
            title: "Enlace copiado",
            description: "El enlace del QR se ha copiado al portapapeles." });
    };

    const downloadAllQRs = () => {
        if (!selectedEnvForQR) return;
        toast({
            title: "Descargando QRs",
            description: `Preparando ${selectedTables.size || selectedEnvForQR.tables.length} códigos QR para descargar.` });
    };

    const printQRs = () => {
        toast({
            title: "Impresión iniciada",
            description: "Se han enviado los códigos QR a la impresora." });
    };

    const qrSizeMap = { small: 120, medium: 200, large: 300 };

    return (
        <div className="flex flex-1 flex-col h-full bg-background/50">
            <PageHeader title="Gestión de Ambientes" />
            <PageContent>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {environments.map(env => (
                        <EnvironmentCard 
                            key={env.id}
                            env={env}
                            onUpdate={updateEnvironment}
                            onRemove={removeEnvironment}
                            onOpenQR={openQRDialog}
                            calculateStats={calculateStats}
                        />
                    ))}
                    <div className="h-[420px]">
                      <CreateActionCard
                          label="Crear Nuevo Ambiente"
                          onClick={addEnvironment}
                          className="h-full border-dashed border-2 bg-card transition-all rounded-xl"
                      />
                    </div>
                </div>
            </PageContent>

            {/* QR Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader
                        flush
                        icon={QrCode}
                        title={`Códigos QR: ${selectedEnvForQR?.name}`}
                        description="Personaliza y descarga los accesos para tus mesas."
                    />

                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-6 border-b border-border/50 bg-muted/10 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-2 bg-background p-1.5 px-3 rounded-2xl border shadow-sm">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedEnvForQR?.tables.length ? selectedTables.size === selectedEnvForQR.tables.length : false}
                                            onCheckedChange={toggleAllTables}
                                        />
                                        <Label htmlFor="select-all" className="text-xs font-bold cursor-pointer">
                                            {selectedTables.size === 0 ? "Seleccionar Todos" : `${selectedTables.size} seleccionados`}
                                        </Label>
                                   </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={regenerateQR} disabled={selectedTables.size === 0}>
                                        <Activity className="mr-2 h-4 w-4" /> Regenerar
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={downloadAllQRs} disabled={selectedTables.size === 0}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </Button>
                                    <Button size="sm" className="rounded-xl h-9 px-4 font-bold" onClick={printQRs} disabled={selectedTables.size === 0}>
                                        <Printer className="mr-2 h-4 w-4" /> Imprimir lote
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <ActionTile
                                    title="Tamaño QR"
                                    icon={Maximize}
                                    iconColor="blue-500"
                                    rightContentType="select"
                                    selectValue={qrSize}
                                    onSelectChange={(v) => setQrSize(v as any)}
                                    selectOptions={[
                                        { value: 'small', label: 'Pequeño' },
                                        { value: 'medium', label: 'Mediano' },
                                        { value: 'large', label: 'Grande' }
                                    ]}
                                    className="border-none bg-background shadow-sm hover:bg-background"
                                />
                                <ActionTile
                                    title="Formato"
                                    icon={FileType}
                                    iconColor="orange-500"
                                    rightContentType="select"
                                    selectValue={qrFormat}
                                    onSelectChange={(v) => setQrFormat(v as any)}
                                    selectOptions={[
                                        { value: 'png', label: 'PNG' },
                                        { value: 'svg', label: 'SVG' }
                                    ]}
                                    className="border-none bg-background shadow-sm hover:bg-background"
                                />
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Buscar por Nº de mesa..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentQRPage(1);
                                        }}
                                        className="pl-10 h-10 rounded-2xl border-none bg-background shadow-sm focus-visible:ring-1 ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 max-h-[50vh]">
                            <div className="p-6">
                            {(() => {
                                if (!selectedEnvForQR) return null;
                                const filteredTables = selectedEnvForQR.tables.filter(t => String(t.number).includes(searchQuery));
                                const totalPages = Math.ceil(filteredTables.length / QR_PER_PAGE);
                                const paginatedTables = filteredTables.slice((currentQRPage-1)*QR_PER_PAGE, currentQRPage*QR_PER_PAGE);

                                if (paginatedTables.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                                            <QrCode className="h-12 w-12 mb-4" />
                                            <p className="font-bold">No se encontraron mesas</p>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {paginatedTables.map(table => {
                                                const tid = String(table.id);
                                                const menuUrl = getMenuUrl(selectedEnvForQR.id, String(table.number));
                                                const qrUrl = generateQRUrl(tid, menuUrl, qrSizeMap[qrSize]);
                                                const isSelected = selectedTables.has(tid);

                                                return (
                                                    <Card key={tid} className={cn(
                                                        "group relative overflow-hidden transition-all duration-300 rounded-3xl border-2 border-muted/50 bg-muted/10 hover:border-primary/40",
                                                        isSelected && "border-primary bg-primary/5 ring-4 ring-primary/10"
                                                    )}>
                                                        <div className="p-3 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleTableSelection(tid)} />
                                                                    <span className="text-xs font-black uppercase tracking-wide">Mesa {table.number}</span>
                                                                </div>
                                                                <Badge variant="neutral" className="text-[10px] px-1.5">{table.capacity}p</Badge>
                                                            </div>
                                                            
                                                            <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-border/50 group/img aspect-square flex items-center justify-center">
                                                                <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                                                                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-lg bg-white" onClick={() => window.open(qrUrl, '_blank')}>
                                                                        <Maximize className="h-3.5 w-3.5 text-primary" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold rounded-xl bg-background" onClick={() => copyToClipboard(menuUrl, tid)}>
                                                                    {copiedTable === tid ? <><Check className="h-3 w-3 mr-1" /> Copiado</> : <><LinkIcon className="h-3 w-3 mr-1" /> Enlace</>}
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold rounded-xl bg-background" onClick={() => window.open(qrUrl, '_blank')}>
                                                                    <Download className="h-3 w-3 mr-1" /> Imagen
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-8">
                                                <Button variant="ghost" size="sm" disabled={currentQRPage === 1} onClick={() => setCurrentQRPage(p => p - 1)} className="rounded-xl">Anterior</Button>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-muted-foreground">Página</span>
                                                    <Badge className="font-black py-0 h-6 px-2">{currentQRPage}</Badge>
                                                    <span className="text-xs font-bold text-muted-foreground">de {totalPages}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" disabled={currentQRPage === totalPages} onClick={() => setCurrentQRPage(p => p + 1)} className="rounded-xl">Siguiente</Button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter flush hint="Los cambios en la configuración visual se aplican instantáneamente.">
                        <Button variant="ghost" onClick={() => setQrDialogOpen(false)} className="rounded-xl font-bold">He terminado</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Re-using types and helpers from local context
import { Link as LinkIcon } from 'lucide-react';


