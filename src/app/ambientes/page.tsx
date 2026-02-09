
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer, Trash, Users, Pencil, Utensils, Activity, Sun, Wine, Coffee, Beer, Building, Plus, Power, Percent, QrCode, Download, Copy, Check, Filter, LayoutGrid, Maximize, FileType } from 'lucide-react';
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';
import { ColorPicker } from '@/components/ui/color-picker';
import { SearchInput } from '@/components/ui/search-input';

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
const availableColors = ['#78A3ED', '#9B6EFD', '#F0768C', '#F7B731', '#4CAF50', '#2196F3'];

/**
 * Componente principal para la página de gestión de ambientes.
 */
export default function AmbientesPage() {
    // Estado local inicializado con mock data
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const [editingEnvironmentId, setEditingEnvironmentId] = React.useState<string | null>(null);
    const [editingName, setEditingName] = React.useState('');
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
    const QR_PER_PAGE = 12;

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
                description: "Debes seleccionar al menos una mesa para regenerar sus códigos QR.",
            });
            return;
        }

        // Update ONLY selected tables' versions
        const newVersions = new Map(qrVersions);
        selectedTables.forEach(tableId => {
            const current = newVersions.get(tableId) || 0;
            newVersions.set(tableId, current + 1);
        });
        setQrVersions(newVersions);

        toast({
            title: "QRs Regenerados",
            description: `Se han actualizado ${selectedTables.size} código${selectedTables.size > 1 ? 's' : ''} QR con una nueva firma de seguridad.`,
        });
    };

    // --- Funciones para manipular el estado local (simulando hook) ---

    // Función auxiliar para generar IDs únicos simples
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
    };

    const removeEnvironment = (id: string) => {
        setEnvironments(environments.filter(env => env.id !== id));
    };

    const updateEnvironment = (id: string, updates: Partial<Environment>) => {
        setEnvironments(environments.map(env =>
            env.id === id ? { ...env, ...updates } : env
        ));
    };


    /**
     * Añade un nuevo ambiente y muestra una notificación.
     */
    const handleAddEnvironment = () => {
        addEnvironment();
        toast({
            title: "Ambiente Creado",
            description: "Se ha creado un nuevo ambiente. ¡Personalízalo a tu gusto!",
        });
    }

    /**
     * Elimina un ambiente y muestra una notificación.
     * @param {string} id - El ID del ambiente a eliminar.
     * @param {string} name - El nombre del ambiente, para la notificación.
     */
    const handleRemoveEnvironment = (id: string, name: string) => {
        removeEnvironment(id);
        toast({
            variant: "destructive",
            title: "Ambiente Eliminado",
            description: `El ambiente "${name}" ha sido eliminado correctamente.`,
        });
    }

    /**
     * Actualiza una o más propiedades de un ambiente.
     * @param {string} envId - El ID del ambiente a actualizar.
     * @param {Partial<Environment>} updates - Un objeto con las propiedades a cambiar.
     */
    const handleUpdateEnvironment = (envId: string, updates: Partial<Environment>) => {
        updateEnvironment(envId, updates);
        const updateKeys = Object.keys(updates);

        if (updateKeys.includes('name') && updates.name) {
            toast({ title: "Nombre Actualizado", description: `El nombre del ambiente se ha cambiado a "${updates.name}".` });
        } else if (updateKeys.includes('status') && updates.status) {
            toast({
                variant: updates.status === 'Cerrado' ? 'destructive' : 'default',
                title: "Estado Actualizado",
                description: `El ambiente ahora está ${updates.status}.`
            });
        } else {
            toast({ title: "Ambiente Actualizado", description: "El icono o color del ambiente ha sido actualizado." });
        }
    }

    // --- Funciones de cálculo para las estadísticas de cada ambiente ---
    const calculateTotalCapacity = (environment: Environment) => {
        return environment.tables.reduce((acc, table) => acc + table.capacity, 0);
    }

    const calculateActiveTables = (environment: Environment) => {
        return environment.tables.filter(table => table.status === 'Ocupada').length;
    }

    const calculateOccupiedCapacity = (environment: Environment) => {
        return environment.tables
            .filter(table => table.status === 'Ocupada')
            .reduce((acc, table) => acc + table.capacity, 0);
    }

    const calculateOccupancyPercentage = (environment: Environment) => {
        const totalCapacity = calculateTotalCapacity(environment);
        if (totalCapacity === 0) return 0;
        const occupiedCapacity = calculateOccupiedCapacity(environment);
        return Math.round((occupiedCapacity / totalCapacity) * 100);
    }

    /**
     * Abre el diálogo de QR para un ambiente.
     * @param {Environment} env - El ambiente seleccionado.
     */
    const openQRDialog = (env: Environment) => {
        setSelectedEnvForQR(env);
        setQrDialogOpen(true);
    };

    /**
     * Genera una URL de QR code usando una API pública
     * @param {string} text - El texto a codificar en el QR.
     */
    const generateQRUrl = (tableId: string, text: string, size: number = 200) => {
        // Using QR Server API (free, no authentication required)
        // Add version to text to "force" a different QR if text is the same
        const version = qrVersions.get(tableId) || 0;
        const textWithVersion = `${text}${version > 0 ? `&v=${version}` : ''}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(textWithVersion)}&format=${qrFormat}`;
    };

    /**
     * Genera el enlace de la carta para una mesa
     * @param {string} envId - ID del ambiente.
     * @param {string} tableNumber - Número de la mesa.
     */
    const getMenuUrl = (envId: string, tableNumber: string) => {
        // In production, this would be your actual menu URL
        return `https://turestaurante.com/carta?ambiente=${envId}&mesa=${tableNumber}`;
    };

    /**
     * Copia el enlace al portapapeles
     */
    const copyToClipboard = async (text: string, tableId: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedTable(tableId);
        setTimeout(() => setCopiedTable(null), 2000);
        toast({
            title: "Enlace copiado",
            description: "El enlace del QR se ha copiado al portapapeles.",
        });
    };

    /**
     * Descarga todos los QR de un ambiente
     */
    const downloadAllQRs = () => {
        if (!selectedEnvForQR) return;
        toast({
            title: "Descargando QRs",
            description: `Preparando ${selectedEnvForQR.tables.length} códigos QR para descargar.`,
        });
        // In production, this would trigger actual downloads
    };

    /**
     * Imprime los QR
     */
    const printQRs = () => {
        toast({
            title: "Impresión iniciada",
            description: "Se han enviado los códigos QR a la impresora.",
        });
        // In production, this would trigger actual printing
    };

    // QR size mapping
    const qrSizeMap = {
        small: 120,
        medium: 200,
        large: 300,
    };

    // --- Manejadores de eventos para la edición del nombre ---
    const handleDoubleClick = (env: Environment) => {
        setEditingEnvironmentId(env.id);
        setEditingName(env.name);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingName(e.target.value);
    }

    const handleUpdateName = (envId: string) => {
        if (editingName.trim()) {
            handleUpdateEnvironment(envId, { name: editingName });
        }
        setEditingEnvironmentId(null);
        setEditingName('');
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, envId: string) => {
        if (e.key === 'Enter') {
            handleUpdateName(envId);
        } else if (e.key === 'Escape') {
            setEditingEnvironmentId(null);
            setEditingName('');
        }
    }

    /**
     * Cambia el estado (Abierto/Cerrado) de un ambiente.
     * @param {string} envId - ID del ambiente.
     * @param {boolean} checked - El nuevo estado del switch.
     */
    const handleStatusChange = (envId: string, checked: boolean) => {
        const newStatus: EnvironmentStatus = checked ? 'Abierto' : 'Cerrado';
        handleUpdateEnvironment(envId, { status: newStatus });
    };

    /**
     * Devuelve la variante de color para el badge de estado.
     * @param {EnvironmentStatus} status - El estado del ambiente.
     */
    const getStatusVariant = (status: EnvironmentStatus) => {
        switch (status) {
            case 'Abierto': return 'success';
            case 'Cerrado': return 'danger';
            default: return 'neutral';
        }
    }

    /**
     * Componente para renderizar un icono dinámicamente a partir de su nombre.
     * @param {{ name: string, [key: string]: any }} props - Propiedades del icono.
     */
    const IconComponent = ({ name, ...props }: { name: string, [key: string]: any }) => {
        const Icon = iconMap[name];
        return Icon ? <Icon {...props} /> : <Utensils {...props} />;
    };

    return (
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title="Gestión de Ambientes" />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {environments.map(env => {
                        const occupancyPercentage = calculateOccupancyPercentage(env);
                        return (
                            <TooltipProvider key={env.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Card className="group flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1" style={{ borderLeft: `4px solid ${env.color}` }}>
                                            <ConfigToggle
                                                id={`status-switch-${env.id}`}
                                                checked={env.status === 'Abierto'}
                                                onCheckedChange={(checked) => handleStatusChange(env.id, checked)}
                                                className="bg-muted/10 border-none border-b rounded-b-none hover:bg-muted/20 p-5 transition-all group/toggle"
                                                color={env.color}
                                                icon={
                                                    <AlertDialog>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button 
                                                                    className="flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                                                >
                                                                    <IconComponent name={env.icon} className="h-5 w-5" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80 p-4" align="start" sideOffset={8}>
                                                                <div className="grid gap-4">
                                                                    <div className="space-y-3">
                                                                        <Label>Personalizar Icono</Label>
                                                                        <div className="grid grid-cols-6 gap-2">
                                                                            {availableIcons.map(iconName => (
                                                                                <Button 
                                                                                    key={iconName} 
                                                                                    variant={env.icon === iconName ? 'default' : 'outline'} 
                                                                                    size="icon" 
                                                                                    className="h-9 w-9 rounded-lg" 
                                                                                    onClick={() => handleUpdateEnvironment(env.id, { icon: iconName })}
                                                                                >
                                                                                    <IconComponent name={iconName} className="h-4 w-4" />
                                                                                </Button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <ColorPicker
                                                                        label="Color de Identidad"
                                                                        value={env.color}
                                                                        onChange={(color) => handleUpdateEnvironment(env.id, { color })}
                                                                    />
                                                                    <div className="pt-2 border-t">
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="w-full justify-start px-2 hover:bg-destructive/10">
                                                                                <Trash className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                <span className="font-semibold">Eliminar este ambiente</span>
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar ambiente?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción es irreversible. Se eliminará "{env.name}" y todas las mesas configuradas en él.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleRemoveEnvironment(env.id, env.name)} className={buttonVariants({ variant: "destructive" })}>Confirmar Eliminación</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                }
                                                label={
                                                    editingEnvironmentId === env.id ? (
                                                        <Input
                                                            type="text"
                                                            value={editingName}
                                                            onChange={handleNameChange}
                                                            onBlur={() => handleUpdateName(env.id)}
                                                            onKeyDown={(e) => handleKeyDown(e, env.id)}
                                                            autoFocus
                                                            className="text-base font-bold leading-none tracking-tight h-8 p-0 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2 group/name" onDoubleClick={() => handleDoubleClick(env)}>
                                                            <span className="text-base font-bold text-foreground cursor-pointer">
                                                                {env.name}
                                                            </span>
                                                            <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover/name:opacity-100 transition-opacity" onClick={() => handleDoubleClick(env)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )
                                                }
                                            />
                                            <CardContent className="flex-grow">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-5 w-5" />
                                                            <span>Aforo total:</span>
                                                        </div>
                                                        <Badge variant="neutral">{calculateTotalCapacity(env)} personas</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Utensils className="h-5 w-5" />
                                                            <span>Mesas:</span>
                                                        </div>
                                                        <Badge variant="neutral">{env.tables.length} mesas</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="h-5 w-5" />
                                                            <span>Mesas activas:</span>
                                                        </div>
                                                        <Badge variant="neutral">{calculateActiveTables(env)} mesas</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Power className="h-5 w-5" />
                                                            <span>Estado:</span>
                                                        </div>
                                                        <Badge variant={getStatusVariant(env.status)}>{env.status}</Badge>
                                                    </div>
                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex items-center justify-between text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <Percent className="h-5 w-5" />
                                                                <span>Aforo Ocupado:</span>
                                                            </div>
                                                            <Badge variant="neutral">{occupancyPercentage}%</Badge>
                                                        </div>
                                                        <Progress value={occupancyPercentage} className="h-2" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex-col items-stretch gap-2">
                                                <Button className="w-full" onClick={() => openQRDialog(env)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    Gestionar QR de Mesas
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Doble clic en el nombre para editar. Clic en el icono para personalizar.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                    <CreateActionCard
                        label="Crear Nuevo Ambiente"
                        onClick={handleAddEnvironment}
                    />
                </div>
            </main>

            {/* QR Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="sm:max-w-3xl lg:max-w-5xl overflow-hidden border-none shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle icon={QrCode}>
                            Códigos QR - {selectedEnvForQR?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Genera y gestiona los códigos QR para las mesas de este ambiente.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEnvForQR && (
                        <>
                            <div className="space-y-4 mb-4">
                                {/* Toolbar: Actions and Selection */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-background/50 p-2 rounded-xl border px-3">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedEnvForQR.tables.length > 0 && selectedTables.size === selectedEnvForQR.tables.length}
                                                onCheckedChange={toggleAllTables}
                                            />
                                            <Label htmlFor="select-all" className="cursor-pointer whitespace-nowrap">
                                                {selectedTables.size === 0 ? "Seleccionar Todos" : `${selectedTables.size} Seleccionados`}
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl h-9"
                                            onClick={regenerateQR}
                                            disabled={selectedTables.size === 0}
                                        >
                                            <Activity className="mr-2 h-4 w-4" />
                                            Regenerar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl h-9"
                                            onClick={downloadAllQRs}
                                            disabled={selectedTables.size === 0}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-xl h-9 px-4"
                                            onClick={printQRs}
                                            disabled={selectedTables.size === 0}
                                            variant="brand"
                                        >
                                            <Printer className="mr-2 h-4 w-4" />
                                            Imprimir QRs
                                        </Button>
                                    </div>
                                </div>

                                {/* Configuration and Search Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <ConfigItem
                                        icon={Maximize}
                                        label="Tamaño"
                                        iconClassName="text-blue-500"
                                        iconContainerClassName="bg-blue-500/10 group-hover:bg-blue-500/20"
                                    >
                                        <Select value={qrSize} onValueChange={(v) => setQrSize(v as any)}>
                                            <SelectTrigger className="w-[100px] h-8 border-none bg-muted/50 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">Pequeño</SelectItem>
                                                <SelectItem value="medium">Mediano</SelectItem>
                                                <SelectItem value="large">Grande</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </ConfigItem>

                                    <ConfigItem
                                        icon={FileType}
                                        label="Formato"
                                        iconClassName="text-amber-500"
                                        iconContainerClassName="bg-amber-500/10 group-hover:bg-amber-500/20"
                                    >
                                        <Select value={qrFormat} onValueChange={(v) => setQrFormat(v as any)}>
                                            <SelectTrigger className="w-[80px] h-8 border-none bg-muted/50 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="png">PNG</SelectItem>
                                                <SelectItem value="svg">SVG</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </ConfigItem>

                                    <SearchInput
                                        placeholder="Buscar mesa..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentQRPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[45vh] -mx-6">
                                <div className="px-6 py-4">
                                {(() => {
                                    // Filter tables by search query
                                    const filteredTables = selectedEnvForQR.tables.filter(t =>
                                        String(t.number).includes(searchQuery)
                                    );

                                    // Paginate filtered results
                                    const totalPages = Math.ceil(filteredTables.length / QR_PER_PAGE);
                                    const paginatedTables = filteredTables.slice(
                                        (currentQRPage - 1) * QR_PER_PAGE,
                                        currentQRPage * QR_PER_PAGE
                                    );

                                    return paginatedTables.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {paginatedTables.map(table => {
                                                    const tableNumber = String(table.number);
                                                    const tableId = String(table.id);
                                                    const menuUrl = getMenuUrl(selectedEnvForQR.id, tableNumber);
                                                    const qrUrl = generateQRUrl(tableId, menuUrl, qrSizeMap[qrSize]);
                                                    const isSelected = selectedTables.has(tableId);
                                                    
                                                    return (
                                                        <Card key={tableId} className={cn(
                                                            "group overflow-hidden transition-all duration-300 rounded-2xl border-muted hover:border-primary/50 hover:shadow-lg", 
                                                            isSelected && "ring-2 ring-primary bg-primary/5 border-primary/20"
                                                        )}>
                                                            <div className="p-3">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleTableSelection(tableId)}
                                                                            className="rounded-md"
                                                                        />
                                                                        <span className="text-sm font-bold">Mesa {tableNumber}</span>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">
                                                                        {table.capacity}p
                                                                    </Badge>
                                                                </div>
                                                                
                                                                <div className="relative group/qr bg-white p-3 rounded-xl border shadow-sm transition-all hover:shadow-md mb-3 flex items-center justify-center aspect-square">
                                                                    <img
                                                                        src={qrUrl}
                                                                        alt={`QR Mesa ${tableNumber}`}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                                                                        <Button 
                                                                            variant="secondary" 
                                                                            size="icon" 
                                                                            className="h-9 w-9 bg-white"
                                                                            onClick={() => window.open(qrUrl, '_blank')}
                                                                        >
                                                                            <Maximize className="h-4 w-4 text-primary" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 text-[10px] font-semibold bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors"
                                                                        onClick={() => copyToClipboard(menuUrl, tableId)}
                                                                    >
                                                                        {copiedTable === tableId ? (
                                                                            <><Check className="h-3 w-3 mr-1" /> OK</>
                                                                        ) : (
                                                                            <><Copy className="h-3 w-3 mr-1" /> Link</>
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 text-[10px] font-semibold bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors"
                                                                        onClick={() => window.open(qrUrl, '_blank')}
                                                                    >
                                                                        <Download className="h-3 w-3 mr-1" />
                                                                        Img
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Pagination Controls */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentQRPage === 1}
                                                        onClick={() => setCurrentQRPage(p => p - 1)}
                                                        className="rounded-xl h-9"
                                                    >
                                                        Anterior
                                                    </Button>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-semibold">Página</span>
                                                        <Badge variant="secondary" className="h-6 min-w-[24px] flex items-center justify-center font-bold">
                                                            {currentQRPage}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground font-medium">de {totalPages}</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentQRPage === totalPages}
                                                        onClick={() => setCurrentQRPage(p => p + 1)}
                                                        className="rounded-xl h-9"
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="p-6 bg-muted/30 rounded-full mb-4">
                                                <QrCode className="h-10 w-10 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">
                                                {searchQuery ? 'No se encontraron mesas que coincidan' : 'No hay mesas configuradas aún.'}
                                            </p>
                                            {!searchQuery && (
                                                <p className="text-sm text-muted-foreground/60 max-w-[250px] mt-1">
                                                    Importa o crea mesas en el plano para generar sus códigos.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                                </div>
                            </ScrollArea>
                        </>
                    )}

                    <DialogFooter>
                        <p className="text-xs text-muted-foreground">Selecciona varias mesas para acciones en lote.</p>
                        <div>
                            <Button variant="ghost" onClick={() => setQrDialogOpen(false)} className="rounded-xl">
                                Cerrar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
