'use client';
import * as React from 'react';
import type { Environment } from '@/types/environments';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEstablishments } from '@/hooks/useEstablishments';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { QRManagementDialog } from '@/components/dialogs/ambientes-qr-dialog';
import { EnvironmentCard } from '@/components/ui/ambiente-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';

// Convex imports
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export default function AmbientesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { activeEstablishment } = useEstablishments();

    // Datos de Convex
    const environmentsData = useQuery(
        api.environments.getEnvironmentsByEstablishment, 
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
    );

    // Mutations de Convex
    const createEnvironment = useMutation(api.environments.createEnvironment);
    const updateEnvironmentMutation = useMutation(api.environments.updateEnvironment);
    const deleteEnvironmentMutation = useMutation(api.environments.deleteEnvironment);

    // QR Dialog state
    const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
    const [selectedEnvForQR, setSelectedEnvForQR] = React.useState<Environment | null>(null);
    const [qrFormat, setQrFormat] = React.useState<'png' | 'svg'>('png');
    const [qrSize, setQrSize] = React.useState<'small' | 'medium' | 'large'>('medium');

    // Filtros y ordenamiento
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
    const [sortOrder, setSortOrder] = React.useState<'none' | 'asc' | 'desc'>('none');
    const [selectedManualEnvIds, setSelectedManualEnvIds] = React.useState<string[]>([]);

    // Convertir datos de Convex al formato esperado por el componente
    const environments = React.useMemo(() => {
        if (!environmentsData) return [];
        return environmentsData.map(env => ({
            id: env.id,
            name: env.name,
            capacity: env.capacity,
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

    // Opciones para el MultiSelect
    const environmentOptions: MultiSelectOption[] = React.useMemo(() => {
        return environments.map(env => ({
            value: env.id,
            label: env.name
        }));
    }, [environments]);

    // Aplicar filtros y ordenamiento
    const filteredAndSortedEnvironments = React.useMemo(() => {
        let result = [...environments];
        
        // Filtro por estado
        if (statusFilter === 'active') {
            result = result.filter(env => env.status === 'Abierto');
        } else if (statusFilter === 'inactive') {
            result = result.filter(env => env.status === 'Cerrado');
        }
        
        // Filtro por selección manual (si hay selección, mostrar solo esos)
        if (selectedManualEnvIds.length > 0) {
            result = result.filter(env => selectedManualEnvIds.includes(env.id));
        }
        
        // Ordenamiento por ocupación
        if (sortOrder !== 'none') {
            result.sort((a, b) => {
                const statsA = calculateStats(a);
                const statsB = calculateStats(b);
                return sortOrder === 'desc' 
                    ? statsB.occupancyPercentage - statsA.occupancyPercentage
                    : statsA.occupancyPercentage - statsB.occupancyPercentage;
            });
        }
        
        return result;
    }, [environments, statusFilter, sortOrder, selectedManualEnvIds]);

    const addEnvironment = async () => {
        if (!activeEstablishment?.id) {
            toast({
                title: "Error",
                description: "No se encontró el establecimiento activo.",
                variant: "destructive"
            });
            return;
        }

        try {
            await createEnvironment({
                establishmentId: activeEstablishment.id,
                name: 'Nuevo Ambiente',
                icon: 'Building',
                color: '#78A3ED',
                status: 'inactive',
            });
            toast({
                title: "Ambiente Creado",
                description: "Se ha creado un nuevo ambiente. ¡Personalízalo a tu gusto!" 
            });
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
            await deleteEnvironmentMutation({ environmentId: id as Id<"environments"> });
            toast({
                variant: "destructive",
                title: "Ambiente Eliminado",
                description: `El ambiente "${name}" ha sido eliminado correctamente.` 
            });
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
            const updateData: {
                environmentId: Id<"environments">;
                name?: string;
                icon?: string;
                color?: string;
                capacity?: number;
                status?: "active" | "inactive" | "maintenance";
            } = { environmentId: id as Id<"environments"> };
            
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.icon !== undefined) updateData.icon = updates.icon;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
            if (updates.status !== undefined) {
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
    };

    const openQRDialog = (env: Environment) => {
        setSelectedEnvForQR(env);
        setQrDialogOpen(true);
    };

    const handleViewPlan = (envId: string) => {
        router.push(`/plano-mesas?envId=${envId}`);
    };

    if (!activeEstablishment) {
        return (
            <PageContainer className="bg-background/50">
                <PageHeader title="Gestión de Ambientes" />
                <PageContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Cargando establecimiento o no se encontró ninguno...</div>
                    </div>
                </PageContent>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="bg-background/50">
            <PageHeader 
                title="Gestión de Ambientes" 
                subtitle="Configura las zonas físicas y los códigos QR de tu restaurante."
            />
            <PageContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
                    <div className="flex flex-wrap gap-3">
                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger width="md">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los ambientes</SelectItem>
                                <SelectItem value="active">Solo activos</SelectItem>
                                <SelectItem value="inactive">Solo inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                            <SelectTrigger width="md">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin ordenar</SelectItem>
                                <SelectItem value="desc">Mayor ocupación</SelectItem>
                                <SelectItem value="asc">Menor ocupación</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="w-[240px]">
                            <MultiSelect
                                options={environmentOptions}
                                selected={selectedManualEnvIds}
                                onChange={setSelectedManualEnvIds}
                                placeholder="Filtrar por ambientes..."
                            />
                        </div>
                    </div>

                    {selectedManualEnvIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Mostrando {selectedManualEnvIds.length} ambiente{selectedManualEnvIds.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredAndSortedEnvironments.map(env => (
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
                establishmentLogo={activeEstablishment.image}
                establishmentName={activeEstablishment.name}
            />
        </PageContainer>
    );
}
