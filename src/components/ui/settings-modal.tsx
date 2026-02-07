'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings } from 'lucide-react';
import { ConfigToggle } from '@/components/ui/config-item';

export interface SettingsTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tabs: SettingsTab[];
  defaultTab?: string;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
  sm: 'sm:max-w-[425px]',
  md: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[600px]',
  xl: 'sm:max-w-[700px]',
  '2xl': 'sm:max-w-[800px]',
};

export function SettingsModal({
  open,
  onOpenChange,
  title,
  description,
  tabs,
  defaultTab,
  onSave,
  onCancel,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  showFooter = true,
  maxWidth = 'lg',
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id || '');

  React.useEffect(() => {
    if (open && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]}>
        <DialogHeader>
          <DialogTitle icon={Settings}>
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {tabs.length === 1 ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="py-4">{tabs[0].content}</div>
          </ScrollArea>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollArea className="max-h-[50vh]">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                  {tab.content}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}

        {showFooter && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button onClick={handleSave}>{saveLabel}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * SettingItem Component
 * 
 * A reusable component for displaying settings based on ConfigToggle.
 */
export function SettingItem({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  className,
  iconClassName,
  disabled = false,
}: any) {
  return (
    <ConfigToggle
      id={id}
      icon={icon}
      label={label}
      description={description}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={className}
      iconClassName={iconClassName}
    />
  );
}
