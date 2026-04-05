'use client';

import * as React from 'react';
import { LayoutGrid, FolderOpen } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogHeader } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';

export interface QuickTemplate {
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
    onApply?: (template: QuickTemplate) => void | Promise<void>;
}

export function QuickTemplatesDialog({ open, onOpenChange, onApply }: QuickTemplatesDialogProps) {
    const [isApplying, setIsApplying] = React.useState(false);

    const handleApply = async (template: QuickTemplate) => {
        if (!onApply || isApplying) return;
        setIsApplying(true);
        try {
            await Promise.resolve(onApply(template));
            onOpenChange(false);
        } catch {
            // Toast y estado: los gestiona el padre
        } finally {
            setIsApplying(false);
        }
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
                            <ActionTile 
                                key={t.id} 
                                icon={LayoutGrid} 
                                title={t.name} 
                                description={t.description} 
                                onClick={() => void handleApply(t)}
                                rightContentType="button"
                                buttonText="Aplicar"
                                buttonVariant="outline"
                                onButtonClick={() => void handleApply(t)}
                                disabled={isApplying}
                            />
                        ))}
                    </div>
                </DialogContent>
            </DialogWindow>
        </Dialog>
    );
}
