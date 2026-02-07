'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * ConfigItem Component (The "Padre" Component)
 * 
 * A generic, premium base component for list items, settings, 
 * and interactive rows across the application.
 */

export interface ConfigItemProps {
  /** Icon can be a Lucide component or a pre-rendered ReactNode */
  icon?: React.ElementType | React.ReactNode;
  /** Main text label */
  label: React.ReactNode;
  /** Subtext or helper description */
  description?: React.ReactNode;
  /** Content to display on the right side (Actions) */
  children?: React.ReactNode;
  /** Custom classes for the container */
  className?: string;
  /** Custom classes for the icon itself if using a Lucide component */
  iconClassName?: string;
  /** Custom classes for the icon container (e.g. for custom bg colors) */
  iconContainerClassName?: string;
  /** Custom color for the icon and its background (hex or CSS var) */
  color?: string;
  /** If true, the icon will not be wrapped in the standard background container */
  noIconContainer?: boolean;
  /** Reduces opacity and prevents interaction */
  disabled?: boolean;
  /** Optional click handler for the whole row */
  onClick?: () => void;
}

export function ConfigItem({
  icon: Icon,
  label,
  description,
  children,
  className,
  iconClassName,
  iconContainerClassName,
  color,
  noIconContainer = false,
  disabled = false,
  onClick,
}: ConfigItemProps) {
  
  // Helper to render the icon correctly whether it's a component or a node
  const renderIcon = () => {
    if (!Icon) return null;
    
    const isLucide = typeof Icon === 'function' || (typeof Icon === 'object' && 'render' in (Icon as any));
    
    // Default styles for the icon
    const iconStyle = color ? { color } : undefined;
    
    const iconContent = isLucide
      ? React.createElement(Icon as React.ElementType, { 
          className: cn("h-5 w-5 text-primary font-bold transition-all duration-300", iconClassName),
          style: iconStyle
        })
      : Icon;

    if (noIconContainer) return iconContent;

    // Background style: if color is provided, use it with 10% opacity
    const containerStyle = color ? { 
      backgroundColor: `${color}1A`, // 1A is ~10% opacity in hex
      color: color 
    } : undefined;

    return (
      <div 
        className={cn(
          "icon-container flex-shrink-0 p-2.5 bg-primary/10 rounded-xl transition-all duration-300", 
          iconContainerClassName
        )}
        style={containerStyle}
      >
        {iconContent}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group gap-3",
        disabled && "opacity-50 cursor-not-allowed",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-1">
        {renderIcon()}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate pr-2 text-foreground">
            {typeof label === 'string' ? <p>{label}</p> : label}
          </div>
          {description && (
            <div className="text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end sm:ml-4 sm:flex-none">
        {children}
      </div>
    </div>
  );
}

/**
 * Specialized Sub-component: Toggle (Switch)
 */
export function ConfigToggle({
  id,
  checked,
  onCheckedChange,
  ...props
}: ConfigItemProps & { id: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <ConfigItem {...props}>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={props.disabled}
      />
    </ConfigItem>
  );
}

/**
 * ConfigEntity Component
 * 
 * A variant of ConfigItem designed for entities with avatars/images (users, establishments).
 */
export function ConfigEntity({
  image,
  fallback,
  avatarClassName,
  ...props
}: ConfigItemProps & { image?: string; fallback?: string; avatarClassName?: string }) {
  const renderEntityIcon = () => {
    if (image && (image.startsWith('http') || image.startsWith('/'))) {
      if (image.includes('camarailogo')) {
        return (
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={typeof props.label === 'string' ? props.label : 'Entity logo'}
              className={cn("h-8 w-auto object-contain", props.iconClassName)}
            />
          </div>
        );
      }
      return (
        <Avatar className={cn("h-8 w-8", avatarClassName)}>
          <AvatarImage src={image} alt={typeof props.label === 'string' ? props.label : 'Entity logo'} />
          <AvatarFallback>{fallback || '?'}</AvatarFallback>
        </Avatar>
      );
    }
    return props.icon;
  };

  return (
    <ConfigItem
      {...props}
      icon={renderEntityIcon()}
      noIconContainer
    />
  );
}
