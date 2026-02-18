"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2.5 opacity-70 transition-all hover:opacity-100 hover:bg-muted disabled:pointer-events-none text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

interface DialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Main title text */
  title?: React.ReactNode;
  /** Optional description text below the title */
  description?: React.ReactNode;
  /** Optional icon component to display next to the title */
  icon?: React.ElementType;
  /**
   * Set to true when the parent DialogContent has p-0 (no padding).
   * Removes the negative margins that are normally used to "bleed" into the dialog padding.
   */
  flush?: boolean;
}

const DialogHeader = ({
  className,
  children,
  title,
  description,
  icon,
  flush = false,
  ...props
}: DialogHeaderProps) => {
  const hasSmartProps = title !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left border-b border-border/50 p-6 bg-muted/40",
        flush ? "mb-0" : "-mx-6 -mt-6 mb-6",
        className
      )}
      {...props}
    >
      {hasSmartProps ? (
        <>
          <DialogTitle icon={icon}>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}
DialogHeader.displayName = "DialogHeader"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional hint text displayed on the left side of the footer */
  hint?: string;
  /** Handler for the cancel button. If provided, a "Cerrar" button is rendered automatically. */
  onCancel?: () => void;
  /** Label for the cancel button. Defaults to "Cerrar". */
  cancelText?: string;
  /** Handler for the confirm button. If provided, a "Guardar Cambios" button is rendered automatically. */
  onConfirm?: () => void;
  /** Label for the confirm button. Defaults to "Guardar Cambios". */
  confirmText?: string;
  /**
   * Set to true when the parent DialogContent has p-0 (no padding).
   * Removes the negative margins that are normally used to "bleed" into the dialog padding.
   */
  flush?: boolean;
}

const DialogFooter = ({
  className,
  children,
  hint,
  onCancel,
  cancelText = "Cerrar",
  onConfirm,
  confirmText = "Guardar Cambios",
  flush = false,
  ...props
}: DialogFooterProps) => {
  const hasSmartProps = onCancel !== undefined || onConfirm !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 bg-muted/40 border-t border-border/50 p-6",
        flush ? "mt-0" : "-mx-6 -mb-6 mt-6",
        className
      )}
      {...props}
    >
      {hasSmartProps ? (
        <>
          <p className="text-xs text-muted-foreground">
            {hint ?? "Los cambios se aplicarán instantáneamente."}
          </p>
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button variant="default" onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & { icon?: React.ElementType }
>(({ className, icon: Icon, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-bold tracking-tight flex items-center gap-3 text-foreground",
      className
    )}
    {...props}
  >
    {Icon && (
      <div className="p-2 h-10 w-10 bg-foreground/10 rounded-lg">
        <Icon className="text-foreground" />
      </div>
    )}
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm font-medium", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
