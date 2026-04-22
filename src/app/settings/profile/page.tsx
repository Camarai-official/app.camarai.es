'use client';

import * as React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Store, Building2, Users, Plug, Percent, Printer } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useEstablishments } from '@/hooks/useEstablishments';

import type { Establishment } from '@/data/establishments';

import { mockUser, User } from '@/data/mock-data';

import { useDevices } from '@/hooks/useDevices';

import type { Device, DeviceType } from '@/data/devices';

import { PageHeader } from '@/components/layout/page-header';

import { PageContent } from '@/components/layout/page-content';

import { PageContainer } from '@/components/layout/page-container';

import { ProfileTab } from '@/components/ui/profile-tab';

import { EstablishmentTab } from '@/components/ui/establishment-tab';

import { DevicesTab } from '@/components/dialogs/configuracion-dispositivos-dialog';

import { CompanyTab } from '@/components/ui/company-tab';

import { ProvidersTab } from '@/components/ui/providers-tab';

import { IntegrationsTab } from '@/components/ui/integrations-tab';

import { TaxesTab } from '@/components/ui/taxes-tab';
import { useToast } from "@/hooks/use-toast";



const VALID_TABS = new Set([

    'profile',

    'establishment',

    'company',

    'devices',

    'providers',

    'integrations',

    'taxes',

]);



function ProfileSettingsPageContent() {

    const establishmentFileInputRef = React.useRef<HTMLInputElement>(null);

    const profileFileInputRef = React.useRef<HTMLInputElement>(null);

    const companyFileInputRef = React.useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const { 
        activeEstablishment, 
        updateEstablishment, 
        removeEstablishment, 
        establishments, 
        addEstablishment,
        isInitialized 
    } = useEstablishments();



    // Local user state replacing useUser hook

    const [user, setUser] = React.useState<Partial<User>>(mockUser);

    const updateUser = (updatedUser: Partial<User>) => {

        setUser(prev => ({ ...prev, ...updatedUser }));

    };



    const router = useRouter();

    const searchParams = useSearchParams();

    const currentTabParam = searchParams.get('tab');

    const activeTab = currentTabParam && VALID_TABS.has(currentTabParam) ? currentTabParam : 'profile';



    // Local state for the form fields

    const [localEstablishment, setLocalEstablishment] = React.useState<Partial<Establishment> | null>(null);

    const [localUser, setLocalUser] = React.useState<Partial<User> | null>(null);



    // Devices state

    const { devices, addDevice, updateDevice, removeDevice } = useDevices();

    const [isDeviceDialogOpen, setIsDeviceDialogOpen] = React.useState(false);

    const [editingDevice, setEditingDevice] = React.useState<Partial<Device> | null>(null);

    const [isSearching, setIsSearching] = React.useState(false);

    const [foundDevices, setFoundDevices] = React.useState<{ name: string, model: string, ipAddress?: string }[]>([]);





    React.useEffect(() => {

        setLocalEstablishment(activeEstablishment ? { ...activeEstablishment } : null);

    }, [activeEstablishment]);





    React.useEffect(() => {

        if (user) {

            setLocalUser(user);

        }

    }, [user]);



    const handleEstablishmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        const { id, value } = e.target;

        setLocalEstablishment(prev => (prev ? { ...prev, [id]: value } : { [id]: value }));

    };



    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const { id, value } = e.target;

        setLocalUser(prev => (prev ? { ...prev, [id]: value } : { [id]: value }));

    };



    const handleEstablishmentSwitchChange = (checked: boolean, id: string) => {

        setLocalEstablishment(prev => (prev ? { ...prev, [id]: checked } : { [id]: checked }));

    }



    const handleEstablishmentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0];

            const reader = new FileReader();

            reader.onloadend = () => {

                setLocalEstablishment(prev => (prev ? { ...prev, image: reader.result as string } : { image: reader.result as string }));

            };

            reader.readAsDataURL(file);

        }

    };



    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0];

            const reader = new FileReader();

            reader.onloadend = () => {

                setLocalUser(prev => (prev ? { ...prev, avatar: reader.result as string } : { avatar: reader.result as string }));

            };

            reader.readAsDataURL(file);

        }

    };



    const handleCompanyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0];

            const reader = new FileReader();

            reader.onloadend = () => {

                if (localEstablishment) {

                    setLocalEstablishment(prev => (prev ? { ...prev, image: reader.result as string } : { image: reader.result as string }));

                }

            };

            reader.readAsDataURL(file);

        }

    };



    const handleSaveEstablishmentChanges = async () => {
        if (activeEstablishment && localEstablishment) {
            try {
                await updateEstablishment(activeEstablishment.id, localEstablishment);
                toast({
                    title: "Establecimiento actualizado",
                    description: "Los cambios se han guardado correctamente.",
                });
            } catch (error) {
                toast({
                    title: "Error al guardar",
                    description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
                    variant: "destructive",
                });
            }
        }
    };



    const handleSaveUserChanges = () => {

        if (user && localUser) {

            updateUser(localUser);

        }

    }



    const handleDeleteEstablishment = () => {

        if (activeEstablishment) {

            removeEstablishment(activeEstablishment.id);

            // Check if there are any establishments left after removal

            setTimeout(() => {

                if (establishments.length > 1) {

                    router.push('/settings/profile?tab=establishment');

                } else {

                    router.push('/settings/profile');

                }

            }, 0);

        }

    }



    const handleCreateFirstEstablishment = async () => {
        try {
            await addEstablishment();
            toast({
                title: "Establecimiento creado",
                description: "Bienvenido a Camarai. Tu primer local ha sido configurado.",
            });
            router.push('/settings/profile?tab=establishment');
        } catch (error) {
            toast({
                title: "Error al crear",
                description: "No se pudo crear el establecimiento. Inténtalo de nuevo.",
                variant: "destructive",
            });
        }
    };



    const handleOpenDeviceDialog = (type: DeviceType, device?: Device) => {

        setFoundDevices([]);

        if (device) {

            setEditingDevice(device);

        } else {

            // Set defaults for a new device

            setEditingDevice({

                type: type,

                name: '',

                model: 'EscPos',

                connectionMethod: 'wifi',

                active: true,

                role: 'ticket',

                useForCashDrawer: false,

                isControlPrinter: false,

                printsKitchenTickets: true,

                isMasterPrinter: false,

                finalTicketCopies: 1,

                printsDeliveryTickets: true,

            });

        }

        setIsDeviceDialogOpen(true);

    };



    const handleSaveDevice = () => {

        if (editingDevice) {

            if (editingDevice.id) {

                updateDevice(editingDevice.id, editingDevice);

            } else {

                addDevice(editingDevice as Omit<Device, 'id'>);

            }

        }

        setIsDeviceDialogOpen(false);

        setEditingDevice(null);

    };



    const handleSearchDevices = (method: 'bluetooth' | 'wifi') => {

        setIsSearching(true);

        setFoundDevices([]);

        setTimeout(() => {

            let simulatedDevices: { name: string, model: string, ipAddress?: string }[] = [];

            if (method === 'bluetooth') {

                simulatedDevices = [

                    { name: 'Impresora de Barra', model: 'EPSON-TM20' },

                    { name: 'KDS Cocina', model: 'KDS-Kitchen-Display' }

                ];

            } else { // wifi

                simulatedDevices = [

                    { name: 'Impresora Cocina', model: 'EPSON-TM-T88VI', ipAddress: '192.168.1.105' },

                    { name: 'TPV Barra', model: 'Square Terminal', ipAddress: '192.168.1.110' }

                ];

            }

            setFoundDevices(simulatedDevices);

            setIsSearching(false);

        }, 2000);

    };



    const handleSelectFoundDevice = (device: { name: string, model: string, ipAddress?: string }) => {

        setEditingDevice(prev => ({ ...prev, name: device.name, model: device.model, ipAddress: device.ipAddress }));

        setFoundDevices([]);

    }



    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <PageContainer>
                <PageHeader title="Ajustes Generales" />
                <PageContent>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-muted-foreground animate-pulse">Cargando ajustes...</div>
                    </div>
                </PageContent>
            </PageContainer>
        );
    }

    return (

        <PageContainer>

            <PageHeader title="Ajustes Generales" />

            <PageContent>

                <Tabs value={activeTab} onValueChange={(value) => router.push(`/settings/profile?tab=${value}`)} className="w-full">

                        <TabsList className="mb-4">

                            <TabsTrigger value="profile" icon={Users}>Perfil</TabsTrigger>

                            <TabsTrigger value="establishment" icon={Store}>Establecimiento</TabsTrigger>

                            <TabsTrigger value="company" icon={Building2}>Empresa</TabsTrigger>

                            <TabsTrigger value="devices" icon={Printer}>Dispositivos</TabsTrigger>

                            <TabsTrigger value="providers" icon={Users}>Proveedores</TabsTrigger>

                            <TabsTrigger value="integrations" icon={Plug}>Integraciones</TabsTrigger>

                            <TabsTrigger value="taxes" icon={Percent}>Impuestos</TabsTrigger>

                        </TabsList>



                    {/* Profile Tab */}

                    <ProfileTab

                        localUser={localUser}

                        profileFileInputRef={profileFileInputRef}

                        onProfileImageChange={handleProfileImageChange}

                        onUserInputChange={handleUserInputChange}

                        onSaveUserChanges={handleSaveUserChanges}

                    />

                    <EstablishmentTab

                        activeEstablishment={activeEstablishment}

                        establishments={establishments}

                        localEstablishment={localEstablishment}

                        establishmentFileInputRef={establishmentFileInputRef}

                        onEstablishmentImageChange={handleEstablishmentImageChange}

                        onEstablishmentInputChange={handleEstablishmentInputChange}

                        onEstablishmentSwitchChange={handleEstablishmentSwitchChange}

                        onSaveEstablishmentChanges={handleSaveEstablishmentChanges}

                        onDeleteEstablishment={handleDeleteEstablishment}

                        onCreateFirstEstablishment={handleCreateFirstEstablishment}
                        isInitialized={isInitialized}
                    />

                    <DevicesTab

                        devices={devices}

                        updateDevice={updateDevice}

                        removeDevice={removeDevice}

                        isDeviceDialogOpen={isDeviceDialogOpen}

                        setIsDeviceDialogOpen={setIsDeviceDialogOpen}

                        editingDevice={editingDevice}

                        setEditingDevice={setEditingDevice}

                        handleOpenDeviceDialog={handleOpenDeviceDialog}

                        handleSaveDevice={handleSaveDevice}

                        handleSearchDevices={handleSearchDevices}

                        isSearching={isSearching}

                        foundDevices={foundDevices}

                        setFoundDevices={setFoundDevices}

                        handleSelectFoundDevice={handleSelectFoundDevice}

                    />

                    <CompanyTab companyFileInputRef={companyFileInputRef} onCompanyImageChange={handleCompanyImageChange} />

                    <ProvidersTab />

                    <IntegrationsTab />

                    <TaxesTab />

                </Tabs>

            </PageContent>

        </PageContainer>

    );

}



export default function ProfileSettingsPage() {

    return (

        <React.Suspense fallback={<div>Cargando...</div>}>

            <ProfileSettingsPageContent />

        </React.Suspense>

    );

}

