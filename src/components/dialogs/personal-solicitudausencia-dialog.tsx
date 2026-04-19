'use client';

import * as React from 'react';
import { Calendar, Upload, X } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ExtendedStaffMember } from './personal-edit-dialog';

interface AbsenceRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staffMembers: ExtendedStaffMember[];
    onSave: (data: any) => void;
}

export function AbsenceRequestDialog({
    open,
    onOpenChange,
    staffMembers,
    onSave
}: AbsenceRequestDialogProps) {
    const [documentFile, setDocumentFile] = React.useState<File | null>(null);
    const [documentDataUrl, setDocumentDataUrl] = React.useState<string>('');
    const documentInputRef = React.useRef<HTMLInputElement>(null);

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit file size to 750KB (Convex has 1MB limit, base64 adds ~33% overhead)
            const maxSize = 750 * 1024; // 750KB in bytes
            if (file.size > maxSize) {
                alert('El documento no puede superar 750KB');
                if (documentInputRef.current) {
                    documentInputRef.current.value = '';
                }
                return;
            }
            setDocumentFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentDataUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveDocument = () => {
        setDocumentFile(null);
        setDocumentDataUrl('');
        if (documentInputRef.current) {
            documentInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        if (documentDataUrl) {
            data.document = documentDataUrl;
        }
        onSave(data);
        onOpenChange(false);
        setDocumentFile(null);
        setDocumentDataUrl('');
    };

    React.useEffect(() => {
        if (!open) {
            setDocumentFile(null);
            setDocumentDataUrl('');
            if (documentInputRef.current) {
                documentInputRef.current.value = '';
            }
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader
                        icon={Calendar}
                        title="Registrar Solicitud de Ausencia"
                        description="Crea una nueva solicitud de vacaciones o baja para un empleado."
                    />
                    
                    <DialogContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="staffId">Empleado</Label>
                        <Select name="staffId" required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                            <SelectContent>
                                {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Ausencia</Label>
                        <Select name="type" required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vacation">Vacaciones</SelectItem>
                                <SelectItem value="sick_leave">Baja Médica</SelectItem>
                                <SelectItem value="personal_days">Asuntos Propios</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Desde</Label>
                            <Input name="startDate" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Hasta</Label>
                            <Input name="endDate" type="date" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo Detallado</Label>
                        <Input name="reason" placeholder="Opcional" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="document">Documento (PDF o Imagen)</Label>
                        <input
                            ref={documentInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentChange}
                            className="hidden"
                        />
                        {documentFile ? (
                            <div className="flex items-center gap-2 p-2 border rounded-md">
                                <span className="text-sm flex-1 truncate">{documentFile.name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveDocument}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => documentInputRef.current?.click()}
                                className="w-full"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Seleccionar documento
                            </Button>
                        )}
                    </div>

                    </DialogContent>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Enviar Solicitud</Button>
                    </DialogFooter>
                </form>
            </DialogWindow>
        </Dialog>
    );
}
