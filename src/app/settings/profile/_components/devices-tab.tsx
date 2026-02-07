import * as React from 'react';
import { Bluetooth, Building2, Cable, Loader2, Monitor, MoreVertical, Pencil, PlusCircle, Printer, Trash, Users, Wifi } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ConfigItem } from '@/components/ui/config-item';
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
    handleSelectFoundDevice,
}: DevicesTabProps) {
    return (
        <TabsContent value="devices">
            <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                    {deviceCategories.map(({ type, title, description, icon: Icon }) => {
                        const filteredDevices = devices.filter(d => d.type === type);
                        return (
                            <Card key={type} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Icon className="h-8 w-8 text-primary" />
                                        <div>
                                            <CardTitle className="font-bold text-muted-foreground">{title}</CardTitle>
                                            <CardDescription>{description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    {filteredDevices.map(device => (
                                        <ConfigItem
                                            key={device.id}
                                            icon={<ConnectionIcon method={device.connectionMethod} />}
                                            label={device.name}
                                            description={device.model}
                                        >
                                            <Switch checked={device.active} onCheckedChange={(checked) => updateDevice(device.id, { active: checked })} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenDeviceDialog(type, device)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => removeDevice(device.id)}><Trash className="mr-2 h-4 w-4 text-muted-foreground" />Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </ConfigItem>
                                    ))}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" onClick={() => handleOpenDeviceDialog(type)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Añadir {title === 'POS' ? 'POS' : title.slice(0, -1)}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle icon={editingDevice?.type === 'printer' ? Printer : Monitor}>{editingDevice?.id ? 'Editar' : 'Añadir'} {editingDevice?.type === 'printer' ? 'Impresora' : 'Dispositivo'}</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de tu nuevo dispositivo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-muted-foreground">Información Básica</h3>
                            <div className="space-y-2">
                                <Label htmlFor="device-name">Nombre del Dispositivo</Label>
                                <Input id="device-name" placeholder="Ej: Impresora de Barra" value={editingDevice?.name || ''} onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
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
                            <div className="space-y-2">
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
                            {editingDevice?.connectionMethod === 'wifi' && (
                                <div className="space-y-4">
                                    <Button type="button" className="w-full" onClick={() => handleSearchDevices('wifi')} disabled={isSearching}>
                                        {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />}
                                        {isSearching ? 'Buscando...' : 'Buscar Dispositivos en la Red'}
                                    </Button>
                                    <div className="space-y-2">
                                        <Label htmlFor="device-ip">Dirección IP</Label>
                                        <Input id="device-ip" placeholder="192.168.1.100" value={editingDevice?.ipAddress || ''} onChange={(e) => setEditingDevice({ ...editingDevice, ipAddress: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            {editingDevice?.connectionMethod === 'bluetooth' && (
                                <div className="space-y-4">
                                    <Button type="button" className="w-full" onClick={() => handleSearchDevices('bluetooth')} disabled={isSearching}>
                                        {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bluetooth className="mr-2 h-4 w-4" />}
                                        {isSearching ? 'Buscando...' : 'Buscar Dispositivos Bluetooth'}
                                    </Button>
                                </div>
                            )}
                            {foundDevices.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <Label>Dispositivos encontrados</Label>
                                    <div className="border rounded-md">
                                        {foundDevices.map((device, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer" onClick={() => handleSelectFoundDevice(device)}>
                                                <div>
                                                    <p className='text-sm font-medium'>{device.name}</p>
                                                    <p className='text-xs text-muted-foreground'>{device.model} {device.ipAddress && `(${device.ipAddress})`}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">Conectar</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {editingDevice?.type === 'printer' && (
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-muted-foreground">Roles y Funciones</h3>
                                <div className="space-y-2">
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="useForCashDrawer" className="flex flex-col gap-0.5">
                                        <span>Impresora de Arqueo</span>
                                        <span className="text-xs font-normal text-muted-foreground">Abre el cajón portamonedas.</span>
                                    </Label>
                                    <Switch id="useForCashDrawer" checked={editingDevice?.useForCashDrawer} onCheckedChange={(c) => setEditingDevice({ ...editingDevice, useForCashDrawer: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="isMasterPrinter" className="flex flex-col gap-0.5">
                                        <span>Impresión Master</span>
                                        <span className="text-xs font-normal text-muted-foreground">Centraliza las impresiones en este dispositivo.</span>
                                    </Label>
                                    <Switch id="isMasterPrinter" checked={editingDevice?.isMasterPrinter} onCheckedChange={(c) => setEditingDevice({ ...editingDevice, isMasterPrinter: c })} />
                                </div>
                            </div>
                        )}

                        {editingDevice?.type === 'printer' && (
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-muted-foreground">Configuración de Tickets</h3>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="printsKitchenTickets">Imprimir tickets de cocina</Label>
                                    <Switch id="printsKitchenTickets" checked={editingDevice?.printsKitchenTickets} onCheckedChange={(c) => setEditingDevice({ ...editingDevice, printsKitchenTickets: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="printsDeliveryTickets">Imprimir tickets de Delivery</Label>
                                    <Switch id="printsDeliveryTickets" checked={editingDevice?.printsDeliveryTickets} onCheckedChange={(c) => setEditingDevice({ ...editingDevice, printsDeliveryTickets: c })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="finalTicketCopies">Copias del Ticket Final</Label>
                                    <Input id="finalTicketCopies" type="number" min="0" value={editingDevice?.finalTicketCopies} onChange={e => setEditingDevice({ ...editingDevice, finalTicketCopies: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSaveDevice}>Guardar Dispositivo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>
    );
}
