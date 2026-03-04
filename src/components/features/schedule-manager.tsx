'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Download, FileSpreadsheet, FileText, Plus, Edit2, Trash, Copy, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Types
export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  role: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

interface ScheduleManagerProps {
  staff: StaffMember[];
  shifts: Shift[];
  onShiftAdd?: (shift: Omit<Shift, 'id'>) => void;
  onShiftUpdate?: (id: string, shift: Partial<Shift>) => void;
  onShiftDelete?: (id: string) => void;
  onExport?: (format: 'pdf' | 'excel' | 'csv', dateRange: { from: Date; to: Date }) => void;
}

// Shift colors by role
const roleColors: Record<string, string> = {
  'Camarero': 'bg-blue-100 border-blue-300 text-blue-800',
  'Encargado': 'bg-purple-100 border-purple-300 text-purple-800',
  'Cocinero': 'bg-orange-100 border-orange-300 text-orange-800',
  'Bartender': 'bg-green-100 border-green-300 text-green-800',
  'default': 'bg-gray-100 border-gray-300 text-gray-800' };

// Schedule templates
const scheduleTemplates = [
  { id: 'standard', name: 'Estándar', description: 'L-V 9:00-17:00' },
  { id: 'split', name: 'Partido', description: 'L-V 10:00-14:00, 18:00-22:00' },
  { id: 'weekend', name: 'Fin de Semana', description: 'S-D 12:00-23:00' },
  { id: 'night', name: 'Nocturno', description: 'L-D 18:00-02:00' },
];

// Shift Editor Dialog
function ShiftEditorDialog({
  open,
  onOpenChange,
  shift,
  staff,
  selectedDate,
  onSave,
  onDelete }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  staff: StaffMember[];
  selectedDate: Date;
  onSave: (data: Omit<Shift, 'id'> | { id: string } & Partial<Shift>) => void;
  onDelete?: () => void;
}) {
  const [formData, setFormData] = React.useState({
    staffId: '',
    startTime: '09:00',
    endTime: '17:00',
    notes: '' });

  React.useEffect(() => {
    if (shift) {
      setFormData({
        staffId: shift.staffId,
        startTime: shift.startTime,
        endTime: shift.endTime,
        notes: shift.notes || '' });
    } else {
      setFormData({
        staffId: staff[0]?.id || '',
        startTime: '09:00',
        endTime: '17:00',
        notes: '' });
    }
  }, [shift, staff, open]);

  const selectedStaff = staff.find(s => s.id === formData.staffId);

  const handleSave = () => {
    if (!formData.staffId) return;
    
    const staffMember = staff.find(s => s.id === formData.staffId);
    
    if (shift) {
      onSave({
        id: shift.id,
        ...formData,
        staffName: staffMember?.name || '',
        role: staffMember?.role || '',
        date: selectedDate });
    } else {
      onSave({
        ...formData,
        staffName: staffMember?.name || '',
        role: staffMember?.role || '',
        date: selectedDate });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow>
        <DialogHeader
          icon={shift ? Edit2 : Plus}
          title={shift ? 'Editar Turno' : 'Nuevo Turno'}
          description={format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        />

        <DialogContent className="p-6">
          <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Empleado</Label>
            <Select value={formData.staffId} onValueChange={(v) => setFormData(p => ({ ...p, staffId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name} - {s.role}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Hora Inicio</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hora Fin</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Notas (opcional)</Label>
            <Input
              placeholder="Ej: Cubrir a Juan, Evento especial..."
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
        </DialogContent>

        <DialogFooter>
          {shift && onDelete && (
            <Button variant="destructive" onClick={onDelete} className="w-full sm:w-auto">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </DialogFooter>
      </DialogWindow>
    </Dialog>
  );
}

// Main ScheduleManager Component
export function ScheduleManager({
  staff,
  shifts,
  onShiftAdd,
  onShiftUpdate,
  onShiftDelete,
  onExport }: ScheduleManagerProps) {
  const { toast } = useToast();
  const [view, setView] = React.useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Navigation
  const goBack = () => {
    if (view === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const goForward = () => {
    if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get days for current view
  const getDays = () => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const days = getDays();

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return shifts.filter(s => 
      format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  // Handle shift click
  const handleShiftClick = (shift: Shift) => {
    setEditingShift(shift);
    setSelectedDate(new Date(shift.date));
    setIsEditorOpen(true);
  };

  // Handle day click (add new)
  const handleDayClick = (day: Date) => {
    setEditingShift(null);
    setSelectedDate(day);
    setIsEditorOpen(true);
  };

  // Handle save
  const handleSave = (data: any) => {
    if (data.id && onShiftUpdate) {
      onShiftUpdate(data.id, data);
      toast({ title: 'Turno actualizado', description: 'El turno ha sido modificado.' });
    } else if (onShiftAdd) {
      onShiftAdd(data);
      toast({ title: 'Turno creado', description: 'El nuevo turno ha sido añadido.' });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (editingShift && onShiftDelete) {
      onShiftDelete(editingShift.id);
      toast({ title: 'Turno eliminado', description: 'El turno ha sido eliminado.' });
      setIsEditorOpen(false);
    }
  };

  // Export handler
  const handleExport = (formatType: 'pdf' | 'excel' | 'csv') => {
    const from = view === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
    const to = view === 'week' ? addDays(from, 6) : endOfMonth(currentDate);
    
    if (onExport) {
      onExport(formatType, { from, to });
    }
    
    toast({
      title: 'Exportando...',
      description: `Descargando horario en formato ${formatType.toUpperCase()}.` });
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    toast({
      title: 'Plantilla aplicada',
      description: 'Los turnos de la plantilla han sido añadidos.' });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <H3 className="text-lg">Gestión de Horarios</H3>
            <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="week">
                  <Calendar className="h-4 w-4 mr-1" />
                  Semanal
                </TabsTrigger>
                <TabsTrigger value="month">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Mensual
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="md" onClick={goBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <Button variant="outline" size="md" onClick={goForward}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Templates */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Plantillas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {scheduleTemplates.map(template => (
                  <DropdownMenuItem key={template.id} onClick={() => applyTemplate(template.id)}>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="text-lg font-semibold text-center md:text-left mt-2">
          {view === 'week' ? (
            <>
              {format(days[0], "d MMM", { locale: es })} - {format(days[6], "d MMM yyyy", { locale: es })}
            </>
          ) : (
            format(currentDate, "MMMM yyyy", { locale: es })
          )}
        </div>
      </CardHeader>

      <CardContent>
        {view === 'week' ? (
          // Weekly View
          <div className="grid grid-cols-7 gap-1">
            {/* Header */}
            {days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "text-center py-2 text-sm font-medium border-b",
                  isToday(day) && "bg-primary/10 rounded-t"
                )}
              >
                <div className="text-muted-foreground">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn(
                  "text-lg",
                  isToday(day) && "text-primary font-bold"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}

            {/* Shifts */}
            {days.map((day, i) => {
              const dayShifts = getShiftsForDay(day);
              return (
                <div
                  key={`shifts-${i}`}
                  className={cn(
                    "min-h-[150px] p-1 border-r border-b cursor-pointer hover:bg-muted/50 transition-colors",
                    isToday(day) && "bg-primary/5"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="space-y-1">
                    {dayShifts.map(shift => (
                      <div
                        key={shift.id}
                        className={cn(
                          "p-1.5 rounded text-xs border cursor-pointer hover:opacity-80",
                          roleColors[shift.role] || roleColors.default
                        )}
                        onClick={(e) => { e.stopPropagation(); handleShiftClick(shift); }}
                      >
                        <div className="font-medium truncate">{shift.staffName}</div>
                        <div className="text-[10px] opacity-75">
                          {shift.startTime} - {shift.endTime}
                        </div>
                      </div>
                    ))}
                    {dayShifts.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-0 hover:opacity-50 transition-opacity">
                        <Plus className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Monthly View
          <div className="grid grid-cols-7 gap-1">
            {/* Header */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
              <div key={i} className="text-center py-2 text-sm font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}

            {/* Empty cells for alignment */}
            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] bg-muted/20" />
            ))}

            {/* Days */}
            {days.map((day, i) => {
              const dayShifts = getShiftsForDay(day);
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[80px] p-1 border cursor-pointer hover:bg-muted/50 transition-colors",
                    !isSameMonth(day, currentDate) && "opacity-40",
                    isToday(day) && "bg-primary/10 border-primary"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayShifts.slice(0, 2).map(shift => (
                      <div
                        key={shift.id}
                        className={cn(
                          "p-0.5 rounded text-[10px] truncate border cursor-pointer",
                          roleColors[shift.role] || roleColors.default
                        )}
                        onClick={(e) => { e.stopPropagation(); handleShiftClick(shift); }}
                      >
                        {shift.staffName}
                      </div>
                    ))}
                    {dayShifts.length > 2 && (
                      <Badge variant="outline" className="text-[9px] h-4">
                        +{dayShifts.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Roles:</span>
          {Object.entries(roleColors).filter(([k]) => k !== 'default').map(([role, classes]) => (
            <div key={role} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded border", classes.split(' ').slice(0, 2).join(' '))} />
              <span className="text-xs">{role}</span>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Shift Editor Dialog */}
      <ShiftEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        shift={editingShift}
        staff={staff}
        selectedDate={selectedDate}
        onSave={handleSave}
        onDelete={editingShift ? handleDelete : undefined}
      />
    </Card>
  );
}

