'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconBadge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface ConfigItemProps {
  icon?: React.ElementType | React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  noIconContainer?: boolean;
  iconClassName?: string;
  iconContainerClassName?: string;
  className?: string;
}

export function ConfigItem({
  icon: Icon,
  label,
  description,
  children,
  noIconContainer = false,
  iconClassName,
  iconContainerClassName,
  className
}: ConfigItemProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0", className)}>
      <div className="flex items-center gap-4 min-w-0">
        {!noIconContainer && Icon ? (
          <IconBadge 
            icon={Icon} 
            className={cn("h-10 w-10 rounded-xl shrink-0", iconContainerClassName)}
            iconClassName={cn("h-5 w-5", iconClassName)}
          />
        ) : (
          Icon && typeof Icon !== 'function' ? Icon : Icon && React.createElement(Icon as React.ElementType, { className: cn("h-5 w-5 shrink-0", iconClassName) })
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium leading-none">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
      </div>
    </div>
  );
}

interface ConfigToggleProps extends Omit<ConfigItemProps, 'children'> {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ConfigToggle({
  id,
  checked,
  onCheckedChange,
  ...props
}: ConfigToggleProps) {
  return (
    <ConfigItem {...props}>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </ConfigItem>
  );
}
