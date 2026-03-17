export type DayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export type Schedule = {
  id: string;
  staffMemberId: string;
  diaSemana: DayOfWeek;
  horaEntrada: string;
  horaSalida: string;
};

export type StaffMember = {
  id: string;
  nombre: string;
  roles: string[];
  rol?: string;
  pin: string;
  email: string;
  telefono: string;
  fotoUrl: string;
  horasContratadas: number;
  fecha_contratacion?: string;
  salarioPorHora: number;
  estado: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Baja';
  color?: string;
  icon?: string;
};

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};

export type StaffRole = 'waiter' | 'cook' | 'bartender' | 'manager' | 'host';

export type TimeLog = {
  id: string;
  staffId: string;
  timestamp: string;
  action: 'clock-in' | 'clock-out' | 'start-break' | 'end-break';
  method: 'manual' | 'qr' | 'pin' | 'app' | 'whatsapp' | 'web';
};

export type AbsenceRequest = {
  id: string;
  staffId: string;
  type: 'vacation' | 'sick_leave' | 'personal_days' | 'other';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type ShiftLog = {
  id: string;
  staffMemberId: string;
  entrada: string;
  salida: string;
  duracion: number;
};

export type TimeReportEntry = {
  log: ShiftLog;
  regularHours: number;
  extraHours: number;
};
