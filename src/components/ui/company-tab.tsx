import { H2, H3, H4, TextSM, TextXS } from '@/components/ui/typography';
import * as React from 'react';
import type { RefObject } from 'react';
import { Camera, Check, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ActionTile } from '@/components/ui/action-tile';

type CompanyTabProps = {
    companyFileInputRef: RefObject<HTMLInputElement>;
    onCompanyImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Spanish NIF/CIF validation function
function validateNIF(nif: string): { valid: boolean; type: string } {
    if (!nif || nif.length < 9) return { valid: false, type: 'invalid' };
    
    const cleanNif = nif.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanNif.length !== 9) return { valid: false, type: 'invalid' };
    
    const firstChar = cleanNif[0];
    const digits = cleanNif.slice(1, 8);
    const controlChar = cleanNif[8];
    
    // NIF personal (DNI) - starts with digit
    if (/^[0-9]/.test(firstChar)) {
        const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const num = parseInt(cleanNif.slice(0, 8), 10);
        const expectedLetter = dniLetters[num % 23];
        return { valid: controlChar === expectedLetter, type: 'DNI' };
    }
    
    // NIE - starts with X, Y, Z
    if (/^[XYZ]/.test(firstChar)) {
        const nieReplace: Record<string, string> = { X: '0', Y: '1', Z: '2' };
        const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const num = parseInt(nieReplace[firstChar] + digits, 10);
        const expectedLetter = dniLetters[num % 23];
        return { valid: controlChar === expectedLetter, type: 'NIE' };
    }
    
    // CIF - starts with letter for companies
    if (/^[ABCDEFGHJKLMNPQRSUVW]/.test(firstChar)) {
        // Simplified CIF validation (control digit check)
        let sumA = 0;
        let sumB = 0;
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i], 10);
            if (i % 2 === 0) {
                const doubled = digit * 2;
                sumA += doubled > 9 ? doubled - 9 : doubled;
            } else {
                sumB += digit;
            }
        }
        const total = sumA + sumB;
        const controlDigit = (10 - (total % 10)) % 10;
        const controlLetter = 'JABCDEFGHI'[controlDigit];
        
        const isValidDigit = controlChar === controlDigit.toString();
        const isValidLetter = controlChar === controlLetter;
        return { valid: isValidDigit || isValidLetter, type: 'CIF' };
    }
    
    return { valid: false, type: 'invalid' };
}

import { useCompany } from '@/hooks/useCompany';

export function CompanyTab({ companyFileInputRef, onCompanyImageChange }: CompanyTabProps) {
    const { toast } = useToast();
    const { company, updateCompany, isInitialized } = useCompany();
    const [isSaving, setIsSaving] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    
    // Form state
    const [formData, setFormData] = React.useState({
        companyName: '',
        legalName: '',
        nif: '',
        website: '',
        address: ''
    });
    
    // Validation state
    const [nifValidation, setNifValidation] = React.useState<{ valid: boolean; type: string } | null>(null);
    const [hasChanges, setHasChanges] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Sync formData with company data from Convex when loaded
    React.useEffect(() => {
        if (company) {
            setFormData({
                companyName: company.name || '',
                legalName: company.legal_name || '',
                nif: company.nif || '',
                website: company.website || '',
                address: company.address || ''
            });
            // Initial validation
            if (company.nif) {
                setNifValidation(validateNIF(company.nif));
            }
        }
    }, [company]);
    
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        
        // Validate NIF on change
        if (field === 'nif') {
            const validation = validateNIF(value);
            setNifValidation(validation);
        }
    };
    
    const handleSave = async () => {
        // Validate NIF before saving (unless it's "PENDING")
        const nifCheck = validateNIF(formData.nif);
        if (!nifCheck.valid && formData.nif !== 'PENDING') {
            toast({
                variant: 'destructive',
                title: 'NIF inválido',
                description: 'Por favor, introduce un NIF/CIF válido.' });
            return;
        }
        
        setIsSaving(true);
        try {
            await updateCompany({
                name: formData.companyName,
                legal_name: formData.legalName,
                nif: formData.nif,
                website: formData.website,
                address: formData.address
            });
            
            setHasChanges(false);
            toast({
                title: 'Cambios guardados',
                description: 'La información de la empresa se ha actualizado correctamente.' 
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: 'No se pudieron guardar los cambios de la empresa.'
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!mounted || !isInitialized) {
        return (
            <TabsContent value="company">
                <Card>
                    <CardHeader>
                        <H3>Cargando información de la empresa...</H3>
                    </CardHeader>
                </Card>
            </TabsContent>
        );
    }
    
    return (
        <TabsContent value="company">
            <Card>
                <CardHeader>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <H3 className="font-bold text-muted-foreground">Información de la Empresa</H3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <TextSM>Datos fiscales y de facturación.</TextSM>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="https://asset.brandfetch.io/idV4dC9a3V/idFr4rVlHR.svg" alt="Company Logo" data-ai-hint="company logo" />
                                <AvatarFallback>C</AvatarFallback>
                            </Avatar>
                            <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-sm" onClick={() => companyFileInputRef.current?.click()}>
                                <Camera className="h-4 w-4" />
                            </Button>
                            <Input ref={companyFileInputRef} type="file" accept="image/*" className="hidden" onChange={onCompanyImageChange} />
                        </div>
                        <div className="grid gap-1.5 flex-grow text-center md:text-left">
                            <H2>{formData.companyName}</H2>
                            <TextSM className="text-muted-foreground">{formData.legalName}</TextSM>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="compName">Nombre Comercial</Label>
                            <Input 
                                id="compName" 
                                value={formData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compLegalName">Razón Social</Label>
                            <Input 
                                id="compLegalName" 
                                value={formData.legalName}
                                onChange={(e) => handleInputChange('legalName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compNif">NIF/CIF</Label>
                            <div className="relative">
                                <Input 
                                    id="compNif" 
                                    value={formData.nif}
                                    onChange={(e) => handleInputChange('nif', e.target.value.toUpperCase())}
                                    className={cn(
                                        nifValidation && !nifValidation.valid && 'border-destructive',
                                        nifValidation && nifValidation.valid && 'border-green-500'
                                    )}
                                />
                                {nifValidation && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {nifValidation.valid ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {nifValidation && (
                                <TextXS className={cn(
                                    nifValidation.valid ? 'text-green-600' : 'text-destructive'
                                )}>
                                    {nifValidation.valid 
                                        ? `${nifValidation.type} válido` 
                                        : 'NIF/CIF no válido. Verifica el número y letra de control.'
                                    }
                                </TextXS>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compWebsite">Sitio Web</Label>
                            <Input 
                                id="compWebsite" 
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="compAddress">Dirección Fiscal</Label>
                            <Input 
                                id="compAddress" 
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Plan y Suscripción</Label>
                            <ActionTile
                                icon={CreditCard}
                                iconColor="#a855f7"
                                title="Profesional"
                                description="Renueva el: 31/12/2024"
                                rightContentType="button"
                                buttonText="Cambiar de Plan"
                                buttonVariant="outline"
                                onButtonClick={() => {}}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4 sm:pt-6">
                    <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                    {hasChanges && (
                        <TextSM className="text-muted-foreground">Tienes cambios sin guardar</TextSM>
                    )}
                </CardFooter>
            </Card>
        </TabsContent>
    );
}

