import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import Link from 'next/link';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TaxesTab() {
    return (
        <TabsContent value="taxes">
            <Card>
                <CardHeader>
                    <H3>Gestión de Impuestos</H3>
                    <CardDescription className="flex flex-wrap items-baseline gap-x-1">
                        <span>Configura los tipos impositivos que se aplicarán en tu negocio.</span>
                        <Link href="/settings/taxes" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto font-medium")}>
                            Ir a la gestión avanzada de impuestos.
                        </Link>
                    </CardDescription>
                </CardHeader>
            </Card>
        </TabsContent>
    );
}

