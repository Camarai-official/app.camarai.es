'use client';

import * as React from 'react';
import { TextSM } from "@/components/ui/typography";
import { QrCode, Maximize, FileType, Check, Download, Activity, Printer, ExternalLink } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { ActionTile } from '@/components/ui/action-tile';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Environment } from '@/types/environments';
import {
    printerService,
    buildMultipleThermalTickets,
    generateTicketHtml,
    downloadTicketsPdf,
    type TicketData,
} from '@/lib/printing';
import { PrintModeDialog, type PrintMode } from '@/components/dialogs/print-mode-dialog';

interface QRManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedEnv: Environment | null;
    qrFormat: 'png' | 'svg';
    setQrFormat: (format: 'png' | 'svg') => void;
    qrSize: 'small' | 'medium' | 'large';
    setQrSize: (size: 'small' | 'medium' | 'large') => void;
    onDownload?: (selectedTables: Set<string>) => void;
    onPrint?: (selectedTables: Set<string>) => void;
    establishmentLogo?: string;
    establishmentName?: string;
}

export function QRManagementDialog({
    open,
    onOpenChange,
    selectedEnv,
    qrFormat,
    setQrFormat,
    qrSize,
    setQrSize,
    onDownload,
    onPrint,
    establishmentLogo,
    establishmentName,
}: QRManagementDialogProps) {
    const { toast } = useToast();
    const [selectedTables, setSelectedTables] = React.useState<Set<string>>(new Set());
    const [currentQRPage, setCurrentQRPage] = React.useState(1);
    const [qrVersions, setQrVersions] = React.useState<Map<string, number>>(new Map());
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [thermalAvailable, setThermalAvailable] = React.useState(false);
    const [printerConnected, setPrinterConnected] = React.useState(false);
    const [printModeOpen, setPrintModeOpen] = React.useState(false);
    const [pendingTickets, setPendingTickets] = React.useState<TicketData[]>([]);

    const QR_PER_PAGE = 8;
    const qrSizeMap = { small: 120, medium: 200, large: 300 };

    React.useEffect(() => {
        if (open) {
            setSelectedTables(new Set());
            setCurrentQRPage(1);
            setQrVersions(new Map());
        }
    }, [open, selectedEnv]);

    React.useEffect(() => {
        printerService.isSupported().then(setThermalAvailable);
    }, []);

    const toggleTableSelection = (tableId: string) => {
        const newSelection = new Set(selectedTables);
        if (newSelection.has(tableId)) {
            newSelection.delete(tableId);
        } else {
            newSelection.add(tableId);
        }
        setSelectedTables(newSelection);
    };

    const handleSelectAll = () => {
        if (!selectedEnv) return;
        if (selectedTables.size === selectedEnv.tables.length) {
            setSelectedTables(new Set());
        } else {
            setSelectedTables(new Set(selectedEnv.tables.map(t => String(t.id))));
        }
    };

    const generateQRUrl = (tableId: string, text: string, size: number = 200) => {
        const version = qrVersions.get(tableId) || 0;
        const textWithVersion = `${text}${version > 0 ? `&v=${version}` : ''}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(textWithVersion)}&format=${qrFormat}`;
    };

    const getMenuUrl = (tableId: string) => {
        return `https://camarai.app/mesa/${tableId}`;
    };

    // --- Regenerar: solo cliente, incrementa version en el preview ---
    const handleRegenerate = () => {
        if (selectedTables.size === 0) return;
        const newVersions = new Map(qrVersions);
        selectedTables.forEach(id => {
            newVersions.set(id, (newVersions.get(id) || 0) + 1);
        });
        setQrVersions(newVersions);
        toast({
            title: "QRs Regenerados",
            description: `Se han actualizado ${selectedTables.size} código${selectedTables.size > 1 ? 's' : ''} QR con una nueva firma de seguridad.`
        });
    };

    // --- Descarga PDF directo: renderiza plantillas y genera el archivo PDF ---
    const handleDownloadPdfTemplates = async () => {
        if (!selectedEnv || selectedTables.size === 0) return;
        setIsDownloading(true);

        try {
            const tickets: TicketData[] = [];
            for (const tableId of selectedTables) {
                const table = selectedEnv.tables.find(t => String(t.id) === tableId);
                if (!table) continue;
                const menuUrl = getMenuUrl(String(table.id));
                tickets.push({
                    mesaId: table.number,
                    orderId: `QR-${Date.now().toString(36).toUpperCase()}`,
                    qrUrl: generateQRUrl(tableId, menuUrl, qrSizeMap['large']),
                    logoUrl: establishmentLogo || '',
                    establishmentName: establishmentName || 'Establecimiento',
                    environmentName: selectedEnv.name,
                });
            }

            const envSlug = selectedEnv.name.toLowerCase().replace(/\s+/g, '-');
            const filename = `tickets-qr-${envSlug}.pdf`;

            await downloadTicketsPdf(tickets, filename);

            toast({
                title: "PDF descargado",
                description: `${tickets.length} plantilla${tickets.length > 1 ? 's' : ''} exportada${tickets.length > 1 ? 's' : ''} en ${filename}.`
            });
            onDownload?.(selectedTables);
        } catch {
            toast({
                title: "Error al generar el PDF",
                description: "No se pudieron generar las plantillas. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Construye los datos de tickets y abre el selector de modo de impresión
    const handlePrintSelected = () => {
        if (!selectedEnv || selectedTables.size === 0) return;

        const tickets: TicketData[] = [];
        for (const tableId of selectedTables) {
            const table = selectedEnv.tables.find(t => String(t.id) === tableId);
            if (!table) continue;
            const menuUrl = getMenuUrl(String(table.id));
            tickets.push({
                mesaId: table.number,
                orderId: `QR-${Date.now().toString(36).toUpperCase()}`,
                qrUrl: menuUrl,
                logoUrl: establishmentLogo || '',
                establishmentName: establishmentName || 'Establecimiento',
                environmentName: selectedEnv.name,
            });
        }

        setPendingTickets(tickets);
        setPrintModeOpen(true);
    };

    // Ejecuta la impresión según el modo elegido en el modal
    const handlePrintModeConfirm = async (mode: PrintMode) => {
        if (pendingTickets.length === 0) return;

        if (mode === 'thermal') {
            try {
                if (!printerConnected) {
                    await printerService.connect();
                    setPrinterConnected(true);
                }

                const buffer = buildMultipleThermalTickets(pendingTickets);
                await printerService.print(buffer);

                toast({
                    title: "Impresión enviada",
                    description: `${pendingTickets.length} ticket(s) enviados a la impresora térmica.`
                });

                onPrint?.(selectedTables);
            } catch (error) {
                console.error('Error en impresión térmica:', error);
                toast({
                    title: "Error de impresión térmica",
                    description: "Comprueba que la impresora está encendida y conectada.",
                    variant: "destructive"
                });
            }
            return;
        }

        // Modo HTML: window.print()
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({
                title: "Ventana bloqueada",
                description: "Permite las ventanas emergentes para imprimir.",
                variant: "destructive"
            });
            return;
        }

        const ticketsWithQRImages = pendingTickets.map(t => ({
            ...t,
            qrUrl: generateQRUrl(String(t.mesaId), t.qrUrl, qrSizeMap['large'])
        }));

        printWindow.document.write(generateTicketHtml(ticketsWithQRImages));
        printWindow.document.close();
        onPrint?.(selectedTables);
    };

    const allSelected = !!selectedEnv?.tables.length && selectedTables.size === selectedEnv.tables.length;

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="xl">
                <DialogHeader
                    icon={QrCode}
                    title={`Gestión de códigos QR`}
                    description={`Ambiente: ${selectedEnv?.name}`}
                />

                <DialogContent>
                    <div className="space-y-6">
                        {/* 1. Configuracion global */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ActionTile
                                icon={Maximize}
                                title="Resolución"
                                rightContentType="select"
                                selectValue={qrSize}
                                onSelectChange={(v) => setQrSize(v as any)}
                                selectOptions={[
                                    { value: 'small', label: 'Pequeño (120px)' },
                                    { value: 'medium', label: 'Mediano (200px)' },
                                    { value: 'large', label: 'Grande (300px)' }
                                ]}
                            />
                            <ActionTile
                                icon={FileType}
                                title="Formato de salida"
                                rightContentType="select"
                                selectValue={qrFormat}
                                onSelectChange={(v) => setQrFormat(v as any)}
                                selectOptions={[
                                    { value: 'png', label: 'PNG' },
                                    { value: 'svg', label: 'SVG' }
                                ]}
                            />
                        </div>

                        {/* 2. Barra de seleccion y acciones masivas */}
                        <ActionTile
                            icon={Check}
                            iconColor={allSelected ? "primary" : "neutral"}
                            title={allSelected ? "Desmarcar todo" : "Seleccionar todas"}
                            description={selectedTables.size > 0 ? `${selectedTables.size} mesa${selectedTables.size > 1 ? 's' : ''} seleccionada${selectedTables.size > 1 ? 's' : ''}` : "Selección masiva para acciones en lote"}
                            onClick={handleSelectAll}
                            rightContentType="custom"
                            customContent={
                                <div className="flex items-center gap-2 w-full [&>*]:flex-1">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectedTables.forEach(id => {
                                                const table = selectedEnv?.tables.find(t => String(t.id) === id);
                                                if (table) {
                                                    const url = getMenuUrl(String(table.id));
                                                    window.open(generateQRUrl(id, url, qrSizeMap[qrSize]), '_blank');
                                                }
                                            });
                                        }}
                                        title="Abrir seleccionados en nueva pestaña"
                                    >
                                        <ExternalLink />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
                                        title="Regenerar firma de los seleccionados"
                                    >
                                        <Activity />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={selectedTables.size === 0 || isDownloading}
                                        onClick={(e) => { e.stopPropagation(); handleDownloadPdfTemplates(); }}
                                        title="Descargar plantillas como PDF"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => { e.stopPropagation(); handlePrintSelected(); }}
                                        title="Imprimir seleccionados"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            }
                        />

                        {/* 3. Grid de tarjetas QR paginado */}
                        <div className="flex-1 min-h-0">
                            {(() => {
                                if (!selectedEnv) return null;
                                const totalPages = Math.ceil(selectedEnv.tables.length / QR_PER_PAGE);
                                const paginatedTables = selectedEnv.tables.slice(
                                    (currentQRPage - 1) * QR_PER_PAGE,
                                    currentQRPage * QR_PER_PAGE
                                );

                                if (paginatedTables.length === 0) return (
                                    <EmptyState icon={QrCode} title="No hay mesas" description="Este ambiente no tiene mesas para generar QRs." />
                                );

                                return (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {paginatedTables.map(table => {
                                                const tid = String(table.id);
                                                const menuUrl = getMenuUrl(String(table.id));
                                                const qrUrl = generateQRUrl(tid, menuUrl, qrSizeMap[qrSize]);
                                                const isSelected = selectedTables.has(tid);

                                                return (
                                                    <Card
                                                        key={tid}
                                                        className={cn(
                                                            "cursor-pointer transition-all",
                                                            isSelected ? "ring-2 ring-primary border-transparent" : "hover:border-primary/50"
                                                        )}
                                                        onClick={() => toggleTableSelection(tid)}
                                                    >
                                                        <CardContent className="p-3 space-y-3">
                                                            {/* Header: numero de mesa + checkbox */}
                                                            <div className="flex items-center justify-between">
                                                                <TextSM className="text-foreground">Mesa {table.number}</TextSM>
                                                                <div className={cn(
                                                                    "h-5 w-5 rounded border transition-all flex items-center justify-center",
                                                                    isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-input"
                                                                )}>
                                                                    {isSelected && <Check className="h-3 w-3" />}
                                                                </div>
                                                            </div>

                                                            {/* Preview QR */}
                                                            <div className="aspect-square bg-white rounded-lg border flex items-center justify-center p-2">
                                                                <img src={qrUrl} alt={`QR Mesa ${table.number}`} className="h-full w-full object-contain" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-3 pt-2">
                                                <Button variant="ghost" size="sm" className="rounded-xl font-bold" disabled={currentQRPage === 1} onClick={() => setCurrentQRPage(p => p - 1)}>
                                                    Anterior
                                                </Button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "h-1.5 rounded-full transition-all",
                                                                currentQRPage === i + 1 ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <Button variant="ghost" size="sm" className="rounded-xl font-bold" disabled={currentQRPage === totalPages} onClick={() => setCurrentQRPage(p => p + 1)}>
                                                    Siguiente
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </DialogContent>

                <DialogFooter>
                    <div className="flex items-center justify-end w-full">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    </div>
                </DialogFooter>
            </DialogWindow>
        </Dialog>

        <PrintModeDialog
            open={printModeOpen}
            onOpenChange={setPrintModeOpen}
            onConfirm={handlePrintModeConfirm}
            thermalAvailable={thermalAvailable}
            thermalConnected={printerConnected}
            ticketCount={pendingTickets.length}
        />
        </>
    );
}
