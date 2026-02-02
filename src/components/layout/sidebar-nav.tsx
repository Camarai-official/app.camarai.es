"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  ChevronDown,
  Home,
  LayoutGrid,
  ShoppingBag,
  QrCode,
  MapPin,
  FileText,
  Tags,
  BadgePercent,
  Clock,
  Laptop,
  MessageSquare,
  Instagram,
  Facebook,
  Bot,
  Map,
  Printer,
  Users,
  Calendar,
  ClipboardList,
  Settings,
  PlusCircle,
  User,
  Shield,
  MessageSquareText,
  Sun,
  Moon,
  LogOut,
  View,
  BookOpen,
  BarChart3,
  Archive,
  CalendarCheck,
  Trash2,
  Layers,
  Package,
  Beaker,
  Contact,
  Monitor,
  Bell,
  Check,
  X,
} from "lucide-react"
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import React from "react"
import { cn } from "@/lib/utils"
import { useEstablishments } from "@/hooks/useEstablishments"
import type { Establishment } from "@/data/establishments"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { mockUser, mockAbsenceRequests, mockStaffMembers, AbsenceRequest, StaffMember } from "@/data/mock-data"

const menuItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/comandas", label: "Comandas", icon: ClipboardList },
  { href: "/ambientes", label: "Ambientes", icon: View },
  { href: "/plano-mesas", label: "Plano de mesas", icon: LayoutGrid },
  { href: "/carta", label: "Carta", icon: BookOpen },
  { href: "/categorias", label: "Categorías", icon: Layers },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/ingredientes", label: "Ingredientes", icon: Beaker },
  { href: "/inventario", label: "Inventario", icon: Archive },
  { href: "/pos", label: "POS", icon: Monitor },
  { href: "/kds", label: "KDS", icon: Laptop },
  { href: "/personal", label: "Personal", icon: Users },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/promociones", label: "Promociones", icon: BadgePercent },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const { establishments, activeEstablishment, setActiveEstablishmentId, addEstablishment, removeEstablishment } = useEstablishments();

  // Use local mock user
  const user = mockUser;

  // Local state for absence requests to simulate updates
  const [absenceRequests, setAbsenceRequests] = React.useState<AbsenceRequest[]>(mockAbsenceRequests);
  const [establishmentToDelete, setEstablishmentToDelete] = React.useState<Establishment | null>(null);

  const pendingRequests = React.useMemo(() => {
    return absenceRequests.filter(req => req.status === 'pending');
  }, [absenceRequests]);

  const pendingReservations = 0; // Placeholder

  const totalNotifications = pendingRequests.length + pendingReservations;

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSelectEstablishment = (id: string) => {
    setActiveEstablishmentId(id);
    router.push('/settings/profile?tab=establishment');
  };

  const handleAddEstablishment = () => {
    const newEstablishmentId = addEstablishment();
    handleSelectEstablishment(newEstablishmentId);
  };

  const handleDeleteClick = (e: React.MouseEvent, est: Establishment) => {
    e.stopPropagation();
    e.preventDefault();
    setEstablishmentToDelete(est);
  };

  const confirmDelete = () => {
    if (establishmentToDelete) {
      const newActiveId = removeEstablishment(establishmentToDelete.id);
      setEstablishmentToDelete(null);
      if (pathname.includes('/settings/profile')) {
        if (newActiveId) {
          router.push('/settings/profile?tab=establishment');
        } else {
          router.push('/settings/profile');
        }
      }
    }
  };

  const handleUpdateRequest = (requestId: string, status: 'approved' | 'rejected') => {
    setAbsenceRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status } : req
    ));

    const request = absenceRequests.find(r => r.id === requestId);
    const employee = mockStaffMembers.find(s => s.id === request?.staffId);

    // Translate status for display
    const statusEs = status === 'approved' ? 'Aprobada' : 'Rechazada';

    toast({
      title: `Solicitud ${statusEs}`,
      description: `La solicitud de ${employee?.nombre || 'empleado'} para el ${request ? format(parseISO(request.startDate), 'dd/MM/yy') : ''} ha sido ${statusEs.toLowerCase()}.`
    });
  };


  if (!user) {
    return null; // Or a loading skeleton
  }

  return (
    <AlertDialog open={!!establishmentToDelete} onOpenChange={(open) => !open && setEstablishmentToDelete(null)}>
      <SidebarHeader className="p-2 pt-4">
        {activeEstablishment ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center justify-between h-14 w-full rounded-lg p-2 bg-card border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground data-[state=open]:bg-sidebar-primary data-[state=open]:text-sidebar-primary-foreground"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {activeEstablishment.id === 'camarai' ? (
                    <div className="flex-shrink-0">
                      <img
                        src="https://res.cloudinary.com/dxh2i2rjo/image/upload/v1769436934/camarailogo_lbsc9d.png"
                        alt={`${activeEstablishment.name} Logo`}
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activeEstablishment.image}
                        alt={`${activeEstablishment.name} Logo`}
                      />
                      <AvatarFallback>{activeEstablishment.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col items-start truncate">
                    <span className="font-semibold text-sm truncate">{activeEstablishment.name}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-sidebar-primary-foreground data-[state=open]:text-sidebar-primary-foreground">
                      {activeEstablishment.type}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-primary-foreground data-[state=open]:text-sidebar-primary-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Ajustes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground">
                TUS ESTABLECIMIENTOS
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {establishments.map(est => (
                  <DropdownMenuItem key={est.id} onSelect={() => handleSelectEstablishment(est.id)} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={est.image}
                          alt={`${est.name} Logo`}
                        />
                        <AvatarFallback>{est.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{est.name}</span>
                    </div>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, est)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleAddEstablishment}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Añadir nuevo establecimiento</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddEstablishment}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Establecimiento
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="p-2 custom-scrollbar">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between h-auto w-full rounded-lg p-2 bg-card border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground data-[state=open]:bg-sidebar-primary data-[state=open]:text-sidebar-primary-foreground">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt="@user" data-ai-hint="profile user" />
                  <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">{user.firstName}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-sidebar-primary-foreground data-[state=open]:text-sidebar-primary-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-sidebar-primary-foreground data-[state=open]:text-sidebar-primary-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(var(--sidebar-width)-1rem)] mb-2 bg-card" side="top" align="start">
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Mi cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaciones
                  </div>
                  {totalNotifications > 0 && <Badge variant="destructive" className="h-5 w-5 p-0 justify-center">{totalNotifications}</Badge>}
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <DropdownMenuLabel>Solicitudes de Ausencia</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pendingRequests.length > 0 ? (
                  pendingRequests.map(req => {
                    const employee = mockStaffMembers.find(s => s.id === req.staffId);
                    return (
                      <div key={req.id} className="p-2 text-xs">
                        <p className="font-semibold">{employee?.nombre}</p>
                        <p className="text-muted-foreground">{req.type} para el {format(parseISO(req.startDate), 'dd/MM/yy')}</p>
                        <div className="flex gap-2 mt-2 justify-end">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateRequest(req.id, 'rejected')}><X className="h-3 w-3 mr-1" />Rechazar</Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleUpdateRequest(req.id, 'approved')}><Check className="h-3 w-3 mr-1" />Aprobar</Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="p-2 text-sm text-muted-foreground">No hay solicitudes de ausencia.</p>
                )}
                <DropdownMenuLabel>Nuevas Reservas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pendingReservations > 0 ? (
                  <p>...</p> // Placeholder
                ) : (
                  <p className="p-2 text-sm text-muted-foreground">No hay nuevas reservas.</p>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Política de privacidad</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
              toast({
                title: 'Enviar comentarios',
                description: 'Puedes enviarnos tus comentarios a soporte@camarai.es',
              });
            }}>
              <MessageSquareText className="mr-2 h-4 w-4" />
              <span>Enviar comentarios</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {isDarkMode ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  <span>{isDarkMode ? 'Modo noche' : 'Modo claro'}</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-destructive/20"
              onSelect={() => {
                toast({
                  title: 'Cerrando sesión',
                  description: 'Has cerrado sesión correctamente. Redirigiendo...',
                });
                // In a real app, this would clear auth state and redirect
                // router.push('/login');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro que quieres eliminar este establecimiento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el establecimiento <strong>{establishmentToDelete?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEstablishmentToDelete(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
