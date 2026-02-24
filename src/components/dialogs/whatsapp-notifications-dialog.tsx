'use client';

import * as React from 'react';
import { MessageSquare, Bell, Clock, X } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppNotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WhatsAppNotificationsDialog({ open, onOpenChange }: WhatsAppNotificationsDialogProps) {
    const { toast } = useToast();
    const [config, setConfig] = React.useState({
        confirmationEnabled: true,
        reminder24h: true,
        reminder2h: true,
        cancellationEnabled: true,
        feedbackEnabled: false 
    });
    
    const [templates, setTemplates] = React.useState({
        confirmation: '¡Hola {nombre}! Tu reserva para {comensales} personas el {fecha} a las {hora} ha sido confirmada. ¡Te esperamos!',
        reminder: '¡Hola {nombre}! Te recordamos tu reserva para hoy a las {hora}. ¡Te esperamos!',
        cancellation: 'Hola {nombre}, tu reserva para el {fecha} ha sido cancelada. Si tienes dudas, contáctanos.' 
    });
    
    const previewMessages = [
        createWhatsAppMessage.text(templates.confirmation
            .replace('{nombre}', 'Carlos')
            .replace('{comensales}', '4')
            .replace('{fecha}', '15 de enero')
            .replace('{hora}', '21:00')
        ),
    ];
    
    const handleSave = () => {
        toast({
            title: 'Configuración guardada',
            description: 'Las notificaciones de WhatsApp han sido actualizadas.' 
        });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="lg">
                <DialogHeader
                    icon={MessageSquare}
                    title="Notificaciones WhatsApp"
                    description="Configura los mensajes automáticos para las reservas."
                />
                
                <DialogContent>
                    <Tabs defaultValue="config" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
                            <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1">Configuración</TabsTrigger>
                            <TabsTrigger value="templates" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1">Templates</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <TabsContent value="config" className="space-y-4 mt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                                <Bell className="h-4 w-4 text-green-500" />
                                            </div>
                                            <div>
                                                <Label className="cursor-pointer">Confirmación de reserva</Label>
                                                <p className="text-[11px] text-muted-foreground">Enviar mensaje cuando se confirma.</p>
                                            </div>
                                        </div>
                                        <Switch 
                                            checked={config.confirmationEnabled}
                                            onCheckedChange={(v) => setConfig(p => ({ ...p, confirmationEnabled: v }))}
                                        />
                                    </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <Label className="cursor-pointer">Recordatorio 24h antes</Label>
                                        <p className="text-[11px] text-muted-foreground">Enviar recordatorio un día antes.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={config.reminder24h}
                                    onCheckedChange={(v) => setConfig(p => ({ ...p, reminder24h: v }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <Label className="cursor-pointer">Recordatorio 2h antes</Label>
                                        <p className="text-[11px] text-muted-foreground">Enviar recordatorio dos horas antes.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={config.reminder2h}
                                    onCheckedChange={(v) => setConfig(p => ({ ...p, reminder2h: v }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                        <X className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div>
                                        <Label className="cursor-pointer">Notificación de cancelación</Label>
                                        <p className="text-[11px] text-muted-foreground">Avisar si se cancela la reserva.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={config.cancellationEnabled}
                                    onCheckedChange={(v) => setConfig(p => ({ ...p, cancellationEnabled: v }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                        <MessageSquare className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div>
                                        <Label className="cursor-pointer">Solicitar feedback</Label>
                                        <p className="text-[11px] text-muted-foreground">Pedir valoración después de la visita.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={config.feedbackEnabled}
                                    onCheckedChange={(v) => setConfig(p => ({ ...p, feedbackEnabled: v }))}
                                />
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="templates" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Mensaje de confirmación</Label>
                                    <Textarea 
                                        value={templates.confirmation}
                                        onChange={(e) => setTemplates(p => ({ ...p, confirmation: e.target.value }))}
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Variables: {'{nombre}'}, {'{fecha}'}, {'{hora}'}, {'{comensales}'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mensaje de recordatorio</Label>
                                    <Textarea 
                                        value={templates.reminder}
                                        onChange={(e) => setTemplates(p => ({ ...p, reminder: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mensaje de cancelación</Label>
                                    <Textarea 
                                        value={templates.cancellation}
                                        onChange={(e) => setTemplates(p => ({ ...p, cancellation: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="mb-2 block">Vista previa</Label>
                                <WhatsAppPreview 
                                    messages={previewMessages}
                                    businessName="Mi Restaurante"
                                    showHeader={true}
                                />
                            </div>
                        </div>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                    </Tabs>
                </DialogContent>
                
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Configuración</Button>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
