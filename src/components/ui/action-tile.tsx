'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Trash, Minus, Plus } from 'lucide-react';

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

type RightContentType = 'switch' | 'badge' | 'select' | 'dropdown' | 'button' | 'quantity' | 'custom' | 'empty';

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

// Badge variant props
interface BadgeProps {
  rightContentType: 'badge';
  /** Badge text */
  badgeText: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'danger' | 'neutral' | 'completed' | 'in-progress' | 'cancelled';
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

// Empty variant props
interface EmptyProps {
  rightContentType?: 'empty';
}

// Union type for all variants
export type ActionTileProps = BaseActionTileProps & (SwitchProps | BadgeProps | SelectProps | DropdownProps | ButtonProps | QuantityProps | CustomProps | EmptyProps);

// ============================================================================
// COMPONENT
// ============================================================================

export function ActionTile(props: ActionTileProps) {
  const {
    icon: Icon,
    iconColor,
    title,
    description,
    rightContentType = 'empty',
    className,
    disabled = false,
    onClick,
  } = props;

  // ============================================================================
  // ICON RENDERING
  // ============================================================================
  
  const renderIcon = () => {
    if (!Icon) return null;
    
    const isLucideComponent = (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) && !React.isValidElement(Icon);
    const isTailwindColor = iconColor && !iconColor.startsWith('#');
    
    // Icon styles
    const iconStyle = iconColor && !isTailwindColor ? { color: iconColor } : undefined;
    const iconTailwindClass = isTailwindColor ? `text-${iconColor}` : '';
    
    // Render the icon
    const iconContent = isLucideComponent
      ? React.createElement(Icon as React.ElementType, { 
          className: cn(
            "h-5 w-5 transition-all duration-300",
            iconTailwindClass || "text-primary"
          ),
          style: iconStyle
        })
      : Icon;

    // Icon container styles
    let containerStyle = undefined;
    let containerTailwindClass = '';

    if (iconColor) {
      if (isTailwindColor) {
        containerTailwindClass = `bg-${iconColor}/10`;
      } else {
        containerStyle = { 
          backgroundColor: `${iconColor}1A`, // 1A is ~10% opacity in hex
        };
      }
    }

    return (
      <div 
        className={cn(
          "flex-shrink-0 p-2.5 rounded-xl transition-all duration-300",
          containerTailwindClass || "bg-primary/10"
        )}
        style={containerStyle}
      >
        {iconContent}
      </div>
    );
  };

  // ============================================================================
  // RIGHT CONTENT RENDERING
  // ============================================================================
  
  const renderRightContent = () => {
    switch (rightContentType) {
      case 'switch': {
        const switchProps = props as BaseActionTileProps & SwitchProps;
        return (
          <Switch
            id={switchProps.switchId}
            checked={switchProps.switchChecked}
            onCheckedChange={switchProps.onSwitchChange}
            disabled={disabled}
          />
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
          <Select
            value={selectProps.selectValue}
            onValueChange={selectProps.onSelectChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px] h-9 border-none bg-muted/50 text-xs">
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
        );
      }

      case 'dropdown': {
        const dropdownProps = props as BaseActionTileProps & DropdownProps;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {dropdownProps.dropdownTrigger || (
                <Button variant="ghost" size="md" className="h-8 w-8">
                  <span className="sr-only">Abrir menú</span>
                  •••
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
          >
            {buttonProps.buttonText}
          </Button>
        );
      }

      case 'quantity': {
        const qProps = props as BaseActionTileProps & QuantityProps;
        return (
          <div className="flex items-center gap-3 bg-background rounded-lg border p-1 shadow-sm">
            <Button
              variant="ghost"
              size="md"
              className="h-6 w-6 hover:bg-destructive/10 transition-colors rounded-md group/remove"
              onClick={(e) => {
                e.stopPropagation();
                qProps.onRemove();
              }}
            >
              <Trash className="h-3.5 w-3.5 text-muted-foreground group-hover/remove:text-destructive" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 px-0.5">
              <Button
                variant="ghost"
                size="md"
                className="h-6 w-6 rounded-md hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  qProps.onDecrease();
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-[13px] font-bold tabular-nums">
                {qProps.quantity}
              </span>
              <Button
                variant="ghost"
                size="md"
                className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  qProps.onIncrease();
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
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
      {/* Left Side: Icon + Title + Description */}
      <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-1">
        {renderIcon()}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate pr-2 text-foreground">
            {typeof title === 'string' ? <p>{title}</p> : title}
          </div>
          {description && (
            <div className="text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Dynamic Content */}
      <div className="flex items-center gap-2 justify-end sm:ml-4 sm:flex-none">
        {renderRightContent()}
      </div>
    </div>
  );
}
