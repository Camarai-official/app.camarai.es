'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
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
    AlertDialogTrigger } from "@/components/dialogs/global-alert-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';
import { ColorPicker } from '@/components/ui/color-picker';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { QRManagementDialog } from '@/components/dialogs/ambientes-qr-dialog';


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
import { Separator } from '@/components/ui/separator';

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


    const regenerateQR = (selectedTables: Set<string>) => {
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
        const totalTables = environment.tables.length;
        const totalCapacity = environment.tables.reduce((acc, table) => acc + table.capacity, 0);
        const occupiedTables = environment.tables.filter(table => table.status === 'Ocupada').length;
        const occupiedCapacity = environment.tables
            .filter(table => table.status === 'Ocupada')
            .reduce((acc, table) => acc + table.capacity, 0);
        const occupancyPercentage = totalCapacity === 0 ? 0 : Math.round((occupiedCapacity / totalCapacity) * 100);
        
        return { totalTables, totalCapacity, occupiedTables, occupiedCapacity, occupancyPercentage };
    }

    const openQRDialog = (env: Environment) => {
        setSelectedEnvForQR(env);
        setQrDialogOpen(true);
    };


    const downloadAllQRs = (selectedTables: Set<string>) => {
        toast({
            title: "Descargando QRs",
            description: `Preparando ${selectedTables.size} códigos QR para descargar.` });
    };

    const printQRs = (selectedTables: Set<string>) => {
        toast({
            title: "Impresión iniciada",
            description: `Se han enviado ${selectedTables.size} códigos QR a la impresora.` });
    };

    const qrSizeMap = { small: 120, medium: 200, large: 300 };

    return (
    <PageContainer className="bg-background/50">
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

            <QRManagementDialog 
                open={qrDialogOpen}
                onOpenChange={setQrDialogOpen}
                selectedEnv={selectedEnvForQR}
                qrFormat={qrFormat}
                setQrFormat={setQrFormat}
                qrSize={qrSize}
                setQrSize={setQrSize}
                onRegenerate={regenerateQR}
                onDownload={downloadAllQRs}
                onPrint={printQRs}
            />
        </PageContainer>
    );
}

// Re-using types and helpers from local context
import { Link as LinkIcon } from 'lucide-react';


