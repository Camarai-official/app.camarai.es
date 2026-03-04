"use client"

import * as React from "react"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { format, parseISO } from "date-fns"
import {
  Home, ClipboardList, View, LayoutGrid, BookOpen, Layers,
  Package, Beaker, Archive, Monitor, Laptop, Users,
  Bell, BarChart3, CalendarCheck, BadgePercent,
  Settings, ChevronDown, PlusCircle, Trash, User, Shield,
  MessageSquareText, Sun, Moon, LogOut, Check, X
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenuBadge
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, 
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, 
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/dialogs/global-alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { useEstablishments } from "@/hooks/useEstablishments"
import { mockUser, mockAbsenceRequests, mockStaffMembers, AbsenceRequest } from "@/data/mock-data"
import type { Establishment } from "@/data/establishments"

// ============================================================================
// CONFIGURATION
// ============================================================================

const navItems = [
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
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/promociones", label: "Promociones", icon: BadgePercent },
  { href: "/settings", label: "Configuración", icon: Settings },
];

// ============================================================================
// COMPONENTS
// ============================================================================

export function SidebarNav() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const { establishments, activeEstablishment, setActiveEstablishmentId, addEstablishment, removeEstablishment } = useEstablishments()
  const [absenceRequests, setAbsenceRequests] = React.useState<AbsenceRequest[]>(mockAbsenceRequests)
  const [establishmentToDelete, setEstablishmentToDelete] = React.useState<Establishment | null>(null)

  const pendingRequests = React.useMemo(() => absenceRequests.filter(req => req.status === 'pending'), [absenceRequests])
  const pendingReservationsCount = 0 // Placeholder
  const totalNotifications = pendingRequests.length + pendingReservationsCount

  // Sync dark mode class
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  React.useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDarkMode])

  const handleSelectEstablishment = (id: string) => {
    setActiveEstablishmentId(id)
    router.push('/settings/profile?tab=establishment')
  }

  const handleAddEstablishment = () => {
    const newId = addEstablishment()
    handleSelectEstablishment(newId)
  }

  const handleDeleteEstablishment = () => {
    if (establishmentToDelete) {
      const newActiveId = removeEstablishment(establishmentToDelete.id)
      setEstablishmentToDelete(null)
      if (pathname.includes('/settings/profile')) {
        router.push(newActiveId ? '/settings/profile?tab=establishment' : '/settings/profile')
      }
    }
  }

  const handleUpdateRequest = (requestId: string, status: 'approved' | 'rejected') => {
    setAbsenceRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req))
    const request = absenceRequests.find(r => r.id === requestId)
    const employee = mockStaffMembers.find(s => s.id === request?.staffId)
    const statusEs = status === 'approved' ? 'Aprobada' : 'Rechazada'

    toast({
      title: `Solicitud ${statusEs}`,
      description: `La solicitud de ${employee?.nombre || 'empleado'} ha sido ${statusEs.toLowerCase()}.`
    })
  }

  return (
    <>
      <SidebarHeader padding="md">
        <NavEstablishments 
          active={activeEstablishment}
          list={establishments}
          isCollapsed={isCollapsed}
          onSelect={handleSelectEstablishment}
          onAdd={handleAddEstablishment}
          onDelete={(est: any) => setEstablishmentToDelete(est)}
        />
      </SidebarHeader>

      <SidebarContent scrollbar>
        <NavMain items={navItems} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter padding="md">
        <NavUser 
          user={mockUser}
          isCollapsed={isCollapsed}
          isDarkMode={isDarkMode}
          onDarkModeChange={setIsDarkMode}
          notifications={{
            total: totalNotifications,
            pendingRequests,
            onUpdateRequest: handleUpdateRequest
          }}
        />
      </SidebarFooter>

      {/* Delete Confirmation */}
      <AlertDialog open={!!establishmentToDelete} onOpenChange={(open) => !open && setEstablishmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar establecimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás <strong>{establishmentToDelete?.name}</strong> permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEstablishmentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEstablishment} variant="destructive">Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ----------------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------------

function NavEstablishments({ active, list, isCollapsed, onSelect, onAdd, onDelete }: any) {
  if (!active) return (
    <Button variant="outline" size="sm" width="full" onClick={onAdd} startIcon={<PlusCircle />}>
      Crear Establecimiento
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" variant="outline" className="h-14">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
            <img 
              src={active.id === 'camarai' ? "https://res.cloudinary.com/dxh2i2rjo/image/upload/v1769436934/camarailogo_lbsc9d.png" : active.image} 
              alt={active.name} 
              className={cn(
                "w-full h-full",
                active.id === 'camarai' ? "object-contain p-1.5" : "object-cover"
              )}
            />
          </div>
          <div className="flex flex-1 flex-col items-start overflow-hidden text-left leading-tight">
            <span className="truncate font-bold text-sm text-foreground">{active.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">{active.type}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent width="trigger" align="start" sideOffset={8}>
        <DropdownMenuGroup>
          {list.map((est: any) => (
            <DropdownMenuItem key={est.id} onSelect={() => onSelect(est.id)} className="gap-3 py-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                <img 
                  src={est.id === 'camarai' ? "https://res.cloudinary.com/dxh2i2rjo/image/upload/v1769436934/camarailogo_lbsc9d.png" : est.image} 
                  alt={est.name} 
                  className={cn(
                    "w-full h-full",
                    est.id === 'camarai' ? "object-contain p-1.5" : "object-cover"
                  )}
                />
              </div>
              <div className="flex flex-1 flex-col items-start overflow-hidden text-left leading-tight">
                <span className="truncate font-bold text-sm text-foreground">{est.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">{est.type}</span>
              </div>
              <Button 
                variant="ghost-destructive" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => { e.stopPropagation(); onDelete(est); }} 
                startIcon={<Trash className="h-4 w-4" />} 
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAdd}>
          <PlusCircle />
          <span>Añadir nuevo local</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavMain({ items, pathname }: any) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item: any) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton isActive={isActive} tooltip={item.label} asChild>
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavUser({ user, isCollapsed, isDarkMode, onDarkModeChange, notifications }: any) {
  const { toast } = useToast()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" variant="outline" className="h-14">
          <Avatar className="h-10 w-10 shrink-0 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.firstName} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">{user.firstName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start overflow-hidden text-left leading-tight">
            <span className="truncate font-bold text-sm text-foreground">{user.firstName}</span>
            <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
          </div>
          {notifications.total > 0 && <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-[10px]">{notifications.total}</Badge>}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent width="lg" side="top" align="start" margin="sm">
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <User />
            <span>Mi cuenta</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Notifications Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Bell />
            <span>Notificaciones</span>
            {notifications.total > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                {notifications.total}
              </Badge>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent width="md">
            <DropdownMenuLabel variant="primary">SOLICITUDES DE AUSENCIA</DropdownMenuLabel>
            <DropdownMenuGroup>
              {notifications.pendingRequests.length > 0 ? (
                notifications.pendingRequests.map((req: any) => {
                  const employee = mockStaffMembers.find(s => s.id === req.staffId)
                  return (
                    <DropdownMenuItem key={req.id} className="gap-3 py-2">
                       <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="text-[10px] font-bold">{employee?.nombre[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate">{employee?.nombre || 'Empleado'}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{req.type} - {format(parseISO(req.startDate), 'dd/MM/yy')}</span>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost-destructive" className="h-7 w-7 p-0" onClick={() => notifications.onUpdateRequest(req.id, 'rejected')} startIcon={<X className="h-4 w-4" />} />
                        <Button size="sm" variant="ghost-success" className="h-7 w-7 p-0" onClick={() => notifications.onUpdateRequest(req.id, 'approved')} startIcon={<Check className="h-4 w-4" />} />
                      </div>
                    </DropdownMenuItem>
                  )
                })
              ) : (
                <p className="p-4 text-xs text-muted-foreground italic text-center">Sin solicitudes pendientes</p>
              )}
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            <Shield />
            <span>Privacidad</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Modo noche' : 'Modo claro'}</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={onDarkModeChange} />
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={() => toast({ title: 'Saliendo...', description: 'Hasta pronto.' })} textVariant="destructive">
          <LogOut />
          <span className="font-bold">Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
