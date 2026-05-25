'use client';

import { useEffect, useState } from 'react';
import { WhatauthWorkerClient } from '@/lib/whatauth-worker-client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthData {
  token: string;
  user: {
    id: string;
    name?: string;
    phone?: string;
  };
}

const WHATAUTH_CONFIG = {
  whatsappNumber: '34632202351',
  backendUrl: 'https://worker.whatauth.es',
  clientId: 'camarai_web_app_znDthHATCK63KPh',
  tenantSlug: 'Camarai_web',
} as const;

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function generateQrUrl(text: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

export default function LoginPage() {
  const { login, logout } = useAuth();

  const [hasStarted, setHasStarted] = useState(false);
  const [workerClient] = useState(() => new WhatauthWorkerClient({
    apiUrl: WHATAUTH_CONFIG.backendUrl,
    clientId: WHATAUTH_CONFIG.clientId,
    tenantSlug: WHATAUTH_CONFIG.tenantSlug,
  }));

  const [loginCode, setLoginCode] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [authStatus, setAuthStatus] = useState<'idle' | 'polling' | 'success' | 'error' | 'expired'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure Whatauth callbacks
  useEffect(() => {
    workerClient.setCallbacks({
      onPinRegistered: async (code, ttl) => {
        setLoginCode(code);
        setTimeLeft(ttl);
        setAuthStatus('polling');

        const waUrl = `https://wa.me/${WHATAUTH_CONFIG.whatsappNumber}?text=${encodeURIComponent(code)}`;
        setQrCodeUrl(generateQrUrl(waUrl));
      },
      onAuthCodeIssued: async () => {
        try {
          const auth = await workerClient.exchangeAuthCode();
          const sessionData: AuthData = {
            token: auth.token || '',
            user: auth.user || { id: 'unknown', name: 'Usuario', phone: undefined },
          };
          
          const success = await login(sessionData.token);
          if (success) {
            localStorage.setItem('whatauth_session', JSON.stringify(sessionData));
            setIsAuthenticated(true);
            setAuthStatus('success');
          } else {
            // Remove the whatauth token since it was denied
            localStorage.removeItem('whatauth_session');
            setIsAuthenticated(false);
            setAuthStatus('idle');
            setHasStarted(false);
          }
        } catch (error) {
          console.error('Error exchanging auth code:', error);
          setAuthStatus('error');
        }
      },
      onError: (err) => {
        console.error('Auth error:', err);
        setAuthStatus('error');
      },
      onExpired: () => {
        setAuthStatus('expired');
      },
    });
  }, [workerClient, login]);

  // Countdown timer
  useEffect(() => {
    if (authStatus !== 'polling' || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [authStatus, timeLeft]);

  // Auto-expire
  useEffect(() => {
    if (timeLeft === 0 && authStatus === 'polling') setAuthStatus('expired');
  }, [timeLeft, authStatus]);

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem('whatauth_session');
    if (saved) {
      try {
        const sessionData: AuthData = JSON.parse(saved);
        login(sessionData.token).then(success => {
          if (success) {
            setIsAuthenticated(true);
            setAuthStatus('success');
          } else {
            localStorage.removeItem('whatauth_session');
            setIsAuthenticated(false);
            setAuthStatus('idle');
            setHasStarted(false);
          }
        });
      } catch {
        localStorage.removeItem('whatauth_session');
      }
    }
  }, [login]);

  // Auto-start login flow
  useEffect(() => {
    if (!isAuthenticated && !hasStarted && (authStatus === 'idle' || authStatus === 'error')) {
      startWorkerFlow();
      setHasStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasStarted, authStatus]);

  const startWorkerFlow = async () => {
    try {
      setAuthStatus('idle');
      await workerClient.initSession();
      await workerClient.connectWebSocket();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await workerClient.registerPin();
    } catch (err) {
      console.error('Error starting auth flow:', err);
      setAuthStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-primary/10 p-2 border border-primary/20">
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                C
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Camarai Dashboard</CardTitle>
            <CardDescription className="text-muted-foreground">
              Inicia sesión con tu cuenta de WhatsApp para continuar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whatauth-container rounded-lg border border-border bg-card/50 p-4 transition-all hover:border-primary/30">
            {/* Polling / Expired state — show QR + code */}
            {(authStatus === 'polling' || authStatus === 'expired') && loginCode && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center relative">
                  <div className="bg-white p-3 rounded-lg relative border border-border">
                    {qrCodeUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrCodeUrl} alt="QR Code para WhatsApp" width={200} height={200} className="rounded" />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted rounded">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    )}
                    {authStatus === 'expired' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
                        <button
                          onClick={startWorkerFlow}
                          className="bg-white/90 p-3 rounded-full mb-2 hover:bg-white transition-colors cursor-pointer"
                        >
                          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <span className="text-white text-sm font-medium">Código expirado</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {authStatus === 'expired'
                    ? 'El código ha expirado. Genera uno nuevo para continuar.'
                    : 'Escanea el QR para enviar el código automáticamente'}
                </p>

                {/* PIN code display */}
                <div className={`bg-muted/50 px-6 py-4 rounded-xl text-center relative ${authStatus === 'expired' ? 'opacity-50' : ''}`}>
                  <p className="text-sm text-muted-foreground mb-2">O envía manualmente:</p>
                  <div className="text-3xl tracking-wider font-mono mb-2 text-primary">{loginCode}</div>
                  {authStatus === 'expired' && (
                    <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span className="text-sm text-orange-500">Código expirado</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp button or regenerate */}
                <div className="flex justify-center">
                  {authStatus === 'expired' ? (
                    <button
                      onClick={startWorkerFlow}
                      className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-opacity"
                    >
                      🔄 Generar nuevo código
                    </button>
                  ) : (
                    <a
                      href={`https://wa.me/${WHATAUTH_CONFIG.whatsappNumber}?text=${encodeURIComponent(loginCode)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                      📱 Enviar por WhatsApp
                    </a>
                  )}
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <span className={authStatus === 'expired' ? 'text-orange-500' : ''}>
                    {authStatus === 'expired'
                      ? '⏰ Tiempo expirado'
                      : <>⏱️ Expira en: <strong>{formatTime(timeLeft)}</strong></>}
                  </span>
                </div>
              </div>
            )}

            {/* Error state */}
            {authStatus === 'error' && (
              <div className="text-center py-4">
                <div className="text-destructive mb-4">❌ Ocurrió un error al conectar</div>
                <button
                  onClick={startWorkerFlow}
                  className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

            {/* Idle / Loading state */}
            {authStatus === 'idle' && !loginCode && (
              <div className="text-center text-muted-foreground py-4">
                <div className="animate-pulse">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                  <p>Generando código de acceso...</p>
                </div>
              </div>
            )}

            {/* Success state */}
            {authStatus === 'success' && (
              <div className="text-center text-green-600 py-4">
                <div className="text-2xl mb-4">✅</div>
                <p>¡Autenticación exitosa!</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('whatauth_session');
                    setIsAuthenticated(false);
                    setAuthStatus('idle');
                    setLoginCode(null);
                    setQrCodeUrl(null);
                    setTimeLeft(180);
                    setHasStarted(false);
                    logout();
                  }}
                  className="mt-4 text-sm text-muted-foreground hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Camarai. Todos los derechos reservados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
