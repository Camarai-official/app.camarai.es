'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Wand2,
  Download,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import jspdf from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import {
  Dialog,
  DialogWindow,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/layout/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PlanificacionPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Convex Hooks
  const establishments = useQuery(api.establishments.getEstablishments);
  const establishmentId = establishments?.[0]?._id;

  const staff = useQuery(api.staff.getStaffByEstablishment, establishmentId ? { establishmentId } : "skip");

  const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

  const planning = useQuery(api.planning.getPlanningByDateRange,
    establishmentId ? { establishmentId, startDate, endDate } : "skip"
  );

  const generateMonthlyPlanning = useMutation(api.planning.generateMonthlyPlanning);
  const upsertPlanningEntry = useMutation(api.planning.upsertPlanningEntry);
  const deletePlanningEntry = useMutation(api.planning.deletePlanningEntry);

  // UI State
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAutoFill = async () => {
    if (!establishmentId) return;
    setIsGenerating(true);
    try {
      await generateMonthlyPlanning({
        establishmentId,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      });
      toast({
        title: "Planificación generada",
        description: "Se han cargado los horarios base para el mes."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la planificación.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!staff || !days) return;

    const headers = ["Empleado", ...days.map(d => format(d, "dd/MM"))];
    const rows = staff.map(member => {
      return [
        member.nombre,
        ...days.map(day => {
          const entries = getEntries(member.id, day);
          return entries.length > 0
            ? entries.map(e => `${e.start_time} - ${e.end_time}`).join(" | ")
            : "";
        })
      ];
    });

    const allData: any[][] = [headers, ...rows];

    const motivosRows: string[][] = [];
    staff.forEach(member => {
      days.forEach(day => {
        const entries = getEntries(member.id, day);
        entries.forEach(entry => {
          if (entry.notes && entry.notes.trim() !== "") {
            motivosRows.push([member.nombre, format(day, "dd/MM/yyyy"), entry.notes]);
          }
        });
      });
    });

    if (motivosRows.length > 0) {
      allData.push([]); // fila en blanco
      allData.push(["Registro de Motivos"]);
      allData.push(["Empleado", "Día", "Motivo"]);
      motivosRows.forEach(row => allData.push(row));
    }

    // Usar ExcelJS con buffer para navegador
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Planificación");

    allData.forEach((row, rowIndex) => {
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planificacion_${format(currentDate, "yyyy_MM")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Excel exportado correctamente" });
  };

  const handleExportPDF = async () => {
    if (!staff || !days) return;

    toast({ title: "Generando PDF...", description: "Por favor espera un momento." });

    try {
      const doc = new jspdf({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      // Add Title
      const title = `Planificación: ${format(currentDate, "MMMM yyyy", { locale: es }).toUpperCase()}`;
      doc.setFontSize(16);
      doc.text(title, 40, 40);

      const headers = ["Día", ...days.map(d => format(d, "d"))];
      const body = staff.map(member => [
        member.nombre,
        ...days.map(day => {
          const entries = getEntries(member.id, day);
          return entries.map(e => `${e.start_time}\n${e.end_time}`).join('\n---\n');
        })
      ]);

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 60,
        theme: 'grid',
        styles: {
          fontSize: days.length > 20 ? 6 : 8,
          cellPadding: 4,
          halign: 'center',
          valign: 'middle',
          overflow: 'linebreak',
          cellWidth: 'auto'
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 80, halign: 'left', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          // Highlight weekends
          if (data.section === 'head' && data.column.index > 0) {
            const dayIndex = data.column.index - 1;
            const day = days[dayIndex];
            if (day && (day.getDay() === 0 || day.getDay() === 6)) {
              data.cell.styles.fillColor = [71, 85, 105];
            }
          }
          if (data.section === 'body' && data.column.index > 0) {
            const dayIndex = data.column.index - 1;
            const day = days[dayIndex];
            if (day && (day.getDay() === 0 || day.getDay() === 6)) {
              data.cell.styles.fillColor = [241, 245, 249];
            }
          }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 100;
      const motivosRows: string[][] = [];

      staff.forEach(member => {
        days.forEach(day => {
          const entries = getEntries(member.id, day);
          entries.forEach(entry => {
            if (entry.notes && entry.notes.trim() !== "") {
              motivosRows.push([member.nombre, format(day, "dd/MM/yyyy"), entry.notes]);
            }
          });
        });
      });

      if (motivosRows.length > 0) {
        doc.setFontSize(12);
        doc.text("Registro de Motivos", 40, finalY + 30);

        autoTable(doc, {
          head: [["Empleado", "Día", "Motivo"]],
          body: motivosRows,
          startY: finalY + 40,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 4,
            halign: 'left',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          }
        });
      }

      doc.save(`planificacion_${format(currentDate, "yyyy_MM")}.pdf`);
      toast({ title: "PDF exportado" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al generar PDF", variant: "destructive" });
    }
  };

  const handleExportPDFByStaff = async () => {
    if (!staff || !days) return;

    toast({ title: "Generando PDFs...", description: "Por favor espera un momento." });

    try {
      for (const member of staff) {
        const doc = new jspdf({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });

        const monthName = format(currentDate, "MMMM", { locale: es });
        const year = format(currentDate, "yyyy");
        const title = `Planificación: ${member.nombre} - ${monthName.toUpperCase()} ${year}`;
        
        doc.setFontSize(16);
        doc.text(title, 40, 40);

        const headers = ["Día", "Fecha", "Horario", "Horas", "Notas"];
        let totalMonthHours = 0;
        let weekHours = 0;
        let weekStartDay: Date | null = days[0];

        const body: any[] = [];
        
        days.forEach((day, index) => {
          const dayName = format(day, "EEEE", { locale: es });
          const dateStr = format(day, "dd/MM/yyyy");
          const entries = getEntries(member.id, day);
          
          const timeStr = entries.map(e => `${e.start_time} - ${e.end_time}`).join('\n');
          const notesStr = entries.map(e => e.notes || "").filter(Boolean).join('\n');
          
          let totalHoursDay = 0;
          entries.forEach(e => {
            const [startH, startM] = e.start_time.split(':').map(Number);
            const [endH, endM] = e.end_time.split(':').map(Number);
            let mins = (endH * 60 + endM) - (startH * 60 + startM);
            if (mins < 0) mins += 24 * 60;
            totalHoursDay += mins / 60;
          });
          totalMonthHours += totalHoursDay;
          weekHours += totalHoursDay;
          const hoursStr = totalHoursDay > 0 ? `${Number(totalHoursDay.toFixed(2))}h` : "-";

          body.push([
            dayName.charAt(0).toUpperCase() + dayName.slice(1), 
            dateStr, 
            timeStr || "Libre", 
            hoursStr,
            notesStr
          ]);

          if (day.getDay() === 0 || index === days.length - 1) {
            const weekStartStr = weekStartDay ? format(weekStartDay, "dd/MM") : "";
            const weekEndStr = format(day, "dd/MM");
            body.push([
              { content: `TOTAL SEMANA (${weekStartStr} al ${weekEndStr})`, colSpan: 3, styles: { halign: 'right', fontStyle: 'italic' } },
              { content: `${Number(weekHours.toFixed(2))}h`, styles: { fontStyle: 'bold' } },
              ""
            ]);
            
            weekHours = 0;
            if (index < days.length - 1) {
              weekStartDay = days[index + 1];
            }
          }
        });

        body.push([
          { content: "TOTAL MES", colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${Number(totalMonthHours.toFixed(2))}h`, styles: { fontStyle: 'bold' } },
          ""
        ]);

        autoTable(doc, {
          head: [headers],
          body: body,
          startY: 60,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 6,
          },
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          didParseCell: (data) => {
            if (data.section === 'body') {
              const rowData = data.row.raw as any[];
              const isTotalRow = rowData[0] && typeof rowData[0] === 'object' && rowData[0].content && String(rowData[0].content).includes('TOTAL');
              
              if (isTotalRow) {
                data.cell.styles.fillColor = [241, 245, 249];
              } else {
                const dayName = rowData[0];
                if (dayName === 'Domingo' || dayName === 'Sábado') {
                  data.cell.styles.fillColor = [241, 245, 249];
                }
                if (data.column.index === 2 && data.cell.text[0] === "Libre") {
                  data.cell.styles.textColor = [156, 163, 175];
                }
              }
            }
          }
        });

        const safeName = member.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`planificacion_${monthName}_${year}_${safeName}.pdf`);
      }
      
      toast({ title: "PDFs exportados correctamente" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al generar PDFs", variant: "destructive" });
    }
  };

  const openEditDialog = (employee: any, day: Date, existingEntry?: any) => {
    setEditingEntry({
      staff_id: employee.id,
      name: employee.nombre,
      date: format(day, "yyyy-MM-dd"),
      start_time: existingEntry?.start_time || "09:00",
      end_time: existingEntry?.end_time || "17:00",
      is_custom: true,
      notes: existingEntry?.notes || "",
      id: existingEntry?._id
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!establishmentId || !editingEntry) return;

    try {
      await upsertPlanningEntry({
        id: editingEntry.id,
        establishmentId,
        staffId: editingEntry.staff_id,
        date: editingEntry.date,
        startTime: editingEntry.start_time,
        endTime: editingEntry.end_time,
        isCustom: true, // Manual changes are always custom
        notes: editingEntry.notes
      });
      setIsEditDialogOpen(false);
      toast({ title: "Cambio guardado" });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async () => {
      if (!editingEntry?.id) return;
      try {
          await deletePlanningEntry({ id: editingEntry.id });
          setIsEditDialogOpen(false);
          toast({ title: "Turno eliminado" });
      } catch (error) {
          toast({ title: "Error al eliminar", variant: "destructive" });
      }
  };

  // Helper to get entries for a specific staff and day
  const getEntries = (staffId: string, day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return planning?.filter(p => p.staff_id === staffId && p.date === dateStr) || [];
  };

  return (
    <PageContainer>
      <PageHeader
        title="Planificación Mensual"
        subtitle="Gestiona los turnos y horarios reales del equipo."
        actions={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 w-full lg:w-auto">
            {/* Navegación de mes */}
            <div className="flex items-center justify-between gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center font-bold md:min-w-[150px]">
                {format(currentDate, "MMMM yyyy", { locale: es }).toUpperCase()}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />

            {/* Acciones */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="md:flex-none h-10" startIcon={<Download />}>
                    Descargar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2 text-primary" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                    <FileDown className="w-4 h-4 mr-2 text-destructive" />
                    PDF (.pdf)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDFByStaff} className="cursor-pointer">
                    <FileDown className="w-4 h-4 mr-2 text-destructive" />
                    PDF por Staff
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="default"
                className="md:flex-none h-10 bg-primary/10 text-primary hover:bg-primary/20"
                onClick={handleAutoFill}
                disabled={isGenerating}
                startIcon={<Wand2 />}
              >
                Auto-rellenar Mes
              </Button>
            </div>
          </div>
        }
      />

      <PageContent>
        <Card className="border-none shadow-sm flex flex-col h-[calc(100vh-220px)] min-h-[400px]" ref={tableRef}>
          <div className="overflow-auto relative flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] border-r border-b sticky left-0 top-0 bg-muted z-30">Empleado</TableHead>
                  {days.map(day => (
                    <TableHead key={day.toISOString()} className={cn(
                      "text-center min-w-[100px] border-r border-b sticky top-0 bg-muted/95 backdrop-blur z-20",
                      (day.getDay() === 0 || day.getDay() === 6) && "bg-muted"
                    )}>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">
                        {format(day, "EEE", { locale: es })}
                      </div>
                      <div className="text-sm">{format(day, "d")}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff?.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium border-r sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2 ">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {member.nombre[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm truncate max-w-[120px]">{member.nombre}</span>
                          <span className="text-[10px] text-muted-foreground">{member.rol}</span>
                        </div>
                      </div>
                    </TableCell>
                    {days.map(day => {
                      const entries = getEntries(member.id, day);
                      return (
                        <TableCell
                          key={day.toISOString()}
                          className={cn(
                            "p-1 text-center border-r transition-colors align-top min-w-[120px]",
                            (day.getDay() === 0 || day.getDay() === 6) && "bg-muted/5"
                          )}
                        >
                          <div className="flex flex-col gap-1 min-h-[40px]">
                            {entries.map(entry => (
                              <div
                                key={entry._id}
                                className={cn(
                                  "text-[10px] p-1 rounded flex flex-col gap-0.5 cursor-pointer hover:brightness-95 transition-all shadow-sm",
                                  entry.is_custom
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                )}
                                onClick={() => openEditDialog(member, day, entry)}
                              >
                                <div className="font-bold whitespace-nowrap">{entry.start_time} - {entry.end_time}</div>
                                {entry.notes && <div className="truncate opacity-70 italic text-[9px]">"{entry.notes}"</div>}
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-full opacity-0 hover:opacity-100 group-hover:opacity-100 text-[10px] text-muted-foreground dashed border border-dashed hover:border-solid mt-auto"
                              onClick={() => openEditDialog(member, day)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Añadir
                            </Button>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" />
            <span>Horario Base</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800" />
            <span>Cambio Manual (Real)</span>
          </div>
        </div>
      </PageContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogWindow size="md">
          <DialogHeader
            title="Editar Turno"
            description={`${editingEntry?.name} - ${editingEntry?.date ? format(parseISO(editingEntry.date), "PPP", { locale: es }) : ""}`}
            icon={Clock}
          />
          <DialogContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Entrada</Label>
                  <Input
                    id="start"
                    type="time"
                    value={editingEntry?.start_time || ""}
                    onChange={(e) => setEditingEntry({...editingEntry, start_time: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">Salida</Label>
                  <Input
                    id="end"
                    type="time"
                    value={editingEntry?.end_time || ""}
                    onChange={(e) => setEditingEntry({...editingEntry, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas o Motivo del cambio</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Cubre a Juan por baja..."
                  value={editingEntry?.notes || ""}
                  onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter
            onCancel={() => setIsEditDialogOpen(false)}
            onConfirm={handleSaveEntry}
            confirmText="Guardar Cambios"
            actions={
              editingEntry?.id && (
                <Button
                  variant="ghost"
                  className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteEntry}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )
            }
          />
        </DialogWindow>
      </Dialog>
    </PageContainer>
  );
}
