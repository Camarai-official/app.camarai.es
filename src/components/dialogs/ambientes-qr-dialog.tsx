'use client';

import * as React from 'react';
import { QrCode, Maximize, FileType, Check, Download, Activity, Printer, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentQRPage, setCurrentQRPage] = React.useState(1);
    const [copiedTable, setCopiedTable] = React.useState<string | null>(null);
    const [qrVersions, setQrVersions] = React.useState<Map<string, number>>(new Map());
    
    const QR_PER_PAGE = 8;
    const qrSizeMap = { small: 120, medium: 200, large: 300 };

    // Reset state when env changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setSelectedTables(new Set());
            setSearchQuery('');
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

    const toggleAllTables = () => {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader
                    icon={QrCode}
                    title={`Gestión de códigos QR`}
                    description={`Ambiente: ${selectedEnv?.name}`}
                />

                <Tabs defaultValue="mesas" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b bg-muted/20">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
                            <TabsTrigger value="mesas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1">
                                Vista Previa de Mesas
                            </TabsTrigger>
                            <TabsTrigger value="ajustes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1">
                                Configuración de Impresión
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="mesas" className="flex-1 flex flex-col overflow-hidden m-0">
                        <div className="p-6 pb-0 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleAllTables}
                                        startIcon={<div className="flex items-center justify-center h-4 w-4 border rounded-sm mr-1"><Checkbox checked={selectedEnv?.tables.length ? selectedTables.size === selectedEnv.tables.length : false} className="border-none" /></div>}
                                    >
                                        {selectedTables.size === 0 ? "Seleccionar Todos" : `${selectedTables.size} Seleccionados`}
                                    </Button>
                                    {selectedTables.size > 0 && (
                                        <Badge variant="default" className="h-8">
                                            {selectedTables.size} de {selectedEnv?.tables.length}
                                        </Badge>
                                    )}
                                </div>
                                <SearchInput
                                    containerClassName="sm:max-w-[300px]"
                                    placeholder="Buscar mesa..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentQRPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                            {(() => {
                                if (!selectedEnv) return null;
                                const filteredTables = selectedEnv.tables.filter(t => String(t.number).includes(searchQuery));
                                const totalPages = Math.ceil(filteredTables.length / QR_PER_PAGE);
                                const paginatedTables = filteredTables.slice((currentQRPage-1)*QR_PER_PAGE, currentQRPage*QR_PER_PAGE);

                                if (paginatedTables.length === 0) {
                                    return (
                                        <EmptyState 
                                            icon={QrCode}
                                            title="No se encontraron mesas"
                                            description="Ajusta tu búsqueda para encontrar lo que necesitas."
                                        />
                                    );
                                }

                                return (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {paginatedTables.map(table => {
                                                const tid = String(table.id);
                                                const menuUrl = getMenuUrl(selectedEnv.id, String(table.number));
                                                const qrUrl = generateQRUrl(tid, menuUrl, qrSizeMap[qrSize]);
                                                const isSelected = selectedTables.has(tid);

                                                return (
                                                    <Card key={tid} className={cn(
                                                        "group transition-all duration-300 border-2",
                                                        isSelected ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "hover:border-primary/20"
                                                    )} onClick={() => toggleTableSelection(tid)}>
                                                        <div className="p-3 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleTableSelection(tid)} />
                                                                    <span className="text-xs font-bold uppercase truncate">Mesa {table.number}</span>
                                                                </div>
                                                                <Badge variant="neutral" className="h-5 text-[10px]">{table.capacity}p</Badge>
                                                            </div>
                                                            
                                                            <div className="relative bg-white p-3 rounded-lg aspect-square flex items-center justify-center border">
                                                                <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full" onClick={(e) => { e.stopPropagation(); window.open(qrUrl, '_blank'); }}>
                                                                        <Maximize className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] bg-muted/50" onClick={(e) => { e.stopPropagation(); copyToClipboard(menuUrl, tid); }}>
                                                                    {copiedTable === tid ? <Check className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
                                                                    {copiedTable === tid ? "Copiado" : "Link"}
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] bg-muted/50" onClick={(e) => { e.stopPropagation(); window.open(qrUrl, '_blank'); }}>
                                                                    <Download className="h-3 w-3" />
                                                                    Imagen
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-4 pt-4">
                                                <Button variant="ghost" size="sm" disabled={currentQRPage === 1} onClick={() => setCurrentQRPage(p => p - 1)}>Anterior</Button>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground mr-1">Página {currentQRPage} de {totalPages}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" disabled={currentQRPage === totalPages} onClick={() => setCurrentQRPage(p => p + 1)}>Siguiente</Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="ajustes" className="flex-1 m-0">
                        <ScrollArea className="h-full">
                            <div className="p-8 space-y-8 max-w-2xl mx-auto">
                                <div className="space-y-4">
                                    <div className="grid gap-4">
                                        <ActionTile
                                            title="Resolució del QR"
                                            description="Determina la calidad y tamaño de la imagen generada."
                                            icon={Maximize}
                                            iconColor="blue-500"
                                            rightContentType="select"
                                            selectValue={qrSize}
                                            onSelectChange={(v) => setQrSize(v as any)}
                                            selectOptions={[
                                                { value: 'small', label: 'Pequeño' },
                                                { value: 'medium', label: 'Mediano' },
                                                { value: 'large', label: 'Grande' }
                                            ]}
                                        />
                                        <ActionTile
                                            title="Formato de Archivo"
                                            description="Tipo de archivo para la descarga (PNG o SVG)."
                                            icon={FileType}
                                            iconColor="orange-500"
                                            rightContentType="select"
                                            selectValue={qrFormat}
                                            onSelectChange={(v) => setQrFormat(v as any)}
                                            selectOptions={[
                                                { value: 'png', label: 'Imagen PNG' },
                                                { value: 'svg', label: 'Vector SVG' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter 
                    hint={selectedTables.size > 0 ? `${selectedTables.size} mesas seleccionadas.` : "Selecciona mesas para realizar acciones."}
                >
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-2 hidden sm:block" />
                        <div className="flex items-center gap-2 flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" startIcon={<Activity />} onClick={handleRegenerate} disabled={selectedTables.size === 0}>
                                Regenerar
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" startIcon={<Download />} onClick={() => onDownload(selectedTables)} disabled={selectedTables.size === 0}>
                                Descargar
                            </Button>
                            <Button variant="default" size="sm" className="flex-1 sm:flex-none font-bold" startIcon={<Printer />} onClick={() => onPrint(selectedTables)} disabled={selectedTables.size === 0}>
                                Imprimir lote
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
