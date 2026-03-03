import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import { Bluetooth, Building2, Cable, Loader2, Monitor, MoreVertical, Pencil, PlusCircle, Printer, Trash, Users, Wifi } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogClose } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';
import type { Device, DeviceType, ConnectionMethod, DeviceRole } from '@/data/devices';

type FoundDevice = { name: string; model: string; ipAddress?: string };

type DevicesTabProps = {
    devices: Device[];
    updateDevice: (id: string, data: Partial<Device>) => void;
    removeDevice: (id: string) => void;
    isDeviceDialogOpen: boolean;
    setIsDeviceDialogOpen: (open: boolean) => void;
    editingDevice: Partial<Device> | null;
    setEditingDevice: React.Dispatch<React.SetStateAction<Partial<Device> | null>>;
    handleOpenDeviceDialog: (type: DeviceType, device?: Device) => void;
    handleSaveDevice: () => void;
    handleSearchDevices: (method: 'bluetooth' | 'wifi') => void;
    isSearching: boolean;
    foundDevices: FoundDevice[];
    setFoundDevices: React.Dispatch<React.SetStateAction<FoundDevice[]>>;
    handleSelectFoundDevice: (device: FoundDevice) => void;
};

const deviceCategories: { type: DeviceType; title: string; description: string; icon: React.ElementType }[] = [
    { type: 'printer', title: 'Impresoras', description: 'Tickets, comandas y facturas.', icon: Printer },
    { type: 'kds', title: 'Pantallas de Cocina (KDS)', description: 'Agiliza los pedidos en cocina.', icon: Monitor },
    { type: 'pos', title: 'POS', description: 'Puntos de venta (Point of Sale).', icon: Users },
    { type: 'cash_register', title: 'Cajas Registradoras', description: 'Gestión de efectivo y pagos.', icon: Building2 },
];

function ConnectionIcon({ method }: { method: ConnectionMethod }) {
    switch (method) {
        case 'wifi': return <Wifi className="h-4 w-4 text-blue-500" />;
        case 'bluetooth': return <Bluetooth className="h-4 w-4 text-indigo-500" />;
        case 'cable': return <Cable className="h-4 w-4 text-gray-500" />;
        default: return null;
    }
}

export function DevicesTab({
    devices,
    updateDevice,
    removeDevice,
    isDeviceDialogOpen,
    setIsDeviceDialogOpen,
    editingDevice,
    setEditingDevice,
    handleOpenDeviceDialog,
    handleSaveDevice,
    handleSearchDevices,
    isSearching,
    foundDevices,
    setFoundDevices,
    handleSelectFoundDevice }: DevicesTabProps) {
    return (
        <TabsContent value="devices">
            <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {deviceCategories.map(({ type, title, description, icon: Icon }) => {
                        const filteredDevices = devices.filter(d => d.type === type);
                        return (
                            <Card key={type}>
                                <CardHeader
                                    icon={Icon}
                                    title={title}
                                    description={description}
                                />
                                <CardContent padding="none">
                                    <div className="divide-y border-t">
                                        {filteredDevices.map(device => (
                                            <ActionTile
                                                key={device.id}
                                                variant="none"
                                                padding="md"
                                                icon={<ConnectionIcon method={device.connectionMethod} />}
                                                title={device.name}
                                                description={device.model}
                                                rightContentType="custom"
                                                customContent={
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={device.active} onCheckedChange={(checked) => updateDevice(device.id, { active: checked })} />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="md">
                                                                    <MoreVertical />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleOpenDeviceDialog(type, device)}><Pencil />Editar</DropdownMenuItem>
                                                                <DropdownMenuItem textVariant="destructive" onClick={() => removeDevice(device.id)}><Trash />Eliminar</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter padding="md">
                                    <Button size="md" variant="outline" fullWidth startIcon={<PlusCircle />} onClick={() => handleOpenDeviceDialog(type)}>
                                        Añadir {title === 'POS' ? 'POS' : title.slice(0, -1)}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                <DialogWindow size="md">
                    <DialogHeader
                        icon={editingDevice?.type === 'printer' ? Printer : Monitor}
                        title={`${editingDevice?.id ? 'Editar' : 'Añadir'} ${editingDevice?.type === 'printer' ? 'Impresora' : 'Dispositivo'}`}
                        description="Configura los detalles de tu dispositivo y su conexión."
                    />
                    <DialogContent spaced>
                        {/* Section: Información Básica */}
                        <div className="flex flex-col gap-4 p-4 border rounded-xl bg-muted/30">
                            <Label variant="medium">Información Básica</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="device-name">Nombre del Dispositivo</Label>
                                    <Input id="device-name" placeholder="Ej: Impresora de Barra" value={editingDevice?.name || ''} onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="device-model">Modelo</Label>
                                    <Select value={editingDevice?.model} onValueChange={(value) => setEditingDevice({ ...editingDevice, model: value })}>
                                        <SelectTrigger id="device-model"><SelectValue placeholder="Selecciona un modelo..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EscPos">EscPos</SelectItem>
                                            <SelectItem value="StarGraphic">StarGraphic</SelectItem>
                                            <SelectItem value="StarPRNT">StarPRNT</SelectItem>
                                            <SelectItem value="ZPL">ZPL</SelectItem>
                                            <SelectItem value="Usb">Usb</SelectItem>
                                            <SelectItem value="EscPosMatrix">EscPosMatrix</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="connection-method">Método de Conexión</Label>
                                <Select value={editingDevice?.connectionMethod} onValueChange={(value: ConnectionMethod) => { setEditingDevice({ ...editingDevice, connectionMethod: value }); setFoundDevices([]); }}>
                                    <SelectTrigger id="connection-method"><SelectValue placeholder="Selecciona un método" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wifi">Wi-Fi</SelectItem>
                                        <SelectItem value="bluetooth">Bluetooth</SelectItem>
                                        <SelectItem value="cable">Cable (USB/Ethernet)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Section: Conectividad y Búsqueda */}
                        {(editingDevice?.connectionMethod === 'wifi' || editingDevice?.connectionMethod === 'bluetooth') && (
                            <div className="flex flex-col gap-4 p-4 border rounded-xl">
                                <Label variant="medium">Conectividad</Label>
                                <Button 
                                    size="md" variant="outline" 
                                    fullWidth 
                                    onClick={() => handleSearchDevices(editingDevice?.connectionMethod as 'wifi' | 'bluetooth')} 
                                    disabled={isSearching}
                                    startIcon={isSearching ? <Loader2 className="animate-spin" /> : (editingDevice?.connectionMethod === 'wifi' ? <Wifi /> : <Bluetooth />)}
                                >
                                    {isSearching ? 'Buscando...' : `Buscar Dispositivos ${editingDevice?.connectionMethod === 'wifi' ? 'Wi-Fi' : 'Bluetooth'}`}
                                </Button>

                                {editingDevice?.connectionMethod === 'wifi' && (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="device-ip">Dirección IP</Label>
                                        <Input id="device-ip" placeholder="192.168.1.100" value={editingDevice?.ipAddress || ''} onChange={(e) => setEditingDevice({ ...editingDevice, ipAddress: e.target.value })} />
                                    </div>
                                )}

                                {foundDevices.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <Label>Dispositivos encontrados</Label>
                                        <div className="divide-y border rounded-xl overflow-hidden">
                                            {foundDevices.map((device, index) => (
                                                <ActionTile
                                                    key={index}
                                                    variant="none"
                                                    padding="sm"
                                                    title={device.name}
                                                    description={`${device.model} ${device.ipAddress ? `(${device.ipAddress})` : ''}`}
                                                    rightContentType="button"
                                                    buttonText="Conectar"
                                                    onButtonClick={() => handleSelectFoundDevice(device)}
                                                    buttonVariant="ghost"
                                                    buttonSize="sm"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section: Roles para Impresoras */}
                        {editingDevice?.type === 'printer' && (
                            <>
                                <div className="flex flex-col gap-4 p-4 border rounded-xl">
                                    <Label variant="medium">Roles y Funciones</Label>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="device-role">Rol Principal</Label>
                                        <Select value={editingDevice?.role} onValueChange={(value: DeviceRole) => setEditingDevice({ ...editingDevice, role: value })}>
                                            <SelectTrigger id="device-role"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ticket">Ticket Principal</SelectItem>
                                                <SelectItem value="kitchen">Cocina</SelectItem>
                                                <SelectItem value="control">Control (Copia Extra)</SelectItem>
                                                <SelectItem value="none">Ninguno</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <ActionTile
                                            variant="none"
                                            padding="none"
                                            title="Impresora de Arqueo"
                                            description="Abre el cajón portamonedas automáticamente."
                                            rightContentType="switch"
                                            switchId="useForCashDrawer"
                                            switchChecked={!!editingDevice?.useForCashDrawer}
                                            onSwitchChange={(c) => setEditingDevice({ ...editingDevice, useForCashDrawer: c })}
                                        />
                                        <ActionTile
                                            variant="none"
                                            padding="none"
                                            title="Impresión Master"
                                            description="Centraliza las impresiones en este dispositivo."
                                            rightContentType="switch"
                                            switchId="isMasterPrinter"
                                            switchChecked={!!editingDevice?.isMasterPrinter}
                                            onSwitchChange={(c) => setEditingDevice({ ...editingDevice, isMasterPrinter: c })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 p-4 border rounded-xl">
                                    <Label variant="medium">Configuración de Tickets</Label>
                                    <div className="flex flex-col gap-3">
                                        <ActionTile
                                            variant="none"
                                            padding="none"
                                            title="Tickets de Cocina"
                                            description="Habilitar impresión automática para cocina."
                                            rightContentType="switch"
                                            switchId="printsKitchenTickets"
                                            switchChecked={!!editingDevice?.printsKitchenTickets}
                                            onSwitchChange={(c) => setEditingDevice({ ...editingDevice, printsKitchenTickets: c })}
                                        />
                                        <ActionTile
                                            variant="none"
                                            padding="none"
                                            title="Tickets de Delivery"
                                            description="Habilitar impresión automática para domicilio."
                                            rightContentType="switch"
                                            switchId="printsDeliveryTickets"
                                            switchChecked={!!editingDevice?.printsDeliveryTickets}
                                            onSwitchChange={(c) => setEditingDevice({ ...editingDevice, printsDeliveryTickets: c })}
                                        />
                                        <div className="flex flex-col gap-2 pt-2">
                                            <Label htmlFor="finalTicketCopies">Copias del Ticket Final</Label>
                                            <Input id="finalTicketCopies" type="number" min="0" value={editingDevice?.finalTicketCopies} onChange={e => setEditingDevice({ ...editingDevice, finalTicketCopies: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                    <DialogFooter
                        onCancel={() => setIsDeviceDialogOpen(false)}
                        cancelText="Cancelar"
                        onConfirm={handleSaveDevice}
                        confirmText="Guardar Dispositivo"
                    />
                </DialogWindow>
            </Dialog>
        </TabsContent>
    );
}

