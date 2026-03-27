'use client';
import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer, Trash, Users, Pencil, Utensils, Activity, Sun, Wine, Coffee, Beer, Building, Power, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Environment } from '@/types/environments';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { QRManagementDialog } from '@/components/dialogs/ambientes-qr-dialog';

// Convex imports
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

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
    const { toast } = useToast();
    const router = useRouter();

    // ID del establecimiento - TODO: Obtener del contexto de autenticación o parámetros de ruta
    const establishmentId = "m57fhe9vh21knfnmb05mge5vx983n95m" as any;

    // Datos de Convex
    const environmentsData = useQuery(api.environments.getEnvironmentsByEstablishment, { establishmentId });

    // Mutations de Convex
    const createEnvironment = useMutation(api.environments.createEnvironment);
    const updateEnvironmentMutation = useMutation(api.environments.updateEnvironment);
    const deleteEnvironmentMutation = useMutation(api.environments.deleteEnvironment);

    // QR Dialog state
    const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
    const [selectedEnvForQR, setSelectedEnvForQR] = React.useState<Environment | null>(null);
    const [qrFormat, setQrFormat] = React.useState<'png' | 'svg'>('png');
    const [qrSize, setQrSize] = React.useState<'small' | 'medium' | 'large'>('medium');

    // Convertir datos de Convex al formato esperado por el componente
    const environments = React.useMemo(() => {
        if (!environmentsData) return [];
        return environmentsData.map(env => ({
            id: env.id,
            name: env.name,
            status: env.status as "Abierto" | "Cerrado",
            icon: env.icon,
            color: env.color,
            tables: env.tables.map(table => ({
                id: table.id,
                number: table.number,
                capacity: table.capacity,
                status: table.status as any,
                x: table.x,
                y: table.y,
                width: table.width,
                height: table.height,
                rotation: table.rotation || 0,
                shape: table.shape as any,
                chairs: table.chairs,
            })),
        }));
    }, [environmentsData]);

    const regenerateQR = (selectedTables: Set<string>) => {
        toast({
            title: "QRs Regenerados",
            description: `Se han actualizado ${selectedTables.size} código${selectedTables.size > 1 ? 's' : ''} QR con una nueva firma de seguridad.` });
    };

    const addEnvironment = async () => {
        try {
            await createEnvironment({
                establishmentId,
                name: 'Nuevo Ambiente',
                icon: 'Building',
                color: '#78A3ED',
                status: 'inactive',
            });
            toast({
                title: "Ambiente Creado",
                description: "Se ha creado un nuevo ambiente. ¡Personalízalo a tu gusto!" });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear el ambiente. Inténtalo de nuevo.",
                variant: "destructive"
            });
        }
    };

    const removeEnvironment = async (id: string, name: string) => {
        try {
            await deleteEnvironmentMutation({ environmentId: id as any });
            toast({
                variant: "destructive",
                title: "Ambiente Eliminado",
                description: `El ambiente "${name}" ha sido eliminado correctamente.` });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el ambiente.",
                variant: "destructive"
            });
        }
    };

    const updateEnvironment = async (id: string, updates: Partial<Environment>) => {
        try {
            const updateData: any = { environmentId: id as any };
            
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.icon !== undefined) updateData.icon = updates.icon;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.status !== undefined) {
                // Mapear status de UI a Convex
                updateData.status = updates.status === 'Abierto' ? 'active' : 'inactive';
            }
            
            await updateEnvironmentMutation(updateData);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar el ambiente.",
                variant: "destructive"
            });
        }
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
