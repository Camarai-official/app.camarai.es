'use client';
import { H3, H5, TextSM } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, MoreVertical, Users, Clock, Phone, PlusCircle, Edit, Trash, ChevronLeft, ChevronRight, MapPin, Settings, MessageSquare, Bell, Send, X, Calendar, Check, LayoutGrid, Armchair, Building2 } from 'lucide-react';
import { ActionTile } from '@/components/ui/action-tile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addMonths, startOfMonth, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useEnvironments } from '@/hooks/useEnvironments';
import { Select, SelectContent, SelectItemWithTrailing, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Environment } from '@/data/environments';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { ReservationDialog, type Reservation } from '@/components/dialogs/reservas-edit-dialog';
import { WhatsAppNotificationsDialog } from '@/components/dialogs/reservas-notificaciones-dialog';

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
    ]
};

export default function ReservasPage() {
    const [reservations, setReservations] = React.useState(initialReservations);
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isWhatsAppConfigOpen, setIsWhatsAppConfigOpen] = React.useState(false);
    const [editingReservation, setEditingReservation] = React.useState<Reservation | null>(null);
    const { toast } = useToast();
    const [displayMonth, setDisplayMonth] = React.useState(startOfMonth(new Date()));
    const [environmentFilterId, setEnvironmentFilterId] = React.useState<string>('all');
    const { environments } = useEnvironments();


    const dayReservations = reservations[format(selectedDate, 'yyyy-MM-dd')] || [];

    const filteredDayReservations = React.useMemo(() => {
        if (environmentFilterId === 'all') return dayReservations;
        return dayReservations.filter((r) => r.environmentId === environmentFilterId);
    }, [dayReservations, environmentFilterId]);

    /** Reservas del día seleccionado por ambiente (solo cuentan las que ya tienen mesa asignada en ese ambiente). */
    const reservationCountsForDay = React.useMemo(() => {
        const byEnvironmentId = Object.fromEntries(environments.map((e) => [e.id, 0])) as Record<string, number>;
        for (const r of dayReservations) {
            if (r.environmentId && r.environmentId in byEnvironmentId) {
                byEnvironmentId[r.environmentId]++;
            }
        }
        return { total: dayReservations.length, byEnvironmentId };
    }, [dayReservations, environments]);

    const triggerFilterCount =
        environmentFilterId === 'all'
            ? reservationCountsForDay.total
            : reservationCountsForDay.byEnvironmentId[environmentFilterId] ?? 0;

    const listDescription =
        environmentFilterId === 'all'
            ? `${dayReservations.length} reservas`
            : dayReservations.length === 0
              ? '0 reservas'
              : `${filteredDayReservations.length} de ${dayReservations.length} reservas`;

    const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        setReservations(prev => ({
            ...prev,
            [dateKey]: prev[dateKey].map(res => res.id === id ? { ...res, status: newStatus } : res)
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
                ).sort((a, b) => a.startTime.localeCompare(b.startTime))
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
                    [dateKey]: [...dayReservations, newReservation].sort((a, b) => a.startTime.localeCompare(b.startTime))
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


    const getStatusProps = (status: Reservation['status']) => {
        switch (status) {
            case 'Confirmada': return { variant: 'completed' as const, text: 'Confirmada' };
            case 'Pendiente': return { variant: 'in-progress' as const, text: 'Pendiente' };
            case 'Cancelada': return { variant: 'destructive' as const, text: 'Cancelada' };
            case 'Completada': return { variant: 'secondary' as const, text: 'Completada' };
            default: return { variant: 'outline' as const, text: 'Desconocido' };
        }
    }

    const handleNextMonth = () => setDisplayMonth(current => addMonths(current, 1));
    const handlePrevMonth = () => setDisplayMonth(current => addMonths(current, -1));


    return (
        <PageContainer className="lg:h-full lg:overflow-hidden">
            <PageHeader title="Gestión de Reservas" />
            <PageContent className="lg:flex-row flex-1 min-h-0" gap="lg">
                <Card padding="md" flex className="flex-1 lg:h-full overflow-hidden min-h-[450px]">
                    <div className="w-full h-full">
                        <UICalendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(day) => day && setSelectedDate(day)}
                            locale={es}
                            month={displayMonth}
                            onMonthChange={(month) => setDisplayMonth(startOfMonth(month))}
                            numberOfMonths={1}
                            variant="grid"
                            className="h-full w-full p-0"
                            components={{
                                Caption: ({ ...props }) => {
                                    return (
                                        <div className="flex justify-between items-center px-1 mb-2">
                                            {props.displayIndex === 0 && (
                                                <Button onClick={handlePrevMonth} variant="outline" size="md" startIcon={<ChevronLeft />} />
                                            )}
                                            <H5>
                                                {format(props.displayMonth, 'LLLL yyyy', { locale: es })}
                                            </H5>
                                            {props.displayIndex === 0 && (
                                                <Button onClick={handleNextMonth} variant="outline" size="md" startIcon={<ChevronRight />} />
                                            )}
                                        </div>
                                    )
                                },
                                DayContent: ({ date }) => {
                                    const dayReservationsCount = reservations[format(date, 'yyyy-MM-dd')]?.length || 0;
                                    return (
                                        <div className="relative flex flex-col items-center justify-center h-full w-full py-1">
                                            <span className="text-xs sm:text-sm">{format(date, 'd')}</span>
                                            <div className="mt-0.5">
                                                {dayReservationsCount > 0 && (
                                                    <Badge variant="default" className="h-4 sm:h-5 px-1 sm:px-2 text-[8px] sm:text-[10px] rounded-full">{dayReservationsCount}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            }}
                        />
                    </div>
                </Card>
                <div className="lg:w-1/3 xl:w-1/3 flex flex-col gap-4 h-full overflow-hidden">
                    <Card flex padding="none" className="h-full overflow-hidden">
                        <CardHeader
                            title={format(selectedDate, "PPP", { locale: es })}
                            description={listDescription}
                            actions={
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <Select value={environmentFilterId} onValueChange={setEnvironmentFilterId}>
                                        <SelectTrigger
                                            width="xl"
                                            className="min-w-[260px] max-w-[min(100%,320px)] !w-[min(100%,320px)] antialiased [&>span]:line-clamp-none [&>span]:flex [&>span]:min-w-0 [&>span]:flex-1 [&>span]:flex-nowrap [&>span]:items-center"
                                            aria-label="Filtrar por ambiente"
                                        >
                                            <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
                                                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="min-w-0 flex-1 basis-0 overflow-hidden text-left">
                                                    <SelectValue
                                                        placeholder="Ambiente"
                                                        className="block truncate whitespace-nowrap text-left text-sm leading-none"
                                                    />
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    size="xs"
                                                    className="ml-0.5 shrink-0 tabular-nums px-2 py-0 leading-none"
                                                    title="Reservas este día (este filtro)"
                                                >
                                                    {triggerFilterCount}
                                                </Badge>
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                            <SelectItemWithTrailing
                                                value="all"
                                                label="Todos los ambientes"
                                                trailing={
                                                    <Badge
                                                        variant="secondary"
                                                        size="xs"
                                                        className="shrink-0 tabular-nums min-w-[1.25rem] justify-center px-1.5"
                                                    >
                                                        {reservationCountsForDay.total}
                                                    </Badge>
                                                }
                                            />
                                            {environments.map((env) => (
                                                <SelectItemWithTrailing
                                                    key={env.id}
                                                    value={env.id}
                                                    label={env.name}
                                                    trailing={
                                                        <Badge
                                                            variant="secondary"
                                                            size="xs"
                                                            className="shrink-0 tabular-nums min-w-[1.25rem] justify-center px-1.5"
                                                        >
                                                            {reservationCountsForDay.byEnvironmentId[env.id] ?? 0}
                                                        </Badge>
                                                    }
                                                />
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant='default' onClick={handleOpenNewReservation} size="md" startIcon={<PlusCircle />}>
                                    </Button>
                                    <Button variant="outline" size="md" onClick={() => setIsWhatsAppConfigOpen(true)}>
                                        <MessageSquare />
                                    </Button>
                                </div>
                            }
                        />
                        <CardContent flex padding="sm" gap="sm" className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredDayReservations.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredDayReservations.map(res => {
                                        const statusProps = getStatusProps(res.status);
                                        const availableEnvironments = getAvailableTablesForReservation(res);
                                        const assignedEnv = res.environmentId ? environments.find(e => e.id === res.environmentId) : null;
                                        const assignedTable = assignedEnv
                                            ? assignedEnv.tables.find((t) => t.id === String(res.tableId))
                                            : null;
                                        
                                        const description = (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3 text-xs opacity-80">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{res.startTime} - {res.endTime}</span>
                                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{res.guests}</span>
                                                </div>
                                                {assignedTable && assignedEnv && (
                                                    <div className="flex items-center gap-1 text-primary font-medium text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {assignedEnv.name} - Mesa {assignedTable.number}
                                                    </div>
                                                )}
                                            </div>
                                        );

                                        return (
                                            <ActionTile
                                                key={res.id}
                                                title={res.customerName}
                                                description={description}
                                                variant="outline"
                                                rightContent={
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={statusProps.variant} size="xs">{statusProps.text}</Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="md" className="h-10 w-10">
                                                                    <MoreHorizontal className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEditReservation(res)}>
                                                                    <Edit />
                                                                    Editar reserva
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Confirmada')} disabled={res.status === 'Confirmada'}>
                                                                    <Check />
                                                                    Confirmar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger><LayoutGrid />Asignar Mesa</DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        {availableEnvironments.map(env => (
                                                                            env.tables.length > 0 && (
                                                                                <DropdownMenuSub key={env.id}>
                                                                                    <DropdownMenuSubTrigger className='w-full'>{env.name}</DropdownMenuSubTrigger>
                                                                                    <DropdownMenuSubContent>
                                                                                        {env.tables.map(table => (
                                                                                            <DropdownMenuItem key={table.id} onSelect={() => handleAssignTable(res.id, env.id, Number(table.id))}>
                                                                                                <Armchair />
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
                                                                    <X />
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground pt-16">
                                    <TextSM>
                                        {dayReservations.length === 0
                                            ? 'No hay reservas para este día.'
                                            : 'No hay reservas para este ambiente en este día.'}
                                    </TextSM>
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
            </PageContent>
        </PageContainer>
    );
}

