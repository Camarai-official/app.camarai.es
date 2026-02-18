'use client';

import * as React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface WhatsAppMessage {
  id?: string;
  type: 'text' | 'image' | 'buttons' | 'list';
  content: string;
  imageUrl?: string;
  buttons?: { id: string; label: string }[];
  listItems?: { id: string; title: string; description?: string }[];
  timestamp?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isOutgoing?: boolean;
}

interface WhatsAppPreviewProps {
  messages: WhatsAppMessage[];
  businessName?: string;
  businessLogo?: string;
  className?: string;
  showHeader?: boolean;
}

const StatusIcon = ({ status }: { status: WhatsAppMessage['status'] }) => {
  switch (status) {
    case 'sending':
      return <Clock className="h-3 w-3 text-gray-400" />;
    case 'sent':
      return <Check className="h-3 w-3 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    case 'read':
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    default:
      return null;
  }
};

const MessageBubble = ({ message }: { message: WhatsAppMessage }) => {
  const isOutgoing = message.isOutgoing ?? true;
  
  return (
    <div className={cn(
      'flex',
      isOutgoing ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg p-2 shadow-sm',
        isOutgoing 
          ? 'bg-emerald-50 dark:bg-emerald-900 rounded-tr-none' 
          : 'bg-foreground dark:bg-slate-800 rounded-tl-none'
      )}>
        {/* Image */}
        {message.type === 'image' && message.imageUrl && (
          <div className="mb-2 rounded overflow-hidden">
            <img 
              src={message.imageUrl} 
              alt="Preview" 
              className="max-w-full h-auto"
            />
          </div>
        )}
        
        {/* Text Content */}
        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {message.content}
        </p>
        
        {/* Buttons */}
        {message.type === 'buttons' && message.buttons && (
          <div className="mt-2 space-y-1">
            {message.buttons.map((btn) => (
              <button
                key={btn.id}
                className="w-full py-2 px-3 text-sm text-emerald-600 dark:text-emerald-500 bg-transparent border border-emerald-600/20 rounded-md hover:bg-emerald-600/5 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
        
        {/* List */}
        {message.type === 'list' && message.listItems && (
          <div className="mt-2 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
            {message.listItems.map((item) => (
              <div 
                key={item.id}
                className="py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-foreground/5 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Timestamp and Status */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOutgoing ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-gray-500">
            {message.timestamp || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export function WhatsAppPreview({ 
  messages, 
  businessName = 'Mi Restaurante',
  businessLogo,
  className,
  showHeader = true 
}: WhatsAppPreviewProps) {
  return (
    <div className={cn(
      'w-full max-w-sm mx-auto rounded-xl overflow-hidden border shadow-lg',
      'bg-stone-100 dark:bg-gray-950',
      className
    )}>
      {/* Header */}
      {showHeader && (
        <div className="bg-emerald-800 dark:bg-slate-800 px-4 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={businessLogo} alt={businessName} />
            <AvatarFallback className="bg-emerald-500 text-foreground">
              {businessName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-medium truncate">{businessName}</p>
            <p className="text-xs text-gray-300">en línea</p>
          </div>
        </div>
      )}
      
      {/* Chat Background Pattern */}
      <div 
        className="p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vista previa del mensaje
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={message.id || index} message={message} />
          ))
        )}
      </div>
      
      {/* Input Bar (Decorative) */}
      <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 flex items-center gap-2">
        <div className="flex-1 bg-foreground dark:bg-slate-700 rounded-full px-4 py-2">
          <p className="text-sm text-gray-400">Escribe un mensaje</p>
        </div>
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14.016l5.016-5.016 1.406 1.406-6.422 6.422-6.422-6.422 1.406-1.406z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Helper para crear mensajes fácilmente
export const createWhatsAppMessage = {
  text: (content: string, options?: Partial<WhatsAppMessage>): WhatsAppMessage => ({
    type: 'text',
    content,
    status: 'read',
    isOutgoing: true,
    ...options,
  }),
  
  image: (content: string, imageUrl: string, options?: Partial<WhatsAppMessage>): WhatsAppMessage => ({
    type: 'image',
    content,
    imageUrl,
    status: 'read',
    isOutgoing: true,
    ...options,
  }),
  
  buttons: (content: string, buttons: { id: string; label: string }[], options?: Partial<WhatsAppMessage>): WhatsAppMessage => ({
    type: 'buttons',
    content,
    buttons,
    status: 'read',
    isOutgoing: true,
    ...options,
  }),
  
  list: (content: string, listItems: { id: string; title: string; description?: string }[], options?: Partial<WhatsAppMessage>): WhatsAppMessage => ({
    type: 'list',
    content,
    listItems,
    status: 'read',
    isOutgoing: true,
    ...options,
  }),
  
  incoming: (content: string, options?: Partial<WhatsAppMessage>): WhatsAppMessage => ({
    type: 'text',
    content,
    isOutgoing: false,
    ...options,
  }),
};
