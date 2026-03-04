import * as React from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, Download, CheckCircle, XCircle, Clock2, Check, X, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { StaffMember, AbsenceRequest } from '@/data/mock-data';
import type { TimeReportEntry } from '@/data/reportes';

type StaffTotals = Record<string, { name: string; regular: number; extra: number }>;

type StaffTabProps = {
    mode: 'hours' | 'absences';
    staffMembers: StaffMember[];
    selectedStaffId: string;
    onStaffChange: (value: string) => void;
    date: DateRange | undefined;
    onDateChange: (range: DateRange | undefined) => void;
    timeReportData: TimeReportEntry[];
    staffTotals: StaffTotals;
    selectedAbsenceType: string;
    onAbsenceTypeChange: (value: string) => void;
    selectedAbsenceStatus: string;
    onAbsenceStatusChange: (value: string) => void;
    filteredAbsenceRequests: AbsenceRequest[];
    onUpdateRequest: (req: AbsenceRequest, newStatus: AbsenceRequest['status']) => void;
};

const getRequestStatusProps = (status: AbsenceRequest['status']) => {
    switch (status) {
        case 'approved': return { label: 'Aprobado', variant: 'success' as const, icon: Check };
        case 'rejected': return { label: 'Rechazado', variant: 'destructive' as const, icon: X };
        case 'pending':
        default: return { label: 'Pendiente', variant: 'secondary' as const, icon: Clock2 };
    }
};

const absenceTypeLabels: Record<string, string> = {
    'vacation': 'Vacaciones',
    'sick_leave': 'Baja Médica',
    'personal_days': 'Asuntos Propios',
    'other': 'Otros'
};

export function StaffTab({
    mode,
    staffMembers,
    selectedStaffId,
    onStaffChange,
    date,
    onDateChange,
    timeReportData,
    staffTotals,
    selectedAbsenceType,
    onAbsenceTypeChange,
    selectedAbsenceStatus,
    onAbsenceStatusChange,
    filteredAbsenceRequests,
    onUpdateRequest }: StaffTabProps) {
    
    if (mode === 'hours') {
        return (
            <TabsContent value="hours" spaced>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedStaffId} onValueChange={onStaffChange}>
                            <SelectTrigger id="staff-select-personal" width="lg">
                                <SelectValue placeholder="Empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {staffMembers.map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-personal"
                                    variant="outline"
                                    size="md"
                                    width="lg"
                                    justify="start"
                                    truncate
                                    startIcon={<CalendarIcon />}
                                >
                                    {date?.from ? (
                                        date.to ? (<>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>)
                                            : (format(date.from, "dd/MM/yyyy"))) : (<span>Selecciona una fecha</span>)
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent padding="none" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={onDateChange}
                                    numberOfMonths={1}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button variant="default" size="md" responsiveWidth="auto-sm" startIcon={<Download />}>
                        Exportar CSV
                    </Button>
                </div>

                {selectedStaffId === 'all' && (
                    <Card>
                        <CardHeader title="Resumen por Empleado">
                            <CardDescription>Total de horas regulares y extra para el periodo seleccionado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table showOnDesktop>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead align="right">Horas Regulares</TableHead>
                                        <TableHead align="right">Horas Extra</TableHead>
                                        <TableHead align="right">Total Horas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(staffTotals).map(([staffId, data]) => (
                                        <TableRow key={staffId}>
                                            <TableCell variant="medium">{data.name}</TableCell>
                                            <TableCell align="right">{data.regular.toFixed(2)}h</TableCell>
                                            <TableCell align="right">{data.extra.toFixed(2)}h</TableCell>
                                            <TableCell align="right" variant="medium">{(data.regular + data.extra).toFixed(2)}h</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="md:hidden space-y-4">
                                {Object.entries(staffTotals).map(([staffId, data]) => (
                                    <Card key={staffId} padding="md">
                                        <p className="font-bold mb-2">{data.name}</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span>Horas Regulares:</span> <span>{data.regular.toFixed(2)}h</span></div>
                                            <div className="flex justify-between"><span>Horas Extra:</span> <span>{data.extra.toFixed(2)}h</span></div>
                                            <Separator margin="xs" />
                                            <div className="flex justify-between font-bold"><span>Total:</span> <span>{(data.regular + data.extra).toFixed(2)}h</span></div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader title="Detalle de Fichajes">
                        <CardDescription>Lista detallada de todos los registros de entrada y salida para el periodo seleccionado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table showOnDesktop>
                            <TableHeader>
                                <TableRow>
                                    {selectedStaffId === 'all' && <TableHead>Empleado</TableHead>}
                                    <TableHead>Fecha</TableHead>
                                    <TableHead align="center">Entrada</TableHead>
                                    <TableHead align="center">Salida</TableHead>
                                    <TableHead align="center">Horas Regulares</TableHead>
                                    <TableHead align="center">Horas Extra</TableHead>
                                    <TableHead align="center" variant="medium">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timeReportData.map(({ log, regularHours, extraHours }) => (
                                    <TableRow key={log.id}>
                                        {selectedStaffId === 'all' && (
                                            <TableCell variant="medium">
                                                {staffMembers.find(s => s.id === log.staffMemberId)?.nombre || 'Desconocido'}
                                            </TableCell>
                                        )}
                                        <TableCell>{format(new Date(log.entrada), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell align="center" variant="mono">{format(new Date(log.entrada), 'HH:mm')}</TableCell>
                                        <TableCell align="center" variant="mono">{log.salida ? format(new Date(log.salida), 'HH:mm') : <Badge variant="secondary">En Turno</Badge>}</TableCell>
                                        <TableCell align="center">{regularHours.toFixed(2)}h</TableCell>
                                        <TableCell align="center">{extraHours > 0 ? <Badge variant="warning">{extraHours.toFixed(2)}h</Badge> : '0.00h'}</TableCell>
                                        <TableCell align="center" variant="medium">{(regularHours + extraHours).toFixed(2)}h</TableCell>
                                    </TableRow>
                                ))}
                                {timeReportData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={selectedStaffId === 'all' ? 7 : 6} height="xl" align="center">
                                            No se encontraron registros de fichajes para los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="md:hidden space-y-4">
                            {timeReportData.map(({ log, regularHours, extraHours }) => (
                                <Card key={log.id} padding="md">
                                    {selectedStaffId === 'all' && <p className="font-bold mb-2">{staffMembers.find(s => s.id === log.staffMemberId)?.nombre || 'Desconocido'}</p>}
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between"><span>Fecha:</span> <span>{format(new Date(log.entrada), 'dd/MM/yyyy')}</span></div>
                                        <div className="flex justify-between"><span>Entrada:</span> <span>{format(new Date(log.entrada), 'HH:mm')}</span></div>
                                        <div className="flex justify-between"><span>Salida:</span> <span>{log.salida ? format(new Date(log.salida), 'HH:mm') : <Badge variant="in-progress">En Turno</Badge>}</span></div>
                                        <Separator margin="sm" />
                                        <div className="flex justify-between"><span>H. Regulares:</span> <span>{regularHours.toFixed(2)}h</span></div>
                                        <div className="flex justify-between"><span>H. Extra:</span> <span>{extraHours > 0 ? <Badge variant="warning">{extraHours.toFixed(2)}h</Badge> : '0.00h'}</span></div>
                                        <div className="flex justify-between font-bold"><span>Total:</span> <span>{(regularHours + extraHours).toFixed(2)}h</span></div>
                                    </div>
                                </Card>
                            ))}
                            {timeReportData.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No se encontraron registros.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="absences" spaced>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedStaffId} onValueChange={onStaffChange}>
                        <SelectTrigger id="absence-staff-select" width="md">
                            <SelectValue placeholder="Empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {staffMembers.map(staff => (
                                <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button id="absence-date-range" variant="outline" size="md" width="lg" justify="start" truncate startIcon={<CalendarIcon />}>
                                {date?.from ? (date.to ? (<>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>) : (format(date.from, "dd/MM/yyyy"))) : (<span>Selecciona una fecha</span>)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent padding="none" align="start">
                            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={onDateChange} numberOfMonths={1} />
                        </PopoverContent>
                    </Popover>

                    <Select value={selectedAbsenceType} onValueChange={onAbsenceTypeChange}>
                        <SelectTrigger id="absence-type-select" width="md">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Tipos</SelectItem>
                            <SelectItem value="vacation">Vacaciones</SelectItem>
                            <SelectItem value="sick_leave">Baja Médica</SelectItem>
                            <SelectItem value="personal_days">Asuntos Propios</SelectItem>
                            <SelectItem value="other">Otros</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedAbsenceStatus} onValueChange={onAbsenceStatusChange}>
                        <SelectTrigger id="absence-status-select" width="md">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="approved">Aprobada</SelectItem>
                            <SelectItem value="rejected">Rechazada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader title="Historial de Ausencias">
                    <CardDescription>Busca y gestiona todas las solicitudes de ausencia de tu equipo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table showOnDesktop>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead visibility="hidden-mobile">Tipo</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead align="center">Estado</TableHead>
                                <TableHead align="right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAbsenceRequests.map(req => {
                                const statusProps = getRequestStatusProps(req.status);
                                const employee = staffMembers.find(s => s.id === req.staffId);
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell variant="medium">{employee?.nombre || 'Desconocido'}</TableCell>
                                        <TableCell visibility="hidden-mobile" textTransform="capitalize">{(absenceTypeLabels[req.type] || req.type).replace('_', ' ')}</TableCell>
                                        <TableCell textSize="sm">
                                            {format(new Date(req.startDate), 'dd/MM/yyyy')} - {req.endDate ? format(new Date(req.endDate), 'dd/MM/yyyy') : format(new Date(req.startDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Badge variant={statusProps.variant}>
                                                {statusProps.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell align="right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost-success" onClick={() => onUpdateRequest(req, 'approved')} startIcon={<Check />} />
                                                    <Button size="sm" variant="ghost-destructive" onClick={() => onUpdateRequest(req, 'rejected')} startIcon={<X />} />
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredAbsenceRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" height="xl">
                                        No se encontraron solicitudes con los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="md:hidden space-y-4">
                        {filteredAbsenceRequests.map(req => {
                            const statusProps = getRequestStatusProps(req.status);
                            const employee = staffMembers.find(s => s.id === req.staffId);
                            return (
                                <Card key={req.id} padding="md">
                                    <p className="font-bold mb-2">{employee?.nombre || 'Desconocido'}</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between"><span>Fecha:</span> <span>{req.startDate}</span></div>
                                        <div className="flex justify-between"><span>Tipo:</span> <span>{req.type}</span></div>
                                        <div className="flex justify-between items-center"><span>Estado:</span> <Badge variant={statusProps.variant} startIcon={<statusProps.icon />}>{req.status}</Badge></div>
                                    </div>
                                    {req.status === 'pending' && (
                                        <>
                                            <Separator margin="md" />
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="ghost-destructive" fullWidth onClick={() => onUpdateRequest(req, 'rejected')} startIcon={<XCircle />}>
                                                    Rechazar
                                                </Button>
                                                <Button size="sm" variant="success" fullWidth onClick={() => onUpdateRequest(req, 'approved')} startIcon={<CheckCircle />}>Aprobar</Button>
                                            </div>
                                        </>
                                    )}
                                </Card>
                            );
                        })}
                        {filteredAbsenceRequests.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No se encontraron solicitudes.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}

