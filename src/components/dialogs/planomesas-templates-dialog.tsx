'use client';

import * as React from 'react';
import { LayoutGrid, FolderOpen } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogHeader } from '@/components/layout/dialog';
import { ConfigItem } from '@/components/ui/config-item';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QuickTemplate {
    id: string;
    name: string;
    description: string;
    tables: number;
}

const floorPlanTemplates: QuickTemplate[] = [
    { id: 'restaurant-small', name: 'Pequeño', description: '8 mesas', tables: 8 },
    { id: 'restaurant-medium', name: 'Mediano', description: '16 mesas', tables: 16 },
    { id: 'bar', name: 'Bar / Barra', description: '10 mesas', tables: 10 },
    { id: 'terraza', name: 'Terraza', description: '12 mesas', tables: 12 },
];

interface QuickTemplatesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply?: (template: QuickTemplate) => void;
}

export function QuickTemplatesDialog({ open, onOpenChange, onApply }: QuickTemplatesDialogProps) {
    const { toast } = useToast();

    const handleApply = (template: QuickTemplate) => {
        toast({ title: "Plantilla aplicada", description: `Se ha configurado el diseño "${template.name}".` });
        onApply?.(template);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader 
                    icon={FolderOpen} 
                    title="Plantillas Rápidas" 
                    description="Selecciona un formato predefinido para organizar tu salón rápidamente." 
                />
                <DialogContent>
                    <div className="grid gap-3">
                        {floorPlanTemplates.map(t => (
                            <ConfigItem 
                                key={t.id} 
                                icon={LayoutGrid} 
                                label={t.name} 
                                description={t.description} 
                                onClick={() => handleApply(t)}
                            >
                                <Button variant="outline" size="sm">Aplicar</Button>
                            </ConfigItem>
                        ))}
                    </div>
                </DialogContent>
            </DialogWindow>
        </Dialog>
    );
}
