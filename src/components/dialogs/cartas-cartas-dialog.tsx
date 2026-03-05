'use client';

import * as React from 'react';
import { BookOpen, MessageSquare, Mic } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogWindow, 
    DialogFooter 
} from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconPicker } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import type { Carta, Category } from '@/data/mock-data';

export interface CartaWhatsAppConfig {
    disponibleWhatsApp: boolean;
    permitirVoz: boolean;
    mensajeBienvenida: string;
    horarioInicio: string;
    horarioFin: string;
}

interface CartasDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    carta: Partial<Carta> | null;
    onSave: (carta: Partial<Carta>) => void;
    whatsAppConfig: CartaWhatsAppConfig;
    onWhatsAppConfigChange: (config: CartaWhatsAppConfig) => void;
    allCategories: Category[];
}

export function CartasDialog({
    isOpen,
    onOpenChange,
    carta,
    onSave,
    whatsAppConfig,
    onWhatsAppConfigChange,
    allCategories
}: CartasDialogProps) {
    const [dialogTab, setDialogTab] = React.useState('general');
    const [localCarta, setLocalCarta] = React.useState<Partial<Carta>>({});

    React.useEffect(() => {
        if (carta) {
            setLocalCarta(carta);
        } else {
            setLocalCarta({});
        }
    }, [carta, isOpen]);

    const handleSave = () => {
        onSave(localCarta);
    };

    const getWhatsAppPreviewMessages = () => {
        const categoriesInCarta = localCarta.elementos_carta?.filter(e => e.tipo === 'categoria') || [];
        const categoryNames = categoriesInCarta.map(e => {
            const cat = allCategories.find(c => c.id === e.id_elemento);
            return cat?.nombre_categoria || 'Categoría';
        });
        
        return [
            createWhatsAppMessage.incoming('Hola, quiero ver la carta'),
            createWhatsAppMessage.text(whatsAppConfig.mensajeBienvenida),
            createWhatsAppMessage.buttons(
                `📋 *${localCarta.nombre_carta || 'Carta'}*\n\nElige una categoría:`,
                categoryNames.slice(0, 3).map((name, i) => ({ id: `cat-${i}`, label: name }))
            ),
        ];
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) setDialogTab('general'); }}>
            <DialogWindow size="lg">
                <DialogHeader
                    icon={BookOpen}
                    title="Editar Carta Digital"
                    description="Configura los detalles principales y la integración WhatsApp."
                />
                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={dialogTab} onValueChange={setDialogTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b bg-muted/10 shrink-0">
                            <TabsList className="h-14 bg-transparent justify-start gap-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <TabsContent value="general" className="space-y-5 mt-0">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre de la Carta</Label>
                                        <Input 
                                            id="name" 
                                            value={localCarta?.nombre_carta || ''} 
                                            onChange={(e) => setLocalCarta(prev => ({ ...prev, nombre_carta: e.target.value }))}
                                            placeholder="Ej. Carta de Verano"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Descripción</Label>
                                        <Textarea 
                                            id="desc" 
                                            value={localCarta?.descripcion_carta || ''} 
                                            onChange={(e) => setLocalCarta(prev => ({ ...prev, descripcion_carta: e.target.value }))}
                                            className="min-h-[100px] resize-none"
                                            placeholder="Describe brevemente esta carta..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <IconPicker
                                            value={localCarta?.icon || 'BookOpen'}
                                            onChange={(icon) => setLocalCarta(prev => ({ ...prev, icon: icon }))}
                                            label="Icono Representativo"
                                        />
                                        <ColorPicker
                                            label="Color de Identidad"
                                            value={localCarta?.color}
                                            onChange={(val) => setLocalCarta(prev => ({ ...prev, color: val }))}
                                        />
                                    </div>
                                    <ActionTile
                                        icon={BookOpen}
                                        title="Carta Activa"
                                        description="Esta carta será visible para los clientes."
                                        rightContentType="switch"
                                        switchId="carta-activa"
                                        switchChecked={localCarta?.activa || false}
                                        onSwitchChange={(checked) => setLocalCarta(prev => ({ ...prev, activa: checked }))}
                                    />
                                </TabsContent>
                                
                                <TabsContent value="whatsapp" className="mt-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-5">
                                            <ActionTile
                                                icon={MessageSquare}
                                                title="Pedidos por WhatsApp"
                                                description="Habilitar flujo de pedidos"
                                                rightContentType="switch"
                                                switchId="ws-pedidos-menu"
                                                switchChecked={whatsAppConfig.disponibleWhatsApp}
                                                onSwitchChange={(v) => onWhatsAppConfigChange({ ...whatsAppConfig, disponibleWhatsApp: v })}
                                                iconColor="#16a34a"
                                            />
                                            
                                            <ActionTile
                                                icon={Mic}
                                                title="Pedidos por Voz (IA)"
                                                description="Procesar audios automáticamente"
                                                rightContentType="switch"
                                                switchId="ws-voz-menu"
                                                switchChecked={whatsAppConfig.permitirVoz}
                                                onSwitchChange={(v) => onWhatsAppConfigChange({ ...whatsAppConfig, permitirVoz: v })}
                                                iconColor="#3b82f6"
                                            />
                                            
                                            <div className="space-y-2">
                                                <Label>Mensaje de Bienvenida</Label>
                                                <Textarea
                                                    value={whatsAppConfig.mensajeBienvenida}
                                                    onChange={(e) => onWhatsAppConfigChange({ ...whatsAppConfig, mensajeBienvenida: e.target.value })}
                                                    placeholder="¡Hola! Bienvenido a nuestro restaurante..."
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Disponibilidad</Label>
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] opacity-70">Desde</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioInicio}
                                                            onChange={(e) => onWhatsAppConfigChange({ ...whatsAppConfig, horarioInicio: e.target.value })}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] opacity-70">Hasta</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioFin}
                                                            onChange={(e) => onWhatsAppConfigChange({ ...whatsAppConfig, horarioFin: e.target.value })}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-muted/30 rounded-2xl border p-4">
                                            <Label className="mb-3 block text-center font-medium">Vista Previa</Label>
                                            <div className="pointer-events-none scale-90 origin-top">
                                                <WhatsAppPreview
                                                    messages={getWhatsAppPreviewMessages()}
                                                    businessName={localCarta?.nombre_carta || 'Mi Restaurante'}
                                                    showHeader={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </DialogContent>
                <DialogFooter 
                    onCancel={() => onOpenChange(false)}
                    onConfirm={handleSave}
                    confirmText="Guardar Carta"
                />
            </DialogWindow>
        </Dialog>
    );
}
