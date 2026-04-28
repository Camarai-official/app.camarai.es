import { H2, H3, TextSM } from '@/components/ui/typography';
import * as React from 'react';
import { OperatingHoursEditor } from '@/components/ui/operating-hours-editor';
import type { RefObject } from 'react';
import { Camera, Trash } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/dialogs/global-alert-dialog';
import type { Establishment } from '@/data/establishments';
import { ConfigToggle } from '@/components/ui/config-item';
import { Store } from 'lucide-react';

type EstablishmentTabProps = {
    activeEstablishment: Establishment | null;
    establishments: Establishment[];
    localEstablishment: Partial<Establishment> | null;
    isInitialized?: boolean; 
    establishmentFileInputRef: RefObject<HTMLInputElement>;
    onEstablishmentImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEstablishmentInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onEstablishmentSwitchChange: (checked: boolean, id: string) => void;
    onSaveEstablishmentChanges: () => void;
    onDeleteEstablishment: () => void;
    onCreateFirstEstablishment: () => void;
};

export function EstablishmentTab({
    activeEstablishment,
    establishments,
    localEstablishment,
    isInitialized,
    establishmentFileInputRef,
    onEstablishmentImageChange,
    onEstablishmentInputChange,
    onEstablishmentSwitchChange,
    onSaveEstablishmentChanges,
    onDeleteEstablishment,
    onCreateFirstEstablishment }: EstablishmentTabProps) {
    
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <TabsContent value="establishment">
                <Card>
                    <CardHeader>
                        <H3>Cargando...</H3>
                        <CardDescription>Preparando vista de configuración...</CardDescription>
                    </CardHeader>
                </Card>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="establishment">
            {!isInitialized ? (
                <Card>
                    <CardHeader>
                        <H3>Cargando...</H3>
                        <CardDescription>Estamos preparando tus establecimientos.</CardDescription>
                    </CardHeader>
                </Card>
            ) : !activeEstablishment && establishments.length === 0 ? (
                <Card>
                    <CardHeader>
                        <H3>No hay establecimientos</H3>
                        <CardDescription>
                            Parece que no tienes ningún establecimiento configurado. ¡Crea uno para empezar!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={onCreateFirstEstablishment}>Crear mi primer establecimiento</Button>
                    </CardContent>
                </Card>
            ) : !localEstablishment ? (
                <Card>
                    <CardHeader>
                        <H3>Cargando...</H3>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <H3 className="font-bold text-muted-foreground">Datos del Establecimiento</H3>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <TextSM>Información del restaurante o local principal.</TextSM>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={localEstablishment.image} alt="Establishment Logo" data-ai-hint="restaurant logo" />
                                    <AvatarFallback>{localEstablishment.name?.charAt(0) || 'C'}</AvatarFallback>
                                </Avatar>
                                <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-sm" onClick={() => establishmentFileInputRef.current?.click()}>
                                    <Camera className="h-4 w-4" />
                                </Button>
                                <Input ref={establishmentFileInputRef} type="file" accept="image/*" className="hidden" onChange={onEstablishmentImageChange} />
                            </div>
                            <div className="grid gap-1.5 flex-grow text-center md:text-left">
                                <H2>{localEstablishment.name}</H2>
                                <TextSM className="text-muted-foreground">{localEstablishment.type}</TextSM>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" value={localEstablishment.name || ''} onChange={onEstablishmentInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Input id="type" value={localEstablishment.type || ''} onChange={onEstablishmentInputChange} />
                            </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Input id="address" value={localEstablishment.address || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Código Postal</Label>
                                    <Input id="postalCode" value={localEstablishment.postalCode || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <Input id="city" value={localEstablishment.city || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province">Provincia</Label>
                                    <Input id="province" value={localEstablishment.province || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">País</Label>
                                    <Input id="country" value={localEstablishment.country || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" value={localEstablishment.phone || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={localEstablishment.email || ''} onChange={onEstablishmentInputChange} />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="hours">Horario de Apertura</Label>
                                    <OperatingHoursEditor 
                                      value={localEstablishment.hours || ''} 
                                      onChange={(val) => onEstablishmentInputChange({ 
                                        target: { id: 'hours', value: val } 
                                      } as any)} 
                                    />
                                </div>
                                <ConfigToggle
                                    id="active"
                                    icon={Store}
                                    label="Establecimiento Activo"
                                    description="Habilita o deshabilita este establecimiento en la plataforma."
                                    checked={localEstablishment.active || false}
                                    onCheckedChange={(checked) => onEstablishmentSwitchChange(checked, 'active')}
                                    className="col-span-1 md:col-span-2"
                                />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 sm:pt-6 flex flex-col sm:flex-row gap-4 sm:justify-between">
                        <Button className="w-full sm:w-auto" onClick={onSaveEstablishmentChanges}>Guardar Cambios</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full sm:w-auto" startIcon={<Trash />} responsive={false}>
                                    Eliminar Establecimiento
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente el establecimiento
                                        <strong> {activeEstablishment?.name}</strong>.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onDeleteEstablishment}
                                        className={buttonVariants({ variant: "destructive" })}
                                    >
                                        Sí, eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            )}
        </TabsContent>
    );
}

