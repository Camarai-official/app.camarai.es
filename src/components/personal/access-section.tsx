'use client';

import * as React from 'react';
import { Shield, User, Settings, Lock, Check, X, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TextSM, TextXS } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface AccessSectionProps {
    employeeData?: {
        pin?: string;
        accessLevel?: 'camarero' | 'cocinero' | 'encargado' | 'jefe' | 'personalizado';
        permissions?: string[];
    };
    onChange?: (data: {
        pin?: string;
        accessLevel?: 'camarero' | 'cocinero' | 'encargado' | 'jefe' | 'personalizado';
        permissions?: string[];
    }) => void;
}

const accessLevels = [
    {
        id: 'camarero',
        title: 'Camarero',
        description: 'Acceso básico (POS, KDS, comandas propias)',
        icon: User,
        permissions: ['pos', 'kds']
    },
    {
        id: 'cocinero',
        title: 'Cocinero',
        description: 'Acceso exclusivo a KDS de cocina',
        icon: ChefHat,
        permissions: ['kds']
    },
    {
        id: 'encargado',
        title: 'Encargado',
        description: 'Camarero + funciones de gestión',
        icon: Settings,
        permissions: ['pos', 'kds', 'reportes', 'inventario', 'personal']
    },
    {
        id: 'jefe',
        title: 'Jefe / Admin',
        description: 'Acceso completo a todas las funciones',
        icon: Shield,
        permissions: ['pos', 'kds', 'reportes', 'reportes_completos', 'inventario', 'personal', 'configuracion', 'integraciones', 'cierre_caja', 'descuentos', 'anular_comandas', 'editar_comandas', 'whatsapp_config']
    },
    {
        id: 'personalizado',
        title: 'Personalizado',
        description: 'Seleccionar permisos manualmente',
        icon: Lock,
        permissions: [] // Will be selected manually
    }
];

const systemPermissions = [
    { id: 'pos', label: 'Acceso a POS', description: 'Ventas y cobros habituales', icon: '🖥️' },
    { id: 'kds', label: 'Acceso a KDS', description: 'Visualización de comandas en cocina', icon: '📺' },
    { id: 'reportes', label: 'Ver Reportes', description: 'Estadísticas de ventas diarias', icon: '📊' },
    { id: 'reportes_completos', label: 'Reportes Completos', description: 'Auditorías y cierres avanzados', icon: '📈' },
    { id: 'inventario', label: 'Gestionar Inventario', description: 'Control de stock y proveedores', icon: '📦' },
    { id: 'personal', label: 'Gestionar Personal', description: 'Gestión de horarios y empleados', icon: '👥' },
    { id: 'configuracion', label: 'Configuración del Sistema', description: 'Ajustes globales del local', icon: '⚙️' },
    { id: 'integraciones', label: 'Gestionar Integraciones', description: 'Conexión con servicios externos', icon: '🔗' },
    { id: 'cierre_caja', label: 'Cierre de Caja', description: 'Habilidad para cerrar el turno', icon: '🔒' },
    { id: 'descuentos', label: 'Aplicar Descuentos', description: 'Rebajas y cortesías en tickets', icon: '💰' },
    { id: 'anular_comandas', label: 'Anular Comandas', description: 'Eliminar comandas registradas', icon: '❌' },
    { id: 'editar_comandas', label: 'Editar Comandas de Otros', description: 'Modificar tickets de terceros', icon: '✏️' },
    { id: 'whatsapp_config', label: 'Configurar WhatsApp', description: 'Ajustes del bot de WhatsApp', icon: '💬' }
];

export function AccessSection({ employeeData, onChange }: AccessSectionProps) {
    const [pin, setPin] = React.useState(employeeData?.pin || '');
    const [accessLevel, setAccessLevel] = React.useState<'camarero' | 'cocinero' | 'encargado' | 'jefe' | 'personalizado'>(
        employeeData?.accessLevel || 'camarero'
    );
    const [permissions, setPermissions] = React.useState<string[]>(employeeData?.permissions || []);

    // Update permissions when access level changes
    React.useEffect(() => {
        if (accessLevel !== 'personalizado') {
            const selectedLevel = accessLevels.find(level => level.id === accessLevel);
            const newPermissions = selectedLevel?.permissions || [];
            setPermissions(newPermissions);
            onChange?.({ pin, accessLevel, permissions: newPermissions });
        } else {
            onChange?.({ pin, accessLevel, permissions });
        }
    }, [accessLevel]);

    // Handle PIN change
    const handlePinChange = (value: string) => {
        // Only allow numbers and max 4 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 4);
        setPin(numericValue);
        onChange?.({ pin: numericValue, accessLevel, permissions });
    };

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: string, checked: boolean) => {
        const newPermissions = checked
            ? [...permissions, permissionId]
            : permissions.filter(p => p !== permissionId);
        
        setPermissions(newPermissions);
        onChange?.({ pin, accessLevel, permissions: newPermissions });
    };

    const selectedLevel = accessLevels.find(level => level.id === accessLevel);

    return (
        <div className="space-y-6">
            {/* Seguridad Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Seguridad
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="pin" className="text-sm font-medium">
                            PIN de Acceso
                        </Label>
                        <Input
                            id="pin"
                            type="password"
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => handlePinChange(e.target.value)}
                            maxLength={4}
                            className="w-32 text-center text-lg tracking-widest"
                        />
                        <TextXS className="text-muted-foreground mt-1">
                            Código de seguridad de 4 dígitos para acceso al sistema
                        </TextXS>
                    </div>
                </CardContent>
            </Card>

            {/* Nivel de Acceso Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Nivel de Acceso
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={accessLevel} onValueChange={(value) => setAccessLevel(value as any)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accessLevels.map((level) => {
                                const Icon = level.icon;
                                return (
                                    <div key={level.id} className="relative">
                                        <RadioGroupItem
                                            value={level.id}
                                            id={level.id}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={level.id}
                                            className={cn(
                                                "flex flex-col items-start p-4 rounded-lg border-2 cursor-pointer transition-all",
                                                "hover:bg-muted/50",
                                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                                                "peer-data-[state=checked]:shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <Icon className="h-5 w-5 text-primary" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{level.title}</div>
                                                    <TextXS className="text-muted-foreground mt-1">
                                                        {level.description}
                                                    </TextXS>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border-2 border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary flex items-center justify-center">
                                                    {accessLevel === level.id && (
                                                        <Check className="h-2 w-2 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Permisos del Sistema Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Permisos del Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {accessLevel === 'personalizado' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {systemPermissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                    <Checkbox
                                        id={permission.id}
                                        checked={permissions.includes(permission.id)}
                                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                                            <span className="mr-2">{permission.icon}</span>
                                            {permission.label}
                                        </Label>
                                        <TextXS className="text-muted-foreground">
                                            {permission.description}
                                        </TextXS>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                <span>Los permisos se definen automáticamente según el nivel de acceso seleccionado</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {selectedLevel?.permissions.map((permissionId) => {
                                    const permission = systemPermissions.find(p => p.id === permissionId);
                                    if (!permission) return null;
                                    return (
                                        <Badge key={permissionId} variant="secondary" className="justify-start">
                                            <span className="mr-2">{permission.icon}</span>
                                            {permission.label}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
