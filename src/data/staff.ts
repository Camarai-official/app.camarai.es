
import type { AbsenceRequest, StaffMember, TimeLog, User } from '@/types/staff';
import { addDays, subDays } from 'date-fns';

export type { AbsenceRequest, StaffMember, TimeLog, User } from '@/types/staff';

export const mockUser: User = {
    firstName: 'Fenix',
    lastName: 'Admin',
    email: 'admin@camarai.es',
    avatar: ''
};

export const mockStaffMembers: StaffMember[] = [
    {
        id: 'staff-1',
        nombre: 'Laura García',
        email: 'laura@camarai.es',
        roles: ['waiter'],
        rol: 'Camarero',
        estado: 'Activo',
        pin: '1234',
        telefono: '600000001',
        fotoUrl: '',
        horasContratadas: 40,
        salarioPorHora: 12,
        color: 'rose-500',
        icon: 'Utensils'
    },
    {
        id: 'staff-2',
        nombre: 'Carlos Pérez',
        email: 'carlos@camarai.es',
        roles: ['cook'],
        rol: 'Cocinero',
        estado: 'Activo',
        pin: '5678',
        telefono: '600000002',
        fotoUrl: '',
        horasContratadas: 40,
        salarioPorHora: 15,
        color: 'amber-500',
        icon: 'ChefHat'
    },
    {
        id: 'staff-3',
        nombre: 'Ana Martínez',
        email: 'ana@camarai.es',
        roles: ['bartender'],
        rol: 'Bartender',
        estado: 'Inactivo',
        pin: '9012',
        telefono: '600000003',
        fotoUrl: '',
        horasContratadas: 20,
        salarioPorHora: 13,
        color: 'violet-500',
        icon: 'Wine'
    },
];

export const mockAbsenceRequests: AbsenceRequest[] = [
    {
        id: 'req-1',
        staffId: 'staff-1',
        startDate: new Date().toISOString(),
        endDate: addDays(new Date(), 2).toISOString(),
        type: 'sick_leave',
        status: 'pending',
        reason: 'Gripe'
    },
    {
        id: 'req-2',
        staffId: 'staff-3',
        startDate: addDays(new Date(), 5).toISOString(),
        endDate: addDays(new Date(), 12).toISOString(),
        type: 'vacation',
        status: 'approved'
    },
];

export const mockTimeLogs: TimeLog[] = [
    {
        id: 'log-1',
        staffId: 'staff-1',
        timestamp: subDays(new Date(), 1).toISOString(),
        action: 'clock-in',
        method: 'pin'
    },
];
