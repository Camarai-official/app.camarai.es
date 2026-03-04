import { H2, H3, TextMD, TextSM } from '@/components/ui/typography';
import * as React from 'react';
import type { RefObject } from 'react';
import { Camera } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfigItem } from '@/components/ui/config-item';
import { CheckCircle2 } from 'lucide-react';
import type { User } from '@/data/mock-data';
import { ActionTile } from '@/components/ui/action-tile';

type ProfileTabProps = {
    localUser: Partial<User> | null;
    profileFileInputRef: RefObject<HTMLInputElement>;
    onProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUserInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveUserChanges: () => void;
};

export function ProfileTab({
    localUser,
    profileFileInputRef,
    onProfileImageChange,
    onUserInputChange,
    onSaveUserChanges }: ProfileTabProps) {
    return (
        <TabsContent value="profile">
            <Card>
                <CardHeader>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <H3 className="font-bold text-muted-foreground">Información del Perfil</H3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <TextSM>Gestiona los datos de tu cuenta de usuario.</TextSM>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-6">
                    {localUser ? (
                        <>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={localUser.avatar} alt="@user" data-ai-hint="profile user" />
                                        <AvatarFallback>{localUser.firstName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Button size="md" className="absolute bottom-0 right-0 rounded-full" onClick={() => profileFileInputRef.current?.click()}>
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Cambiar foto</span>
                                    </Button>
                                    <Input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={onProfileImageChange} />
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 flex-grow text-center md:text-left">
                                    <div>
                                        <H2>{localUser.firstName} {localUser.lastName}</H2>
                                        <TextMD className="text-muted-foreground">{localUser.email}</TextMD>
                                    </div>
                                    <TextSM className="text-muted-foreground">Último login: 12/07/2024 10:30 AM</TextSM>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombre</Label>
                                    <Input id="firstName" value={localUser.firstName || ''} onChange={onUserInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellidos</Label>
                                    <Input id="lastName" value={localUser.lastName || ''} onChange={onUserInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={localUser.email || ''} onChange={onUserInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" type="tel" defaultValue="+34 600 000 000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input id="password" type="password" placeholder="••••••••" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pin">PIN de seguridad</Label>
                                    <Input id="pin" type="password" maxLength={4} placeholder="••••" />
                                </div>
                                <ActionTile
                                    icon={CheckCircle2}
                                    iconColor="#22c55e"
                                    title="Estado de la Cuenta"
                                    description="Estado actual de tu perfil de usuario."
                                    variant="outline"
                                    padding="md"
                                    rightContentType="select"
                                    selectValue="activo"
                                    onSelectChange={() => {}}
                                    selectOptions={[
                                        { value: 'activo', label: 'Activo' },
                                        { value: 'inactivo', label: 'Inactivo' }
                                    ]}
                                />
                            </div>
                        </>
                    ) : (
                        <TextSM>Cargando perfil...</TextSM>
                    )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={onSaveUserChanges} disabled={!localUser}>Guardar Cambios</Button>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}

