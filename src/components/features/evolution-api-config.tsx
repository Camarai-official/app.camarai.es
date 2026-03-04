'use client';
import { H3, TextXS } from '@/components/ui/typography';

import * as React from 'react';
import { AlertCircle, Check, Loader2, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface EvolutionAPIConfig {
  apiUrl: string;
  apiKey: string;
  instanceId: string;
  businessNumber: string;
  webhookUrl: string;
}

interface EvolutionAPIConfigProps {
  config: EvolutionAPIConfig;
  onChange: (config: EvolutionAPIConfig) => void;
  onSave?: () => void;
  onTestConnection?: () => Promise<boolean>;
  onTestMessage?: (number: string) => Promise<boolean>;
  className?: string;
  readOnly?: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function EvolutionAPIConfigForm({
  config,
  onChange,
  onSave,
  onTestConnection,
  onTestMessage,
  className,
  readOnly = false }: EvolutionAPIConfigProps) {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('disconnected');
  const [isTesting, setIsTesting] = React.useState(false);
  const [testNumber, setTestNumber] = React.useState('');
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  const handleChange = (field: keyof EvolutionAPIConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) {
      // Simulate connection test
      setConnectionStatus('connecting');
      setIsTesting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: check if required fields are filled
      const isValid = config.apiUrl && config.apiKey && config.instanceId;
      setConnectionStatus(isValid ? 'connected' : 'error');
      setIsTesting(false);
      
      toast({
        title: isValid ? 'Conexión exitosa' : 'Error de conexión',
        description: isValid 
          ? 'Evolution API está respondiendo correctamente.'
          : 'No se pudo conectar. Verifica las credenciales.',
        variant: isValid ? 'default' : 'destructive' });
      return;
    }

    setConnectionStatus('connecting');
    setIsTesting(true);
    
    try {
      const success = await onTestConnection();
      setConnectionStatus(success ? 'connected' : 'error');
      toast({
        title: success ? 'Conexión exitosa' : 'Error de conexión',
        description: success 
          ? 'Evolution API está respondiendo correctamente.'
          : 'No se pudo conectar. Verifica las credenciales.',
        variant: success ? 'default' : 'destructive' });
    } catch {
      setConnectionStatus('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al probar la conexión.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testNumber) {
      toast({
        variant: 'destructive',
        title: 'Número requerido',
        description: 'Introduce un número para enviar el mensaje de prueba.' });
      return;
    }

    setIsSendingTest(true);

    if (!onTestMessage) {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Mensaje enviado',
        description: `Mensaje de prueba enviado a ${testNumber}.` });
      setIsSendingTest(false);
      return;
    }

    try {
      const success = await onTestMessage(testNumber);
      toast({
        title: success ? 'Mensaje enviado' : 'Error al enviar',
        description: success 
          ? `Mensaje de prueba enviado a ${testNumber}.`
          : 'No se pudo enviar el mensaje.',
        variant: success ? 'default' : 'destructive' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al enviar el mensaje.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Wifi className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Conectando...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <WifiOff className="h-3 w-3 mr-1" />
            Desconectado
          </Badge>
        );
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <H3 className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-whatsapp" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Evolution API
            </H3>
            <CardDescription>
              Configuración de conexión con WhatsApp Business
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API URL */}
        <div className="space-y-2">
          <Label htmlFor="api-url">URL de la API</Label>
          <Input
            id="api-url"
            placeholder="https://api.evolution.com"
            value={config.apiUrl}
            onChange={(e) => handleChange('apiUrl', e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Tu clave de API"
            value={config.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* Instance ID */}
        <div className="space-y-2">
          <Label htmlFor="instance-id">Instance ID</Label>
          <Input
            id="instance-id"
            placeholder="ID de tu instancia"
            value={config.instanceId}
            onChange={(e) => handleChange('instanceId', e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* Business Number */}
        <div className="space-y-2">
          <Label htmlFor="business-number">Número de WhatsApp Business</Label>
          <Input
            id="business-number"
            placeholder="+34612345678"
            value={config.businessNumber}
            onChange={(e) => handleChange('businessNumber', e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL del Webhook</Label>
          <Input
            id="webhook-url"
            placeholder="https://tu-dominio.com/api/webhook/whatsapp"
            value={config.webhookUrl}
            onChange={(e) => handleChange('webhookUrl', e.target.value)}
            disabled={readOnly}
          />
          <TextXS className="text-muted-foreground">
            URL donde se recibirán los eventos de WhatsApp
          </TextXS>
        </div>

        {/* Test Connection */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTesting || readOnly}
          >
            {isTesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Probar Conexión
          </Button>
          {connectionStatus === 'connected' && (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </div>

        {/* Test Message */}
        {connectionStatus === 'connected' && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Enviar mensaje de prueba</Label>
            <div className="flex gap-2">
              <Input
                placeholder="+34612345678"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                disabled={readOnly}
              />
              <Button 
                onClick={handleSendTestMessage}
                disabled={isSendingTest || !testNumber || readOnly}
              >
                {isSendingTest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        )}

        {/* Save Button */}
        {onSave && !readOnly && (
          <div className="pt-4">
            <Button onClick={onSave} className="w-full">
              Guardar Configuración
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default config for initialization
export const defaultEvolutionConfig: EvolutionAPIConfig = {
  apiUrl: '',
  apiKey: '',
  instanceId: '',
  businessNumber: '',
  webhookUrl: '' };

