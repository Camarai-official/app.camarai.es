'use client';
import * as React from 'react';

import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Mic, Clock, BookOpen } from 'lucide-react';
import { mockCartas, mockCategories, type Carta, type ElementoCarta } from '@/data/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogWindow, DialogTrigger, DialogFooter } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/page-container';
import { ActionTile } from '@/components/ui/action-tile';
import { IconPicker } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { CartaCard } from '@/components/ui/carta-card';


// WhatsApp config type for Carta
interface CartaWhatsAppConfig {
  disponibleWhatsApp: boolean;
  permitirVoz: boolean;
  mensajeBienvenida: string;
  horarioInicio: string;
  horarioFin: string;
}



export default function CartaPage() {
    const { toast } = useToast();
    const [cartas, setCartas] = React.useState<Carta[]>(mockCartas);
    const [editingCarta, setEditingCarta] = React.useState<Partial<Carta> | null>(null);
    const [isCartaDialogOpen, setIsCartaDialogOpen] = React.useState(false);
    const [isElementDialogOpen, setIsElementDialogOpen] = React.useState(false);
    const [selectedCartaId, setSelectedCartaId] = React.useState<string | null>(null);
    const [newElementData, setNewElementData] = React.useState<{ id_elemento: string }>({ id_elemento: '' });
    const [dialogTab, setDialogTab] = React.useState('general');
    
    // WhatsApp config state
    const [whatsAppConfig, setWhatsAppConfig] = React.useState<CartaWhatsAppConfig>({
        disponibleWhatsApp: true,
        permitirVoz: true,
        mensajeBienvenida: '¡Hola! Bienvenido a nuestro restaurante. ¿Qué te gustaría pedir hoy?',
        horarioInicio: '12:00',
        horarioFin: '23:00' });
    
    // Generate WhatsApp preview messages
    const getWhatsAppPreviewMessages = () => {
        const carta = editingCarta;
        if (!carta) return [];
        
        const categoriesInCarta = carta.elementos_carta?.filter(e => e.tipo === 'categoria') || [];
        const categoryNames = categoriesInCarta.map(e => {
            const cat = mockCategories.find(c => c.id === e.id_elemento);
            return cat?.nombre_categoria || 'Categoría';
        });
        
        return [
            createWhatsAppMessage.incoming('Hola, quiero ver la carta'),
            createWhatsAppMessage.text(whatsAppConfig.mensajeBienvenida),
            createWhatsAppMessage.buttons(
                `📋 *${carta.nombre_carta || 'Carta'}*\n\nElige una categoría:`,
                categoryNames.slice(0, 3).map((name, i) => ({ id: `cat-${i}`, label: name }))
            ),
        ];
    };

    // --- Helpers Local State ---

    const addCarta = () => {
        const newCarta: Carta = {
            id: `carta-${Date.now()}`,
            nombre_carta: 'Nueva Carta',
            descripcion_carta: '',
            activa: false,
            elementos_carta: [],
            icon: 'BookOpen',
            color: 'blue-400'
        };
        setCartas(prev => [...prev, newCarta]);
        setEditingCarta(newCarta);
        setIsCartaDialogOpen(true);
    };

    const updateCarta = (id: string, updates: Partial<Carta>) => {
        setCartas(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCarta = (id: string) => {
        setCartas(prev => prev.filter(c => c.id !== id));
    };


    const addElementToCarta = () => {
        if (selectedCartaId && newElementData.id_elemento) {
            const carta = cartas.find(c => c.id === selectedCartaId);
            if (carta) {
                const newElement: ElementoCarta = {
                    id: `el-${Date.now()}`,
                    tipo: 'categoria',
                    id_elemento: newElementData.id_elemento
                };
                updateCarta(selectedCartaId, { elementos_carta: [...carta.elementos_carta, newElement] });
                setIsElementDialogOpen(false);
                setNewElementData({ id_elemento: '' });
            }
        }
    };

    const removeElementFromCarta = (cartaId: string, elementId: string) => {
        const carta = cartas.find(c => c.id === cartaId);
        if (carta) {
            updateCarta(cartaId, { elementos_carta: carta.elementos_carta.filter(el => el.id !== elementId) });
        }
    };

    // --- End Helpers ---

    const handleSaveCarta = () => {
        if (editingCarta && editingCarta.id) {
            updateCarta(editingCarta.id, editingCarta);
            setIsCartaDialogOpen(false);
            setEditingCarta(null);
        }
    };


    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Cartas"
                subtitle="Diseña y organiza las cartas digitales de tu restaurante."
            />

            <PageContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cartas.map(carta => (
                        <CartaCard
                            key={carta.id}
                            carta={carta}
                            onUpdate={updateCarta}
                            onRemove={removeCarta}
                            onEdit={(c) => { setEditingCarta(c); setIsCartaDialogOpen(true); }}
                            onAddElement={(id) => { setSelectedCartaId(id); setIsElementDialogOpen(true); }}
                            onRemoveElement={removeElementFromCarta}
                            categories={mockCategories}
                        />
                    ))}
                    <CreateActionCard className="h-80" label="Crear Nueva Carta" onClick={addCarta} />
                </div>

                <Dialog open={isCartaDialogOpen} onOpenChange={(open) => { setIsCartaDialogOpen(open); if (!open) setDialogTab('general'); }}>
                    <DialogWindow size="lg">
                        <DialogHeader
                            icon={BookOpen}
                            title="Editar Carta Digital"
                            description="Configura los detalles principales y la integración WhatsApp."
                        />
                        <DialogContent>
                            <Tabs value={dialogTab} onValueChange={setDialogTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        General
                                    </TabsTrigger>
                                    <TabsTrigger value="whatsapp" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        WhatsApp
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="general" className="space-y-5 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" variant="group">Nombre de la Carta</Label>
                                        <Input 
                                            id="name" 
                                            value={editingCarta?.nombre_carta || ''} 
                                            onChange={(e) => setEditingCarta(prev => ({ ...prev, nombre_carta: e.target.value }))}
                                            placeholder="Ej. Carta de Verano"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc" variant="group">Descripción</Label>
                                        <Textarea 
                                            id="desc" 
                                            value={editingCarta?.descripcion_carta || ''} 
                                            onChange={(e) => setEditingCarta(prev => ({ ...prev, descripcion_carta: e.target.value }))}
                                            className="min-h-[100px] resize-none"
                                            placeholder="Describe brevemente esta carta..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <IconPicker
                                            value={editingCarta?.icon || 'BookOpen'}
                                            onChange={(icon) => setEditingCarta(prev => ({ ...prev, icon: icon }))}
                                            label="Icono Representativo"
                                        />
                                        <ColorPicker
                                            label="Color de Identidad"
                                            value={editingCarta?.color}
                                            onChange={(val) => setEditingCarta(prev => ({ ...prev, color: val }))}
                                        />
                                    </div>
                                    <ActionTile
                                        icon={BookOpen}
                                        title="Carta Activa"
                                        description="Esta carta será visible para los clientes."
                                        rightContentType="switch"
                                        switchId="carta-activa"
                                        switchChecked={editingCarta?.activa || false}
                                        onSwitchChange={(checked) => setEditingCarta(prev => ({ ...prev, activa: checked }))}
                                    />
                                </TabsContent>
                                
                                <TabsContent value="whatsapp" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-5">
                                            <ActionTile
                                                icon={MessageSquare}
                                                title="Pedidos por WhatsApp"
                                                description="Habilitar flujo de pedidos"
                                                rightContentType="switch"
                                                switchId="ws-pedidos"
                                                switchChecked={whatsAppConfig.disponibleWhatsApp}
                                                onSwitchChange={(v) => setWhatsAppConfig(p => ({ ...p, disponibleWhatsApp: v }))}
                                                iconColor="#16a34a"
                                            />
                                            
                                            <ActionTile
                                                icon={Mic}
                                                title="Pedidos por Voz (IA)"
                                                description="Procesar audios automáticamente"
                                                rightContentType="switch"
                                                switchId="ws-voz"
                                                switchChecked={whatsAppConfig.permitirVoz}
                                                onSwitchChange={(v) => setWhatsAppConfig(p => ({ ...p, permitirVoz: v }))}
                                                iconColor="#3b82f6"
                                            />
                                            
                                            <div className="space-y-2">
                                                <Label variant="group">Mensaje de Bienvenida</Label>
                                                <Textarea
                                                    value={whatsAppConfig.mensajeBienvenida}
                                                    onChange={(e) => setWhatsAppConfig(p => ({ ...p, mensajeBienvenida: e.target.value }))}
                                                    placeholder="¡Hola! Bienvenido a nuestro restaurante..."
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label icon={Clock} variant="group">Disponibilidad</Label>
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] opacity-70">Desde</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioInicio}
                                                            onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioInicio: e.target.value }))}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] opacity-70">Hasta</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioFin}
                                                            onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioFin: e.target.value }))}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-muted/30 rounded-2xl border p-4">
                                            <Label variant="group" className="mb-3 block text-center">Vista Previa</Label>
                                            <div className="pointer-events-none scale-95 origin-top">
                                                <WhatsAppPreview
                                                    messages={getWhatsAppPreviewMessages()}
                                                    businessName={editingCarta?.nombre_carta || 'Mi Restaurante'}
                                                    showHeader={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                        <DialogFooter 
                            hint="Los cambios se guardarán en la configuración de esta carta."
                            onCancel={() => setIsCartaDialogOpen(false)}
                            cancelText="Cancelar"
                            onConfirm={handleSaveCarta}
                            confirmText="Guardar Carta"
                        />
                    </DialogWindow>
                </Dialog>

                <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
                    <DialogWindow size="md">
                        <DialogHeader
                            icon={PlusCircle}
                            title="Añadir Contenido"
                            description="Selecciona una categoría de productos para añadir a la carta."
                        />
                        <DialogContent>
                            <div className="space-y-4">
                                <ActionTile
                                    icon={BookOpen}
                                    title="Seleccionar Categoría"
                                    description="Elige la sección de productos a mostrar"
                                    rightContentType="custom"
                                    rightContentClassName="min-w-[200px]"
                                    customContent={
                                        <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Elige una categoría..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }
                                />
                            </div>
                        </DialogContent>
                        <DialogFooter 
                            hint="Añadirás este elemento al final de la carta actual."
                            onCancel={() => setIsElementDialogOpen(false)}
                            cancelText="Cancelar"
                            onConfirm={addElementToCarta}
                            confirmText="Añadir Contenido"
                            confirmDisabled={!newElementData.id_elemento}
                        />
                    </DialogWindow>
                </Dialog>

            </PageContent>
        </PageContainer>
    );
}

