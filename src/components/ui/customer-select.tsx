'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

interface Customer {
  _id: Id<"customers">;
  name: string;
  phone?: string;
  email?: string;
  establishments_id: Id<"establishments">[];
}

interface CustomerSelectProps {
  establishmentId: Id<"establishments">;
  selectedCustomer?: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomerSelect({ 
  establishmentId, 
  selectedCustomer, 
  onCustomerSelect, 
  placeholder = "Buscar cliente...",
  disabled = false 
}: CustomerSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newCustomerData, setNewCustomerData] = React.useState({
    name: '',
    phone: '',
    email: ''
  });

  // Search customers based on query
  const searchResults = useQuery(api.customers.searchCustomers, {
    establishment_id: establishmentId,
    search_query: searchQuery,
  }) || [];

  // Get all customers when no search query
  const allCustomers = useQuery(api.customers.getCustomers, {
    establishment_id: establishmentId,
  }) || [];

  // Customer creation mutation
  const createCustomer = useMutation(api.customers.createCustomer);

  // Use search results if there's a query, otherwise show all customers
  const customers = searchQuery ? searchResults : allCustomers;

  const handleSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    // Determine if searchQuery looks like a phone number
    const isPhoneNumber = /^\d[\d\s\-\+\(\)]*$/.test(searchQuery.trim());
    
    // Set initial data based on what user provided
    setNewCustomerData({
      name: isPhoneNumber ? '' : searchQuery.trim(),
      phone: isPhoneNumber ? searchQuery.trim() : '',
      email: ''
    });
    
    setShowCreateDialog(true);
  };

  const handleCreateCustomerConfirm = async () => {
    try {
      // Create customer in database
      const customerId = await createCustomer({
        establishments_id: [establishmentId],
        name: newCustomerData.name || 'Cliente',
        phone: newCustomerData.phone || undefined,
        email: newCustomerData.email || undefined,
        source: "manual" as const,
      });

      // Create customer object with the real ID
      const newCustomer: Customer = {
        _id: customerId,
        name: newCustomerData.name || 'Cliente',
        phone: newCustomerData.phone,
        email: newCustomerData.email,
        establishments_id: [establishmentId],
      };
      
      onCustomerSelect(newCustomer);
      setShowCreateDialog(false);
      setOpen(false);
      setSearchQuery('');
      setNewCustomerData({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleClear = () => {
    onCustomerSelect(null);
    setSearchQuery('');
  };

  
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selectedCustomer && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 shrink-0" />
            {selectedCustomer ? (
              <span className="truncate">
                {selectedCustomer.name}
                {selectedCustomer.phone && (
                  <span className="text-muted-foreground ml-2">
                    ({selectedCustomer.phone})
                  </span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </div>
          {selectedCustomer && (
            <span
              className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }
              }}
            >
              ×
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            {/* Show empty state manually when no customers */}
            {customers.length === 0 ? (
              <div className="py-2">
                <p className="px-2 text-sm text-muted-foreground">
                  No se encontraron clientes.
                </p>
              </div>
            ) : (
              <div className="py-1">
                {customers.map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleSelect(customer)}
                    className="flex items-center gap-2 cursor-pointer px-2 py-2 hover:bg-accent"
                  >
                    <Users className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      {(customer.phone || customer.email) && (
                        <span className="text-sm text-muted-foreground">
                          {customer.phone && `Tel: ${customer.phone}`}
                          {customer.phone && customer.email && " | "}
                          {customer.email && `Email: ${customer.email}`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Always show create option when there's a search query */}
            {searchQuery && (
              <div className="py-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-1 h-8 text-sm"
                  onClick={handleCreateNew}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Crear "{searchQuery}" como nuevo cliente
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    {/* Customer Creation Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogWindow size="sm">
        <DialogHeader
          icon={Users}
          title="Crear Nuevo Cliente"
          description="Completa los datos para crear un nuevo cliente"
        />
        <DialogContent spaced>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-name">Nombre *</Label>
              <Input
                id="customer-name"
                placeholder="Nombre del cliente"
                value={newCustomerData.name}
                onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-phone">Teléfono</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="+34 600 000 000"
                value={newCustomerData.phone}
                onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="cliente@email.com"
                value={newCustomerData.email}
                onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter
          onCancel={() => setShowCreateDialog(false)}
          cancelText="Cancelar"
          onConfirm={handleCreateCustomerConfirm}
          confirmText="Crear Cliente"
          confirmDisabled={!newCustomerData.name.trim()}
        />
      </DialogWindow>
    </Dialog>
    </>
  );
}
