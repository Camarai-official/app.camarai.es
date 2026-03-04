'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { MessageSquare, Smartphone, QrCode, Check, ChevronRight, RefreshCw, Phone, User, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Types
interface WhatsAppLoginProps {
  onLoginSuccess?: (userData: { phone: string; name: string; verified: boolean }) => void;
  onLoginError?: (error: string) => void;
  restaurantName?: string;
  mode?: 'employee' | 'customer';
}

type LoginStep = 'phone' | 'qr' | 'verify' | 'success';

// WhatsApp Login Component
export function WhatsAppLogin({
  onLoginSuccess,
  onLoginError,
  restaurantName = 'Mi Restaurante',
  mode = 'employee' }: WhatsAppLoginProps) {
  const { toast } = useToast();
  const [step, setStep] = React.useState<LoginStep>('phone');
  const [phone, setPhone] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [qrExpiry, setQrExpiry] = React.useState(60);
  const [userName, setUserName] = React.useState('');

  // QR countdown
  React.useEffect(() => {
    if (step === 'qr' && qrExpiry > 0) {
      const timer = setInterval(() => {
        setQrExpiry(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, qrExpiry]);

  // Validate phone number
  const isValidPhone = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, '');
    return cleaned.length >= 9 && cleaned.length <= 15;
  };

  // Generate QR URL (using api.qrserver.com for demo)
  const getQRUrl = () => {
    const data = `whatsapp://send?phone=${phone.replace(/\D/g, '')}&text=Iniciar%20sesión%20en%20${encodeURIComponent(restaurantName)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  };

  // Handle phone submission
  const handlePhoneSubmit = async () => {
    if (!isValidPhone(phone)) {
      toast({
        variant: 'destructive',
        title: 'Número inválido',
        description: 'Por favor, introduce un número de teléfono válido.' });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('qr');
    setQrExpiry(60);
    
    toast({
      title: 'Código enviado',
      description: 'Escanea el QR o revisa tu WhatsApp.' });
  };

  // Handle QR scanned (simulated)
  const handleQRScanned = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('verify');
  };

  // Handle verification
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Código incorrecto',
        description: 'El código debe tener 6 dígitos.' });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success
    setIsLoading(false);
    setStep('success');
    
    onLoginSuccess?.({
      phone: phone,
      name: userName || 'Usuario',
      verified: true });
    
    toast({
      title: '¡Bienvenido!',
      description: 'Has iniciado sesión correctamente.' });
  };

  // Refresh QR
  const handleRefreshQR = () => {
    setQrExpiry(60);
    toast({
      title: 'QR actualizado',
      description: 'Se ha generado un nuevo código QR.' });
  };

  // Reset to start
  const handleReset = () => {
    setStep('phone');
    setPhone('');
    setVerificationCode('');
    setQrExpiry(60);
  };

  // Progress based on step
  const getProgress = () => {
    switch (step) {
      case 'phone': return 25;
      case 'qr': return 50;
      case 'verify': return 75;
      case 'success': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-whatsapp/10 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-brand-whatsapp" />
        </div>
        <H3>Iniciar Sesión con WhatsApp</H3>
        <CardDescription>
          {mode === 'employee' 
            ? `Accede a tu cuenta de ${restaurantName}`
            : 'Escanea el QR para identificarte'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-between px-2">
          {[
            { key: 'phone', label: 'Teléfono', icon: Phone },
            { key: 'qr', label: 'QR', icon: QrCode },
            { key: 'verify', label: 'Verificar', icon: Lock },
            { key: 'success', label: 'Listo', icon: Check },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isPast = ['phone', 'qr', 'verify', 'success'].indexOf(step) > i;
            return (
              <div
                key={s.key}
                className={cn(
                  "flex flex-col items-center gap-1",
                  isActive && "text-primary",
                  isPast && !isActive && "text-green-500",
                  !isActive && !isPast && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2",
                  isActive && "border-primary bg-primary/10",
                  isPast && !isActive && "border-green-500 bg-green-50",
                  !isActive && !isPast && "border-muted"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px]">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 bg-muted rounded-md border text-sm">
                  <span>🇪🇸</span>
                  <span>+34</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="612 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recibirás un mensaje de WhatsApp para verificar tu número.
              </p>
            </div>

            {mode === 'employee' && (
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre (opcional)</Label>
                <Input
                  id="name"
                  placeholder="Juan García"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={handlePhoneSubmit} 
              className="w-full bg-brand-whatsapp hover:bg-brand-whatsapp/90"
              disabled={isLoading || !phone}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Continuar
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4 text-center">
            <div className="relative mx-auto w-fit">
              <div className="p-4 bg-foreground rounded-lg shadow-inner border">
                <Image
                  src={getQRUrl()}
                  alt="QR Code"
                  width={180}
                  height={180}
                  className="mx-auto"
                  unoptimized
                />
              </div>
              {qrExpiry <= 0 && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">QR expirado</p>
                  <Button variant="outline" size="sm" onClick={handleRefreshQR} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Escanea con WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                {qrExpiry > 0 
                  ? `El código expira en ${qrExpiry}s`
                  : 'Código expirado'
                }
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleQRScanned}
                className="w-full bg-brand-whatsapp hover:bg-brand-whatsapp/90"
                disabled={isLoading || qrExpiry <= 0}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Ya escaneé el código
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Cambiar número
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-brand-whatsapp">
                <Smartphone className="h-3 w-3 mr-1" />
                Código enviado a {phone}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código de verificación</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                Introduce el código de 6 dígitos que recibiste.
              </p>
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full bg-brand-whatsapp hover:bg-brand-whatsapp/90"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Verificar
            </Button>

            <div className="text-center">
              <Button variant="link" size="sm" onClick={() => setStep('qr')}>
                ¿No recibiste el código? Volver al QR
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">¡Verificación completada!</h3>
              <p className="text-sm text-muted-foreground">
                Bienvenido{userName ? `, ${userName}` : ''}
              </p>
            </div>
            <Badge variant="outline" className="text-brand-whatsapp">
              <Check className="h-3 w-3 mr-1" />
              {phone} verificado
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

