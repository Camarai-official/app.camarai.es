
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Users, Clock, Phone, PlusCircle, Edit, Trash, ChevronLeft, ChevronRight, MapPin, Settings, MessageSquare, Bell, Send, X, Calendar, Check, LayoutGrid, Armchair  } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addMonths, startOfMonth, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useEnvironments } from '@/hooks/useEnvironments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Environment } from '@/data/environments';
import { PageHeader } from '@/components/layout/page-header';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';

type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  environmentId?: string;
  tableId?: number;
};

const initialReservations: { [key: string]: Reservation[] } = {
  [format(new Date(), 'yyyy-MM-dd')]: [
    { id: 'res-1', customerName: 'Carlos Sánchez', phone: '600123456', guests: 4, startTime: '21:00', endTime: '22:30', status: 'Confirmada', environmentId: 'main-hall', tableId: 1 },
    { id: 'res-2', customerName: 'Ana Martínez', phone: '600654321', guests: 2, startTime: '21:30', endTime: '23:30', status: 'Pendiente', notes: 'Mesa en la terraza, si es posible.' },
  ],
  [format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')]: [ // Tomorrow
    { id: 'res-3', customerName: 'Lucía Fernández', phone: '600789012', guests: 5, startTime: '14:00', endTime: '15:30', status: 'Confirmada' },
  ],
  [format(new Date(Date.now() + 2 * 86400000), 'yyyy-MM-dd')]: [ // Day after tomorrow
    { id: 'res-4', customerName: 'Javier López', phone: '600234567', guests: 2, startTime: '20:30', endTime: '21:45', status: 'Pendiente' },
    { id: 'res-5', customerName: 'Elena Gómez', phone: '600345678', guests: 8, startTime: '22:00', endTime: '00:30', status: 'Confirmada', notes: 'Celebración de cumpleaños.' },
    { id: 'res-6', customerName: 'David Moreno', phone: '600456789', guests: 3, startTime: '21:00', endTime: '22:30', status: 'Cancelada' },
  ],
};


function ReservationDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    getAvailableTables, 
    environments,
    editingReservation 
}: { 
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (res: Omit<Reservation, 'id'>, id?: string) => void;
    getAvailableTables: (res: Partial<Reservation>) => Environment[];
    environments: Environment[];
    editingReservation?: Reservation | null;
}) {
    const isEditing = !!editingReservation;
    
    const [reservation, setReservation] = React.useState<Omit<Reservation, 'id' | 'status'>>({
        customerName: '',
        phone: '',
        guests: 2,
        startTime: '20:30',
        endTime: '22:00',
        notes: '',
        environmentId: undefined,
        tableId: undefined,
    });

    const [selectedEnvId, setSelectedEnvId] = React.useState<string | undefined>(undefined);

    // Initialize form when editing
    React.useEffect(() => {
        if (editingReservation) {
            setReservation({
                customerName: editingReservation.customerName,
                phone: editingReservation.phone,
                guests: editingReservation.guests,
                startTime: editingReservation.startTime,
                endTime: editingReservation.endTime,
                notes: editingReservation.notes || '',
                environmentId: editingReservation.environmentId,
                tableId: editingReservation.tableId,
            });
            setSelectedEnvId(editingReservation.environmentId);
        } else {
            setReservation({
                customerName: '',
                phone: '',
                guests: 2,
                startTime: '20:30',
                endTime: '22:00',
                notes: '',
                environmentId: undefined,
                tableId: undefined,
            });
            setSelectedEnvId(undefined);
        }
    }, [editingReservation, open]);

    const availableTablesByEnv = React.useMemo(() => {
        if (!selectedEnvId) return [];
        const availableEnvs = getAvailableTables({ ...reservation, id: editingReservation?.id });
        const selectedAvailableEnv = availableEnvs.find(e => e.id === selectedEnvId);
        return selectedAvailableEnv ? selectedAvailableEnv.tables : [];
    }, [selectedEnvId, reservation, getAvailableTables, editingReservation?.id]);
    
    React.useEffect(() => {
        // Reset table selection if environment changes (only for new reservations)
        if (!isEditing) {
            setReservation(p => ({ ...p, tableId: undefined }));
        }
    }, [selectedEnvId, isEditing]);

    const handleSave = () => {
        const status = isEditing ? editingReservation.status : 'Confirmada';
        onSave({ ...reservation, status }, editingReservation?.id);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle icon={Calendar}>{isEditing ? 'Editar Reserva' : 'Añadir Nueva Reserva'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Modifica los datos de la reserva.' 
                            : 'Introduce los datos para crear una reserva manualmente.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Nombre del Cliente</Label>
                            <Input id="customerName" value={reservation.customerName} onChange={e => setReservation(p => ({...p, customerName: e.target.value}))}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" type="tel" value={reservation.phone} onChange={e => setReservation(p => ({...p, phone: e.target.value}))}/>
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guests">Comensales</Label>
                            <Input id="guests" type="number" min="1" value={reservation.guests} onChange={e => setReservation(p => ({...p, guests: parseInt(e.target.value) || 1}))}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Hora de Inicio</Label>
                            <Input id="startTime" type="time" value={reservation.startTime} onChange={e => setReservation(p => ({...p, startTime: e.target.value}))}
                            className="dark:[color-scheme:dark]" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="endTime">Hora de Fin</Label>
                            <Input id="endTime" type="time" value={reservation.endTime} onChange={e => setReservation(p => ({...p, endTime: e.target.value}))}
                            className="dark:[color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="environment-select">Ambiente</Label>
                             <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
                                <SelectTrigger id="environment-select">
                                    <SelectValue placeholder="Seleccionar ambiente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {environments.map(env => (
                                        <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="table-select">Mesa</Label>
                             <Select 
                                value={reservation.tableId?.toString()} 
                                onValueChange={(val) => setReservation(p => ({...p, tableId: parseInt(val), environmentId: selectedEnvId }))}
                                disabled={!selectedEnvId || availableTablesByEnv.length === 0}
                             >
                                <SelectTrigger id="table-select">
                                    <SelectValue placeholder={!selectedEnvId ? 'Elige un ambiente' : 'Mesas disponibles...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTablesByEnv.map(table => (
                                        <SelectItem key={table.id} value={table.id.toString()}>Mesa {table.number} (Cap: {table.capacity})</SelectItem>
                                    ))}
                                    {selectedEnvId && availableTablesByEnv.length === 0 && <p className="text-sm text-muted-foreground p-2">No hay mesas disponibles.</p>}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notas (Opcional)</Label>
                        <Textarea id="notes" placeholder="Alergias, preferencias de mesa, celebración, etc." value={reservation.notes} onChange={e => setReservation(p => ({...p, notes: e.target.value}))}/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <Button variant="brand" onClick={handleSave}>{isEditing ? 'Guardar Cambios' : 'Crear Reserva'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// WhatsApp Notifications Config Dialog
function WhatsAppNotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [config, setConfig] = React.useState({
        confirmationEnabled: true,
        reminder24h: true,
        reminder2h: true,
        cancellationEnabled: true,
        feedbackEnabled: false,
    });
    
    const [templates, setTemplates] = React.useState({
        confirmation: '¡Hola {nombre}! Tu reserva para {comensales} personas el {fecha} a las {hora} ha sido confirmada. ¡Te esperamos!',
        reminder: '¡Hola {nombre}! Te recordamos tu reserva para hoy a las {hora}. ¡Te esperamos!',
        cancellation: 'Hola {nombre}, tu reserva para el {fecha} ha sido cancelada. Si tienes dudas, contáctanos.',
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
            description: 'Las notificaciones de WhatsApp han sido actualizadas.',
        });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle icon={MessageSquare}>
                        Notificaciones WhatsApp
                    </DialogTitle>
                    <DialogDescription>
                        Configura los mensajes automáticos para las reservas.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="config" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="config" className="space-y-4 mt-4">
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
                </Tabs>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Configuración</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ReservasPage() {
  const [reservations, setReservations] = React.useState(initialReservations);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isWhatsAppConfigOpen, setIsWhatsAppConfigOpen] = React.useState(false);
  const [editingReservation, setEditingReservation] = React.useState<Reservation | null>(null);
  const { toast } = useToast();
  const [displayMonth, setDisplayMonth] = React.useState(startOfMonth(new Date()));
  const { environments } = useEnvironments();


  const dayReservations = reservations[format(selectedDate, 'yyyy-MM-dd')] || [];

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setReservations(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].map(res => res.id === id ? {...res, status: newStatus} : res)
    }));
    toast({
        title: `Reserva ${newStatus}`,
        description: `La reserva ha sido marcada como ${newStatus.toLowerCase()}.`
    });
  }
  
  const handleSaveReservation = (reservationData: Omit<Reservation, 'id'>, existingId?: string) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    if (existingId) {
        // Editing existing reservation
        setReservations(prev => ({
            ...prev,
            [dateKey]: prev[dateKey].map(res => 
                res.id === existingId 
                    ? { ...res, ...reservationData }
                    : res
            ).sort((a,b) => a.startTime.localeCompare(b.startTime))
        }));
        toast({
            title: "Reserva Actualizada",
            description: `La reserva de ${reservationData.customerName} ha sido modificada.`
        });
    } else {
        // Creating new reservation
        const newReservation: Reservation = {
            ...reservationData,
            id: `res-${Date.now()}`
        };
        setReservations(prev => {
            const dayReservations = prev[dateKey] || [];
            return {
                ...prev,
                [dateKey]: [...dayReservations, newReservation].sort((a,b) => a.startTime.localeCompare(b.startTime))
            }
        });
        toast({
            title: "Reserva Creada",
            description: `Se ha añadido la reserva para ${reservationData.customerName}.`
        });
    }
    setEditingReservation(null);
  };
  
  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsDialogOpen(true);
  };
  
  const handleOpenNewReservation = () => {
    setEditingReservation(null);
    setIsDialogOpen(true);
  }

  const handleAssignTable = (reservationId: string, environmentId: string, tableId: number) => {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setReservations(prev => ({
          ...prev,
          [dateKey]: prev[dateKey].map(res => 
              res.id === reservationId 
              ? { ...res, environmentId, tableId, status: 'Confirmada' }
              : res
          )
      }));
      toast({
          title: "Mesa Asignada",
          description: "La mesa se ha asignado a la reserva y ha sido confirmada."
      });
  };

  const getAvailableTablesForReservation = React.useCallback((reservation: Partial<Reservation>) => {
      if (!reservation.startTime || !reservation.endTime) return environments;

      const reservationStart = parse(`${reservation.startTime}`, 'HH:mm', new Date());
      const reservationEnd = parse(`${reservation.endTime}`, 'HH:mm', new Date());
      
      // Handle overnight
      if (reservationEnd < reservationStart) {
          reservationEnd.setDate(reservationEnd.getDate() + 1);
      }

      const todaysReservations = reservations[format(selectedDate, 'yyyy-MM-dd')] || [];
      const occupiedTables = new Set<string>(); // "envId-tableId"

      todaysReservations.forEach(r => {
          if (r.id !== reservation.id && r.tableId && r.environmentId) {
              const rStart = parse(r.startTime, 'HH:mm', new Date());
              const rEnd = parse(r.endTime, 'HH:mm', new Date());
              if (rEnd < rStart) rEnd.setDate(rEnd.getDate() + 1);

              // Check for overlap
              if (reservationStart < rEnd && reservationEnd > rStart) {
                  occupiedTables.add(`${r.environmentId}-${r.tableId}`);
              }
          }
      });
      
      return environments.map(env => ({
          ...env,
          tables: env.tables.filter(table => !occupiedTables.has(`${env.id}-${table.id}`) && table.capacity >= (reservation.guests || 0))
      })).filter(env => env.tables.length > 0);
  }, [reservations, selectedDate, environments])


  const getStatusProps = (status: ReservationStatus) => {
    switch (status) {
        case 'Confirmada': return { variant: 'completed' as const, text: 'Confirmada' };
        case 'Pendiente': return { variant: 'in-progress' as const, text: 'Pendiente' };
        case 'Cancelada': return { variant: 'destructive' as const, text: 'Cancelada' };
        case 'Completada': return { variant: 'secondary' as const, text: 'Completada' };
        default: return { variant: 'outline' as const, text: 'Desconocido' };
    }
  }
  
  const handleNextMonth = () => setDisplayMonth(current => addMonths(current, 2));
  const handlePrevMonth = () => setDisplayMonth(current => addMonths(current, -2));


  return (
    <div className="flex flex-1 flex-col h-full">
      <PageHeader title="Gestión de Reservas" />
      <main className="flex-grow flex flex-col lg:flex-row gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
        <Card className="w-full lg:w-auto flex-grow flex justify-center items-start p-2 md:p-4">
            <div className="w-full">
                <UICalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => day && setSelectedDate(day)}
                    locale={es}
                    month={displayMonth}
                    onMonthChange={(month) => setDisplayMonth(startOfMonth(month))}
                    numberOfMonths={2}
                    className="p-0 flex flex-col"
                    classNames={{
                        months: 'flex flex-col space-y-4 w-full',
                        month: 'space-y-4 w-full',
                        caption: 'flex justify-center pt-1 relative items-center',
                        head_row: "grid grid-cols-7",
                        head_cell: "w-full",
                        row: 'grid grid-cols-7 w-full mt-2',
                        cell: 'w-full',
                        day: "h-14 w-full text-base",
                        day_selected: "bg-background text-background-foreground hover:bg-background hover:text-background-foreground focus:bg-background focus:text-background-foreground",
                    }}
                    components={{
                        Caption: ({ ...props }) => {
                             return (
                                <div className="flex justify-between items-center px-1 mb-2">
                                    {props.displayIndex === 0 && (
                                        <Button onClick={handlePrevMonth} variant="outline" size="icon" className="h-7 w-7">
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    )}
                                     <h2 className="text-sm font-medium text-center flex-1">
                                        {format(props.displayMonth, 'LLLL yyyy', { locale: es })}
                                    </h2>
                                    {props.displayIndex === 0 && (
                                         <Button onClick={handleNextMonth} variant="outline" size="icon" className="h-7 w-7">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )
                        },
                        DayContent: ({ date }) => {
                            const dayReservationsCount = reservations[format(date, 'yyyy-MM-dd')]?.length || 0;
                            return (
                                <div className="relative flex flex-col items-center justify-center h-full w-full">
                                    <span>{format(date, 'd')}</span>
                                    {dayReservationsCount > 0 && (
                                        <Badge variant="default" className="mt-1 h-5 px-2 text-[10px] rounded-full">{dayReservationsCount}</Badge>
                                    )}
                                </div>
                            )
                        },
                    }}
                />
            </div>
        </Card>
        <div className="lg:w-1/3 xl:w-1/3 flex flex-col gap-4">
            <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <div>
                        <CardTitle className="text-lg font-bold">
                            {format(selectedDate, "PPP", { locale: es })}
                        </CardTitle>
                        <CardDescription>{dayReservations.length} reservas</CardDescription>
                    </div>
                     <div className="mt-4 flex gap-2">
                        <Button className="flex-1" onClick={handleOpenNewReservation} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4"/>Añadir Reserva
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsWhatsAppConfigOpen(true)}>
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0 overflow-y-auto custom-scrollbar">
                    {dayReservations.length > 0 ? (
                        <div className="space-y-3">
                            {dayReservations.map(res => {
                                const statusProps = getStatusProps(res.status);
                                const availableEnvironments = getAvailableTablesForReservation(res);
                                const assignedEnv = res.environmentId ? environments.find(e => e.id === res.environmentId) : null;
                                const assignedTable = assignedEnv ? assignedEnv.tables.find(t => t.id === res.tableId) : null;
                                return (
                                    <div key={res.id} className="p-3 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{res.customerName}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{res.startTime} - {res.endTime}</span>
                                                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{res.guests} pers.</span>
                                                </p>
                                                 {assignedTable && assignedEnv && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        <span className="font-medium text-primary">{assignedEnv.name} - Mesa {assignedTable.number}</span>
                                                    </p>
                                                 )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2"><MoreVertical className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditReservation(res)}>
                                                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        Editar reserva
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Confirmada')} disabled={res.status === 'Confirmada'}>
                                                        <Check className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        Confirmar
                                                    </DropdownMenuItem>
                                                     <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger><LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />Asignar Mesa</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {availableEnvironments.map(env => (
                                                                env.tables.length > 0 && (
                                                                    <DropdownMenuSub key={env.id}>
                                                                        <DropdownMenuSubTrigger className='w-full'>{env.name}</DropdownMenuSubTrigger>
                                                                        <DropdownMenuSubContent>
                                                                            {env.tables.map(table => (
                                                                                <DropdownMenuItem key={table.id} onSelect={() => handleAssignTable(res.id, env.id, table.id)}>
                                                                                    <Armchair className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                    Mesa {table.number} (Cap: {table.capacity})
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuSubContent>
                                                                    </DropdownMenuSub>
                                                                )
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Cancelada')}>
                                                        <X className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        Cancelar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="mt-2 flex justify-between items-end">
                                            <Badge variant={statusProps.variant}>{statusProps.text}</Badge>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{res.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground pt-16">
                            <p>No hay reservas para este día.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <ReservationDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onSave={handleSaveReservation} 
            getAvailableTables={getAvailableTablesForReservation}
            environments={environments}
            editingReservation={editingReservation}
        />
        
        <WhatsAppNotificationsDialog
            open={isWhatsAppConfigOpen}
            onOpenChange={setIsWhatsAppConfigOpen}
        />
      </main>
    </div>
  );
}
