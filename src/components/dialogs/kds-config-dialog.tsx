'use client';

import * as React from 'react';
import { TextSM, TextMD } from "@/components/ui/typography";
import { Settings, LayoutGrid, Volume2, Timer, Soup, Boxes } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface KDSConfig {
    selectedEnvironment: string;
    selectedCategories: string[];
    alertTime: number;
    soundEnabled: boolean;
    layoutMode: string;
}

interface KDSConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: KDSConfig;
    onConfigChange: (config: KDSConfig) => void;
    onSave: () => void;
    environments: any[];
    categories: any[];
}

export function KDSConfigDialog({
    open,
    onOpenChange,
    config,
    onConfigChange,
    onSave,
    environments,
    categories
}: KDSConfigDialogProps) {
    const toggleCategory = (categoryId: string) => {
        const isSelected = config.selectedCategories.includes(categoryId);
        onConfigChange({
            ...config,
            selectedCategories: isSelected
                ? config.selectedCategories.filter(id => id !== categoryId)
                : [...config.selectedCategories, categoryId]
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={Settings}
                    title="Configuración del KDS"
                    description="Configura el ambiente, categorías y opciones de visualización para la cocina."
                />
                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 w-full">
                        <div className="space-y-6 py-4 px-2 sm:p-6">
                            {/* Visualización y Ambiente */}
                            <div className="space-y-3">
                                <ActionTile
                                    icon={Boxes}
                                    iconColor="muted-foreground"
                                    title="Ambiente / Estación"
                                    description="Filtra las comandas por ambiente específico."
                                    rightContentType="select"
                                    selectValue={config.selectedEnvironment}
                                    onSelectChange={(v) => onConfigChange({ ...config, selectedEnvironment: v })}
                                    selectOptions={[
                                        { value: 'all', label: 'Todos los ambientes' },
                                        ...environments.map(env => ({ value: env.id, label: env.name }))
                                    ]}
                                />

                                <ActionTile
                                    icon={LayoutGrid}
                                    iconColor="muted-foreground"
                                    title="Layout de Pantalla"
                                    description="Define cómo se muestran las comandas."
                                    rightContentType="select"
                                    selectValue={config.layoutMode}
                                    onSelectChange={(v) => onConfigChange({ ...config, layoutMode: v })}
                                    selectOptions={[
                                        { value: 'grid', label: 'Grid (Rejilla)' },
                                        { value: 'list', label: 'Lista Vertical' },
                                        { value: 'columns', label: 'Columnas por Estado' }
                                    ]}
                                />
                            </div>

                            <Separator className="opacity-50" />

                            {/* Alertas y Sonido */}
                            <div className="space-y-3">
                                <ActionTile
                                    icon={Timer}
                                    iconColor="muted-foreground"
                                    title={`Tiempo de Alerta: ${config.alertTime} min`}
                                    description="Las comandas se marcarán en rojo tras este tiempo."
                                    rightContentType="custom"
                                    customContent={
                                        <div className="w-32 pt-2">
                                            <Slider
                                                min={5}
                                                max={30}
                                                step={1}
                                                value={[config.alertTime]}
                                                onValueChange={([v]) => onConfigChange({ ...config, alertTime: v })}
                                            />
                                        </div>
                                    }
                                />

                                <ActionTile
                                    icon={Volume2}
                                    iconColor="muted-foreground"
                                    title="Sonido de Comandas"
                                    description="Avisar acústicamente al recibir nuevos pedidos."
                                    rightContentType="switch"
                                    switchId="kds-sound"
                                    switchChecked={config.soundEnabled}
                                    onSwitchChange={(checked) => onConfigChange({ ...config, soundEnabled: checked })}
                                />
                            </div>

                            <Separator className="opacity-50" />

                            {/* Categorías */}
                            <div className="space-y-4 px-1">
                                <div className="flex items-center gap-2">
                                    <Soup className="h-4 w-4 text-muted-foreground" />
                                    <TextSM>Filtrar por Categorías</TextSM>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((category) => (
                                        <ActionTile 
                                            key={category.id} 
                                            title={category.nombre_categoria}
                                            rightContentType="checkbox"
                                            checkboxId={`kds-cat-${category.id}`}
                                            checkboxChecked={config.selectedCategories.includes(category.id)}
                                            onCheckboxChange={() => toggleCategory(category.id)}
                                            variant="outline"
                                            padding="sm"
                                            onClick={() => toggleCategory(category.id)}
                                        />
                                    ))}
                                </div>
                                <TextMD className="text-muted-foreground">
                                    {config.selectedCategories.length === 0 
                                        ? 'Mostrando todas las categorías' 
                                        : `${config.selectedCategories.length} categorías seleccionadas`}
                                </TextMD>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
                <DialogFooter
                    onCancel={() => { onSave(); onOpenChange(false); }}
                    cancelText="Cerrar"
                />
            </DialogWindow>
        </Dialog>
    );
}
