'use client';
import { H3, H5, TextSM } from '@/components/ui/typography';

// Convex imports
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, MoreVertical, Users, Clock, Phone, PlusCircle, Edit, Trash, ChevronLeft, ChevronRight, MapPin, Settings, MessageSquare, Bell, Send, X, Calendar, Check, LayoutGrid, Armchair, Building2 } from 'lucide-react';
import { ActionTile } from '@/components/ui/action-tile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose, DialogWindow } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addMonths, startOfMonth, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useEstablishments } from '@/hooks/useEstablishments';
import { Select, SelectContent, SelectItemWithTrailing, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { ReservationDialog, type Reservation, type ReservationStatus } from '@/components/dialogs/reservas-edit-dialog';
import { WhatsAppNotificationsDialog } from '@/components/dialogs/reservas-notificaciones-dialog';

// Local type that matches actual Convex data structure
type LocalReservation = {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  environmentId?: string;
  tableId?: string;
};

// Type transformation functions
const transformLocalToDialog = (local: LocalReservation): Reservation => {
    const statusMap: Record<string, ReservationStatus> = {
        'pending': 'Pendiente',
        'confirmed': 'Confirmada',
        'cancelled': 'Cancelada',
        'completed': 'Completada',
        'no_show': 'Pendiente' // Map no_show to Pendiente for dialog
    };
    
    return {
        id: local.id,
        customerName: local.customerName,
        phone: local.phone,
        guests: local.guests,
        startTime: local.startTime,
        endTime: local.endTime,
        status: statusMap[local.status] || 'Pendiente',
        notes: local.notes,
        environmentId: local.environmentId,
        tableId: local.tableId
    };
};

const transformDialogToLocal = (dialog: Reservation): LocalReservation => {
    const statusMap: Record<string, 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'> = {
        'Pendiente': 'pending',
        'Confirmada': 'confirmed',
        'Cancelada': 'cancelled',
        'Completada': 'completed'
    };
    
    return {
        id: dialog.id,
        customerName: dialog.customerName,
        phone: dialog.phone,
        guests: dialog.guests,
        startTime: dialog.startTime,
        endTime: dialog.endTime,
        status: statusMap[dialog.status] || 'pending',
        notes: dialog.notes,
        environmentId: dialog.environmentId,
        tableId: dialog.tableId
    };
};

export default function ReservasPage() {
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isWhatsAppConfigOpen, setIsWhatsAppConfigOpen] = React.useState(false);
    const [editingReservation, setEditingReservation] = React.useState<LocalReservation | null>(null);
    const { toast } = useToast();
    const [displayMonth, setDisplayMonth] = React.useState(startOfMonth(new Date()));
    const [environmentFilterId, setEnvironmentFilterId] = React.useState<string>('all');
    const { activeEstablishment } = useEstablishments();
    const [collapsedReservations, setCollapsedReservations] = React.useState<Set<string>>(new Set());
    const [showTableAssignmentPopup, setShowTableAssignmentPopup] = React.useState<{ reservationId: string; availableTables: any[] } | null>(null);
    const environments = useQuery(api.environments.getEnvironmentsByEstablishment, 
        activeEstablishment ? { establishmentId: activeEstablishment.id as Id<"establishments"> } : "skip"
    ) || [];
    
    // Convex hooks
    const createReservation = useMutation(api.reservations.createReservation);
    const updateReservation = useMutation(api.reservations.updateReservation);
    const updateReservationStatus = useMutation(api.reservations.updateReservationStatus);
    const getReservations = useQuery(api.reservations.getReservations, 
        activeEstablishment ? {
            establishment_id: activeEstablishment.id as Id<"establishments">,
            date: format(selectedDate, 'yyyy-MM-dd')
        } : "skip"
    );
    const getReservationsByMonth = useQuery(api.reservations.getReservationsByMonth,
        activeEstablishment ? {
            establishment_id: activeEstablishment.id as Id<"establishments">,
            year: displayMonth.getFullYear(),
            month: displayMonth.getMonth()
        } : "skip"
    );


    // Transform Convex data to frontend format
    const dayReservations = React.useMemo(() => {
        if (!getReservations) return [];
        return getReservations.map((r: any) => ({
            id: r._id,
            customerName: r.customer_name || 'Cliente',
            phone: r.customer_phone || '',
            email: r.customer_email || '',
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            guests: r.guests,
            status: r.status,
            notes: r.notes,
            tableId: r.table_id,
            environmentId: r.environmentId
        }));
    }, [getReservations]);

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

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Check for conflicts when changing to confirmed status
            if (newStatus === 'confirmed') {
                const reservation = dayReservations.find(r => r.id === id);
                if (reservation && reservation.tableId && reservation.environmentId) {
                    // Check for conflicts with other confirmed reservations only
                    const todaysReservations = getReservations || [];
                    const hasConflict = todaysReservations.some(r => {
                        // Skip the current reservation and cancelled reservations
                        if (r._id === id || r.status === 'cancelled') return false;
                        
                        // Check if same table and overlapping time
                        if (r.table_id === reservation.tableId && r.environmentId === reservation.environmentId) {
                            const rStart = parse(r.start_time, 'HH:mm', new Date());
                            const rEnd = parse(r.end_time, 'HH:mm', new Date());
                            const reservationStart = parse(reservation.startTime, 'HH:mm', new Date());
                            const reservationEnd = parse(reservation.endTime, 'HH:mm', new Date());
                            
                            // Handle overnight
                            if (rEnd < rStart) rEnd.setDate(rEnd.getDate() + 1);
                            if (reservationEnd < reservationStart) reservationEnd.setDate(reservationEnd.getDate() + 1);
                            
                            // Check for overlap: (Start1 < End2) AND (End1 > Start2)
                            return reservationStart < rEnd && reservationEnd > rStart;
                        }
                        return false;
                    });
                    
                    if (hasConflict) {
                        toast({
                            title: "Conflicto de Reserva",
                            description: "No se puede confirmar esta reserva porque la mesa ya está ocupada en este horario por otra reserva confirmada.",
                            variant: "destructive"
                        });
                        return;
                    }
                }
            }
            
            await updateReservationStatus({
                reservationId: id as Id<"reservations">,
                status: newStatus as any
            });
            
            toast({
                title: `Reserva ${newStatus === 'confirmed' ? 'Confirmada' : newStatus === 'cancelled' ? 'Cancelada' : newStatus === 'completed' ? 'Completada' : newStatus === 'pending' ? 'Pendiente' : 'No Show'}`,
                description: `La reserva ha sido marcada como ${newStatus === 'confirmed' ? 'Confirmada' : newStatus === 'cancelled' ? 'Cancelada' : newStatus === 'completed' ? 'Completada' : newStatus === 'pending' ? 'Pendiente' : 'No Show'}.`
            });
        } catch (error) {
            console.error('Error updating reservation status:', error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado de la reserva.",
                variant: "destructive"
            });
        }
    }

    const handleSaveReservation = async (reservationData: Omit<LocalReservation, 'id'>, existingId?: string) => {
        try {
            if (!activeEstablishment) {
                toast({
                    title: "Error",
                    description: "No hay un establecimiento activo seleccionado.",
                    variant: "destructive"
                });
                return;
            }

            if (existingId) {
                // Update existing reservation
                await updateReservation({
                    reservation_id: existingId as Id<"reservations">,
                    customer_name: reservationData.customerName,
                    customer_phone: reservationData.phone,
                    customer_email: undefined,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    start_time: reservationData.startTime,
                    end_time: reservationData.endTime,
                    guests: reservationData.guests,
                    table_id: reservationData.tableId ? (reservationData.tableId as Id<"tables">) : undefined,
                    notes: reservationData.notes,
                });
                
                toast({
                    title: "Reserva Actualizada",
                    description: `La reserva de ${reservationData.customerName} ha sido modificada.`
                });
            } else {
                // Creating new reservation
                await createReservation({
                    establishment_id: activeEstablishment.id as Id<"establishments">,
                    customer_name: reservationData.customerName,
                    customer_phone: reservationData.phone,
                    customer_email: undefined, // TODO: Add to form if needed
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    start_time: reservationData.startTime,
                    end_time: reservationData.endTime,
                    guests: reservationData.guests,
                    table_id: reservationData.tableId ? (reservationData.tableId as Id<"tables">) : undefined,
                    notes: reservationData.notes,
                    source: "dashboard"
                });
                
                toast({
                    title: "Reserva Creada",
                    description: `La reserva de ${reservationData.customerName} ha sido creada.`
                });
            }
            setIsDialogOpen(false);
            setEditingReservation(null);
        } catch (error) {
            console.error('Error saving reservation:', error);
            toast({
                title: "Error",
                description: "No se pudo guardar la reserva. Inténtelo de nuevo.",
                variant: "destructive"
            });
        }
    };

    const handleEditReservation = (reservation: Reservation) => {
        const transformedReservation = transformDialogToLocal(reservation);
        setEditingReservation(transformedReservation);
        setIsDialogOpen(true);
    };

    const handleOpenNewReservation = () => {
        setEditingReservation(null);
        setIsDialogOpen(true);
    }

    const handleAssignTable = async (reservationId: string, environmentId: string, tableId: string) => {
        try {
            // Update reservation with new table assignment
            await updateReservation({
                reservation_id: reservationId as Id<"reservations">,
                table_id: tableId as Id<"tables">,
            });

            toast({
                title: "Mesa Asignada",
                description: "La mesa se ha asignado correctamente a la reserva."
            });
        } catch (error) {
            console.error('Error assigning table:', error);
            toast({
                title: "Error",
                description: "No se pudo asignar la mesa. Inténtelo de nuevo.",
                variant: "destructive"
            });
        }
    };

    // Wrapper functions to handle type transformations for dialog component
    const handleSaveReservationWrapper = (reservationData: Omit<Reservation, 'id'>, existingId?: string) => {
        // Transform from dialog type to local type
        const localData: Omit<LocalReservation, 'id'> = {
            customerName: reservationData.customerName,
            phone: reservationData.phone,
            guests: reservationData.guests,
            startTime: reservationData.startTime,
            endTime: reservationData.endTime,
            status: transformDialogToLocal({ ...reservationData, id: '' } as Reservation).status,
            notes: reservationData.notes,
            environmentId: reservationData.environmentId,
            tableId: reservationData.tableId
        };
        handleSaveReservation(localData, existingId);
    };

    const getAvailableTablesWrapper = (reservation: Partial<Reservation>) => {
        // Transform from dialog type to local type
        const localReservation: Partial<LocalReservation> = {
            customerName: reservation.customerName,
            phone: reservation.phone,
            guests: reservation.guests,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            status: reservation.status ? transformDialogToLocal({ ...reservation, id: '' } as Reservation).status : undefined,
            notes: reservation.notes,
            environmentId: reservation.environmentId,
            tableId: reservation.tableId
        };
        return getAvailableTablesForReservation(localReservation);
    };

    const handleConfirmReservation = (reservation: LocalReservation) => {
        // Check if reservation is cancelled and collapsed
        if (reservation.status === 'cancelled' && collapsedReservations.has(reservation.id)) {
            // Get available tables for this reservation
            const availableEnvironments = getAvailableTablesForReservation(reservation);
            
            // Format available tables for popup
            const availableTables = availableEnvironments.flatMap(env => 
                env.tables.map(table => ({
                    environment: env,
                    table: table
                }))
            );

            // Show popup with available tables
            setShowTableAssignmentPopup({
                reservationId: reservation.id,
                availableTables
            });
        } else {
            // Normal confirmation flow
            handleStatusChange(reservation.id, 'confirmed');
        }
    };

    const handleAssignTableAndConfirm = async (reservationId: string, environmentId: string, tableId: string) => {
        try {
            // Update reservation with table assignment and confirm status
            await updateReservation({
                reservation_id: reservationId as Id<"reservations">,
                table_id: tableId as Id<"tables">,
            });

            // Update status to confirmed
            await updateReservationStatus({
                reservationId: reservationId as Id<"reservations">,
                status: 'confirmed'
            });

            toast({
                title: "Reserva Confirmada",
                description: "La reserva ha sido confirmada y la mesa asignada automáticamente."
            });

            // Remove from collapsed reservations since it's now confirmed
            setCollapsedReservations(prev => {
                const newSet = new Set(prev);
                newSet.delete(reservationId);
                return newSet;
            });

        } catch (error) {
            console.error('Error assigning table and confirming reservation:', error);
            toast({
                title: "Error",
                description: "No se pudo asignar la mesa y confirmar la reserva.",
                variant: "destructive"
            });
        }
    };

    const toggleReservationCollapse = (reservationId: string) => {
        setCollapsedReservations(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reservationId)) {
                newSet.delete(reservationId);
            } else {
                newSet.add(reservationId);
            }
            return newSet;
        });
    };

    const getAvailableTablesForReservation = React.useCallback((reservation: Partial<LocalReservation>) => {
        if (!reservation.startTime || !reservation.endTime) return environments;

        const reservationStart = parse(`${reservation.startTime}`, 'HH:mm', new Date());
        const reservationEnd = parse(`${reservation.endTime}`, 'HH:mm', new Date());

        // Handle overnight
        if (reservationEnd < reservationStart) {
            reservationEnd.setDate(reservationEnd.getDate() + 1);
        }

        const todaysReservations = getReservations || [];
        const occupiedTables = new Set<string>(); // "envId-tableId"

        todaysReservations.forEach(r => {
            // Skip cancelled reservations - they don't block tables
            if (r.status === 'cancelled') return;
            
            if (r.table_id && r.environmentId) {
                const rStart = parse(r.start_time, 'HH:mm', new Date());
                const rEnd = parse(r.end_time, 'HH:mm', new Date());
                if (rEnd < rStart) rEnd.setDate(rEnd.getDate() + 1);

                const hasOverlap = reservationStart < rEnd && reservationEnd > rStart;
                const isSameReservation = r._id === reservation.id;
                const shouldCheckConflict = !isSameReservation;
                
                if (hasOverlap && shouldCheckConflict) {
                    occupiedTables.add(`${r.environmentId}-${r.table_id}`);
                }
            }
        });

        const availableEnvironments = environments.map(env => ({
            ...env,
            tables: env.tables.filter(table => !occupiedTables.has(`${env.id}-${table.id}`) && table.capacity >= (reservation.guests || 0))
        })).filter(env => env.tables.length > 0);

        return availableEnvironments;
    }, [getReservations, selectedDate, environments])


    const getStatusProps = (status: string) => {
        switch (status) {
            case 'confirmed': return { variant: 'completed' as const, text: 'Confirmada' };
            case 'pending': return { variant: 'in-progress' as const, text: 'Pendiente' };
            case 'cancelled': return { variant: 'destructive' as const, text: 'Cancelada' };
            case 'completed': return { variant: 'secondary' as const, text: 'Completada' };
            case 'no_show': return { variant: 'outline' as const, text: 'No Show' };
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
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const dayReservationsCount = getReservationsByMonth?.[dateStr] || 0;
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
                                            ? assignedEnv.tables.find((t) => t.id === res.tableId)
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
                                                                <DropdownMenuItem onClick={() => handleConfirmReservation(res)} disabled={res.status === 'confirmed'}>
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
                                                                                            <DropdownMenuItem key={table.id} onSelect={() => handleAssignTable(res.id, env.id, table.id)}>
                                                                                                <Armchair />
                                                                                                Mesa {table.number}
                                                                                                {res.tableId === table.id.toString() && (
                                                                                                    <Check className="ml-auto h-4 w-4 text-green-600" />
                                                                                                )}
                                                                                            </DropdownMenuItem>
                                                                                        ))}
                                                                                    </DropdownMenuSubContent>
                                                                                </DropdownMenuSub>
                                                                            )
                                                                        ))}
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'cancelled')} disabled={res.status === 'cancelled'}>
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
                    onSave={handleSaveReservationWrapper}
                    getAvailableTables={getAvailableTablesWrapper}
                    environments={environments}
                    editingReservation={editingReservation ? transformLocalToDialog(editingReservation) : null}
                />

                <WhatsAppNotificationsDialog
                    open={isWhatsAppConfigOpen}
                    onOpenChange={setIsWhatsAppConfigOpen}
                />

                {/* Table Assignment Popup */}
                <Dialog open={!!showTableAssignmentPopup} onOpenChange={() => setShowTableAssignmentPopup(null)}>
                    <DialogWindow size="sm">
                        <DialogHeader
                            icon={Armchair}
                            title="Asignar Mesa Automática"
                            description="Esta reserva está cancelada y colapsada. Se asignará automáticamente una mesa disponible y se confirmará la reserva."
                        />
                        <DialogContent spaced>
                            {showTableAssignmentPopup?.availableTables.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Mesa disponible encontrada:
                                    </p>
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <Armchair className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-800">
                                            {showTableAssignmentPopup.availableTables[0].environment.name} - Mesa {showTableAssignmentPopup.availableTables[0].table.number}
                                        </span>
                                        <Badge variant="secondary" size="xs">
                                            {showTableAssignmentPopup.availableTables[0].table.capacity} personas
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <X className="h-5 w-5 text-red-600" />
                                    <span className="text-red-800">
                                        No hay mesas disponibles para esta reserva.
                                    </span>
                                </div>
                            )}
                        </DialogContent>
                        <DialogFooter
                            onCancel={() => setShowTableAssignmentPopup(null)}
                            cancelText="Cancelar"
                            onConfirm={() => {
                                if (showTableAssignmentPopup?.availableTables.length > 0) {
                                    const { reservationId, availableTables } = showTableAssignmentPopup;
                                    const firstAvailable = availableTables[0];
                                    handleAssignTableAndConfirm(reservationId, firstAvailable.environment.id, firstAvailable.table.id);
                                }
                                setShowTableAssignmentPopup(null);
                            }}
                            confirmText={showTableAssignmentPopup?.availableTables.length > 0 ? "Confirmar y Asignar Mesa" : "Cerrar"}
                            confirmDisabled={!showTableAssignmentPopup?.availableTables.length}
                        />
                    </DialogWindow>
                </Dialog>
            </PageContent>
        </PageContainer>
    );
}

