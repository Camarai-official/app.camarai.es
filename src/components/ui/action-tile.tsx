'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge, IconBadge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Trash, Minus, Plus, MoreHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * ActionTile Component
 * 
 * A universal, flexible component for displaying interactive rows with:
 * - Left side: Icon, Color, Title, and optional Description
 * - Right side: Any component (Switch, Badge, Select, Dropdown, Button, or custom)
 * 
 * All styling is built-in, no need to add classes when using the component.
 */

// ============================================================================
// TYPES
// ============================================================================

type RightContentType = 'switch' | 'checkbox' | 'badge' | 'select' | 'dropdown' | 'button' | 'quantity' | 'progress' | 'custom' | 'empty';

interface BaseActionTileProps {
  /** Icon component from lucide-react or any React node */
  icon?: React.ElementType | React.ReactNode;
  /** Icon color (hex or tailwind color name) */
  iconColor?: string;
  /** Main title text */
  title: React.ReactNode;
  /** Optional description text below title */
  description?: React.ReactNode;
  /** Type of content to display on the right side */
  rightContentType?: RightContentType;
  /** Custom className for the entire row (optional, use sparingly) */
  className?: string;
  /** Disable the entire row */
  disabled?: boolean;
  /** Click handler for the entire row */
  onClick?: () => void;
  /** Variant of the tile */
  variant?: 'outline' | 'ghost' | 'accent' | 'none';
  /** Padding for the tile */
  padding?: 'none' | 'sm' | 'md';
  /** Custom className for the icon container */
  iconContainerClassName?: string;
  /** Custom className for the icon itself */
  iconClassName?: string;
  /** Custom className for the right content container */
  /** Custom content to render on the right, overrides rightContentType */
  rightContent?: React.ReactNode;
  /** Custom className for the right content container */
  rightContentClassName?: string;
}

// Switch variant props
interface SwitchProps {
  rightContentType: 'switch';
  /** Switch ID for accessibility */
  switchId: string;
  /** Switch checked state */
  switchChecked: boolean;
  /** Switch change handler */
  onSwitchChange: (checked: boolean) => void;
}

// Checkbox variant props
interface CheckboxProps {
  rightContentType: 'checkbox';
  /** Checkbox ID for accessibility */
  checkboxId: string;
  /** Checkbox checked state */
  checkboxChecked: boolean;
  /** Checkbox change handler */
  onCheckboxChange: (checked: boolean) => void;
}

// Badge variant props
interface BadgeProps {
  rightContentType: 'badge';
  /** Badge text */
  badgeText: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'completed' | 'in-progress' | 'cancelled';
}

// Select variant props
interface SelectProps {
  rightContentType: 'select';
  /** Select value */
  selectValue: string;
  /** Select change handler */
  onSelectChange: (value: string) => void;
  /** Select options */
  selectOptions: { value: string; label: string }[];
  /** Select placeholder */
  selectPlaceholder?: string;
}

// Dropdown variant props
interface DropdownProps {
  rightContentType: 'dropdown';
  /** Dropdown trigger content (usually a button icon) */
  dropdownTrigger?: React.ReactNode;
  /** Dropdown menu items */
  dropdownItems: { label: string; onClick: () => void; icon?: React.ReactNode }[];
}

// Button variant props
interface ButtonProps {
  rightContentType: 'button';
  /** Button text */
  buttonText: string;
  /** Button click handler */
  onButtonClick: () => void;
  /** Button variant */
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand';
  /** Button size */
  buttonSize?: 'sm' | 'md';
  /** Button icon */
  buttonIcon?: React.ReactNode;
}

// Custom content variant props
interface CustomProps {
  rightContentType: 'custom';
  /** Custom content to render on the right */
  customContent: React.ReactNode;
}

// Quantity variant props
interface QuantityProps {
  rightContentType: 'quantity';
  /** Current quantity value */
  quantity: number;
  /** Handler for quantity increase */
  onIncrease: () => void;
  /** Handler for quantity decrease */
  onDecrease: () => void;
  /** Handler for item removal */
  onRemove: () => void;
}

// Progress variant props
interface ProgressProps {
  rightContentType: 'progress';
  /** Current progress value (0-100) */
  progressValue: number;
  /** Custom class for the progress indicator */
  progressIndicatorClassName?: string;
  /** Custom class for the progress root */
  progressClassName?: string;
  /** Label to show next to the progress bar (default is percentage) */
  progressLabel?: React.ReactNode;
  /** Whether to show the progress label */
  showProgressLabel?: boolean;
}

// Empty variant props
interface EmptyProps {
  rightContentType?: 'empty';
}

// Union type for all variants
export type ActionTileProps = BaseActionTileProps & (SwitchProps | CheckboxProps | BadgeProps | SelectProps | DropdownProps | ButtonProps | QuantityProps | ProgressProps | CustomProps | EmptyProps);

// ============================================================================
// COMPONENT
// ============================================================================

export const ActionTile = React.forwardRef<HTMLDivElement, ActionTileProps>((props, ref) => {
  const {
    icon: Icon,
    iconColor,
    title,
    description,
    rightContentType = 'empty',
    className,
    disabled = false,
    onClick,
    variant = 'outline',
    padding = 'md',
    iconContainerClassName,
    iconClassName,
    rightContent,
    rightContentClassName,
  } = props;

  // ============================================================================
  // ICON RENDERING
  // ============================================================================
  
  const renderIcon = () => {
    if (!Icon) return null;
    return (
      <IconBadge 
        icon={Icon} 
        iconColor={iconColor}
        className={cn("h-10 w-10 rounded-xl shrink-0", iconContainerClassName)}
        iconClassName={cn("h-5 w-5", iconClassName)}
      />
    );
  };

  // ============================================================================
  // RIGHT CONTENT RENDERING
  // ============================================================================
  
  const renderRightContent = () => {
    if (rightContent) return rightContent;
    switch (rightContentType) {
      case 'switch': {
        const switchProps = props as BaseActionTileProps & SwitchProps;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              id={switchProps.switchId}
              checked={switchProps.switchChecked}
              onCheckedChange={switchProps.onSwitchChange}
              disabled={disabled}
            />
          </div>
        );
      }

      case 'checkbox': {
        const checkboxProps = props as BaseActionTileProps & CheckboxProps;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={checkboxProps.checkboxId}
              checked={checkboxProps.checkboxChecked}
              onCheckedChange={checkboxProps.onCheckboxChange}
              disabled={disabled}
            />
          </div>
        );
      }

      case 'badge': {
        const badgeProps = props as BaseActionTileProps & BadgeProps;
        return (
          <Badge variant={badgeProps.badgeVariant || 'default'}>
            {badgeProps.badgeText}
          </Badge>
        );
      }

      case 'select': {
        const selectProps = props as BaseActionTileProps & SelectProps;
        return (
          <div onClick={(e) => e.stopPropagation()} className="w-full">
            <Select
              value={selectProps.selectValue}
              onValueChange={selectProps.onSelectChange}
              disabled={disabled}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={selectProps.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {selectProps.selectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      case 'dropdown': {
        const dropdownProps = props as BaseActionTileProps & DropdownProps;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              {dropdownProps.dropdownTrigger || (
                <Button variant="ghost" size="md" className="h-10 w-10">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownProps.dropdownItems.map((item, index) => (
                <DropdownMenuItem key={index} onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      case 'button': {
        const buttonProps = props as BaseActionTileProps & ButtonProps;
        return (
          <Button
            variant={buttonProps.buttonVariant || 'default'}
            size={buttonProps.buttonSize || 'sm'}
            onClick={buttonProps.onButtonClick}
            disabled={disabled}
            startIcon={buttonProps.buttonIcon}
            className="h-10"
          >
            {buttonProps.buttonText}
          </Button>
        );
      }

      case 'quantity': {
        const qProps = props as BaseActionTileProps & QuantityProps;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="md"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                qProps.onDecrease();
              }}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center text-sm font-bold tabular-nums">
              {qProps.quantity}
            </span>
            <Button
              variant="ghost"
              size="md"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                qProps.onIncrease();
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                qProps.onRemove();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      case 'progress': {
        const pProps = props as BaseActionTileProps & ProgressProps;
        return (
          <div className="flex flex-col items-end gap-1.5 w-24 sm:w-32">
            {pProps.showProgressLabel !== false && (
              <span className="text-xs font-bold tabular-nums">
                {pProps.progressLabel || `${pProps.progressValue}%`}
              </span>
            )}
            <Progress 
              value={pProps.progressValue} 
              className={cn("h-1.5", pProps.progressClassName)}
              indicatorClassName={pProps.progressIndicatorClassName}
            />
          </div>
        );
      }

      case 'custom': {
        const customProps = props as BaseActionTileProps & CustomProps;
        return customProps.customContent;
      }

      case 'empty':
      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Variant: Progress uses a special full-width vertical layout
  if (rightContentType === 'progress') {
    const pProps = props as BaseActionTileProps & ProgressProps;
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex flex-1 items-center transition-colors group gap-3 w-full",
          variant === 'outline' && "rounded-xl border bg-card hover:bg-muted/50",
          variant === 'ghost' && "bg-transparent hover:bg-muted/30",
          variant === 'accent' && "bg-accent/50 hover:bg-accent rounded-md",
          variant === 'none' && "bg-transparent border-none p-0 shadow-none hover:bg-transparent",
          padding === 'none' && "p-0",
          padding === 'sm' && "p-2",
          padding === 'md' && "p-3",
          disabled && "opacity-50 cursor-not-allowed",
          onClick && "cursor-pointer",
          className
        )}
      >
        {renderIcon()}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-bold text-foreground leading-tight">
                {typeof title === 'string' ? <span>{title}</span> : title}
              </div>
              {description && (
                <div className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                  {description}
                </div>
              )}
            </div>
            {pProps.showProgressLabel !== false && (
              <div className="text-sm font-black text-foreground tabular-nums flex-shrink-0">
                {pProps.progressLabel || `${pProps.progressValue}%`}
              </div>
            )}
          </div>
          <Progress 
            value={pProps.progressValue} 
            className={cn("h-1.5", pProps.progressClassName)}
            indicatorClassName={pProps.progressIndicatorClassName}
          />
        </div>
      </div>
    );
  }

  // Standard Layout: Left (Icon + Text) | Right (Interactive Content)
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start sm:flex-row sm:items-center justify-between transition-colors group gap-3 sm:gap-4 min-h-16 w-full",
        variant === 'outline' && "rounded-xl border bg-card hover:bg-muted/50",
        variant === 'ghost' && "bg-transparent hover:bg-muted/30",
        variant === 'accent' && "bg-accent/50 hover:bg-accent rounded-md",
        variant === 'none' && "bg-transparent border-none p-0 shadow-none hover:bg-transparent",
        padding === 'none' && "p-0",
        padding === 'sm' && "p-2",
        padding === 'md' && "py-1.5 px-3",
        disabled && "opacity-50 cursor-not-allowed",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Left Side: Icon + Title + Description */}
      <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        {renderIcon()}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-left text-foreground leading-tight">
            {typeof title === 'string' ? <span>{title}</span> : title}
          </div>
          {description && (
            <div className="text-[11px] text-muted-foreground text-left line-clamp-2 leading-tight">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Dynamic Content */}
      <div className={cn("flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end shrink-0 min-w-0 [&>*]:flex-1 sm:[&>*]:flex-none", rightContentClassName)}>
        {renderRightContent()}
      </div>
    </div>
  );
});

ActionTile.displayName = 'ActionTile';
