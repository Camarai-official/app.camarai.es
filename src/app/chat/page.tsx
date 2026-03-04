'use client';

import * as React from 'react';
import { 
    MessageSquare, 
    Search, 
    Send, 
    MoreVertical, 
    Paperclip, 
    Smile,
    CheckCheck,
    Plus,
    Sparkles,
    Lightbulb,
    Clock,
    TrendingUp,
    AlertCircle,
    User,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { H3, TextSM, TextXS } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

const SUGGESTED_PROMPTS = [
    { id: '1', title: 'Ventas de hoy', prompt: '¿Cuánto hemos vendido hoy comparado con el martes pasado?', icon: TrendingUp },
    { id: '2', title: 'Stock bajo', prompt: 'Dime qué productos tienen menos de 5 unidades en stock.', icon: AlertCircle },
    { id: '3', title: 'Personal activo', prompt: '¿Quién está fichado ahora mismo en el local?', icon: User },
    { id: '4', title: 'Plato estrella', prompt: '¿Cuál es el plato más vendido de este mes?', icon: Lightbulb },
];

const INITIAL_MESSAGES = [
    { 
        id: '0', 
        sender: 'Camarai AI', 
        content: '¡Hola! Soy tu asistente de Camarai. Tengo acceso a toda la información de tu restaurante: ventas, personal, inventario y reservas. ¿En qué puedo ayudarte hoy?', 
        time: 'Ahora', 
        isMe: false,
        isAI: true 
    },
];

export default function AIChatPage() {
    const { toast } = useToast();
    const [messages, setMessages] = React.useState(INITIAL_MESSAGES);
    const [message, setMessage] = React.useState('');
    const [isThinking, setIsThinking] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const simulateAIResponse = (userMsg: string) => {
        setIsThinking(true);
        
        // Simular tiempo de "pensamiento"
        setTimeout(() => {
            let response = "He analizado los datos y veo que ";
            
            if (userMsg.toLowerCase().includes('venta')) {
                response += "hoy hemos facturado 1.240€, lo que supone un incremento del 12% respecto al martes pasado. El ticket medio ha subido a 42,50€.";
            } else if (userMsg.toLowerCase().includes('stock') || userMsg.toLowerCase().includes('unidades')) {
                response += "tienes stock bajo en 3 productos: Cerveza Mahou (4 u.), Solomillo de Ternera (2 u.) y Salmón Fresco (3 u.). ¿Quieres que cree una alerta para el proveedor?";
            } else if (userMsg.toLowerCase().includes('fichado') || userMsg.toLowerCase().includes('personal')) {
                response += "actualmente hay 6 empleados con el turno activo: Alba (Encargada), Juan (Cocina), María (Salón) y otros 3 auxiliares. Todo el personal de tarde ha fichado correctamente.";
            } else {
                response += "actualmente el restaurante está operando con normalidad. Las reservas para el fin de semana están al 85% de ocupación y no hay incidencias técnicas reportadas.";
            }

            const aiMsg = {
                id: Date.now().toString(),
                sender: 'Camarai AI',
                content: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                isAI: true
            };
            
            setMessages(prev => [...prev, aiMsg]);
            setIsThinking(false);
        }, 1500);
    };

    const handleSendMessage = (e?: React.FormEvent, customMsg?: string) => {
        if (e) e.preventDefault();
        const msgToSend = customMsg || message;
        if (!msgToSend || isThinking) return;

        const newUserMsg = {
            id: Date.now().toString(),
            sender: 'Yo',
            content: msgToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            isAI: false
        };

        setMessages(prev => [...prev, newUserMsg]);
        setMessage('');
        simulateAIResponse(msgToSend);
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Asistente Inteligente" 
                subtitle="Pregúntame cualquier cosa sobre tu restaurante. Tengo acceso a datos de ventas, stock y personal en tiempo real."
            />
            
            <PageContent className="pb-0 h-[calc(100vh-200px)]">
                <Card className="h-full flex overflow-hidden border-none shadow-xl bg-card">
                    {/* LEFT SIDEBAR: SUGGESTIONS & HISTORY */}
                    <div className="hidden lg:flex w-80 border-r flex-col shrink-0 bg-muted/10">
                        <div className="p-4 border-b">
                            <H3 className="text-lg flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" /> Sugerencias IA
                            </H3>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Haz clic para lanzar una consulta rápida
                            </p>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {SUGGESTED_PROMPTS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSendMessage(undefined, item.prompt)}
                                    className="w-full p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <item.icon className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[11px] font-bold  tracking-wider">{item.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {item.prompt}
                                    </p>
                                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="h-3 w-3 text-primary" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto p-4 border-t bg-primary/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <HelpCircle className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-xs font-bold">¿Cómo sabré..?</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Puedo cruzar datos de diferentes módulos para darte respuestas precisas. Por ejemplo: "Dime si necesito más personal el sábado basándote en las reservas".
                            </p>
                        </div>
                    </div>

                    {/* MAIN CHAT AREA */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/5 relative">
                        {/* CHAT HEADER */}
                        <div className="h-16 px-6 border-b flex items-center justify-between bg-card shrink-0 z-10">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0 flex flex-col">
                                    <span className="font-bold text-sm truncate">Camarai AI Assistant</span>
                                    <span className="text-[10px] text-success flex items-center gap-1 font-bold">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Inteligencia Activa
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9"><Clock className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {/* MESSAGES AREA */}
                        <ScrollArea ref={scrollRef} className="flex-1 p-6">
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div className="flex justify-center">
                                    <Badge variant="outline" className="text-[10px] font-bold opacity-30  tracking-widest border-none">Conexión Segura con el Establecimiento</Badge>
                                </div>
                                
                                {messages.map((msg) => (
                                    <div key={msg.id} className={cn(
                                        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        msg.isMe ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <Avatar className={cn(
                                            "h-9 w-9 shrink-0",
                                            msg.isAI ? "bg-primary shadow-md" : "bg-muted shadow-sm"
                                        )}>
                                            <AvatarFallback className={cn("text-xs font-bold", msg.isAI ? "text-white" : "")}>
                                                {msg.isAI ? <Sparkles className="h-4 w-4" /> : "YO"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className={cn(
                                            "flex flex-col gap-1.5 max-w-[80%]",
                                            msg.isMe ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                                msg.isMe 
                                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                                                    : "bg-card text-foreground rounded-tl-none border border-border/50 shadow-sm"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[10px] text-muted-foreground font-bold">{msg.time}</span>
                                                {msg.isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isThinking && (
                                    <div className="flex gap-4 animate-in fade-in duration-300">
                                        <Avatar className="h-9 w-9 shrink-0 bg-primary shadow-md">
                                            <AvatarFallback className="text-white"><Sparkles className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-card border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">Consultando base de datos...</span>
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* INPUT AREA */}
                        <div className="p-6 bg-card border-t shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto w-full">
                                <div className="flex-1 bg-muted/30 rounded-2xl flex items-end p-1.5 shadow-inner border border-border/60 transition-all focus-within:border-primary/50 focus-within:bg-muted/10">
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl mb-0.5 hover:bg-primary/10 hover:text-primary">
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <textarea 
                                        rows={1}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Haz una pregunta sobre el restaurante..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 px-3 resize-none max-h-32 min-h-[44px]"
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl mb-0.5 hover:bg-primary/10 hover:text-primary">
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    disabled={!message || isThinking}
                                    className="h-12 w-12 shrink-0 rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                            <div className="flex justify-center mt-3">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold  tracking-wider">
                                    <Sparkles className="h-3 w-3" /> Camarai Engine v2.4
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </PageContent>
        </PageContainer>
    );
}
