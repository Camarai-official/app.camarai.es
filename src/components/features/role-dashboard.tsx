'use client';

import * as React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Bell, Calendar, Users, Package, CreditCard, MessageSquare, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getRoleColors } from '@/lib/role-colors';

// Types
type UserRole = 'camarero' | 'bartender' | 'cocinero' | 'encargado' | 'jefe';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueTime?: string;
}

interface Notification {
  id: string;
  type: 'order' | 'reservation' | 'alert' | 'reminder';
  message: string;
  time: string;
  read: boolean;
}

interface RoleDashboardProps {
  role: UserRole;
  userName: string;
  tasks?: Task[];
  notifications?: Notification[];
  onTaskClick?: (task: Task) => void;
  onNotificationClick?: (notification: Notification) => void;
  stats?: Record<string, number | string>;
}

// Role-specific configurations - design system: colores sutiles
const roleConfig: Record<UserRole, {
  title: string;
  quickActions: { label: string; icon: React.ElementType; href?: string }[];
  defaultStats: { label: string; value: string | number }[];
}> = {
  camarero: {
    title: 'Panel del Camarero',
    quickActions: [
      { label: 'Nuevo Pedido', icon: ClipboardList },
      { label: 'Ver Mesas', icon: Users },
      { label: 'Cobrar', icon: CreditCard },
      { label: 'WhatsApp', icon: MessageSquare },
    ],
    defaultStats: [
      { label: 'Mesas asignadas', value: 6 },
      { label: 'Pedidos hoy', value: 23 },
      { label: 'Propinas', value: '45€' },
    ],
  },
  bartender: {
    title: 'Panel del Bartender',
    quickActions: [
      { label: 'Pedidos Barra', icon: ClipboardList },
      { label: 'Stock Bebidas', icon: Package },
      { label: 'Cobrar', icon: CreditCard },
      { label: 'WhatsApp', icon: MessageSquare },
    ],
    defaultStats: [
      { label: 'Bebidas servidas', value: 45 },
      { label: 'Pedidos cola', value: 3 },
      { label: 'Stock bajo', value: 2 },
    ],
  },
  cocinero: {
    title: 'Panel del Cocinero',
    quickActions: [
      { label: 'Ver KDS', icon: ClipboardList },
      { label: 'Stock', icon: Package },
      { label: 'Alertas', icon: Bell },
      { label: 'Recetas', icon: Settings },
    ],
    defaultStats: [
      { label: 'Pedidos en cola', value: 8 },
      { label: 'Tiempo medio', value: '12 min' },
      { label: 'Completados hoy', value: 67 },
    ],
  },
  encargado: {
    title: 'Panel del Encargado',
    quickActions: [
      { label: 'Resumen', icon: BarChart3 },
      { label: 'Personal', icon: Users },
      { label: 'Reservas', icon: Calendar },
      { label: 'Inventario', icon: Package },
    ],
    defaultStats: [
      { label: 'Ventas hoy', value: '2,450€' },
      { label: 'Staff activo', value: 8 },
      { label: 'Reservas', value: 12 },
    ],
  },
  jefe: {
    title: 'Panel de Administración',
    quickActions: [
      { label: 'Reportes', icon: BarChart3 },
      { label: 'Configuración', icon: Settings },
      { label: 'Personal', icon: Users },
      { label: 'Finanzas', icon: CreditCard },
    ],
    defaultStats: [
      { label: 'Ventas mes', value: '45,230€' },
      { label: 'Empleados', value: 15 },
      { label: 'Rentabilidad', value: '+12%' },
    ],
  },
};

// Priority badge variants
const priorityVariants: Record<string, any> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

// Default tasks by role
const getDefaultTasks = (role: UserRole): Task[] => {
  const baseTasks: Record<UserRole, Task[]> = {
    camarero: [
      { id: '1', title: 'Mesa 5 - Pedir segundo plato', priority: 'high', status: 'pending', dueTime: '14:30' },
      { id: '2', title: 'Mesa 8 - Preparar cuenta', priority: 'medium', status: 'pending' },
      { id: '3', title: 'Reponer servilletas', priority: 'low', status: 'pending' },
    ],
    bartender: [
      { id: '1', title: '3 cócteles en cola', priority: 'high', status: 'in_progress' },
      { id: '2', title: 'Revisar stock de gin', priority: 'medium', status: 'pending' },
      { id: '3', title: 'Preparar garnishes', priority: 'low', status: 'pending' },
    ],
    cocinero: [
      { id: '1', title: '4 platos en preparación', priority: 'high', status: 'in_progress' },
      { id: '2', title: 'Mise en place para cena', priority: 'medium', status: 'pending' },
      { id: '3', title: 'Revisar stock vegetales', priority: 'low', status: 'pending' },
    ],
    encargado: [
      { id: '1', title: 'Revisar horarios semana', priority: 'high', status: 'pending', dueTime: '17:00' },
      { id: '2', title: 'Confirmar reserva grupo 15p', priority: 'medium', status: 'pending' },
      { id: '3', title: 'Pedido proveedores', priority: 'medium', status: 'pending' },
    ],
    jefe: [
      { id: '1', title: 'Revisar P&L mensual', priority: 'high', status: 'pending' },
      { id: '2', title: 'Reunión equipo', priority: 'medium', status: 'pending', dueTime: '18:00' },
      { id: '3', title: 'Aprobar vacaciones', priority: 'low', status: 'pending' },
    ],
  };
  return baseTasks[role] || [];
};

// Default notifications
const getDefaultNotifications = (role: UserRole): Notification[] => [
  { id: '1', type: 'order', message: 'Nuevo pedido Mesa 12', time: 'Hace 2 min', read: false },
  { id: '2', type: 'reservation', message: 'Reserva confirmada para 20:00', time: 'Hace 15 min', read: false },
  { id: '3', type: 'alert', message: 'Stock bajo: Tomate', time: 'Hace 1 hora', read: true },
];

// Role Dashboard Component
export function RoleDashboard({
  role,
  userName,
  tasks,
  notifications,
  onTaskClick,
  onNotificationClick,
  stats,
}: RoleDashboardProps) {
  const config = roleConfig[role];
  const roleStyles = getRoleColors(role);
  const displayTasks = tasks || getDefaultTasks(role);
  const displayNotifications = notifications || getDefaultNotifications(role);

  const pendingTasks = displayTasks.filter(t => t.status === 'pending').length;
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;
  const taskProgress = displayTasks.length > 0 
    ? Math.round((completedTasks / displayTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Card - design system: sutil */}
      <Card className="overflow-hidden">
        <div className={cn("p-6", roleStyles.bg)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bienvenido,</p>
              <h2 className="text-2xl font-bold">{userName}</h2>
            </div>
            <Badge variant="outline" className={roleStyles.text}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          </div>
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-4">{config.title}</h3>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {config.quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex-col h-auto py-3 gap-1"
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row - design system: sin iconos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {config.defaultStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-none rounded-lg p-4">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.[stat.label] || stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mis Tareas</CardTitle>
              <Badge variant="neutral">{pendingTasks} pendientes</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso del día</span>
                <span>{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-1.5" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {displayTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                      task.status === 'completed' && "opacity-50"
                    )}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium text-sm",
                          task.status === 'completed' && "line-through"
                        )}>
                          {task.title}
                        </p>
                        {task.dueTime && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {task.dueTime}
                          </p>
                        )}
                      </div>
                      <Badge variant={priorityVariants[task.priority]}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notificaciones</CardTitle>
              <Badge variant="neutral">
                {displayNotifications.filter(n => !n.read).length} nuevas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {displayNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-primary/5 border-primary/20"
                    )}
                    onClick={() => onNotificationClick?.(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        notification.type === 'order' && "bg-blue-100 text-blue-600",
                        notification.type === 'reservation' && "bg-purple-100 text-purple-600",
                        notification.type === 'alert' && "bg-red-100 text-red-600",
                        notification.type === 'reminder' && "bg-yellow-100 text-yellow-600"
                      )}>
                        {notification.type === 'order' && <ClipboardList className="h-4 w-4" />}
                        {notification.type === 'reservation' && <Calendar className="h-4 w-4" />}
                        {notification.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                        {notification.type === 'reminder' && <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
