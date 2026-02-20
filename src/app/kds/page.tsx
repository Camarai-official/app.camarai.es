'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitorPlay, Settings, ExternalLink, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useEnvironments } from '@/hooks/useEnvironments';
import { mockCategories } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export default function KdsPage() {
  const [configOpen, setConfigOpen] = React.useState(false);
  const { environments } = useEnvironments();
  const { toast } = useToast();
  
  // Configuration state
  const [selectedEnvironment, setSelectedEnvironment] = React.useState<string>('all');
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [alertTime, setAlertTime] = React.useState<number>(10);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [layoutMode, setLayoutMode] = React.useState<string>('grid');

  const handleLaunchKDS = () => {
    // In a real app, this would redirect to the KDS application
    toast({
      title: 'Iniciando KDS',
      description: 'Redirigiendo al sistema de visualización de cocina...' });
    // window.open('/kds-app', '_blank');
  };

  const handleSaveConfig = () => {
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes del KDS se han guardado correctamente.' });
    setConfigOpen(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <PageContainer>
      <PageHeader title="Kitchen Display System (KDS)" />
      <PageContent className="items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <MonitorPlay className="h-10 w-10 text-primary" />
            </div>
            <H3 className="text-2xl">Kitchen Display System</H3>
            <CardDescription className="text-base">
              Sistema de visualización de comandas para la cocina. Gestiona pedidos y tiempos de preparación en tiempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-3">
              <Button size="md" className="w-full" onClick={handleLaunchKDS}>
                <ExternalLink className="mr-2 h-5 w-5" />
                Iniciar KDS
              </Button>
               <Button variant="outline" size="md" className="w-full" onClick={() => setConfigOpen(true)}>
                <Settings className="mr-2 h-5 w-5" />
                Configurar Pantallas
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <p className="text-xs text-muted-foreground">
              Configura los filtros y alertas antes de iniciar la pantalla.
            </p>
          </CardFooter>
        </Card>
      </PageContent>

      {/* Modal de Configuración KDS */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader
            icon={Settings}
            title="Configuración del KDS"
            description="Configura el ambiente, categorías y opciones de visualización para la pantalla de cocina."
          />
          <div className="grid gap-6 py-4">
            {/* Environment Selection */}
            <div className="grid gap-2">
              <Label htmlFor="environment">Ambiente / Estación de Cocina</Label>
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Seleccionar ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los ambientes</SelectItem>
                  {environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Filtra las comandas por ambiente específico.
              </p>
            </div>

            {/* Category Filter */}
            <div className="grid gap-2">
              <Label>Filtrar por Categorías de Productos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {mockCategories.slice(0, 10).map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal cursor-pointer">
                      {category.nombre_categoria}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCategories.length === 0 ? 'Mostrando todas las categorías' : `${selectedCategories.length} categorías seleccionadas`}
              </p>
            </div>

            {/* Alert Time */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="alert-time">Tiempo de Alerta (minutos)</Label>
                <span className="text-sm font-medium">{alertTime} min</span>
              </div>
              <Slider
                id="alert-time"
                min={5}
                max={30}
                step={1}
                value={[alertTime]}
                onValueChange={([value]) => setAlertTime(value)}
              />
              <p className="text-xs text-muted-foreground">
                Las comandas se marcarán en rojo si superan este tiempo.
              </p>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sonido de Nuevas Comandas
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reproducir sonido al recibir comandas nuevas.
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {/* Layout Mode */}
            <div className="grid gap-2">
              <Label htmlFor="layout">Layout de Visualización</Label>
              <Select value={layoutMode} onValueChange={setLayoutMode}>
                <SelectTrigger id="layout">
                  <SelectValue placeholder="Seleccionar layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid (Rejilla)</SelectItem>
                  <SelectItem value="list">Lista Vertical</SelectItem>
                  <SelectItem value="columns">Columnas por Estado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define cómo se muestran las comandas en pantalla.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
    );
}

