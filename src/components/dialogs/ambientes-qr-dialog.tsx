'use client';

import * as React from 'react';
import { TextSM } from "@/components/ui/typography";
import { QrCode, Maximize, FileType, Check, Download, Activity, Printer, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ActionTile } from '@/components/ui/action-tile';
import { cn } from '@/lib/utils';
import type { Environment } from '@/data/mock-data';

interface QRManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedEnv: Environment | null;
    qrFormat: 'png' | 'svg';
    setQrFormat: (format: 'png' | 'svg') => void;
    qrSize: 'small' | 'medium' | 'large';
    setQrSize: (size: 'small' | 'medium' | 'large') => void;
    onRegenerate: (selectedTables: Set<string>) => void;
    onDownload: (selectedTables: Set<string>) => void;
    onPrint: (selectedTables: Set<string>) => void;
}

export function QRManagementDialog({
    open,
    onOpenChange,
    selectedEnv,
    qrFormat,
    setQrFormat,
    qrSize,
    setQrSize,
    onRegenerate,
    onDownload,
    onPrint
}: QRManagementDialogProps) {
    const [selectedTables, setSelectedTables] = React.useState<Set<string>>(new Set());
    const [currentQRPage, setCurrentQRPage] = React.useState(1);
    const [copiedTable, setCopiedTable] = React.useState<string | null>(null);
    const [qrVersions, setQrVersions] = React.useState<Map<string, number>>(new Map());

    const QR_PER_PAGE = 8;
    const qrSizeMap = { small: 120, medium: 200, large: 300 };

    // Reset state when env changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setSelectedTables(new Set());
            setCurrentQRPage(1);
        }
    }, [open, selectedEnv]);

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

    const getMenuUrl = (envId: string, tableNumber: string) => {
        return `https://camarai.app/m/${envId}/${tableNumber}`;
    };

    const copyToClipboard = async (text: string, tableId: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedTable(tableId);
        setTimeout(() => setCopiedTable(null), 2000);
    };

    const handleRegenerate = () => {
        onRegenerate(selectedTables);
        // Local update of versions for preview
        const newVersions = new Map(qrVersions);
        selectedTables.forEach(id => {
            newVersions.set(id, (newVersions.get(id) || 0) + 1);
        });
        setQrVersions(newVersions);
    };

    const allSelected = !!selectedEnv?.tables.length && selectedTables.size === selectedEnv.tables.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="xl">
                <DialogHeader
                    icon={QrCode}
                    title={`Gestión de códigos QR`}
                    description={`Ambiente: ${selectedEnv?.name}`}
                />

                <DialogContent>
                    <div className="space-y-6">
                        {/* 1. Global Configuration Row */}
                        <div className="grid grid-cols-2 gap-4">
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

                        {/* 2. Selection Toolbar & Bulk Actions */}
                        <ActionTile
                            icon={Check}
                            iconColor={allSelected ? "primary" : "neutral"}
                            title={allSelected ? "Desmarcar todo" : "Seleccionar todas"}
                            description={selectedTables.size > 0 ? `${selectedTables.size} mesas seleccionadas` : "Selección masiva para acciones en lote"}
                            onClick={handleSelectAll}
                            rightContentType="custom"
                            customContent={
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="secondary" 
                                        size="md" 
                                        
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectedTables.forEach(id => {
                                                const table = selectedEnv?.tables.find(t => String(t.id) === id);
                                                if (table) {
                                                    const url = getMenuUrl(selectedEnv!.id, String(table.number));
                                                    window.open(generateQRUrl(id, url, qrSizeMap[qrSize]), '_blank');
                                                }
                                            });
                                        }}
                                        title="Abrir seleccionados"
                                    >
                                        <ExternalLink/>
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="md" 
                                        
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
                                        title="Regenerar seleccionados"
                                    >
                                        <Activity />
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="md" 
                                        
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => { e.stopPropagation(); onDownload(selectedTables); }}
                                        title="Descargar seleccionados"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="md" 
                                        
                                        disabled={selectedTables.size === 0}
                                        onClick={(e) => { e.stopPropagation(); onPrint(selectedTables); }}
                                        title="Imprimir seleccionados"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            }
                        />

                        {/* 3. QR Cards Grid */}
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
                                                const menuUrl = getMenuUrl(selectedEnv.id, String(table.number));
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
                                                            <div className="flex items-center justify-between">
                                                                <TextSM className="text-foreground">Mesa {table.number}</TextSM>
                                                                <div className={cn(
                                                                    "h-5 w-5 rounded border transition-all flex items-center justify-center",
                                                                    isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-input"
                                                                )}>
                                                                    {isSelected && <Check className="h-3 w-3" />}
                                                                </div>
                                                            </div>

                                                            <div className="aspect-square bg-white rounded-lg border flex items-center justify-center p-2 relative">
                                                                <img src={qrUrl} alt="QR" className="h-full w-full object-contain" />
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
    );
}
