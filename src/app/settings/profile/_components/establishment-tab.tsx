import * as React from 'react';
import type { RefObject } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Establishment } from '@/data/establishments';

type EstablishmentTabProps = {
    activeEstablishment: Establishment | null;
    establishments: Establishment[];
    localEstablishment: Partial<Establishment> | null;
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
    establishmentFileInputRef,
    onEstablishmentImageChange,
    onEstablishmentInputChange,
    onEstablishmentSwitchChange,
    onSaveEstablishmentChanges,
    onDeleteEstablishment,
    onCreateFirstEstablishment,
}: EstablishmentTabProps) {
    return (
        <TabsContent value="establishment">
            {!activeEstablishment && establishments.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No hay establecimientos</CardTitle>
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
                        <CardTitle>Cargando...</CardTitle>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CardTitle className="font-bold text-muted-foreground">Datos del Establecimiento</CardTitle>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Información del restaurante o local principal.</p>
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
                                <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background" onClick={() => establishmentFileInputRef.current?.click()}>
                                    <Camera className="h-4 w-4" />
                                </Button>
                                <Input ref={establishmentFileInputRef} type="file" accept="image/*" className="hidden" onChange={onEstablishmentImageChange} />
                            </div>
                            <div className="grid gap-1.5 flex-grow text-center md:text-left">
                                <h2 className="text-2xl font-bold">{localEstablishment.name}</h2>
                                <p className="text-muted-foreground">{localEstablishment.type}</p>
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
                            <div className="space-y-2 md:col-span-2">
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
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="hours">Horario</Label>
                                <Textarea id="hours" value={localEstablishment.hours || ''} onChange={onEstablishmentInputChange} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="active"
                                    checked={localEstablishment.active || false}
                                    onCheckedChange={(checked) => onEstablishmentSwitchChange(checked, 'active')}
                                />
                                <Label htmlFor="active">Establecimiento Activo</Label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 flex justify-between">
                        <Button onClick={onSaveEstablishmentChanges}>Guardar Cambios</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
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
