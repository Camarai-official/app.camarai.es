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
  useSidebar,
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
  Trash,
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/dialogs/global-alert-dialog"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { ConfigEntity, ConfigItem, ConfigToggle } from "@/components/ui/config-item"
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
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
      <SidebarHeader>
        {activeEstablishment ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full bg-card hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent px-2 py-2 flex items-center transition-all duration-200 h-14",
                  isCollapsed ? "justify-center" : "justify-start gap-3"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <img
                    src={activeEstablishment.id === 'camarai' 
                      ? "https://res.cloudinary.com/dxh2i2rjo/image/upload/v1769436934/camarailogo_lbsc9d.png" 
                      : activeEstablishment.image}
                    alt={activeEstablishment.name}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-1 flex-col items-start overflow-hidden text-left leading-tight">
                    <span className="truncate font-bold text-sm text-foreground">
                      {activeEstablishment.name}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {activeEstablishment.type}
                    </span>
                  </div>
                )}
                {!isCollapsed && (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <Settings />
                  <span>Ajustes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground">
                TUS ESTABLECIMIENTOS
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {establishments.map(est => (
                  <DropdownMenuItem key={est.id} onSelect={() => handleSelectEstablishment(est.id)} className="p-0 overflow-hidden">
                    <ConfigEntity
                      image={est.image}
                      fallback={est.name.charAt(0)}
                      label={est.name}
                      className="w-full border-none bg-transparent hover:bg-transparent p-2"
                      avatarClassName="h-6 w-6"
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="md"
                          className="h-6 w-6 hover:bg-destructive/10"
                          onClick={(e) => handleDeleteClick(e, est)}
                        >
                          <Trash />
                        </Button>
                      </AlertDialogTrigger>
                    </ConfigEntity>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleAddEstablishment}>
                <PlusCircle />
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
            <Button 
                variant="ghost" 
                className={cn(
                  "w-full bg-card hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent px-2 py-2 flex items-center transition-all duration-200 h-14",
                  isCollapsed ? "justify-center" : "justify-start gap-3"
                )}
            >
              <Avatar className="h-9 w-9 shrink-0 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                  {user.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-1 flex-col items-start overflow-hidden text-left leading-tight">
                  <span className="truncate font-bold text-sm text-foreground">
                    {user.firstName}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--sidebar-width)] max-w-[calc(100vw-1.5rem)] mb-2 bg-card" side="top" align="start">
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <User />
                <span>Mi cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Bell />
                    Notificaciones
                  </div>
                  {totalNotifications > 0 && <Badge variant="destructive" className="h-5 w-5 p-0 justify-center">{totalNotifications}</Badge>}
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2 w-64 sm:w-80">
                <div className="mb-4">
                  <DropdownMenuLabel className="flex items-center gap-2 text-primary pb-1">
                    <Users className="h-4 w-4" />
                    Solicitudes de Ausencia
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator variant="label" />
                  <div className="space-y-1 px-1">
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map(req => {
                        const employee = mockStaffMembers.find(s => s.id === req.staffId);
                        return (
                          <ConfigItem
                            key={req.id}
                            label={employee?.nombre || ''}
                            description={`${req.type} para el ${format(parseISO(req.startDate), 'dd/MM/yy')}`}
                            className="border-none bg-accent/50 hover:bg-accent p-2 rounded-md"
                            noIconContainer
                          >
                            <div className="flex gap-1">
                              <Button size="md" variant="ghost" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleUpdateRequest(req.id, 'rejected')}><X className="h-4 w-4 text-muted-foreground" /></Button>
                              <Button size="md" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleUpdateRequest(req.id, 'approved')}><Check className="h-4 w-4" /></Button>
                            </div>
                          </ConfigItem>
                        )
                      })
                    ) : (
                      <p className="p-2 text-xs text-muted-foreground italic">No hay solicitudes de ausencia pendiente.</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <DropdownMenuLabel className="flex items-center gap-2 text-primary pb-1">
                    <CalendarCheck className="h-4 w-4" />
                    Nuevas Reservas
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator variant="label" />
                  <div className="space-y-1 px-1">
                    {pendingReservations > 0 ? (
                      <p className="p-2 text-xs text-muted-foreground">...</p> // Placeholder
                    ) : (
                      <p className="p-2 text-xs text-muted-foreground italic">No hay nuevas reservas por revisar.</p>
                    )}
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                <Shield />
                <span>Política de privacidad</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
              toast({
                title: 'Enviar comentarios',
                description: 'Puedes enviarnos tus comentarios a soporte@camarai.es',
              });
            }}>
              <MessageSquareText />
              <span>Enviar comentarios</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0 overflow-hidden">
              <ConfigToggle
                id="dark-mode"
                icon={isDarkMode ? Moon : Sun}
                label={isDarkMode ? 'Modo noche' : 'Modo claro'}
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="w-full border-none bg-transparent hover:bg-transparent p-2"
                noIconContainer
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                toast({
                  title: 'Cerrando sesión',
                  description: 'Has cerrado sesión correctamente. Redirigiendo...',
                });
                // In a real app, this would clear auth state and redirect
                // router.push('/login');
              }}
            >
              <LogOut />
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
