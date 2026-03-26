'use client';

import * as React from 'react';
import { BookOpen, MessageSquare, Mic, Layers, PlusCircle, Check, Trash } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextSM } from '@/components/ui/typography';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import type { Carta, Category, ElementoCarta } from '@/data/mock-data';

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
    isCreating?: boolean; // New prop to explicitly indicate creation mode
}

export function CartasDialog({
    isOpen,
    onOpenChange,
    carta,
    onSave,
    whatsAppConfig,
    onWhatsAppConfigChange,
    allCategories,
    isCreating = false
}: CartasDialogProps) {
    const [dialogTab, setDialogTab] = React.useState('general');
    const [localCarta, setLocalCarta] = React.useState<Partial<Carta>>({});

    React.useEffect(() => {
        if (carta) {
            // Ensure we're working with a clean copy
            const cleanCarta = { ...carta };
            setLocalCarta(cleanCarta);
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
                    title={isCreating ? "Crear Nueva Carta" : "Editar Carta Digital"}
                    description={isCreating ? "Diseña tu nueva carta digital y configura la integración WhatsApp." : "Configura los detalles principales y la integración WhatsApp."}
                />
                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={dialogTab} onValueChange={setDialogTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b bg-muted/10 shrink-0">
                            <TabsList className="h-14 bg-transparent justify-start gap-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="categories">Categorías</TabsTrigger>
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
                                
                                <TabsContent value="categories" className="mt-0 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Categorías de la Carta</h3>
                                            <Badge variant="outline">
                                                {localCarta?.elementos_carta?.filter(e => e.tipo === 'categoria').length || 0} categorías
                                            </Badge>
                                        </div>
                                        
                                        {/* Available Categories */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-medium">Categorías Disponibles</Label>
                                            <div className="grid gap-2">
                                                {allCategories.map(category => {
                                                    const isInCarta = localCarta?.elementos_carta?.some(
                                                        element => element.tipo === 'categoria' && element.id_elemento === category.id
                                                    );
                                                    
                                                    return (
                                                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <Layers className="h-4 w-4 text-blue-500" />
                                                                <div>
                                                                    <div className="font-medium">{category.nombre_categoria}</div>
                                                                    <TextSM className="text-muted-foreground">
                                                                        {isInCarta ? "Ya añadida" : "Disponible para añadir"}
                                                                    </TextSM>
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                size="sm" 
                                                                variant={isInCarta ? "destructive" : "default"}
                                                                onClick={() => {
                                                                    if (isInCarta) {
                                                                        // Remove category from carta
                                                                        setLocalCarta(prev => ({
                                                                            ...prev,
                                                                            elementos_carta: prev.elementos_carta?.filter(
                                                                                element => !(element.tipo === 'categoria' && element.id_elemento === category.id)
                                                                            ) || []
                                                                        }));
                                                                    } else {
                                                                        // Add category to carta
                                                                        const newElement: ElementoCarta = {
                                                                            id: `el-${Date.now()}`,
                                                                            tipo: 'categoria',
                                                                            id_elemento: category.id
                                                                        };
                                                                        setLocalCarta(prev => ({
                                                                            ...prev,
                                                                            elementos_carta: [...(prev.elementos_carta || []), newElement]
                                                                        }));
                                                                    }
                                                                }}
                                                            >
                                                                {isInCarta ? (
                                                                    <>
                                                                        <Trash className="h-3 w-3 mr-1" />
                                                                        Eliminar
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PlusCircle className="h-3 w-3 mr-1" />
                                                                        Añadir
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {allCategories.length === 0 && (
                                            <div className="text-center py-8">
                                                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                                <h3 className="text-lg font-medium mb-2">Sin categorías disponibles</h3>
                                                <TextSM className="text-muted-foreground">
                                                    No hay categorías creadas. Primero crea categorías en la sección de Categorías.
                                                </TextSM>
                                            </div>
                                        )}
                                    </div>
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
                    confirmText={isCreating ? "Crear Carta" : "Guardar Cambios"}
                />
            </DialogWindow>
        </Dialog>
    );
}
