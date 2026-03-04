'use client';
import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer, Trash, Users, Pencil, Utensils, Activity, Sun, Wine, Coffee, Beer, Building, Power, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockEnvironments } from '@/data/mock-data';
import type { Environment } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { CreateActionCard } from '@/components/widgets/create-action-card';
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
import { EnvironmentCard } from '@/components/ui/ambiente-card';

/**
 * @fileoverview Página para la gestión de ambientes del restaurante (ej. Salón, Terraza).
 * ✅ Versión desacoplada: Utiliza mock data y gestión de estado local.
 */

export default function AmbientesPage() {
    // Estado local inicializado con mock data
    const [environments, setEnvironments] = React.useState<Environment[]>(mockEnvironments);
    const { toast } = useToast();
    const router = useRouter();

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

    const handleViewPlan = (envId: string) => {
        router.push(`/plano-mesas?envId=${envId}`);
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
                            onViewPlan={handleViewPlan}
                        />
                    ))}
                    <div className="h-[230px]">
                    <CreateActionCard
                        label="Crear Nuevo Ambiente"
                        onClick={addEnvironment}
                        className="h-56"
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
