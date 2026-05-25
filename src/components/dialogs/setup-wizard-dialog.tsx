import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from './global-alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SetupWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  name: string;
  authId: string;
  onSuccess: () => void;
}

export function SetupWizardDialog({ open, onOpenChange, phone, name, authId, onSuccess }: SetupWizardDialogProps) {
  const [companyName, setCompanyName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [userName, setUserName] = useState(name || '');
  const [userPhone, setUserPhone] = useState(phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFirstEstablishment = useMutation(api.establishments.createFirstEstablishment);
  const createStaffMember = useMutation(api.staff.createStaffMember);

  const handleCreate = async () => {
    if (!companyName.trim() || !establishmentName.trim() || !userName.trim() || !userPhone.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Create company and establishment
      const establishmentId = await createFirstEstablishment({
        companyName,
        establishmentName,
        ownerId: authId,
      });

      // 2. Create staff admin
      await createStaffMember({
        establishmentId,
        name: userName,
        role: 'admin',
        phone: userPhone,
        status: 'active',
        contract_type: 'indefinite',
        contract_start: Date.now(),
        salary: 0,
        irpf: 0,
        dashboard_sections: ['all'], // owner gets all sections
        clock_methods: ['app', 'qr', 'web'],
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Configuración de cuenta</AlertDialogTitle>
          <AlertDialogDescription>
            Como eres un nuevo usuario administrador, necesitamos crear tu compañía y establecimiento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nombre de la Compañía</Label>
            <Input
              id="companyName"
              placeholder="Ej: Grupo Restauración S.L."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="establishmentName">Nombre del Establecimiento</Label>
            <Input
              id="establishmentName"
              placeholder="Ej: Restaurante El Gourmet"
              value={establishmentName}
              onChange={(e) => setEstablishmentName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userName">Tu Nombre</Label>
            <Input
              id="userName"
              placeholder="Ej: Juan Pérez"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userPhone">Tu Teléfono</Label>
            <Input
              id="userPhone"
              placeholder="Ej: +34 600 123 456"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleCreate} disabled={loading || !companyName.trim() || !establishmentName.trim() || !userName.trim() || !userPhone.trim()}>
            {loading ? 'Creando...' : 'Crear y Continuar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
