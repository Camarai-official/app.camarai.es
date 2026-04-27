'use client';

import * as React from 'react';
import { TextMD } from "@/components/ui/typography";
import { MessageSquare, Bell, Clock, X } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogClose } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { ActionTile } from '@/components/ui/action-tile';
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
                        <TabsList className="w-full">
                            <TabsTrigger value="config" icon={Bell}>Configuración</TabsTrigger>
                            <TabsTrigger value="templates" icon={MessageSquare}>Templates</TabsTrigger>
                        </TabsList>

                        <ScrollArea>
                            <div className="p-6">
                                <TabsContent value="config" spaced>
                                    <ActionTile
                                        icon={Bell}
                                        iconColor="#22c55e"
                                        title="Confirmación de reserva"
                                        description="Enviar mensaje cuando se confirma."
                                        rightContentType="switch"
                                        switchId="confirmation"
                                        switchChecked={config.confirmationEnabled}
                                        onSwitchChange={(v) => setConfig(p => ({ ...p, confirmationEnabled: v }))}
                                        variant="outline"
                                    />
                                    <ActionTile
                                        icon={Clock}
                                        iconColor="#3b82f6"
                                        title="Recordatorio 24h antes"
                                        description="Enviar recordatorio un día antes."
                                        rightContentType="switch"
                                        switchId="reminder24h"
                                        switchChecked={config.reminder24h}
                                        onSwitchChange={(v) => setConfig(p => ({ ...p, reminder24h: v }))}
                                        variant="outline"
                                    />
                                    <ActionTile
                                        icon={Clock}
                                        iconColor="#f59e0b"
                                        title="Recordatorio 2h antes"
                                        description="Enviar recordatorio dos horas antes."
                                        rightContentType="switch"
                                        switchId="reminder2h"
                                        switchChecked={config.reminder2h}
                                        onSwitchChange={(v) => setConfig(p => ({ ...p, reminder2h: v }))}
                                        variant="outline"
                                    />
                                    <ActionTile
                                        icon={X}
                                        iconColor="#ef4444"
                                        title="Notificación de cancelación"
                                        description="Avisar si se cancela la reserva."
                                        rightContentType="switch"
                                        switchId="cancellation"
                                        switchChecked={config.cancellationEnabled}
                                        onSwitchChange={(v) => setConfig(p => ({ ...p, cancellationEnabled: v }))}
                                        variant="outline"
                                    />
                                    <ActionTile
                                        icon={MessageSquare}
                                        iconColor="#a855f7"
                                        title="Solicitar feedback"
                                        description="Pedir valoración después de la visita."
                                        rightContentType="switch"
                                        switchId="feedback"
                                        switchChecked={config.feedbackEnabled}
                                        onSwitchChange={(v) => setConfig(p => ({ ...p, feedbackEnabled: v }))}
                                        variant="outline"
                                    />
                                </TabsContent>
                        
                                <TabsContent value="templates" spaced>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <ActionTile 
                                                    icon={Bell} 
                                                    iconColor="#22c55e" 
                                                    title="Confirmación" 
                                                    variant="none"
                                                    padding="none"
                                                />
                                                <Textarea 
                                                    value={templates.confirmation}
                                                    onChange={(e) => setTemplates(p => ({ ...p, confirmation: e.target.value }))}
                                                    rows={4}
                                                />
                                                <TextMD className="text-muted-foreground">
                                                    Variables: <code className="text-primary">{'{nombre}'}</code>, <code className="text-primary">{'{fecha}'}</code>, <code className="text-primary">{'{hora}'}</code>, <code className="text-primary">{'{comensales}'}</code>
                                                </TextMD>
                                            </div>

                                            <div className="space-y-3">
                                                <ActionTile 
                                                    icon={Clock} 
                                                    iconColor="#3b82f6" 
                                                    title="Recordatorio" 
                                                    variant="none"
                                                    padding="none"
                                                />
                                                <Textarea 
                                                    value={templates.reminder}
                                                    onChange={(e) => setTemplates(p => ({ ...p, reminder: e.target.value }))}
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <ActionTile 
                                                    icon={X} 
                                                    iconColor="#ef4444" 
                                                    title="Cancelación" 
                                                    variant="none"
                                                    padding="none"
                                                />
                                                <Textarea 
                                                    value={templates.cancellation}
                                                    onChange={(e) => setTemplates(p => ({ ...p, cancellation: e.target.value }))}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex flex-col h-full min-h-[500px]">
                                            <Label variant="medium">Vista Previa Real-time</Label>
                                            <div className="rounded-2xl border bg-muted/30 p-6 flex-1 flex justify-center">
                                                <div className="w-full max-w-[320px] h-full">
                                                    <WhatsAppPreview 
                                                        messages={previewMessages}
                                                        businessName="Mi Restaurante"
                                                        showHeader
                                                    />
                                                </div>
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
                    cancelText="Cancelar"
                    onConfirm={handleSave}
                    confirmText="Guardar Configuración"
                />
            </DialogWindow>
        </Dialog>
    );
}
