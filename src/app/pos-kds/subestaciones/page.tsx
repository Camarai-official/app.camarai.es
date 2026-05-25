'use client';

import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useEstablishments } from '@/hooks/useEstablishments';

import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash, Edit, Settings } from 'lucide-react';

import { SubestacionEditDialog } from '@/components/dialogs/subestacion-edit-dialog';

export default function SubestacionesPage() {
  const { toast } = useToast();
  const { activeEstablishment } = useEstablishments();
  const [selectedStation, setSelectedStation] = React.useState<any>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Queries
  const stations = useQuery(
    api.kds.listKitchenStations,
    activeEstablishment?.id
      ? { establishmentId: activeEstablishment.id as Id<"establishments"> }
      : "skip"
  );

  const rules = useQuery(
    api.kds.listRoutingRules,
    activeEstablishment?.id
      ? { establishmentId: activeEstablishment.id as Id<"establishments"> }
      : "skip"
  );

  const categories = useQuery(
    api.categories.getCategories,
    activeEstablishment?.id
      ? { establishmentId: activeEstablishment.id as Id<"establishments"> }
      : "skip"
  );

  const products = useQuery(
    api.products.getProducts,
    activeEstablishment?.id
      ? { establishmentId: activeEstablishment.id as Id<"establishments"> }
      : "skip"
  );

  // Mutations
  const createStation = useMutation(api.kds.createKitchenStation);
  const deleteStation = useMutation(api.kds.deleteKitchenStation);
  const updateStationMutation = useMutation(api.kds.updateKitchenStation);
  const createRule = useMutation(api.kds.createRoutingRule);
  const deleteRule = useMutation(api.kds.deleteRoutingRule);

  const handleAddStation = async () => {
    if (!activeEstablishment?.id) return;
    try {
      await createStation({
        establishmentId: activeEstablishment.id,
        name: "Nueva Subestación",
        description: "Descripción de la subestación",
        display_order: (stations?.length || 0) + 1,
        preparation_types: [],
        active: true,
      });
      toast({ title: "Subestación creada", description: "La subestación ha sido creada correctamente." });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo crear la subestación", variant: "destructive" });
    }
  };

  const handleDeleteStation = async (stationId: Id<"kitchen_stations">) => {
    try {
      await deleteStation({ stationId });
      toast({ title: "Subestación eliminada", description: "La subestación ha sido eliminada." });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo eliminar la subestación", variant: "destructive" });
    }
  };

  const handleOpenEdit = (station: any) => {
    setSelectedStation(station);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (updatedData: any) => {
    if (!selectedStation) return;
    try {
      await updateStationMutation({
        stationId: selectedStation._id,
        ...updatedData
      });
      toast({ title: "Subestación actualizada", description: "Cambios guardados correctamente." });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo actualizar la subestación", variant: "destructive" });
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Subestaciones" 
        subtitle="Configura las subestaciones (KDS) y asigna los productos que se enviarán a cada una."
      />
      <PageContent>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subestaciones</CardTitle>
              <CardDescription>Lista de subestaciones activas en cocina/barra.</CardDescription>
            </div>
            <Button onClick={handleAddStation} startIcon={<PlusCircle />}>
              Nueva Subestación
            </Button>
          </CardHeader>
          <CardContent>
            {stations === undefined ? (
              <div className="text-center p-4">Cargando subestaciones...</div>
            ) : stations.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No hay subestaciones creadas.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Reglas Asignadas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stations.map((station) => {
                    const stationRules = rules?.filter(r => r.station_id === station._id) || [];
                    return (
                      <TableRow key={station._id}>
                        <TableCell className="font-medium">{station.name}</TableCell>
                        <TableCell>
                          <Badge variant={station.active ? "success" : "secondary"}>
                            {station.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {stationRules.length} reglas
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(station)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteStation(station._id)}>
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContent>

      <SubestacionEditDialog
        station={selectedStation}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleSaveEdit}
        categories={categories}
        products={products}
        rules={rules?.filter((r: any) => selectedStation && r.station_id === selectedStation._id) || []}
        onCreateRule={createRule}
        onDeleteRule={deleteRule}
      />
    </PageContainer>
  );
}
