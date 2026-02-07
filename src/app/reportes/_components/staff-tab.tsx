import * as React from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, Download, CheckCircle, XCircle, Clock2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        case 'approved': return { icon: CheckCircle, className: 'text-green-500', variant: 'completed' as const };
        case 'rejected': return { icon: XCircle, className: 'text-red-500', variant: 'destructive' as const };
        case 'pending':
        default: return { icon: Clock2, className: 'text-yellow-500', variant: 'in-progress' as const };
    }
};

export function StaffTab({
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
    onUpdateRequest,
}: StaffTabProps) {
    return (
        <TabsContent value="staff" className="space-y-6">
            <Tabs defaultValue="horas-trabajadas" className="w-full">
                <TabsList>
                    <TabsTrigger value="horas-trabajadas">Horas Trabajadas</TabsTrigger>
                    <TabsTrigger value="gestion-ausencias">Gestión de Ausencias</TabsTrigger>
                </TabsList>
                <TabsContent value="horas-trabajadas" className="pt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-muted-foreground">Filtros del Informe</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="staff-select-personal">Empleado</Label>
                                <Select value={selectedStaffId} onValueChange={onStaffChange}>
                                    <SelectTrigger id="staff-select-personal">
                                        <SelectValue placeholder="Seleccionar empleado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los empleados</SelectItem>
                                        {staffMembers.map(staff => (
                                            <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date-range-personal">Rango de Fechas</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date-personal"
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal truncate', !date && 'text-muted-foreground')}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (<>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>)
                                                    : (format(date.from, "dd/MM/yyyy"))) : (<span>Selecciona una fecha</span>)
                                            }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
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
                            <div className="flex items-end">
                                <Button className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar a CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedStaffId === 'all' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen por Empleado</CardTitle>
                                <CardDescription>Total de horas regulares y extra para el periodo seleccionado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table className="hidden md:table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Empleado</TableHead>
                                            <TableHead className="text-right">Horas Regulares</TableHead>
                                            <TableHead className="text-right">Horas Extra</TableHead>
                                            <TableHead className="text-right">Total Horas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(staffTotals).map(([staffId, data]) => (
                                            <TableRow key={staffId}>
                                                <TableCell className="font-medium">{data.name}</TableCell>
                                                <TableCell className="text-right">{data.regular.toFixed(2)}h</TableCell>
                                                <TableCell className="text-right">{data.extra.toFixed(2)}h</TableCell>
                                                <TableCell className="text-right font-bold">{(data.regular + data.extra).toFixed(2)}h</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="md:hidden space-y-4">
                                    {Object.entries(staffTotals).map(([staffId, data]) => (
                                        <Card key={staffId} className="p-4">
                                            <p className="font-bold mb-2">{data.name}</p>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between"><span>Horas Regulares:</span> <span>{data.regular.toFixed(2)}h</span></div>
                                                <div className="flex justify-between"><span>Horas Extra:</span> <span>{data.extra.toFixed(2)}h</span></div>
                                                <Separator className="my-1" />
                                                <div className="flex justify-between font-bold"><span>Total:</span> <span>{(data.regular + data.extra).toFixed(2)}h</span></div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalle de Fichajes</CardTitle>
                            <CardDescription>Lista detallada de todos los registros de entrada y salida para el periodo seleccionado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table className="hidden md:table">
                                <TableHeader>
                                    <TableRow>
                                        {selectedStaffId === 'all' && <TableHead>Empleado</TableHead>}
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Entrada</TableHead>
                                        <TableHead>Salida</TableHead>
                                        <TableHead className="text-right">Horas Regulares</TableHead>
                                        <TableHead className="text-right">Horas Extra</TableHead>
                                        <TableHead className="text-right font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timeReportData.map(({ log, regularHours, extraHours }) => (
                                        <TableRow key={log.id}>
                                            {selectedStaffId === 'all' && (
                                                <TableCell className="font-medium">
                                                    {staffMembers.find(s => s.id === log.staffMemberId)?.nombre || 'Desconocido'}
                                                </TableCell>
                                            )}
                                            <TableCell>{format(new Date(log.entrada), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{format(new Date(log.entrada), 'HH:mm')}</TableCell>
                                            <TableCell>{log.salida ? format(new Date(log.salida), 'HH:mm') : <Badge variant="in-progress">En Turno</Badge>}</TableCell>
                                            <TableCell className="text-right">{regularHours.toFixed(2)}h</TableCell>
                                            <TableCell className="text-right">{extraHours > 0 ? <Badge variant="warning">{extraHours.toFixed(2)}h</Badge> : '0.00h'}</TableCell>
                                            <TableCell className="text-right font-bold">{(regularHours + extraHours).toFixed(2)}h</TableCell>
                                        </TableRow>
                                    ))}
                                    {timeReportData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={selectedStaffId === 'all' ? 7 : 6} className="h-24 text-center">
                                                No se encontraron registros de fichajes para los filtros seleccionados.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="md:hidden space-y-4">
                                {timeReportData.map(({ log, regularHours, extraHours }) => (
                                    <Card key={log.id} className="p-4">
                                        {selectedStaffId === 'all' && <p className="font-bold mb-2">{staffMembers.find(s => s.id === log.staffMemberId)?.nombre || 'Desconocido'}</p>}
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span>Fecha:</span> <span>{format(new Date(log.entrada), 'dd/MM/yyyy')}</span></div>
                                            <div className="flex justify-between"><span>Entrada:</span> <span>{format(new Date(log.entrada), 'HH:mm')}</span></div>
                                            <div className="flex justify-between"><span>Salida:</span> <span>{log.salida ? format(new Date(log.salida), 'HH:mm') : <Badge variant="in-progress">En Turno</Badge>}</span></div>
                                            <Separator className="my-2" />
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
                <TabsContent value="gestion-ausencias" className="pt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-muted-foreground">Filtros de Ausencias</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="absence-staff-select">Empleado</Label>
                                <Select value={selectedStaffId} onValueChange={onStaffChange}>
                                    <SelectTrigger id="absence-staff-select">
                                        <SelectValue placeholder="Seleccionar empleado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los empleados</SelectItem>
                                        {staffMembers.map(staff => (
                                            <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="absence-date-range">Rango de Fechas</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="absence-date-range" variant="outline" className={cn('w-full justify-start text-left font-normal truncate', !date && 'text-muted-foreground')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (date.to ? (<>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>) : (format(date.from, "dd/MM/yyyy"))) : (<span>Selecciona una fecha</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={onDateChange} numberOfMonths={1} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="absence-type-select">Tipo de Ausencia</Label>
                                <Select value={selectedAbsenceType} onValueChange={onAbsenceTypeChange}>
                                    <SelectTrigger id="absence-type-select">
                                        <SelectValue placeholder="Tipo de Ausencia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los Tipos</SelectItem>
                                        <SelectItem value="vacation">Vacaciones</SelectItem>
                                        <SelectItem value="sick_leave">Baja Médica</SelectItem>
                                        <SelectItem value="personal_days">Asuntos Propios</SelectItem>
                                        <SelectItem value="other">Otros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="absence-status-select">Estado</Label>
                                <Select value={selectedAbsenceStatus} onValueChange={onAbsenceStatusChange}>
                                    <SelectTrigger id="absence-status-select" className="w-full md:w-[200px]">
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
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Ausencias</CardTitle>
                            <CardDescription>Busca y gestiona todas las solicitudes de ausencia de tu equipo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table className="hidden md:table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAbsenceRequests.map(req => {
                                        const statusProps = getRequestStatusProps(req.status);
                                        const employee = staffMembers.find(s => s.id === req.staffId);
                                        return (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{employee?.nombre || 'Desconocido'}</TableCell>
                                                <TableCell>{req.startDate}</TableCell>
                                                <TableCell>{req.type}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusProps.variant}>
                                                        <statusProps.icon className="mr-1 h-3 w-3" />
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="outline" className="hover:bg-destructive/10" onClick={() => onUpdateRequest(req, 'rejected')}>
                                                                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                Rechazar
                                                            </Button>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdateRequest(req, 'approved')}>Aprobar</Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Gestionada</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredAbsenceRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
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
                                        <Card key={req.id} className="p-4">
                                            <p className="font-bold mb-2">{employee?.nombre || 'Desconocido'}</p>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between"><span>Fecha:</span> <span>{req.startDate}</span></div>
                                                <div className="flex justify-between"><span>Tipo:</span> <span>{req.type}</span></div>
                                                <div className="flex justify-between items-center"><span>Estado:</span> <Badge variant={statusProps.variant}><statusProps.icon className="mr-1 h-3 w-3" />{req.status}</Badge></div>
                                            </div>
                                            {req.status === 'pending' && (
                                                <>
                                                    <Separator className="my-3" />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="outline" className="hover:bg-destructive/10 flex-1" onClick={() => onUpdateRequest(req, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            Rechazar
                                                        </Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => onUpdateRequest(req, 'approved')}>Aprobar</Button>
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
            </Tabs>
        </TabsContent>
    );
}
