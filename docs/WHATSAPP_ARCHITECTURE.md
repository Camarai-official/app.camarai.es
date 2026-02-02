# Arquitectura WhatsApp - Camarero AI

## Resumen

El sistema utiliza **WhatsApp** como canal principal de comunicación mediante **Evolution API** y **n8n** para automatización. El "Camarero AI" es un asistente inteligente que procesa pedidos por voz y texto.

---

## Stack Tecnológico

| Componente | Tecnología | Función |
|------------|------------|---------|
| Canal | WhatsApp Business | Comunicación con clientes |
| API | Evolution API | Conexión WhatsApp <-> Backend |
| Automatización | n8n | Flujos de trabajo y lógica |
| AI | OpenAI / Whisper | Procesamiento voz y texto |
| Frontend | Next.js | Panel de administración |

---

## Roles del Sistema

### Matriz de Permisos

| Rol | Código | Descripción |
|-----|--------|-------------|
| Cliente | `customer` | Usuario final que hace pedidos |
| Camarero | `waiter` | Personal de sala |
| Encargado | `manager` | Supervisor de turno |
| Jefe/Admin | `admin` | Acceso total |

### Permisos por Rol

| Permiso | Cliente | Camarero | Encargado | Jefe |
|---------|---------|----------|-----------|------|
| Escanear QR mesa | ✓ | ✓ | ✓ | ✓ |
| Ver carta | ✓ | ✓ | ✓ | ✓ |
| Hacer pedido | ✓ | ✓ | ✓ | ✓ |
| Editar pedido | - | Solo propios | Todos | Todos |
| Cancelar pedido | Propio | Solo propios | Todos | Todos |
| Cobrar | - | ✓ | ✓ | ✓ |
| Cobrar después | - | ✓ | ✓ | ✓ |
| Ver comandas | - | Asignadas | Todas | Todas |
| Ver reportes | - | - | Básicos | Completos |
| Gestionar personal | - | - | ✓ | ✓ |
| Configuración | - | - | Parcial | Total |
| Integraciones | - | - | - | ✓ |

---

## Flujos de WhatsApp

### 1. Apertura de Mesa (QR)

```
[Usuario escanea QR de mesa]
         |
         v
   [WhatsApp Link]
   wa.me/NUMERO?text=MESA_X
         |
         v
  [Evolution API recibe mensaje]
         |
         v
      [n8n Flow]
         |
    ¿Número registrado?
       /        \
      No         Sí
      |          |
      v          v
  [Pedir      [Detectar rol]
   registro]      |
                  +---> Cliente: Abrir mesa lectura
                  +---> Camarero: Abrir mesa completa
                  +---> Encargado: Abrir + métricas
         |
         v
  [Webhook a Frontend]
  [Actualizar estado mesa]
```

### 2. Pedido por Texto

```
[Cliente envía: "Quiero una hamburguesa"]
         |
         v
  [Evolution API]
         |
         v
      [n8n]
         |
         v
  [AI procesa intención]
         |
         v
  [Buscar producto en carta]
         |
    ¿Encontrado?
       /        \
      No         Sí
      |          |
      v          v
  [Sugerir    [Confirmar pedido]
   similares]     |
                  v
            [Enviar a cocina/KDS]
                  |
                  v
            [Webhook Frontend]
```

### 3. Pedido por Voz

```
[Cliente envía audio]
         |
         v
  [Evolution API]
         |
         v
      [n8n]
         |
         v
  [Whisper: Audio -> Texto]
         |
         v
  [Continúa como pedido texto]
```

### 4. Notificación de Reserva

```
[Nueva reserva en sistema]
         |
         v
      [n8n]
         |
         v
  [Generar mensaje confirmación]
         |
         v
  [Evolution API envía WhatsApp]
         |
         v
  [Programar recordatorio 24h antes]
         |
         v
  [Programar recordatorio 2h antes]
```

### 5. Campaña Promocional

```
[Jefe crea campaña en Frontend]
         |
         v
  [Seleccionar audiencia]
         |
         v
  [Programar fecha/hora]
         |
         v
      [n8n]
         |
         v
  [Evolution API envía masivo]
         |
         v
  [Tracking: enviado/entregado/leído]
```

---

## Configuración Evolution API

### Variables de Entorno

```env
# Evolution API
EVOLUTION_API_URL=https://api.evolution.com
EVOLUTION_API_KEY=your_api_key_here
EVOLUTION_INSTANCE_ID=your_instance_id

# WhatsApp Business
WHATSAPP_BUSINESS_NUMBER=+34612345678
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhook/whatsapp

# n8n
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
N8N_API_KEY=your_n8n_key
```

### Endpoints Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/message/send` | POST | Enviar mensaje |
| `/message/sendMedia` | POST | Enviar imagen/audio |
| `/message/sendButtons` | POST | Mensaje con botones |
| `/message/sendList` | POST | Mensaje con lista |
| `/webhook/set` | POST | Configurar webhook |
| `/instance/status` | GET | Estado de conexión |

---

## Webhooks del Frontend

### Eventos que el Frontend debe escuchar

```typescript
// Tipos de eventos WhatsApp
type WhatsAppEvent = 
  | 'mesa.abierta'
  | 'mesa.cerrada'
  | 'pedido.nuevo'
  | 'pedido.modificado'
  | 'pedido.cancelado'
  | 'pedido.pagado'
  | 'reserva.confirmada'
  | 'reserva.cancelada'
  | 'mensaje.recibido'
  | 'mensaje.leido';

// Estructura del webhook
interface WebhookPayload {
  event: WhatsAppEvent;
  timestamp: string;
  data: {
    mesaId?: string;
    pedidoId?: string;
    reservaId?: string;
    clientePhone?: string;
    empleadoId?: string;
  };
}
```

### Ejemplo de Handler

```typescript
// api/webhook/whatsapp/route.ts
export async function POST(request: Request) {
  const payload: WebhookPayload = await request.json();
  
  switch (payload.event) {
    case 'mesa.abierta':
      // Actualizar estado de mesa en UI
      break;
    case 'pedido.nuevo':
      // Añadir pedido a lista de comandas
      // Notificar a KDS
      break;
    case 'reserva.confirmada':
      // Actualizar calendario de reservas
      break;
  }
  
  return Response.json({ received: true });
}
```

---

## QR de Mesa

### Formato del Enlace

```
https://wa.me/WHATSAPP_NUMBER?text=MESA_[ID]_[ESTABLECIMIENTO]_[TIMESTAMP]
```

### Ejemplo

```
https://wa.me/34612345678?text=MESA_T5_REST001_1706540400
```

### Decodificación en n8n

```javascript
// Extraer datos del mensaje inicial
const mensaje = $input.item.json.message;
const partes = mensaje.split('_');

return {
  tipo: partes[0],        // "MESA"
  mesaId: partes[1],      // "T5"
  establecimiento: partes[2], // "REST001"
  timestamp: partes[3]    // "1706540400"
};
```

---

## Integración con Frontend

### Componentes que usan WhatsApp

| Componente | Uso de WhatsApp |
|------------|-----------------|
| `plano-mesas` | Generación QR con enlace WhatsApp |
| `reservas` | Notificaciones automáticas |
| `promociones` | Envío de campañas |
| `comandas` | Recepción de pedidos |
| `personal` | Envío de credenciales |
| `reportes` | Métricas de WhatsApp |
| `settings` | Configuración Evolution API |

### Estado de Conexión

El frontend debe mostrar el estado de conexión con Evolution API:

- 🟢 **Conectado**: API respondiendo, WhatsApp activo
- 🟡 **Reconectando**: Intentando reconexión
- 🔴 **Desconectado**: Sin conexión a Evolution API

---

## Seguridad

### Autenticación de Empleados

1. Empleado escanea QR de mesa
2. Sistema detecta número de teléfono
3. Busca en base de datos de personal
4. Si es empleado registrado:
   - Detecta rol asignado
   - Aplica permisos correspondientes
5. Si no está registrado:
   - Trata como cliente

### PIN de Camarero (Opcional)

Para mayor seguridad, el camarero puede requerir PIN:

```
[Camarero escanea QR]
         |
         v
  [Sistema detecta empleado]
         |
         v
  [Solicitar PIN por WhatsApp]
         |
         v
  [Validar PIN]
         |
    ¿Válido?
       /     \
      No      Sí
      |       |
      v       v
  [Denegar] [Acceso completo]
```

---

## Próximos Pasos

1. [ ] Configurar instancia Evolution API
2. [ ] Crear flujos n8n para cada caso de uso
3. [ ] Implementar webhooks en Next.js
4. [ ] Entrenar modelo AI para procesamiento de pedidos
5. [ ] Configurar Whisper para transcripción de voz
6. [ ] Testing E2E de flujos completos
