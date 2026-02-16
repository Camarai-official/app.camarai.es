'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicQRClockProps {
    establecimientoId: string;
    establecimientoNombre?: string;
    intervaloSegundos?: number;
    onFichaje?: (data: { timestamp: string; qrToken: string }) => void;
    className?: string;
}

export function DynamicQRClock({ 
    establecimientoId, 
    establecimientoNombre = 'Establecimiento',
    intervaloSegundos = 30,
    onFichaje,
    className 
}: DynamicQRClockProps) {
    const [qrToken, setQrToken] = React.useState<string>('');
    const [countdown, setCountdown] = React.useState(intervaloSegundos);
    const [isOnline, setIsOnline] = React.useState(true);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [offlineQueue, setOfflineQueue] = React.useState<Array<{timestamp: string; qrToken: string}>>([]);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Generar token único
    const generateToken = React.useCallback(() => {
        return `${establecimientoId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }, [establecimientoId]);

    // Inicializar token
    React.useEffect(() => {
        setQrToken(generateToken());
    }, [generateToken]);

    // Regenerar QR cada intervalo y actualizar reloj
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setCountdown(prev => {
                if (prev <= 1) {
                    setQrToken(generateToken());
                    return intervaloSegundos;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [intervaloSegundos, generateToken]);

    // Detectar online/offline
    React.useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Intentar sincronizar cola offline
            if (offlineQueue.length > 0) {
                // Aquí iría la lógica de sincronización
                console.log('Sincronizando fichajes pendientes:', offlineQueue);
                setOfflineQueue([]);
            }
        };
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [offlineQueue]);

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement && containerRef.current) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Error toggling fullscreen:', err);
        }
    };

    // Escuchar cambios de fullscreen
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Simular fichaje (para demo)
    const handleSimulateFichaje = () => {
        const fichajeData = {
            timestamp: new Date().toISOString(),
            qrToken: qrToken };

        if (!isOnline) {
            setOfflineQueue(prev => [...prev, fichajeData]);
        } else {
            onFichaje?.(fichajeData);
        }
    };

    const qrUrl = qrToken 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrToken)}`
        : '';
    const progress = (countdown / intervaloSegundos) * 100;

    return (
        <div 
            ref={containerRef} 
            className={cn(
                "transition-all duration-300",
                isFullscreen && "fixed inset-0 z-50 bg-background p-8 flex items-center justify-center",
                className
            )}
        >
            <Card className={cn(
                "w-full max-w-md mx-auto transition-transform duration-300",
                isFullscreen && "scale-125"
            )}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <H3 className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {establecimientoNombre}
                        </H3>
                        <div className="flex items-center gap-2">
                            <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
                                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            <Button variant="ghost" size="md" onClick={toggleFullscreen} className="h-8 w-8">
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* QR Code con countdown */}
                    <div className="flex justify-center">
                        <div className="relative inline-block">
                            <div className="p-4 bg-white rounded-lg border shadow-sm">
                                {qrUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={qrUrl} 
                                        alt="QR Fichaje" 
                                        width={200} 
                                        height={200}
                                        className="rounded"
                                    />
                                ) : (
                                    <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
                                )}
                            </div>
                            {/* Countdown circular */}
                            <div className="absolute -bottom-3 -right-3 bg-background rounded-full p-1 border shadow-sm">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="absolute w-12 h-12 -rotate-90">
                                        <circle 
                                            cx="24" cy="24" r="20" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="3" 
                                            className="text-muted" 
                                        />
                                        <circle 
                                            cx="24" cy="24" r="20" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="3" 
                                            className="text-primary transition-all duration-1000"
                                            strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="text-sm font-bold">{countdown}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hora actual grande */}
                    <div className="text-center">
                        <div className="text-5xl font-mono font-bold tracking-tight">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="text-center text-sm text-muted-foreground">
                        Escanea el código QR para fichar
                    </div>

                    {/* Cola offline */}
                    {offlineQueue.length > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>{offlineQueue.length} fichaje(s) pendiente(s) de sincronizar</span>
                            </div>
                        </div>
                    )}

                    {/* Botón para simular fichaje (solo desarrollo) */}
                    {process.env.NODE_ENV === 'development' && (
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={handleSimulateFichaje}
                        >
                            Simular Fichaje (Dev)
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

